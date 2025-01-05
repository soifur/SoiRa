import { Button } from "./ui/button";
import { Bot, Archive, Folder, Users, CreditCard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ProfileMenu } from "./ProfileMenu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export const Navigation = () => {
  const location = useLocation();
  const isEmbedded = location.pathname.startsWith('/embed/');

  if (isEmbedded) return null;

  const menuItems = [
    { icon: Bot, to: "/bots", label: "Bots" },
    { icon: Folder, to: "/folders", label: "Folders" },
    { icon: CreditCard, to: "/subscriptions", label: "Subscriptions" },
    { icon: Users, to: "/users", label: "Users" },
    { icon: Archive, to: "/archive", label: "Archive" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <div className="flex gap-6 md:gap-10">
          {menuItems.map(({ icon: Icon, to }) => (
            <Link key={to} to={to}>
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Icon className="h-5 w-5" />
              </Button>
            </Link>
          ))}
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <ProfileMenu />
        </div>
      </div>

      {/* Mobile Navigation Sidebar */}
      <Sidebar className="lg:hidden">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map(({ icon: Icon, to, label }) => (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton asChild>
                      <Link to={to}>
                        <Icon className="h-5 w-5" />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </nav>
  );
};