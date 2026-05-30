import type { Metadata } from "next";

import { AuthProvider } from "@/components/providers/auth-provider";
import { PRODUCT } from "@/lib/constants/product";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: PRODUCT.name,
    template: `%s | ${PRODUCT.name}`,
  },
  description: PRODUCT.shortDescription,
  applicationName: PRODUCT.name,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen bg-background font-sans text-foreground antialiased">
          {children}
        </body>
      </html>
    </AuthProvider>
  );
}
