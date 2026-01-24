"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "~/components/site-footer";
import { SiteHeader } from "~/components/site-header";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
