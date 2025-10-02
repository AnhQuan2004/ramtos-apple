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
import { useConfetti } from "@/hooks/use-confetti";
import { submitTransfer, checkTransactionStatusWithTimeout, currentNetwork, swapWithPasskey } from "@/lib/webauthn";
import { useSearchParams } from "react-router-dom";

const DemoSection = () => {
  const { handleApplePay, isLoading: isLoadingPay, error: payError } = useApplePay({});
  const { triggerConfetti } = useConfetti();
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [aptosAddress, setAptosAddress] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'signin' | 'welcome' | 'product' | 'success' | 'balance' | 'swap' | 'subscribe' | 'send_tip' | 'buy_nft'>('signin');
  const [searchParams] = useSearchParams();
  const [tipAddress, setTipAddress] = useState('');
  const [tipAmount, setTipAmount] = useState('0.1');
  const [isSendingTip, setIsSendingTip] = useState(false);
  const [tipStatus, setTipStatus] = useState('');
  const [tipTxHash, setTipTxHash] = useState('');
  const [isBuyingNft, setIsBuyingNft] = useState(false);
  const [buyNftStatus, setBuyNftStatus] = useState('');
  const [buyNftTxHash, setBuyNftTxHash] = useState('');
  const [subscriptionAmount, setSubscriptionAmount] = useState(0.1); // Default to 0.1 APT
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState('');
  const [subscribeTxHash, setSubscribeTxHash] = useState('');
  const [swapAmount, setSwapAmount] = useState('0.1');
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapStatus, setSwapStatus] = useState('');
  const [swapTxHash, setSwapTxHash] = useState('');
  
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
      triggerConfetti('celebration');
      handlePaymentSuccess();
      
      const timer = setTimeout(() => {
        setCurrentStep('product');
      }, 5000);

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
    triggerConfetti('success');
  };
  
  if (isSignedIn) {
    if (currentStep === 'balance') {
      return (
        <GridBackground className="border-2 border-primary/30 shadow-lg shadow-primary/10 rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-6 md:p-10 min-h-[500px] sm:min-h-[600px] md:min-h-[700px] flex flex-col relative z-20">
            <div className="text-xs sm:text-sm font-medium text-primary mb-4 sm:mb-6">Demo</div>
            
            <div className="flex-grow flex flex-col items-center justify-center space-y-4 sm:space-y-6 md:space-y-8">
              {/* Balance Header */}
              <div className="w-full text-center">
                <h2 className="text-2xl sm:text-3xl font-semibold mb-2">Your Balance</h2>
                <p className="text-muted-foreground text-base sm:text-lg mb-6 sm:mb-8">
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
                <div className="space-y-4 sm:space-y-6 w-full">
                  {balance.map((coin, index) => (
                    <div key={coin.coin_type} className="w-full bg-surface/50 border border-primary/20 rounded-xl p-4 sm:p-6 shadow-lg">
                      <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ${
                            coin.symbol === 'APT' ? '' : 
                            coin.symbol === 'USDC' ? 'bg-blue-500' : 
                            coin.symbol === 'USDT' ? 'bg-green-500' : 'bg-gray-500'
                          }`}>
                            {coin.symbol === 'APT' ? (
                              <img src="/icon.png" alt="APT Icon" className="h-10 w-10 sm:h-14 sm:w-14 rounded-full" />
                            ) : (
                              <img src="/usdc.png" alt="USDC Icon" className="h-6 w-6 sm:h-8 sm:w-8 rounded-full" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg sm:text-xl font-medium">{coin.symbol}</h3>
                            <p className="text-sm sm:text-base text-muted-foreground">{coin.name}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-xl sm:text-3xl font-bold">{coin.formattedAmount}</p>
                          {coin.symbol === 'USDC' || coin.symbol === 'USDT' ? (
                            <p className="text-sm sm:text-base text-muted-foreground">${coin.formattedAmount} USD</p>
                          ) : null}
                        </div>
                      </div>
                      
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-8 sm:mt-10 flex justify-between">
              <div 
                className="w-14 h-14 sm:w-16 sm:h-16 bg-surface/70 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:shadow-lg transition-all border border-primary/20 touch-manipulation"
                onClick={() => setCurrentStep('product')}
              >
                <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8 text-primary rotate-180" />
              </div>
              
              <div 
                className="w-14 h-14 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all border-2 border-primary/30 touch-manipulation"
                onClick={() => setCurrentStep('swap')}
              >
                <ArrowLeftRight className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-center gap-2">
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
              </div>
            </div>
          </div>
        </GridBackground>
      );
    } else if (currentStep === 'swap') {
      return (
        <GridBackground className="border-2 border-primary/30 shadow-lg shadow-primary/10 rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-6 md:p-10 min-h-[500px] sm:min-h-[600px] md:min-h-[700px] flex flex-col relative z-20">
            <div className="text-xs sm:text-sm font-medium text-primary mb-4 sm:mb-6">Demo</div>
            <div className="flex-grow flex flex-col items-center justify-center space-y-4 sm:space-y-6 md:space-y-8">
              <h2 className="text-2xl sm:text-3xl font-semibold mb-2">Swap Tokens</h2>
              <div className="w-full bg-surface/50 border border-primary/20 rounded-xl p-4 sm:p-6 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                  <span className="text-muted-foreground text-sm sm:text-base">From</span>
                  <span className="text-muted-foreground text-xs sm:text-sm">Balance: {aptBalance ? Number(aptBalance.formattedAmount).toFixed(2) : '0.00'} APT</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <img src="/icon.png" alt="APT Icon" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex-shrink-0" />
                  <input 
                    type="number" 
                    placeholder="0.0" 
                    value={swapAmount} 
                    onChange={(e) => setSwapAmount(e.target.value)} 
                    className="bg-transparent text-xl sm:text-2xl font-bold w-full focus:outline-none" 
                  />
                  <span className="text-lg sm:text-2xl font-bold flex-shrink-0">APT</span>
                </div>
                <div className="text-right text-muted-foreground text-xs sm:text-sm mt-2">
                  ~${(Number(swapAmount) * 7.5).toFixed(2)} USD
                </div>
              </div>
              <div className="w-full bg-surface/50 border border-primary/20 rounded-xl p-4 sm:p-6 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                  <span className="text-muted-foreground text-sm sm:text-base">To</span>
                  <span className="text-muted-foreground text-xs sm:text-sm">Balance: {usdcBalance ? Number(usdcBalance.formattedAmount).toFixed(2) : '0.00'} USDC</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <img src="/usdc.png" alt="USDC Icon" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex-shrink-0" />
                  <input 
                    type="number" 
                    placeholder="0.0" 
                    value={(Number(swapAmount) * 7.45).toFixed(2)} 
                    readOnly 
                    className="bg-transparent text-xl sm:text-2xl font-bold w-full focus:outline-none" 
                  />
                  <span className="text-lg sm:text-2xl font-bold flex-shrink-0">USDC</span>
                </div>
                <div className="text-right text-muted-foreground text-xs sm:text-sm mt-2">
                  ~${(Number(swapAmount) * 7.45).toFixed(2)} USD
                </div>
              </div>
              <Button 
                className="w-full bg-primary hover:bg-primary-hover glow-effect" 
                size="lg"
                onClick={async () => {
                  try {
                    setIsSwapping(true);
                    setSwapStatus('Processing swap...');
                    const credentialId = localStorage.getItem("credentialId");
                    if (!credentialId) {
                      throw new Error("No credential found");
                    }
                    const hash = await swapWithPasskey(
                      credentialId,
                      "0x1::aptos_coin::AptosCoin",
                      "0x97f28f805f9e8ab3928488d8efc903c347328ba584558b4eb6a8ea7483dc7b11::coins::USDC",
                      parseFloat(swapAmount) * 100000000,
                      10000
                    );
                    if (hash) {
                      setSwapTxHash(hash);
                      setSwapStatus('Transaction submitted, checking status...');
                      const status = await checkTransactionStatusWithTimeout(hash);
                      setSwapStatus(status);
                      if (status.includes('success') || status.includes('Success')) {
                        triggerConfetti('success');
                      }
                    }
                  } catch (error: any) {
                    setSwapStatus(`Swap failed: ${error.message}`);
                  } finally {
                    setIsSwapping(false);
                  }
                }}
                disabled={isSwapping || !swapAmount || parseFloat(swapAmount) <= 0}
              >
                {isSwapping ? 'Swapping...' : 'Swap'}
              </Button>
              {swapStatus && <p className="text-sm text-center mt-2">{swapStatus}</p>}
              {swapTxHash && (
                <div className="w-full text-center mt-4">
                  <p className="text-sm font-mono break-all">{swapTxHash}</p>
                  <Button
                    variant="link"
                    onClick={() => {
                      const explorerUrl = `${currentNetwork.explorerUrl}/${swapTxHash}?network=${currentNetwork.name.toLowerCase()}`;
                      window.open(explorerUrl, "_blank");
                    }}
                  >
                    View in Aptos Explorer
                  </Button>
                </div>
              )}
            </div>
            <div className="mt-10 flex justify-between">
              <div 
                className="w-16 h-16 bg-surface/70 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:shadow-lg transition-all border border-primary/20"
                onClick={() => setCurrentStep('balance')}
              >
                <ChevronRight className="h-8 w-8 text-primary rotate-180" />
              </div>
              <div 
                className="w-16 h-16 bg-primary rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all border-2 border-primary/30"
                onClick={() => setCurrentStep('subscribe')}
              >
                <ChevronRight className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-center gap-2">
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
              </div>
            </div>
          </div>
        </GridBackground>
      );
    } else if (currentStep === 'subscribe') {
      return (
        <GridBackground className="border-2 border-primary/30 shadow-lg shadow-primary/10 rounded-2xl overflow-hidden">
          <div className="p-6 md:p-10 min-h-[600px] md:min-h-[700px] flex flex-col relative z-20">
            <div className="text-sm font-medium text-primary mb-6">Demo</div>
            <div className="flex-grow flex flex-col items-center justify-center space-y-6 md:space-y-8">
              <h2 className="text-3xl font-semibold mb-2">Choose Your Plan</h2>
              <div className="w-full space-y-4">
                {[
                  { name: 'Weekly', amount: 0.001 },
                  { name: 'Monthly', amount: 0.1 },
                  { name: 'Yearly', amount: 1 },
                ].map((plan) => (
                  <Button
                    key={plan.name}
                    variant={subscriptionAmount === plan.amount ? 'default' : 'outline'}
                    className="w-full justify-between h-20 text-left"
                    onClick={() => setSubscriptionAmount(plan.amount)}
                  >
                    <span className="text-xl font-medium">{plan.name}</span>
                    <span className="text-3xl font-bold">{plan.amount} APT</span>
                  </Button>
                ))}
              </div>
              <Button 
                className="w-full bg-primary hover:bg-primary-hover glow-effect" 
                size="lg"
                onClick={async () => {
                  try {
                    setIsSubscribing(true);
                    setSubscribeStatus('Processing subscription...');
                    const credentialId = localStorage.getItem("credentialId");
                    const hash = await submitTransfer(
                      credentialId || undefined,
                      aptosAddress || undefined,
                      "0xb485454eba35a2441814f6b635c7bd9b24ae4012a97884f39fc1cd1148122c3a",
                      subscriptionAmount * 100000000
                    );
                    if (hash) {
                      setSubscribeTxHash(hash);
                      setSubscribeStatus('Transaction submitted, checking status...');
                      const status = await checkTransactionStatusWithTimeout(hash);
                      setSubscribeStatus(status);
                      if (status.includes('success') || status.includes('Success')) {
                        triggerConfetti('success');
                      }
                    }
                  } catch (error: any) {
                    setSubscribeStatus(`Subscription failed: ${error.message}`);
                  } finally {
                    setIsSubscribing(false);
                  }
                }}
                disabled={isSubscribing}
              >
                {isSubscribing ? 'Processing...' : 'Subscribe'}
              </Button>
              {subscribeStatus && <p className="text-sm text-center mt-2">{subscribeStatus}</p>}
              {subscribeTxHash && (
                <div className="w-full text-center mt-4">
                  <p className="text-sm font-mono break-all">{subscribeTxHash}</p>
                  <Button
                    variant="link"
                    onClick={() => {
                      const explorerUrl = `${currentNetwork.explorerUrl}/${subscribeTxHash}?network=${currentNetwork.name.toLowerCase()}`;
                      window.open(explorerUrl, "_blank");
                    }}
                  >
                    View in Aptos Explorer
                  </Button>
                </div>
              )}
            </div>
            <div className="mt-10 flex justify-between">
              <div 
                className="w-16 h-16 bg-surface/70 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:shadow-lg transition-all border border-primary/20"
                onClick={() => setCurrentStep('swap')}
              >
                <ChevronRight className="h-8 w-8 text-primary rotate-180" />
              </div>
              <div 
                className="w-16 h-16 bg-primary rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all border-2 border-primary/30"
                onClick={() => setCurrentStep('send_tip')}
              >
                <ChevronRight className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-center gap-2">
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
              </div>
            </div>
          </div>
        </GridBackground>
      );
    } else if (currentStep === 'send_tip') {
      return (
        <GridBackground className="border-2 border-primary/30 shadow-lg shadow-primary/10 rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-6 md:p-10 min-h-[500px] sm:min-h-[600px] md:min-h-[700px] flex flex-col relative z-20">
            <div className="text-xs sm:text-sm font-medium text-primary mb-4 sm:mb-6">Demo</div>
            <div className="flex-grow flex flex-col items-center justify-center space-y-4 sm:space-y-6 md:space-y-8">
              <h2 className="text-2xl sm:text-3xl font-semibold mb-2">Send a Tip</h2>
                <div className="w-full space-y-3 sm:space-y-4">
                  <input
                    type="text"
                    placeholder="Enter recipient address"
                    value={tipAddress}
                    onChange={(e) => setTipAddress(e.target.value)}
                    className="w-full bg-surface/50 border border-primary/20 rounded-xl p-3 sm:p-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                  />
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    className="w-full bg-surface/50 border border-primary/20 rounded-xl p-3 sm:p-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                  />
                </div>
                <Button 
                  className="w-full bg-primary hover:bg-primary-hover glow-effect" 
                  size="lg"
                  onClick={async () => {
                    try {
                      setIsSendingTip(true);
                      setTipStatus('Sending tip...');
                      const credentialId = localStorage.getItem("credentialId");
                      const hash = await submitTransfer(
                        credentialId || undefined,
                        aptosAddress || undefined,
                        tipAddress,
                        parseFloat(tipAmount) * 100000000
                      );
                      if (hash) {
                        setTipTxHash(hash);
                        setTipStatus('Transaction submitted, checking status...');
                        const status = await checkTransactionStatusWithTimeout(hash);
                        setTipStatus(status);
                        if (status.includes('success') || status.includes('Success')) {
                          triggerConfetti('success');
                        }
                      }
                    } catch (error: any) {
                      setTipStatus(`Failed to send tip: ${error.message}`);
                    } finally {
                      setIsSendingTip(false);
                    }
                  }}
                  disabled={isSendingTip || !tipAddress || !tipAmount}
                >
                  {isSendingTip ? 'Sending...' : 'Send'}
                </Button>
                {tipStatus && <p className="text-sm text-center mt-2">{tipStatus}</p>}
                {tipTxHash && (
                  <div className="w-full text-center mt-4">
                    <p className="text-sm font-mono break-all">{tipTxHash}</p>
                    <Button
                      variant="link"
                      onClick={() => {
                        const explorerUrl = `${currentNetwork.explorerUrl}/${tipTxHash}?network=${currentNetwork.name.toLowerCase()}`;
                        window.open(explorerUrl, "_blank");
                      }}
                    >
                      View in Aptos Explorer
                    </Button>
                  </div>
                )}
              </div>
              <div className="mt-10 flex justify-between">
              <div 
                className="w-16 h-16 bg-surface/70 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:shadow-lg transition-all border border-primary/20"
                onClick={() => setCurrentStep('subscribe')}
              >
                <ChevronRight className="h-8 w-8 text-primary rotate-180" />
              </div>
              <div 
                className="w-16 h-16 bg-primary rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all border-2 border-primary/30"
                onClick={() => setCurrentStep('buy_nft')}
              >
                <ChevronRight className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-center gap-2">
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
              </div>
            </div>
          </div>
        </GridBackground>
      );
    } else if (currentStep === 'buy_nft') {
      return (
        <GridBackground className="border-2 border-primary/30 shadow-lg shadow-primary/10 rounded-2xl overflow-hidden">
          <div className="p-6 md:p-10 min-h-[600px] md:min-h-[700px] flex flex-col relative z-20">
            <div className="text-sm font-medium text-primary mb-6">Demo</div>
            <div className="flex-grow flex flex-col items-center justify-center space-y-6 md:space-y-8">
              <h2 className="text-3xl font-semibold mb-2">Buy NFT</h2>
              <div className="w-full flex flex-col items-center">
                <img src="/nft.png" alt="NFT" className="rounded-lg shadow-lg mb-4 w-64 h-64 object-cover" />
                <p className="text-2xl font-bold">0.001 APT</p>
              </div>
              <Button 
                className="w-full bg-primary hover:bg-primary-hover glow-effect" 
                size="lg"
                onClick={async () => {
                  try {
                    setIsBuyingNft(true);
                    setBuyNftStatus('Processing purchase...');
                    const credentialId = localStorage.getItem("credentialId");
                    const hash = await submitTransfer(
                      credentialId || undefined,
                      aptosAddress || undefined,
                      "0xb485454eba35a2441814f6b635c7bd9b24ae4012a97884f39fc1cd1148122c3a",
                      0.001 * 100000000
                    );
                    if (hash) {
                      setBuyNftTxHash(hash);
                      setBuyNftStatus('Transaction submitted, checking status...');
                      const status = await checkTransactionStatusWithTimeout(hash);
                      setBuyNftStatus(status);
                      if (status.includes('success') || status.includes('Success')) {
                        triggerConfetti('fireworks');
                      }
                    }
                  } catch (error: any) {
                    setBuyNftStatus(`Failed to buy NFT: ${error.message}`);
                  } finally {
                    setIsBuyingNft(false);
                  }
                }}
                disabled={isBuyingNft}
              >
                {isBuyingNft ? 'Processing...' : 'Buy Now'}
              </Button>
              {buyNftStatus && <p className="text-sm text-center mt-2">{buyNftStatus}</p>}
              {buyNftTxHash && (
                <div className="w-full text-center mt-4">
                  <p className="text-sm font-mono break-all">{buyNftTxHash}</p>
                  <Button
                    variant="link"
                    onClick={() => {
                      const explorerUrl = `${currentNetwork.explorerUrl}/${buyNftTxHash}?network=${currentNetwork.name.toLowerCase()}`;
                      window.open(explorerUrl, "_blank");
                    }}
                  >
                    View in Aptos Explorer
                  </Button>
                </div>
              )}
            </div>
            <div className="mt-10 flex justify-between">
              <div 
                className="w-16 h-16 bg-surface/70 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:shadow-lg transition-all border border-primary/20"
                onClick={() => setCurrentStep('send_tip')}
              >
                <ChevronRight className="h-8 w-8 text-primary rotate-180" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-center gap-2">
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                <div className="w-3 h-3 bg-primary rounded-full"></div>
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
            <div className="flex justify-center gap-2">
              <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
              <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
              <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
              <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
              <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
              <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
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
            <div className="flex justify-center gap-2">
              <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
              <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
              <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
              <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
              <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
              <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
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
          <h2 className="text-2xl font-semibold mb-6 text-foreground">Forget seed phases</h2>
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
