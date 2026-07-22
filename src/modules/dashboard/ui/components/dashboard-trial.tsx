import Link from "next/link";
import { RocketIcon, SparklesIcon, ZapIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const DashboardTrial = () => {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.premium.getFreeUsage.queryOptions());

  if (!data) return null;

  const { planId, planName, agentCount, meetingCount, maxAgents, maxMeetings } = data;

  const isPro = planId === "pro";
  const isUltimate = planId === "ultimate";
  const isFree = planId === "free";

  return (
    <div className="border border-border/10 rounded-lg w-full bg-white/5 flex flex-col gap-y-2">
      <div className="p-3 flex flex-col gap-y-4">
        <div className="flex items-center gap-2">
          {isUltimate ? (
            <SparklesIcon className="size-4 text-purple-400" />
          ) : isPro ? (
            <ZapIcon className="size-4 text-emerald-400" />
          ) : (
            <RocketIcon className="size-4 text-emerald-500" />
          )}
          <p className="text-sm font-medium">
            {planName} {isFree ? "Trial" : "Plan"}
          </p>
        </div>

        {/* Agents Usage */}
        <div className="flex flex-col gap-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Agents</span>
            <span className="font-medium">
              {maxAgents !== null ? `${agentCount}/${maxAgents}` : `${agentCount} (Unlimited)`}
            </span>
          </div>
          {maxAgents !== null && (
            <Progress value={Math.min((agentCount / maxAgents) * 100, 100)} />
          )}
        </div>

        {/* Meetings Usage */}
        <div className="flex flex-col gap-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Meetings</span>
            <span className="font-medium">
              {maxMeetings !== null ? `${meetingCount}/${maxMeetings}` : `${meetingCount} (Unlimited)`}
            </span>
          </div>
          {maxMeetings !== null && (
            <Progress value={Math.min((meetingCount / maxMeetings) * 100, 100)} />
          )}
        </div>
      </div>

      <Button
        className="bg-transparent border-t border-border/10 hover:bg-white/10 rounded-t-none text-xs h-9"
        asChild
      >
        <Link href="/upgrade">
          {isFree ? "Upgrade" : "Manage Plan"}
        </Link>
      </Button>
    </div>
  );
};
