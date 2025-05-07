import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";

import { TRPCReactProvider } from "@/trpc/react";
import { NuqsAdapter } from 'nuqs/adapters/next/app'

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <NuqsAdapter>{children}</NuqsAdapter>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
