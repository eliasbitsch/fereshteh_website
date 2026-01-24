import "~/styles/globals.css";

import type { Metadata, Viewport } from "next";
import { LayoutWrapper } from "~/components/layout-wrapper";
import { Providers } from "~/components/providers";
import { fonts } from "~/config/fonts";
import { siteConfig } from "~/config/site";
import { cx } from "~/lib/cva";

export const metadata: Metadata = {
  title: {
    template: `%s | ${siteConfig.name}`,
    default: siteConfig.name,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  alternates: {
    canonical: siteConfig.url,
  },
  authors: {
    name: siteConfig.name,
    url: siteConfig.url,
  },
  twitter: {
    creator: "@fellipeutaka",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      className={cx(
        "motion-safe:scroll-smooth",
        fonts.sans.variable,
        fonts.mono.variable
      )}
      lang="en"
      suppressHydrationWarning
    >
      <body>
        <noscript>
          <style>
            {".motion { opacity: 1 !important; transform: none !important }"}
          </style>
        </noscript>

        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
