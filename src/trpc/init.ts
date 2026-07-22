import { db } from '@/db';
import { agents, meetings, subscriptions } from '@/db/schema';
import { auth } from '@/lib/auth';
import { MAX_FREE_AGENTS, MAX_FREE_MEETINGS, MAX_PRO_AGENTS } from '@/modules/premium/constants';
import { initTRPC, TRPCError } from '@trpc/server';
import { and, count, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { cache } from 'react';

export const createTRPCContext = cache(async () => {
  return { userId: 'user_123' };
});

const t = initTRPC.create({});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
  }

  return next({ ctx: { ...ctx, auth: session } });
});

export const premiumProcedure = (entity: "meetings" | "agents") =>
  protectedProcedure.use(async ({ ctx, next }) => {
    // Query active subscription from database
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

    const isFreeMeetingLimitReached = planId === "free" && userMeetings.count >= MAX_FREE_MEETINGS;
    const isFreeAgentLimitReached = planId === "free" && userAgents.count >= MAX_FREE_AGENTS;
    const isProAgentLimitReached = planId === "pro" && userAgents.count >= MAX_PRO_AGENTS;

    if (entity === "meetings" && isFreeMeetingLimitReached) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You have reached the maximum number of free meetings (3). Please upgrade to Pro or Ultimate.",
      });
    }

    if (entity === "agents" && isFreeAgentLimitReached) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You have reached the maximum number of free agents (1). Please upgrade to Pro or Ultimate.",
      });
    }

    if (entity === "agents" && isProAgentLimitReached) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You have reached the maximum number of Pro agents (5). Please upgrade to Ultimate for unlimited agents.",
      });
    }

    return next({ ctx: { ...ctx, subscription: sub || null, planId } });
  });
