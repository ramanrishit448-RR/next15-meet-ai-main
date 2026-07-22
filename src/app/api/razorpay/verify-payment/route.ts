import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { razorpay } from "@/lib/razorpay";

export const dynamic = "force-dynamic";


export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
      planName,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment verification parameters" },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Generate expected signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json(
        { error: "Payment verification failed: Invalid signature" },
        { status: 400 }
      );
    }

    // Attempt to fetch order to double check notes if planId wasn't passed directly
    let targetPlanId = planId;
    let targetPlanName = planName;

    try {
      const order = await razorpay.orders.fetch(razorpay_order_id);
      if (order?.notes) {
        if (!targetPlanId && order.notes.planId) targetPlanId = order.notes.planId;
        if (!targetPlanName && order.notes.planName) targetPlanName = order.notes.planName;
      }
    } catch (e) {
      console.warn("Could not fetch order from Razorpay SDK:", e);
    }

    const finalPlanId = targetPlanId || "pro";
    const finalPlanName = targetPlanName || (finalPlanId === "ultimate" ? "Ultimate" : "Pro");
    const userId = session.user.id;

    // Upsert subscription into DB
    const existing = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));

    if (existing.length > 0) {
      await db
        .update(subscriptions)
        .set({
          planId: finalPlanId,
          planName: finalPlanName,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          status: "active",
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.userId, userId));
    } else {
      await db.insert(subscriptions).values({
        userId,
        planId: finalPlanId,
        planName: finalPlanName,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        status: "active",
      });
    }

    return NextResponse.json({
      success: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      planId: finalPlanId,
      planName: finalPlanName,
      message: `Successfully upgraded to ${finalPlanName}!`,
    });
  } catch (error) {
    console.error("Razorpay verify-payment error:", error);
    return NextResponse.json(
      { error: "Payment verification error" },
      { status: 500 }
    );
  }
}
