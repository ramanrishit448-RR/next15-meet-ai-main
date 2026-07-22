"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, handler: () => void) => void;
    };
  }
}

interface UseRazorpayCheckoutProps {
  planName: string;
  planId: string;
  amount: number; // in INR
  userEmail?: string;
  userName?: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
};

export const useRazorpayCheckout = ({
  planName,
  planId,
  amount,
  userEmail,
  userName,
  onSuccess,
  onError,
}: UseRazorpayCheckoutProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const openCheckout = useCallback(async () => {
    setIsLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay script");
      }

      // Create order on server
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, planId, planName }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.error ?? "Failed to create order");
      }

      const { orderId, amount: orderAmount, currency, keyId: serverKeyId } = await orderRes.json();

      const razorpayKey = serverKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error("Razorpay Key ID missing. Check server environment variables.");
      }

      const options: RazorpayOptions = {
        key: razorpayKey,
        amount: orderAmount,
        currency,
        name: "Meet AI",
        description: `${planName} Plan — Monthly Subscription`,
        order_id: orderId,
        handler: async (response: RazorpayPaymentResponse) => {
          try {
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                planId,
                planName,
              }),
            });

            if (!verifyRes.ok) {
              throw new Error("Payment verification failed");
            }

            const { paymentId } = await verifyRes.json();
            toast.success(`Payment successful! Welcome to ${planName}!`);
            onSuccess?.(paymentId);
          } catch (err) {
            const message = err instanceof Error ? err.message : "Verification failed";
            toast.error(message);
            onError?.(message);
          }
        },
        prefill: {
          name: userName ?? "",
          email: userEmail ?? "",
        },
        theme: {
          color: "#10b981", // matches the primary green from globals.css
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Payment initiation failed";
      toast.error(message);
      onError?.(message);
    } finally {
      setIsLoading(false);
    }
  }, [amount, planId, planName, userEmail, userName, onSuccess, onError]);

  return { openCheckout, isLoading };
};
