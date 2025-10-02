import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Check, Shield, Wallet, Fingerprint, Key, Loader2 } from "lucide-react";
import { Buffer } from "buffer";
import { createCredential, getCredential, getCredentialInfo } from "@/lib/webauthn";
import { useConfetti } from "@/hooks/use-confetti";

interface SignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignInSuccess?: (address: string) => void;
}

const SignInModal = ({ open, onOpenChange, onSignInSuccess }: SignInModalProps) => {
  const { triggerConfetti } = useConfetti();
  const [email, setEmail] = useState("");
  const [credentialId, setCredentialId] = useState<string | null>(
    localStorage.getItem("credentialId")
  );
  const [isCreatingPasskey, setIsCreatingPasskey] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [passkeyInfo, setPasskeyInfo] = useState<any>(null);

  const createPasskey = async () => {
    try {
      setIsCreatingPasskey(true);
      setErrorMessage(null);

      const credential = await createCredential();
      
      if (credential) {
        const credentialInfo = getCredentialInfo(credential as PublicKeyCredential);
        
        if (credentialInfo) {
          console.log("==== Passkey Created Successfully ===");
          console.log("Credential ID:", credentialInfo.id);
          console.log("Aptos Address:", credentialInfo.publicKey.aptosAddress);
          
          // Save to local storage
          localStorage.setItem("credentialData", JSON.stringify(credentialInfo));
          localStorage.setItem("credentialId", credentialInfo.id);
          
          // Update state
          setCredentialId(credentialInfo.id);
          setPasskeyInfo(credentialInfo);
          setShowSuccessMessage(true);
          
          // Trigger confetti for passkey creation success
          triggerConfetti('celebration');
          
          // Call onSignInSuccess if provided
          if (onSignInSuccess) {
            onSignInSuccess(credentialInfo.publicKey.aptosAddress);
          }
        } else {
          throw new Error("Failed to get credential info");
        }
      } else {
        throw new Error("Credential creation failed");
      }
      
    } catch (error: any) {
      console.error("Failed to create Passkey:", error);
      setErrorMessage(`Failed to create Passkey: ${error.message || error}`);
    } finally {
      setIsCreatingPasskey(false);
    }
  };

  const signInWithPasskey = async () => {
    if (!credentialId) {
      setErrorMessage("No registered credential");
      return;
    }

    try {
      setIsSigningIn(true);
      setErrorMessage(null);

      const allowCredentials: PublicKeyCredentialDescriptor[] = [
        {
          type: "public-key",
          id: Buffer.from(credentialId, "base64"),
        },
      ];

      const credential = await getCredential(allowCredentials);

      if (credential) {
        const savedCredential = localStorage.getItem("credentialData");
        if (savedCredential && onSignInSuccess) {
          try {
            const credentialData = JSON.parse(savedCredential);
            setShowSuccessMessage(true);
            onSignInSuccess(credentialData.publicKey.aptosAddress);
          } catch (error) {
            console.error("Failed to parse credential data:", error);
            throw new Error("Failed to parse stored credential data");
          }
        } else {
          throw new Error("No saved credential data found");
        }
      } else {
        throw new Error("Sign in failed");
      }
    } catch (error: any) {
      console.error("Signing failed:", error);
      setErrorMessage(`Signing failed: ${error.message || error}`);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-surface border-card-border">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-left">Get started</DialogTitle>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-sm text-muted-foreground">ramtos.sh</span>
                <Check className="h-3 w-3 text-primary" />
              </div>
            </div>
          </div>
        </DialogHeader>

        {showSuccessMessage ? (
          <div className="space-y-6 pt-2">
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {credentialId ? "Successfully signed in!" : "Passkey created successfully!"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {credentialId 
                  ? "You are now signed in with your passkey." 
                  : "Your passkey has been created and is ready to use."}
              </p>
              
              {passkeyInfo && (
                <div className="w-full p-4 bg-surface-hover rounded-lg mb-4">
                  <div className="text-left">
                    <p className="text-sm mb-1"><span className="font-semibold">Aptos Address:</span></p>
                    <p className="text-xs bg-background p-2 rounded overflow-x-auto">{passkeyInfo.publicKey.aptosAddress}</p>
                  </div>
                </div>
              )}
              
              <Button 
                onClick={() => {
                  setShowSuccessMessage(false);
                  onOpenChange(false);
                }}
                className="w-full"
              >
                Continue
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            <p className="text-muted-foreground">
              Use Ramtos to sign in to ramtos.fun and more.
            </p>

            {errorMessage && (
              <div className="p-3 bg-red-100 border border-red-200 rounded-lg text-red-800 text-sm">
                {errorMessage}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Permissions requested
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-card-border">
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <span className="text-sm">Use wallet to </span>
                      <span className="text-sm font-semibold">earn Points</span>
                      <span className="text-sm"> and redeem them for airdrop</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg border border-card-border">
                    <Check className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">Perform actions on your behalf</span>
                  </div>
                </div>
              </div>

              {credentialId ? (
                <Button 
                  size="lg" 
                  className="w-full bg-primary hover:bg-primary-hover glow-effect"
                  onClick={signInWithPasskey}
                  disabled={isSigningIn}
                >
                  {isSigningIn ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Fingerprint className="h-4 w-4 mr-2" />
                      Sign in with Passkey
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  className="w-full bg-primary hover:bg-primary-hover glow-effect"
                  onClick={createPasskey}
                  disabled={isCreatingPasskey}
                >
                  {isCreatingPasskey ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating passkey...
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4 mr-2" />
                      Create Ramtos Passkey
                    </>
                  )}
                </Button>
              )}

              {!credentialId && (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">First time?</div>
                  
                  <Input
                    type="email"
                    placeholder="example@ithaca.xyz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-surface border-border"
                  />
                  
                  <div className="text-xs text-muted-foreground text-right">
                    Optional
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SignInModal;
