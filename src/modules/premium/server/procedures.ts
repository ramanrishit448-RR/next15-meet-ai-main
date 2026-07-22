import { eq, count, and } from "drizzle-orm";

import { db } from "@/db";
import { agents, meetings, subscriptions } from "@/db/schema";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { SUBSCRIPTION_PLANS, MAX_FREE_AGENTS, MAX_FREE_MEETINGS, MAX_PRO_AGENTS } from "../constants";

export const premiumRouter = createTRPCRouter({
  getCurrentSubscription: protectedProcedure.query(async ({ ctx }) => {
    try {
      const [sub] = await db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.userId, ctx.auth.user.id),
            eq(subscriptions.status, "active")
          )
        );

      if (!sub) {
        return {
          planId: "free",
          planName: "Free",
          status: "active",
        };
      }

      return {
        id: sub.id,
        planId: sub.planId,
        planName: sub.planName,
        status: sub.status,
        updatedAt: sub.updatedAt,
      };
    } catch (error) {
      console.error("Failed to fetch current subscription:", error);
      return {
        planId: "free",
        planName: "Free",
        status: "active",
      };
    }
  }),

  getProducts: protectedProcedure.query(async () => {
    return SUBSCRIPTION_PLANS;
  }),

  getFreeUsage: protectedProcedure.query(async ({ ctx }) => {
    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, ctx.auth.user.id),
          eq(subscriptions.status, "active")
        )
      );

    const planId = sub?.planId || "free";
    const planName = sub?.planName || (planId === "pro" ? "Pro" : planId === "ultimate" ? "Ultimate" : "Free");

    const [userMeetings] = await db
      .select({
        count: count(meetings.id),
      })
      .from(meetings)
      .where(eq(meetings.userId, ctx.auth.user.id));

    const [userAgents] = await db
      .select({
        count: count(agents.id),
      })
      .from(agents)
      .where(eq(agents.userId, ctx.auth.user.id));

    return {
      planId,
      planName,
      meetingCount: userMeetings.count,
      maxMeetings: planId === "free" ? MAX_FREE_MEETINGS : null,
      agentCount: userAgents.count,
      maxAgents: planId === "free" ? MAX_FREE_AGENTS : planId === "pro" ? MAX_PRO_AGENTS : null,
    };
  })
});