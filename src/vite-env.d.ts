/// <reference types="vite/client" />

interface Window {
  WhateeCheckout: {
    open: (options: { payment_token: string; merchant_id: string }) => void;
  };
}
