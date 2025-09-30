// @ts-ignore - Noble libraries don't have proper TypeScript declarations
import { sha3_256 } from "@noble/hashes/sha3";
// @ts-ignore - Noble libraries don't have proper TypeScript declarations
import { p256 } from "@noble/curves/nist.js";
import { Buffer } from "buffer";
import {
  AptosConfig,
  Aptos,
  Network,
  Hex,
  generateSigningMessageForTransaction,
  TransactionAuthenticatorSingleSender,
  AccountAuthenticatorSingleKey,
  AnyPublicKey,
  AnySignature,
  WebAuthnSignature,
  Secp256r1PublicKey
} from "@aptos-labs/ts-sdk";
import { parseAuthenticatorData, convertCOSEtoPKCS } from "@simplewebauthn/server/helpers";
// @ts-ignore - Noble libraries don't have proper TypeScript declarations
import type { ECDSASigFormat } from '@noble/curves/abstract/weierstrass';

// ================= Network config =================
interface NetworkConfig {
  name: string;
  network: Network;
  fullnodeUrl: string;
  faucetUrl: string | null;
  explorerUrl: string;
}

export const NETWORKS: Record<string, NetworkConfig> = {
  DEVNET: {
    name: "Devnet",
    network: Network.DEVNET,
    fullnodeUrl: "https://fullnode.devnet.aptoslabs.com",
    faucetUrl: "https://faucet.devnet.aptoslabs.com",
    explorerUrl: "https://explorer.aptoslabs.com/account",
  },
  TESTNET: {
    name: "Testnet",
    network: Network.TESTNET,
    fullnodeUrl: "https://fullnode.testnet.aptoslabs.com",
    faucetUrl: "https://faucet.testnet.aptoslabs.com",
    explorerUrl: "https://explorer.aptoslabs.com/account",
  },
  MAINNET: {
    name: "Mainnet",
    network: Network.MAINNET,
    fullnodeUrl: "https://fullnode.mainnet.aptoslabs.com",
    faucetUrl: null,
    explorerUrl: "https://explorer.aptoslabs.com/account",
  }
};

// ❗ Default to TESTNET (trước đây là Devnet)
export let currentNetwork = NETWORKS.TESTNET;
export let aptosClient = new Aptos(new AptosConfig({ network: currentNetwork.network }));

export function switchNetwork(networkKey: keyof typeof NETWORKS) {
  currentNetwork = NETWORKS[networkKey];
  aptosClient = new Aptos(new AptosConfig({ network: currentNetwork.network }));
  console.log(`Switched to ${currentNetwork.name} network`);
  return currentNetwork;
}

// ================= Misc helpers =================
export const generateTestRawTxn = async () => {
  const privateKey = new Uint8Array(32);
  crypto.getRandomValues(privateKey);
  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);
  const rawTransaction = { bcsToBytes: () => challenge };
  return { challenge: challenge.buffer, rawTransaction };
};

export const p256SignatureFromDER = (derSig: Uint8Array) => {
  const sig = p256.Signature.fromBytes(derSig, 'der');
  return sig.toBytes('compact');
};

export const defaultRp: PublicKeyCredentialRpEntity = {
  id: window.location.hostname,
  name: window.location.origin,
};

export const defaultPubKeyCredParams: PublicKeyCredentialParameters[] = [
  { type: "public-key", alg: -7 },
];

export const defaultUser = {
  name: "Ramtos",
  displayName: "",
  id: Uint8Array.from(String(Math.random() * 99999999)),
};

export function spcSupportsPreferred() {
  const match = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
  if (!match) return false;
  return parseInt(match[2], 10) >= 106;
}

export const defaultResidentKey: ResidentKeyRequirement = spcSupportsPreferred()
  ? "preferred" : "required";

export const defaultAuthenticatorSelection: AuthenticatorSelectionCriteria = {
  userVerification: "required",
  residentKey: defaultResidentKey,
  authenticatorAttachment: "platform",
};

export type SPCPublicKeyCredentialCreationOptions = Omit<
  PublicKeyCredentialCreationOptions,
  ""
>;

