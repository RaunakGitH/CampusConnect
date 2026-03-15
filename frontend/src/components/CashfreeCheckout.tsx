// frontend/src/components/CashfreeCheckout.tsx
// Loads Cashfree JS SDK and opens payment UI inline (no redirect needed).
//
// ── FIX: All backend calls now go through subscriptionApi (the api() wrapper)
//         which automatically refreshes the access token on 401 and retries.
//         The old raw fetch() calls bypassed this, causing "authentication failed"
//         if the 15-min access token expired while the Cashfree modal was open.

import { useState } from "react";
import { Crown, Loader2 } from "lucide-react";
import { subscriptionApi } from "@/services/api";

declare global {
  interface Window { Cashfree: any; }
}

interface Props {
  onSuccess: (subscription: any) => void;
  onError?: (msg: string) => void;
  label?: string;
  subscriptionType?: string;
  couponCode?: string;
}

function loadCashfreeSDK(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Cashfree) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

const CashfreeCheckout = ({
  onSuccess, onError,
  label = "Upgrade to Premium",
  subscriptionType = "student",
  couponCode,
}: Props) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      // 1. Create order — uses api() wrapper with auto token-refresh on 401
      const orderData = await subscriptionApi.createOrder(subscriptionType, couponCode);
      const { orderId, paymentSessionId, cfEnv } = orderData;

      // 2. Load Cashfree SDK
      const loaded = await loadCashfreeSDK();
      if (!loaded) throw new Error("Could not load payment SDK. Check your connection.");

      // 3. Open Cashfree checkout modal
      const cashfree = new window.Cashfree({ mode: cfEnv === "production" ? "production" : "sandbox" });
      const result = await cashfree.checkout({ paymentSessionId, redirectTarget: "_modal" });

      if (result.error) throw new Error(result.error.message || "Payment failed.");
      if (result.redirect) {
        // Cashfree sandbox (and some production flows) redirect instead of
        // closing the modal. Store the pending order so SubscriptionPage can
        // verify it when the return_url lands back on /subscription.
        sessionStorage.setItem("cc_pending_order", JSON.stringify({
          orderId, subType: subscriptionType, couponC: couponCode || "",
        }));
        return;
      }

      // 4. Verify payment — fresh token fetched here via api() wrapper, handles
      //    the case where the 15-min access token expired during the payment modal.
      const verifyData = await subscriptionApi.verifyOrder(orderId, couponCode);
      onSuccess(verifyData.subscription);

    } catch (err: any) {
      onError?.(err.message || "Payment failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors shadow-lg shadow-primary/25"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crown className="h-4 w-4" />}
      {loading ? "Opening payment..." : label}
    </button>
  );
};

export default CashfreeCheckout;
