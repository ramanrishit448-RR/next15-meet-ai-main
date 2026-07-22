import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { razorpay } from "@/lib/razorpay";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId === "rzp_test_placeholder") {
      console.error("Razorpay keys missing in environment variables.");
      return NextResponse.json(
        {
          error:
            "Razorpay API keys missing. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your Vercel Environment Variables.",
        },
        { status: 500 }
      );
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to upgrade your subscription." },
        { status: 401 }
      );
    }

    const { amount, currency = "INR", planId, planName } = await req.json();

    if (!amount || typeof amount !== "number") {
      return NextResponse.json(
        { error: "Invalid plan amount." },
        { status: 400 }
      );
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects paise (1 INR = 100 paise)
      currency,
      receipt: `rcpt_${Date.now()}`,
      notes: {
        userId: session.user.id,
        planId: planId ?? "",
        planName: planName ?? "",
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (error: unknown) {
    console.error("Razorpay create-order error:", error);
    const err = error as { error?: { description?: string }; message?: string };
    const errorMessage =
      err?.error?.description ||
      err?.message ||
      "Failed to create order with Razorpay.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