export const generateDefaultPublicKey = async (): Promise<SPCPublicKeyCredentialCreationOptions> => {
  const { challenge } = await generateTestRawTxn();
  return {
    rp: defaultRp,
    user: defaultUser,
    challenge,
    pubKeyCredParams: defaultPubKeyCredParams,
    authenticatorSelection: defaultAuthenticatorSelection,
    extensions: {},
  };
};

export async function createCredential(
  publicKey?: SPCPublicKeyCredentialCreationOptions
): Promise<Credential | null> {
  const defaultPublicKey = await generateDefaultPublicKey();
  const publicKeyCreationOptions: SPCPublicKeyCredentialCreationOptions = {
    ...defaultPublicKey,
    ...publicKey,
  };
  return await navigator.credentials.create({ publicKey: publicKeyCreationOptions });
}

export async function getCredential(
  allowCredentials: PublicKeyCredentialDescriptor[]
) {
  const { challenge } = await generateTestRawTxn();
  const publicKey: PublicKeyCredentialRequestOptions = {
    challenge: challenge as ArrayBuffer,
    allowCredentials,
    extensions: {},
  };
  return (await navigator.credentials.get({ publicKey })) as PublicKeyCredential;
}

export function calculateAptosAddressFromPublicKey(publicKeyBytes: Uint8Array): string {
  try {
    if (publicKeyBytes.length !== 65 || publicKeyBytes[0] !== 0x04) {
      throw new Error(`Invalid public key format`);
    }
    const publicKey = new Secp256r1PublicKey(publicKeyBytes);
    const authKey = publicKey.authKey();
    return authKey.derivedAddress().toString();
  } catch (error) {
    console.error('Failed to calculate Aptos address:', error);
    return 'Calculation failed';
  }
}

export function parsePublicKey(response: PublicKeyCredential): Uint8Array {
  try {
    // Check if response.response has getAuthenticatorData method (AuthenticatorAttestationResponse)
    if ('getAuthenticatorData' in response.response) {
      const authData = Buffer.from(
        new Uint8Array((response.response as AuthenticatorAttestationResponse).getAuthenticatorData())
      );
      const parsedAuthenticatorData = parseAuthenticatorData(authData);
      if (!parsedAuthenticatorData.credentialPublicKey) {
        throw new Error("No credential public key found in authenticator data");
      }
      return convertCOSEtoPKCS(parsedAuthenticatorData.credentialPublicKey);
    } else {
      throw new Error("Response is not an AuthenticatorAttestationResponse");
    }
  } catch (error) {
    console.error("Error parsing public key:", error);
    throw new Error("Failed to parse public key from credential");
  }
}

export function getCredentialInfo(credential: PublicKeyCredential): {
  id: string;
  type: string;
  publicKey: { base64: string; hex: string; aptosAddress: string; };
  rawData: any;
} | null {
  try {
    const publickey = parsePublicKey(credential);
    return {
      id: Buffer.from(credential.rawId).toString("base64"),
      type: credential.type || '',
      publicKey: {
        base64: Buffer.from(publickey).toString("base64"),
        hex: Buffer.from(publickey).toString("hex"),
        aptosAddress: calculateAptosAddressFromPublicKey(publickey),
      },
      rawData: publickey,
    };
  } catch (error) {
    console.error('Failed to get credential information:', error);
    return null;
  }
}

export function normalizeS(
  sigBytes: Uint8Array,
  formFormat: ECDSASigFormat = 'compact',
  toFormat: ECDSASigFormat = 'compact'
): Uint8Array {
  const sig = p256.Signature.fromBytes(sigBytes, formFormat);
  if (!sig.hasHighS()) return sig.toBytes(toFormat);
  const sLow = p256.Point.Fn.neg(sig.s);
  const rec = sig.recovery != null ? (sig.recovery ^ 1) : undefined;
  return new p256.Signature(sig.r, sLow, rec).toBytes(toFormat);
}

// ================= Balance API =================

/**
 * Gets portfolio data for an address from the API
 * @param address The Aptos address to fetch portfolio for
 */
export async function getPortfolio(address: string) {
  try {
    const response = await fetch(`https://nguyenanhquan.online/portfolio/${address}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch portfolio:", error);
    throw error;
  }
}