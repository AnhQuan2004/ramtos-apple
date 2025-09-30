import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, LogOut, Check, ChevronRight, ShoppingBag, 
  Building, ArrowLeftRight, ArrowUpRight, CircleUser,
  Wallet, CreditCard, DollarSign, BarChart3, Loader2
} from "lucide-react";
import SignInModal from "./SignInModal";
import { GridBackground } from "@/components/ui/grid-background-demo";
import { useApplePay } from "@/hooks/use-apple-pay";
import { useBalance } from "@/hooks/use-balance";

import { useSearchParams } from "react-router-dom";

const DemoSection = () => {
  const { handleApplePay, isLoading: isLoadingPay, error: payError } = useApplePay({});
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [aptosAddress, setAptosAddress] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'signin' | 'welcome' | 'product' | 'success' | 'balance'>('signin');
  const [searchParams] = useSearchParams();
  
  // Use the balance hook to fetch account balance
  const { 
    balance, 
    aptBalance, 
    usdcBalance, 
    isLoading: isLoadingBalance, 
    error: balanceError 
  } = useBalance(aptosAddress);
  
  // Check for successful payment
  useEffect(() => {
    const handlePaymentSuccess = async () => {
      if (aptosAddress) {
        try {
          console.log(`Transferring 1 APT to ${aptosAddress}...`);
          const senderPrivateKey = import.meta.env.VITE_SENDER_PRIVATE_KEY;
          
          const response = await fetch('https://nguyenanhquan.online/transfer-coin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              senderPrivateKey,
              recipientAddress: aptosAddress,
              amount: 20000000,
              coinType: "0x1::aptos_coin::AptosCoin",
            }),
          });

          const data = await response.json();

          if (data.success) {
            console.log('Coin transfer successful:', data.transactionHash);
          } else {
            console.error('Coin transfer failed:', data.message);
          }
        } catch (error) {
          console.error('An error occurred during coin transfer:', error);
        }
      }
    };

    if (searchParams.get('payment') === 'success') {
      setCurrentStep('success');
      handlePaymentSuccess();
      
      const timer = setTimeout(() => {
        setCurrentStep('product');
      }, 2000);

      // Cleanup the timer if the component unmounts or dependencies change
      return () => clearTimeout(timer);
    }
  }, [searchParams, aptosAddress]);

  // Check if user is already signed in on component mount
  useEffect(() => {
    const credentialId = localStorage.getItem("credentialId");
    const credentialData = localStorage.getItem("credentialData");
    
    if (credentialId && credentialData) {
      try {
        const parsedData = JSON.parse(credentialData);
        setIsSignedIn(true);
        setAptosAddress(parsedData.publicKey.aptosAddress);
        setCurrentStep('welcome');
      } catch (error) {
        console.error("Failed to parse credential data:", error);
      }
    }
  }, []);
  
  // Handle sign out
  const handleSignOut = () => {
    localStorage.removeItem("credentialId");
    localStorage.removeItem("credentialData");
    setIsSignedIn(false);
    setAptosAddress(null);
    setCurrentStep('signin');
  };
  
  // Handle next step
  const handleNextStep = () => {
    if (currentStep === 'welcome') {
      setCurrentStep('product');
    }
  };

  // This function will be called from SignInModal when login is successful
  const handleSignInSuccess = (address: string) => {
    setIsSignedIn(true);
    setAptosAddress(address);
    setCurrentStep('welcome');
    setIsSignInModalOpen(false);
  };
  
  if (isSignedIn) {
    if (currentStep === 'balance') {
      return (
        <GridBackground className="border-2 border-primary/30 shadow-lg shadow-primary/10 rounded-2xl overflow-hidden">
          <div className="p-6 md:p-10 min-h-[600px] md:min-h-[700px] flex flex-col relative z-20">
            <div className="text-sm font-medium text-primary mb-6">Demo</div>
            
            <div className="flex-grow flex flex-col items-center justify-center space-y-6 md:space-y-8">
              {/* Balance Header */}
              <div className="w-full text-center">
                <h2 className="text-3xl font-semibold mb-2">Your Balance</h2>
                <p className="text-muted-foreground text-lg mb-8">
                  View your available assets
                </p>
              </div>
              
              {/* All Coins Balance Cards */}
              {isLoadingBalance ? (
                <div className="flex justify-center items-center py-8 w-full">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : balanceError ? (
                <div className="text-center text-red-500 py-8 w-full">
                  <p>Error loading balance: {balanceError}</p>
                </div>
              ) : balance.length === 0 ? (
                <div className="text-center py-8 w-full">
                  <p>No coins found in this wallet</p>
                </div>
              ) : (
                <div className="space-y-6 w-full">
                  {balance.map((coin, index) => (
                    <div key={coin.coin_type} className="w-full bg-surface/50 border border-primary/20 rounded-xl p-6 shadow-lg">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                            coin.symbol === 'APT' ? '' : 
                            coin.symbol === 'USDC' ? 'bg-blue-500' : 
                            coin.symbol === 'USDT' ? 'bg-green-500' : 'bg-gray-500'
                          }`}>
                            {coin.symbol === 'APT' ? (
                              <img src="/icon.png" alt="APT Icon" className="h-14 w-14 rounded-full" />
                            ) : (
                              <DollarSign className="h-8 w-8 text-white" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-xl font-medium">{coin.symbol}</h3>
                            <p className="text-muted-foreground">{coin.name}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-3xl font-bold">{coin.formattedAmount}</p>
                          {coin.symbol === 'USDC' || coin.symbol === 'USDT' ? (
                            <p className="text-muted-foreground">${coin.formattedAmount} USD</p>
                          ) : null}
                        </div>
                      </div>
                      
                      {index === 0 && (
                        <div className="flex justify-between gap-4 mt-6">
                          <Button className="flex-1 bg-blue-500 hover:bg-blue-600">
                            <ArrowUpRight className="h-5 w-5 mr-2" />
                            Send
                          </Button>
                          <Button className="flex-1 bg-blue-500 hover:bg-blue-600">
                            <CreditCard className="h-5 w-5 mr-2" />
                            Deposit
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-10 flex justify-between">
              <div 
                className="w-16 h-16 bg-surface/70 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:shadow-lg transition-all border border-primary/20"
                onClick={() => setCurrentStep('product')}
              >
                <ChevronRight className="h-8 w-8 text-primary rotate-180" />
              </div>
              
              <div 
                className="w-16 h-16 bg-primary rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all border-2 border-primary/30"
                onClick={() => setCurrentStep('welcome')}
              >
                <ChevronRight className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-center gap-3">
                <div className="w-4 h-4 bg-muted-foreground/30 rounded-full"></div>
                <div className="w-4 h-4 bg-muted-foreground/30 rounded-full"></div>
                <div className="w-4 h-4 bg-muted-foreground/30 rounded-full"></div>
                <div className="w-4 h-4 bg-primary rounded-full shadow-sm shadow-primary/50"></div>
                <div className="w-4 h-4 bg-muted-foreground/30 rounded-full"></div>
              </div>
            </div>
          </div>
        </GridBackground>
      );
    } else if (currentStep === 'welcome') {
      return (
        <GridBackground className="border-2 border-primary/30 shadow-lg shadow-primary/10 rounded-2xl overflow-hidden">
          <div className="p-6 md:p-10 min-h-[600px] md:min-h-[700px] flex flex-col relative z-20">
          <div className="text-sm font-medium text-primary mb-6">Demo</div>
          
          <div className="flex-grow flex flex-col items-center justify-center space-y-6 md:space-y-8">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8 border-2 border-primary/30 shadow-md">
            <Check className="h-12 w-12 text-primary" />
          </div>
            
            <div className="text-center">
              <h2 className="text-3xl font-semibold mb-3 text-foreground">You're signed in!</h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Using your passkey for secure authentication
              </p>
            </div>
            
            {aptosAddress && (
              <div className="w-full">
                <div className="text-base font-medium mb-3 text-primary">Aptos Address:</div>
                <div className="bg-surface/70 border border-primary/20 p-4 rounded-lg text-sm font-mono break-all shadow-inner">
                  {aptosAddress}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-12 flex items-center justify-between">
            <Button 
              variant="destructive"
              size="lg"
              className="shadow-md text-base px-6 py-6"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign out
            </Button>
            
            <div 
              className="w-16 h-16 bg-primary rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all border-2 border-primary/30"
              onClick={handleNextStep}
            >
              <ChevronRight className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <div className="mt-4">
          <div className="flex justify-center gap-3">
            <div className="w-4 h-4 bg-muted-foreground/30 rounded-full"></div>
            <div className="w-4 h-4 bg-primary rounded-full shadow-sm shadow-primary/50"></div>
            <div className="w-4 h-4 bg-muted-foreground/30 rounded-full"></div>
            <div className="w-4 h-4 bg-muted-foreground/30 rounded-full"></div>
            <div className="w-4 h-4 bg-muted-foreground/30 rounded-full"></div>
          </div>
          </div>
          </div>
        </GridBackground>
      );
    } else if (currentStep === 'success') {
      return (
        <GridBackground className="border-2 border-primary/30 shadow-lg shadow-primary/10 rounded-2xl overflow-hidden">
          <div className="p-6 md:p-10 min-h-[600px] md:min-h-[700px] flex flex-col relative z-20">
            <div className="text-sm font-medium text-primary mb-6">Demo</div>
            <div className="flex-grow flex flex-col items-center justify-center space-y-6 md:space-y-8">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 border-2 border-green-300 shadow-md">
                <Check className="h-12 w-12 text-green-600" />
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-semibold mb-3 text-foreground">Payment Successful!</h2>
                <p className="text-muted-foreground mb-8 text-lg">
                  Your transaction has been processed.
                </p>
              </div>
            </div>
          </div>
        </GridBackground>
      );
    } else if (currentStep === 'product') {
      return (
        <GridBackground className="border-2 border-primary/30 shadow-lg shadow-primary/10 rounded-2xl overflow-hidden">
          <div className="p-6 md:p-10 min-h-[600px] md:min-h-[700px] flex flex-col relative z-20">
          <div className="text-sm font-medium text-primary mb-6">Demo</div>
          
          <div className="flex-grow flex flex-col items-center justify-center space-y-6 md:space-y-8">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 bg-primary rounded-lg flex items-center justify-center shadow-md">
                <ShoppingBag className="h-12 w-12 text-white" />
              </div>
            </div>
            
            <Button 
              size="lg" 
              className="w-full bg-primary hover:bg-primary-hover text-white font-medium border-2 border-primary/20 shadow-lg shadow-primary/20 glow-effect text-lg py-7"
              onClick={handleApplePay}
              disabled={isLoadingPay}
            >
              <ShoppingBag className="h-6 w-6 mr-3" />
              {isLoadingPay ? 'Processing...' : 'Buy with Apple Pay'}
            </Button>
            {payError && <p className="text-red-500 text-sm mt-2">{payError}</p>}
            
            <div className="text-center mt-12">
              <h3 className="text-3xl font-semibold mb-4">Buy now, for real</h3>
              <p className="text-muted-foreground text-lg">
                Fund your account & complete purchases in seconds
              </p>
            </div>
            
            {/* Action Icons */}
            <div className="mt-16 w-full grid grid-cols-4 gap-4">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                  <Building className="h-8 w-8 text-primary" />
                </div>
                <span className="text-lg font-semibold">Buy</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                  <ArrowLeftRight className="h-8 w-8 text-primary" />
                </div>
                <span className="text-lg font-semibold">Trade</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                  <ArrowUpRight className="h-8 w-8 text-primary" />
                </div>
                <span className="text-lg font-semibold">Send</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                  <CircleUser className="h-8 w-8 text-primary" />
                </div>
                <span className="text-lg font-semibold">Request</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-between">
            <div 
              className="w-16 h-16 bg-surface/70 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:shadow-lg transition-all border border-primary/20"
              onClick={() => setCurrentStep('welcome')}
            >
              <ChevronRight className="h-8 w-8 text-primary rotate-180" />
            </div>
            
            <div 
              className="w-16 h-16 bg-primary rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all border-2 border-primary/30"
              onClick={() => setCurrentStep('balance')}
            >
              <ChevronRight className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-center gap-1">
              <div className="w-2 h-2 bg-muted-foreground/30 rounded-full"></div>
              <div className="w-2 h-2 bg-muted-foreground/30 rounded-full"></div>
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <div className="w-2 h-2 bg-muted-foreground/30 rounded-full"></div>
              <div className="w-2 h-2 bg-muted-foreground/30 rounded-full"></div>
            </div>
          </div>
          </div>
        </GridBackground>
      );
    }
  }
  
  return (
    <GridBackground className="border-2 border-primary/30 shadow-lg shadow-primary/10 rounded-2xl overflow-hidden">
      <div className="p-6 md:p-10 min-h-[600px] md:min-h-[700px] flex flex-col relative z-20">
      <div className="text-center flex-grow flex flex-col">
        <div className="text-sm font-medium text-primary mb-6">Demo</div>
        
        {/* Demo Sign In Button */}
        <div className="mb-8 flex-grow flex flex-col justify-center">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">Forget passwords</h2>
          <p className="text-muted-foreground mb-8 text-base">
            Ramtos is the fastest and most secure way to sign in.
          </p>
          
          <Button 
            size="lg" 
            className="w-full bg-primary hover:bg-primary-hover text-white font-medium border-2 border-primary/20 shadow-lg shadow-primary/20 glow-effect"
            onClick={() => setIsSignInModalOpen(true)}
          >
            Sign in with Aptos Passkey
          </Button>
        </div>

        {/* Progress Dots */}
          <div className="flex justify-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
            <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
            <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
            <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
          </div>
      </div>
      </div>

      <SignInModal 
        open={isSignInModalOpen} 
        onOpenChange={setIsSignInModalOpen}
        onSignInSuccess={handleSignInSuccess}
      />
    </GridBackground>
  );
};

export default DemoSection;
