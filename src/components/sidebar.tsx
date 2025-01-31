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
  { title: "Address Book", url: "/address-book", icon: <BookMarked /> },
];

export function GlobalSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>ERC-4337 Stats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      {item.icon}
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
