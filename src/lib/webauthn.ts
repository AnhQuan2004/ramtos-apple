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
    explorerUrl: "https://explorer.aptoslabs.com/txn",
  },
  TESTNET: {
    name: "Testnet",
    network: Network.TESTNET,
    fullnodeUrl: "https://fullnode.testnet.aptoslabs.com",
    faucetUrl: "https://faucet.testnet.aptoslabs.com",
    explorerUrl: "https://explorer.aptoslabs.com/txn",
  },
  MAINNET: {
    name: "Mainnet",
    network: Network.MAINNET,
    fullnodeUrl: "https://fullnode.mainnet.aptoslabs.com",
    faucetUrl: null,
    explorerUrl: "https://explorer.aptoslabs.com/txn",
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

/**
 * Execute transfer transaction on Aptos network
 */
export async function submitTransfer(
  credentialId?: string,
  senderAddress?: string,
  receiverAddress?: string,
  amount?: number
) {

  if (!credentialId) {
    throw new Error("Please create a Passkey credential first");
  }
  try {

    // Use passkey
    // Read current public key to calculate address
    

    // Create account
  

    // Get account address
    const savedCredential = window.localStorage.getItem("credentialData");
    
    if (!savedCredential) {
      throw new Error("Please create a Passkey credential first");
    }
    const credentialData = JSON.parse(savedCredential);
    
    // Use passed parameters or default values
    const finalSenderAddress = senderAddress || credentialData.publicKey.aptosAddress;
    const finalReceiverAddress = receiverAddress || "0x1234567890123456789012345678901234567890123456789012345678901234";
    const finalAmount = amount || 1000; // Default 0.001 APT (1000 smallest units)
    
    console.log(`=== ${currentNetwork.name} Transfer Transaction ===`);
    console.log("Sender Address:", finalSenderAddress);
    console.log("Receiver Address:", finalReceiverAddress);
    console.log("Transfer Amount:", finalAmount, "smallest units");
    console.log("Network:", currentNetwork.name);
    

    console.log(aptosClient)
    // build raw transaction

    const simpleTxn = await aptosClient.transaction.build.simple({
      sender: finalSenderAddress,
      data: {
        function: "0x1::aptos_account::transfer",
        functionArguments: [
          finalReceiverAddress,
          finalAmount,
        ],
        typeArguments: [],
      },
      options: {
        maxGasAmount: 2000,
        gasUnitPrice: 100
      }
    });
    console.log("rawTxn", simpleTxn.rawTransaction);
    
    // Calculate challenge

    const message = generateSigningMessageForTransaction(simpleTxn);
    console.log("message", message);

    const challenge = sha3_256(message);
    console.log("challenge", challenge);

    // Sign

    const allowedCredentials: PublicKeyCredentialDescriptor[] = [
      {
        type: "public-key",
        id: Buffer.from(credentialId, "base64"),
      },
    ];

    const publicKey: PublicKeyCredentialRequestOptions = {
      challenge: challenge.buffer as ArrayBuffer,                    // Challenge - convert to ArrayBuffer
      allowCredentials: allowedCredentials,  // Allowed credentials
      extensions: {},              // Extensions
    };
  
    let credential = await navigator.credentials.get({
      publicKey,
    });

    console.log("credential", credential);

    if (!credential) {
      throw new Error("Failed to get credential");
    }

    const { clientDataJSON, authenticatorData, signature } = (credential as PublicKeyCredential).response as AuthenticatorAssertionResponse;

    console.log("clientDataJSON", Buffer.from(clientDataJSON).toString("utf-8"));
    console.log("authenticatorData", Buffer.from(authenticatorData).toString("utf-8"));
    console.log("signature", Buffer.from(signature).toString("utf-8"));

    const signatureCompact = normalizeS(new Uint8Array(signature), 'der', 'compact');
    console.log("signatureCompact", signatureCompact);


    const transactionAuthenticator = new TransactionAuthenticatorSingleSender(
      new AccountAuthenticatorSingleKey(new AnyPublicKey(
        new Secp256r1PublicKey(Hex.fromHexInput(credentialData.publicKey.hex).toUint8Array()),
      ),
      new AnySignature(new WebAuthnSignature(signatureCompact, new Uint8Array(authenticatorData), new Uint8Array(clientDataJSON)))
    ),
    );
    console.log("transactionAuthenticator", transactionAuthenticator.bcsToHex().toString());

    // Submit transaction
    
    const result = await aptosClient.transaction.submit.simple({
      transaction: simpleTxn,
      senderAuthenticator: new AccountAuthenticatorSingleKey(new AnyPublicKey(
        new Secp256r1PublicKey(Hex.fromHexInput(credentialData.publicKey.hex).toUint8Array()),
      ),
      new AnySignature(new WebAuthnSignature(signatureCompact, new Uint8Array(authenticatorData), new Uint8Array(clientDataJSON))),
    )});

    

    // Return transaction hash
    if (result.hash) {
      return result.hash;
    } else {
      throw new Error("Failed to get transaction hash");
    }
  } catch (error) {
    console.error("Transfer transaction failed:", error);
    throw error;
  }
}

/**
 * Transaction status check with timeout loop
 */
export async function checkTransactionStatusWithTimeout(transactionHash: string): Promise<string> {
  const maxAttempts = 10; // 10 second timeout
  const intervalMs = 1000; // Check every 1 second
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Attempt ${attempt} to check transaction status...`);
      
      const response = await fetch(
        `${currentNetwork.fullnodeUrl}/v1/transactions/by_hash/${transactionHash}`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          // Transaction not yet on-chain, continue waiting
          if (attempt < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, intervalMs));
            continue;
          } else {
            return "Transaction check timeout: Not on-chain within 10 seconds";
          }
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }
      
      const transaction = await response.json();
      console.log(`Transaction response (attempt ${attempt}):`, transaction);
      
      // Aptos transaction status check logic
      if (transaction.success === true) {
        return "Transaction successfully on-chain";
      } else if (transaction.success === false) {
        return `Transaction failed: ${transaction.vm_status || 'Unknown error'}`;
      } else {
        // Check other possible success flags
        if (transaction.vm_status === "Executed successfully") {
          return "Transaction successfully on-chain";
        } else if (transaction.vm_status && transaction.vm_status !== "Executed successfully") {
          return `Transaction failed: ${transaction.vm_status}`;
        } else {
          // If no clear status, check if transaction exists on-chain
          if (transaction.hash) {
            return "Transaction successfully on-chain";
          } else {
            return "Transaction status unknown";
          }
        }
      }
      
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
        continue;
      } else {
        return `Transaction check failed: ${error instanceof Error ? error.message : String(error)}`;
      }
    }
  }
  
  return "Transaction check timeout";
}

/**
 * Execute a swap transaction on the Aptos network using a passkey
 */
export async function swapWithPasskey(
  credentialId: string,
  fromType: string,
  toType: string,
  amountIn: number,
  minOut: number
) {
  if (!credentialId) {
    throw new Error("Please create a Passkey credential first");
  }
  try {
    const savedCredential = window.localStorage.getItem("credentialData");
    if (!savedCredential) {
      throw new Error("Please create a Passkey credential first");
    }
    const credentialData = JSON.parse(savedCredential);
    const senderAddress = credentialData.publicKey.aptosAddress;

    const MODULE_ADDRESS = "0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12";
    const curveType = "0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12::curves::Uncorrelated";

    const simpleTxn = await aptosClient.transaction.build.simple({
      sender: senderAddress,
      data: {
        function: `${MODULE_ADDRESS}::scripts_v3::swap`,
        typeArguments: [fromType, toType, curveType],
        functionArguments: [amountIn, minOut],
      },
    });

    const message = generateSigningMessageForTransaction(simpleTxn);
    const challenge = sha3_256(message);

    const allowedCredentials: PublicKeyCredentialDescriptor[] = [
      {
        type: "public-key",
        id: Buffer.from(credentialId, "base64"),
      },
    ];

    const publicKey: PublicKeyCredentialRequestOptions = {
      challenge: challenge.buffer as ArrayBuffer,
      allowCredentials: allowedCredentials,
      extensions: {},
    };

    const credential = await navigator.credentials.get({
      publicKey,
    });

    if (!credential) {
      throw new Error("Failed to get credential");
    }

    const { clientDataJSON, authenticatorData, signature } = (credential as PublicKeyCredential).response as AuthenticatorAssertionResponse;
    const signatureCompact = normalizeS(new Uint8Array(signature), 'der', 'compact');

    const result = await aptosClient.transaction.submit.simple({
      transaction: simpleTxn,
      senderAuthenticator: new AccountAuthenticatorSingleKey(
        new AnyPublicKey(new Secp256r1PublicKey(Hex.fromHexInput(credentialData.publicKey.hex).toUint8Array())),
        new AnySignature(new WebAuthnSignature(signatureCompact, new Uint8Array(authenticatorData), new Uint8Array(clientDataJSON)))
      ),
    });

    if (result.hash) {
      return result.hash;
    } else {
      throw new Error("Failed to get transaction hash");
    }
  } catch (error) {
    console.error("Swap transaction failed:", error);
    throw error;
  }
}
