'use client'

import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  BookMarked,
  Box,
  Globe,
  Link as LinkIcon,
  UserRound,
  AppWindow,
  Wallet,
  Tag,
} from "lucide-react";
import Link from "next/link";

const items = [
  {
    title: "Overview",
    url: "/overview",
    icon: <Globe />,
  },
  {
    title: "Chains",
    url: "/chains/ethereum",
    icon: <LinkIcon />,
  },
  {
    title: "Bundlers",
    url: "/bundlers",
    icon: <Box />,
  },
  {
    title: "Paymasters",
    url: "/paymasters",
    icon: <Wallet />,
  },
  {
    title: "Accounts",
    url: "/accounts",
    icon: <UserRound />,
  },
  {
    title: "Apps",
    url: "/apps",
    icon: <AppWindow />,
  },
  {
    title: "Unlabeled Addresses",
    url: "/unlabeled-addresses",
    icon: <Tag />,
  },
  { title: "Address Book", url: "/address-book", icon: <BookMarked /> },
];

export function GlobalSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>ERC4337 Stats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url || 
                  (item.url !== '/' && pathname?.startsWith(item.url));
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      className={isActive ? "bg-muted text-primary" : ""}
                    >
                      <a href={item.url}>
                        {item.icon}
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="flex flex-row gap-0 whitespace-pre text-sm text-muted-foreground mx-auto">
        Inspired by{" "}
        <Link
          className="underline"
          href={"https://www.bundlebear.com/overview/all"}
        >
          BundleBear
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
