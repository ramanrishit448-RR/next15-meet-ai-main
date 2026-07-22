import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { razorpay } from "@/lib/razorpay";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, currency = "INR", planId, planName } = await req.json();

    if (!amount || typeof amount !== "number") {
      return NextResponse.json(
        { error: "Invalid amount" },
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
    });
  } catch (error) {
    console.error("Razorpay create-order error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
