"use client";

import { useState } from "react";
import { SparklesIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";

import { PricingCard } from "../components/pricing-card";
import { useRazorpayCheckout } from "../components/razorpay-checkout";
import { SUBSCRIPTION_PLANS, type PlanId, type SubscriptionPlan } from "../../constants";

// ─── Individual plan card with its own checkout hook ───────────────────────
const PlanCard = ({
  plan,
  currentPlanId,
  userEmail,
  userName,
  onSuccess,
}: {
  plan: SubscriptionPlan;
  currentPlanId: PlanId;
  userEmail?: string;
  userName?: string;
  onSuccess: (planId: PlanId) => void;
}) => {
  const isCurrentPlan = plan.id === currentPlanId;
  const isFree = plan.price === 0;

  const { openCheckout, isLoading } = useRazorpayCheckout({
    planName: plan.name,
    planId: plan.id,
    amount: plan.price,
    userEmail,
    userName,
    onSuccess: () => onSuccess(plan.id),
  });

  let buttonText = plan.cta;
  const handleClick = () => {
    if (isCurrentPlan || isFree) return;
    openCheckout();
  };

  return (
    <PricingCard
      variant={plan.variant}
      title={plan.name}
      description={plan.description}
      price={plan.price}
      priceSuffix={isFree ? "" : "/month"}
      features={plan.features}
      badge={plan.badge}
      buttonText={buttonText}
      onClick={handleClick}
      isLoading={isLoading}
      isCurrentPlan={isCurrentPlan}
    />
  );
};

// ─── Main upgrade view ──────────────────────────────────────────────────────
export const UpgradeView = () => {
  const { data: session } = authClient.useSession();
  const [currentPlanId, setCurrentPlanId] = useState<PlanId>("free");

  const userName = session?.user?.name;
  const userEmail = session?.user?.email;

  return (
    <div className="flex-1 py-8 px-4 md:px-8 flex flex-col gap-y-10 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col items-center gap-y-3 text-center max-w-2xl mx-auto">
        <div className="flex items-center gap-x-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
          <SparklesIcon className="size-4 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-700">Choose Your Plan</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          Upgrade your{" "}
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            Meet.AI
          </span>{" "}
          experience
        </h1>
        <p className="text-muted-foreground text-base max-w-lg">
          Pick the plan that fits your workflow. Upgrade, downgrade, or cancel
          anytime. All plans billed monthly in INR.
        </p>
        <div className="mt-1 px-4 py-2 rounded-lg bg-muted/60 border">
          <p className="text-sm text-muted-foreground">
            You are currently on the{" "}
            <span className="font-semibold text-foreground capitalize">
              {currentPlanId}
            </span>{" "}
            plan
          </p>
        </div>
      </div>

      {/* Pricing cards */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 pb-8">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            currentPlanId={currentPlanId}
            userEmail={userEmail ?? undefined}
            userName={userName ?? undefined}
            onSuccess={(planId) => setCurrentPlanId(planId)}
          />
        ))}
      </div>

      {/* Footer note */}
      <div className="text-center text-xs text-muted-foreground pb-4">
        <p>
          Payments are securely processed by{" "}
          <span className="font-semibold">Razorpay</span>. All prices are in
          Indian Rupees (INR) and include GST.
        </p>
        <p className="mt-1">
          Need help?{" "}
          <a
            href="mailto:support@meetai.com"
            className="text-emerald-600 hover:underline font-medium"
          >
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
};

export const UpgradeViewLoading = () => {
  return (
    <div className="flex-1 py-8 px-4 md:px-8 flex flex-col gap-y-10">
      <div className="flex flex-col items-center gap-y-3 text-center">
        <div className="h-8 w-48 bg-muted animate-pulse rounded-full" />
        <div className="h-12 w-96 bg-muted animate-pulse rounded-xl" />
        <div className="h-5 w-80 bg-muted animate-pulse rounded-lg" />
      </div>
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border bg-muted animate-pulse h-[480px]"
          />
        ))}
      </div>
    </div>
  );
};

export const UpgradeViewError = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold">Something went wrong</p>
        <p className="text-sm text-muted-foreground">
          Please refresh the page or try again later.
        </p>
      </div>
    </div>
  );
};
