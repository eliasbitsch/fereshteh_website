import { rehypeCodeDefaultOptions } from "fumadocs-core/mdx-plugins";
import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import lastModified from "fumadocs-mdx/plugins/last-modified";
import { z } from "zod";
import { transformerNpmCommands } from "~/lib/mdx-plugins/rehype-npm-commands";
import { vercelDarkTheme } from "~/lib/mdx-plugins/themes/vercel-dark";
import { vercelLightTheme } from "~/lib/mdx-plugins/themes/vercel-light";

export const pages = defineDocs({
  dir: "src/content/pages",
  docs: {
    schema: z.object({
      title: z.string().max(99).optional(),
    }),
  },
});

export default defineConfig({
  plugins: [],
  mdxOptions: {
    rehypeCodeOptions: {
      themes: {
        light: vercelLightTheme,
        dark: vercelDarkTheme,
      },
      icon: false,
      transformers: [
        ...(rehypeCodeDefaultOptions.transformers ?? []),
        transformerNpmCommands(),
      ],
    },
  },
});
