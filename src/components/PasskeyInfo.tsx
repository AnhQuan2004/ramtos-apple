import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Fingerprint, Key, Copy, ExternalLink } from "lucide-react";

const PasskeyInfo = () => {
  const [credentialData, setCredentialData] = useState<any>(null);
  
  useEffect(() => {
    // Load credential data from localStorage if available
    const savedData = localStorage.getItem("credentialData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setCredentialData(parsedData);
      } catch (error) {
        console.error("Failed to parse credential data:", error);
      }
    }
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const openAptosExplorer = (address: string) => {
    window.open(`https://explorer.aptoslabs.com/txn/${address}?network=devnet`, '_blank');
  };

  if (!credentialData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No Passkey Found</CardTitle>
          <CardDescription>
            You haven't created a passkey yet. Use the Sign In button to create one.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          <CardTitle>Your Passkey</CardTitle>
        </div>
        <CardDescription>
          Your passkey is securely stored on this device
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm font-medium">Aptos Address</div>
          <div className="flex items-center gap-2">
            <div className="bg-surface p-2 rounded-md text-xs font-mono flex-1 overflow-x-auto">
              {credentialData.publicKey.aptosAddress}
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => copyToClipboard(credentialData.publicKey.aptosAddress)}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => openAptosExplorer(credentialData.publicKey.aptosAddress)}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Public Key (Hex)</div>
          <div className="flex items-center gap-2">
            <div className="bg-surface p-2 rounded-md text-xs font-mono flex-1 overflow-x-auto truncate">
              {credentialData.publicKey.hex}
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => copyToClipboard(credentialData.publicKey.hex)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => {
              localStorage.removeItem("credentialData");
              localStorage.removeItem("credentialId");
              setCredentialData(null);
            }}
          >
            Reset Passkey
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PasskeyInfo;
