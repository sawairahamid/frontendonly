import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "ResolveSync — Automation Control Center",
  description:
    "Monitor automation workflows, connected integrations and every execution across your systems.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
