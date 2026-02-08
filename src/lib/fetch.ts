import { createFetch, createSchema } from "@better-fetch/fetch";
import { z } from "zod";

const schema = createSchema(
  {
    "https://api.github.com/repos/:owner/:repo/commits": {
      params: z.object({
        owner: z.string(),
        repo: z.string(),
      }),
      query: z.object({
        path: z.string(),
      }),
      output: z.array(
        z.object({
          commit: z.object({
            committer: z.object({
              date: z.string(),
            }),
          }),
        })
      ),
    },
  },
  {
    strict: true,
  }
);

export const api = createFetch({
  schema,
});
