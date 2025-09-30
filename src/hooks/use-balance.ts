import { useState, useEffect } from 'react';

interface Coin {
  coin_type: string;
  amount: string;
  symbol: string;
  name: string;
  decimals: number;
  formattedAmount?: string;
}

interface BalanceResponse {
  success: boolean;
  data: {
    address: string;
    coins: Coin[];
    tokens: any[];
    digitalAssets: any[];
    fungibleAssets: any[];
  };
  message: string;
}

export function useBalance(address: string | null) {
  const [balance, setBalance] = useState<Coin[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!address) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Make API call to get portfolio data
        const response = await fetch(`https://nguyenanhquan.online/portfolio/${address}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const result: BalanceResponse = await response.json();
        
        // Check if the API call was successful
        if (result.success && result.data && result.data.coins) {
          // Format the amounts for each coin
          const formattedCoins = result.data.coins.map(coin => ({
            ...coin,
            formattedAmount: formatAmount(coin.amount, coin.decimals)
          }));
          
          setBalance(formattedCoins);
        } else {
          throw new Error(result.message || "Failed to fetch balance data");
        }
      } catch (err: any) {
        console.error('Error fetching balance:', err);
        setError(err.message || 'Failed to fetch balance');
        setBalance([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBalance();
  }, [address]);
  
  // Format amount based on decimals
  const formatAmount = (amount: string, decimals: number): string => {
    const value = parseInt(amount) / Math.pow(10, decimals);
    
    // Format based on symbol type (can customize further if needed)
    if (value >= 1000) {
      // Use commas for thousands separator for large numbers
      return value.toLocaleString(undefined, { 
        minimumFractionDigits: decimals > 6 ? 6 : decimals,
        maximumFractionDigits: decimals > 6 ? 6 : decimals
      });
    } else {
      // Show full precision for smaller numbers
      return value.toFixed(decimals);
    }
  };
  
  // Get a specific coin balance by symbol
  const getCoinBalance = (symbol: string) => {
    return balance.find(c => c.symbol === symbol) || null;
  };

  return {
    balance,
    aptBalance: getCoinBalance('APT'),
    usdcBalance: getCoinBalance('USDC'),
    isLoading,
    error,
    // Helper to get any coin by symbol
    getCoinBalance
  };
}