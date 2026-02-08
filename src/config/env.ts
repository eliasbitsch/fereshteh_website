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
  experimental__runtimeEnv: {},
  emptyStringAsUndefined: true,
});
