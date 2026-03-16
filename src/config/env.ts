import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),

    GITHUB_TOKEN: z.string().optional(),

    // Feature flags
    AVAILABLE_FOR_WORK: z
      .enum(["true", "false"])
      .transform((s) => s === "true")
      .pipe(z.boolean())
      .default(false),
  },
  client: {
    NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().optional(),
    NEXT_PUBLIC_UMAMI_SHARE_URL: z.string().optional(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_UMAMI_WEBSITE_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
    NEXT_PUBLIC_UMAMI_SHARE_URL: process.env.NEXT_PUBLIC_UMAMI_SHARE_URL,
  },
  emptyStringAsUndefined: true,
});
