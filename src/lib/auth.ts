import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

const trustedOrigins = [
  "https://meet-ai-main.vercel.app",
  "http://localhost:3000",
];

if (process.env.VERCEL_URL) {
  trustedOrigins.push(`https://${process.env.VERCEL_URL}`);
}
if (process.env.BETTER_AUTH_URL) {
  trustedOrigins.push(process.env.BETTER_AUTH_URL);
}
if (process.env.NEXT_PUBLIC_APP_URL) {
  trustedOrigins.push(process.env.NEXT_PUBLIC_APP_URL);
}

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins,
  emailAndPassword: { enabled: true },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
});
