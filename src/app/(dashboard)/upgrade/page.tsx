import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ErrorBoundary } from "react-error-boundary";

import { auth } from "@/lib/auth";
import {
  UpgradeView,
  UpgradeViewError,
  UpgradeViewLoading,
} from "@/modules/premium/ui/views/upgrade-view";

export const dynamic = "force-dynamic";

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <Suspense fallback={<UpgradeViewLoading />}>
      <ErrorBoundary fallback={<UpgradeViewError />}>
        <UpgradeView />
      </ErrorBoundary>
    </Suspense>
  );
};

export default Page;