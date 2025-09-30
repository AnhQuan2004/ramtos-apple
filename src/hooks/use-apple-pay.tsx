import { useState, useCallback } from 'react';
import { PAYMENT_CONFIG } from '@/lib/payment-config';

interface OrderLine {
  quantity: number;
  key: string;
  unit_price: number;
  title: string;
  image_url: string;
  compared_price: number;
  properties: { key: string; value: string }[];
}

interface UseApplePayProps {
  amount?: number;
  orderLines?: OrderLine[];
}

export const useApplePay = ({ amount, orderLines }: UseApplePayProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApplePay = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const usdcAmount = amount || 1;
      const orderData = orderLines || [
        {
          quantity: 1,
          key: 'usdc-custom',
          unit_price: usdcAmount,
          title: `${usdcAmount} USDC`,
          image_url: 'https://coin-images.coingecko.com/coins/images/51504/large/pngtree-usd-coin-usdc-digital-stablecoin-icon-technology-pay-web-vector-png-image_37843734.png',
          compared_price: usdcAmount,
          properties: [
            { key: "blockchain", value: "Solana" },
            { key: "token_standard", value: "SPL Token" },
            { key: "network", value: "Devnet" }
          ]
        },
      ];

      const response = await fetch(PAYMENT_CONFIG.api_url, {
        method: 'POST',
        headers: {
          'api-key': PAYMENT_CONFIG.api_key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: usdcAmount,
          currency: 'USD',
          subtotal: usdcAmount,
          shipping_name: 'Digital Delivery',
          shipping_fee: 0,
          tax_amount: 0,
          order_lines: orderData,
          success_url: `${window.location.origin}/thankyou`,
          cancel_url: `${window.location.origin}/cancel?popup=true`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const order = await response.json();
      console.log('Payment API Response:', order);

      // Find the payment URL in the links array
      const payLink = order.links.find((link: any) => link.rel === 'pay');

      if (payLink && payLink.href) {
        window.location.href = payLink.href;
      } else {
        throw new Error('Payment URL not found');
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [amount, orderLines]);

  return { handleApplePay, isLoading, error };
};
