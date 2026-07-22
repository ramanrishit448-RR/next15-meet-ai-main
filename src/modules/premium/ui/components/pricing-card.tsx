import { CircleCheckIcon, SparklesIcon, ZapIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const pricingCardVariants = cva(
  "relative rounded-2xl p-6 w-full flex flex-col transition-all duration-300 overflow-hidden group",
  {
    variants: {
      variant: {
        default:
          "bg-white text-black border border-gray-200 hover:border-gray-300 hover:shadow-lg hover:-translate-y-0.5",
        highlighted:
          "bg-gradient-to-br from-[#093C23] via-[#0a4a2a] to-[#051B16] text-white border border-emerald-800/50 shadow-2xl shadow-emerald-900/30 hover:shadow-emerald-800/40 hover:-translate-y-1",
        premium:
          "bg-gradient-to-br from-[#1a0533] via-[#2d0a52] to-[#0f0120] text-white border border-purple-800/50 shadow-2xl shadow-purple-900/30 hover:shadow-purple-700/40 hover:-translate-y-1",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const pricingCardIconVariants = cva("size-5 shrink-0", {
  variants: {
    variant: {
      default: "fill-emerald-500 text-white",
      highlighted: "fill-emerald-400 text-[#093C23]",
      premium: "fill-purple-400 text-[#1a0533]",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const pricingCardSecondaryTextVariants = cva("", {
  variants: {
    variant: {
      default: "text-neutral-500",
      highlighted: "text-emerald-200/80",
      premium: "text-purple-200/80",
    },
  },
});

const pricingCardBadgeVariants = cva(
  "text-xs font-semibold px-2.5 py-1 rounded-full tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-emerald-100 text-emerald-700",
        highlighted: "bg-emerald-400/20 text-emerald-300 border border-emerald-500/30",
        premium: "bg-purple-400/20 text-purple-300 border border-purple-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const pricingCardButtonVariants = cva("w-full font-semibold transition-all duration-200", {
  variants: {
    variant: {
      default:
        "bg-transparent border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white",
      highlighted:
        "bg-emerald-400 text-[#051B16] hover:bg-emerald-300 shadow-lg shadow-emerald-900/40",
      premium:
        "bg-purple-500 text-white hover:bg-purple-400 shadow-lg shadow-purple-900/50",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface Props extends VariantProps<typeof pricingCardVariants> {
  badge?: string | null;
  price: number;
  features: string[];
  title: string;
  description?: string | null;
  priceSuffix: string;
  className?: string;
  buttonText: string;
  onClick: () => void;
  isLoading?: boolean;
  isCurrentPlan?: boolean;
}

const PlanIcon = ({ variant }: { variant: Props["variant"] }) => {
  if (variant === "premium")
    return <SparklesIcon className="size-5 text-purple-400" />;
  if (variant === "highlighted")
    return <ZapIcon className="size-5 text-emerald-400" />;
  return null;
};

export const PricingCard = ({
  variant,
  badge,
  price,
  features,
  title,
  description,
  priceSuffix,
  className,
  buttonText,
  onClick,
  isLoading,
  isCurrentPlan,
}: Props) => {
  return (
    <div className={cn(pricingCardVariants({ variant }), className)}>
      {/* Decorative glow blob */}
      {variant === "highlighted" && (
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-500" />
      )}
      {variant === "premium" && (
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-500" />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-x-4 mb-1">
        <div className="flex flex-col gap-y-1.5">
          <div className="flex items-center gap-x-2">
            <PlanIcon variant={variant} />
            <h6 className="font-bold text-xl tracking-tight">{title}</h6>
          </div>
          {badge && (
            <span className={cn(pricingCardBadgeVariants({ variant }), "self-start")}>
              {badge}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className={cn("text-sm mt-2 leading-relaxed", pricingCardSecondaryTextVariants({ variant }))}>
        {description}
      </p>

      {/* Price */}
      <div className="flex items-end gap-x-1 mt-5">
        <span className={cn("text-sm font-semibold", pricingCardSecondaryTextVariants({ variant }))}>
          ₹
        </span>
        <h4 className="text-5xl font-extrabold tracking-tighter leading-none">
          {price.toLocaleString("en-IN")}
        </h4>
        <span className={cn("text-sm mb-1.5 font-medium", pricingCardSecondaryTextVariants({ variant }))}>
          {priceSuffix}
        </span>
      </div>

      <div className="py-5">
        <Separator
          className={cn(
            "opacity-20",
            variant === "default" ? "bg-gray-300" : "bg-white"
          )}
        />
      </div>

      {/* CTA Button */}
      <Button
        className={cn(pricingCardButtonVariants({ variant }), "h-11 text-sm rounded-xl")}
        onClick={onClick}
        disabled={isLoading || isCurrentPlan}
      >
        {isLoading ? (
          <span className="flex items-center gap-x-2">
            <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Processing…
          </span>
        ) : isCurrentPlan ? (
          "✓ Current Plan"
        ) : (
          buttonText
        )}
      </Button>

      {/* Features */}
      <div className="flex flex-col gap-y-3 mt-6">
        <p className={cn("text-xs font-bold uppercase tracking-widest", pricingCardSecondaryTextVariants({ variant }))}>
          What&apos;s included
        </p>
        <ul className="flex flex-col gap-y-2.5">
          {features.map((feature, index) => (
            <li key={index} className={cn("flex items-start gap-x-2.5 text-sm", pricingCardSecondaryTextVariants({ variant }))}>
              <CircleCheckIcon
                className={cn(pricingCardIconVariants({ variant }), "mt-0.5")}
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
