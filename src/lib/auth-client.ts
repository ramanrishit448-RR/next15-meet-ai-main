import { polarClient } from "@polar-sh/better-auth";
// import { sentinelClient } from "@better-auth/infra/client";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [polarClient()] // Add back sentinelClient() once you have a BETTER_AUTH_API_KEY
});
