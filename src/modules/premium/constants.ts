export const MAX_FREE_MEETINGS = 3;
export const MAX_FREE_AGENTS = 1;
export const MAX_PRO_AGENTS = 5;


export type PlanId = "free" | "pro" | "ultimate";

export interface PlanFeature {
  text: string;
}

export interface SubscriptionPlan {
  id: PlanId;
  name: string;
  description: string;
  price: number; // in INR (per month)
  badge?: string;
  variant: "default" | "highlighted" | "premium";
  features: string[];
  cta: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for getting started with AI-powered meetings.",
    price: 0,
    variant: "default",
    cta: "Current Plan",
    features: [
      `${MAX_FREE_MEETINGS} meetings per month`,
      `${MAX_FREE_AGENTS} AI agent`,
      "Basic meeting summaries",
      "Standard transcription",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "For professionals who need more power and flexibility.",
    price: 499,
    badge: "Most Popular",
    variant: "highlighted",
    cta: "Upgrade to Pro",
    features: [
      "Unlimited meetings",
      "5 AI agents",
      "Advanced AI summaries",
      "Real-time transcription",
      "Action item extraction",
      "Priority support",
      "Custom meeting templates",
    ],
  },
  {
    id: "ultimate",
    name: "Ultimate",
    description: "For teams and enterprises that need everything.",
    price: 999,
    badge: "Best Value",
    variant: "premium",
    cta: "Upgrade to Ultimate",
    features: [
      "Unlimited meetings",
      "Unlimited AI agents",
      "Advanced AI summaries",
      "Real-time transcription",
      "Action item extraction",
      "White-label branding",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
    ],
  },
];
