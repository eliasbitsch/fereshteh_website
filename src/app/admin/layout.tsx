import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - CMS",
  description: "Content Management System",
  robots: "noindex, nofollow",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
