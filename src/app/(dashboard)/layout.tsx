import type React from "react";
import RootLayout from "../rootLayout";
import { SidebarProvider } from "@/components/ui/sidebar";
import { GlobalSidebar } from "@/components/sidebar";

export default function DahboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RootLayout>
      <SidebarProvider>
        <GlobalSidebar />
        <main className="flex-1 w-full">{children}</main>
      </SidebarProvider>
    </RootLayout>
  );
}
