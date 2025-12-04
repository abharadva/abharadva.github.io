// src/components/admin/Sidebar.tsx
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Banknote,
  BookText,
  LayoutTemplate,
  ListTodo,
  Lock,
  StickyNote,
  Calendar as CalendarIcon,
  BrainCircuit,
  Home,
  Navigation as NavigationIcon,
  ImageIcon,
  Settings,
  FlaskConical,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useSignOutMutation } from "@/store/api/adminApi";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "../ui/skeleton";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

const mainNav = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Calendar", href: "/admin/calendar", icon: CalendarIcon },
  { name: "Analytics", href: "/admin/analytics", icon: LayoutDashboard },
];

const portfolioNav = [
  { name: "Blog", href: "/admin/blog", icon: BookText },
  { name: "Content", href: "/admin/content", icon: LayoutTemplate },
  { name: "Assets", href: "/admin/assets", icon: ImageIcon },
];

const productivityNav = [
  { name: "Tasks", href: "/admin/tasks", icon: ListTodo },
  { name: "Notes", href: "/admin/notes", icon: StickyNote },
  { name: "Finance", href: "/admin/finance", icon: Banknote },
  { name: "Learning", href: "/admin/learning", icon: BrainCircuit },
];

const systemNav = [
  { name: "Navigation", href: "/admin/navigation", icon: NavigationIcon },
  { name: "Settings", href: "/admin/settings", icon: Settings },
  { name: "Security", href: "/admin/security", icon: Lock },
  { name: "CRUD Test", href: "/admin/test", icon: FlaskConical },
];

interface SidebarProps {
  onLinkClick?: () => void;
}

export function Sidebar({ onLinkClick }: SidebarProps) {
  const router = useRouter();
  const { session } = useAuthGuard();
  const [signOut] = useSignOutMutation();

  const handleLogout = async () => {
    await signOut().unwrap();
    router.replace("/admin/login");
  };

  const NavLink = ({
    item,
  }: {
    item: { name: string; href: string; icon: React.ElementType };
  }) => {
    const isActive =
      router.pathname === item.href ||
      (item.href !== "/admin" && router.pathname.startsWith(item.href));
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              onClick={onLinkClick}
              className={cn(
                "group flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>{item.name}</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="md:hidden">
            {item.name}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-background px-4">
      <div className="flex h-16 shrink-0 items-center">
        <Link
          href="/admin"
          className="font-mono text-lg font-semibold tracking-tighter"
        >
          ADMIN<span className="text-primary">.</span>PANEL
        </Link>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {mainNav.map((item) => (
                <li key={item.name}>
                  <NavLink item={item} />
                </li>
              ))}
            </ul>
          </li>

          <li className="flex-1">
            <Accordion
              type="multiple"
              defaultValue={["portfolio", "productivity", "system"]}
              className="w-full"
            >
              <AccordionItem value="portfolio" className="border-b-0">
                <AccordionTrigger className="py-2 text-xs font-mono uppercase text-muted-foreground hover:no-underline">
                  Portfolio
                </AccordionTrigger>
                <AccordionContent className="pt-1">
                  <ul className="space-y-1 list-none">
                    {portfolioNav.map((item) => (
                      <li key={item.name}>
                        <NavLink item={item} />
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="productivity" className="border-b-0">
                <AccordionTrigger className="py-2 text-xs font-mono uppercase text-muted-foreground hover:no-underline">
                  Productivity
                </AccordionTrigger>
                <AccordionContent className="pt-1">
                  <ul className="space-y-1 list-none">
                    {productivityNav.map((item) => (
                      <li key={item.name}>
                        <NavLink item={item} />
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="system" className="border-b-0">
                <AccordionTrigger className="py-2 text-xs font-mono uppercase text-muted-foreground hover:no-underline">
                  System
                </AccordionTrigger>
                <AccordionContent className="pt-1">
                  <ul className="space-y-1 list-none">
                    {systemNav.map((item) => (
                      <li key={item.name}>
                        <NavLink item={item} />
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </li>

          <li className="-mx-4 mt-auto border-t">
            {session ? (
              <div className="flex items-center justify-between p-4">
                <div className="truncate">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {session.user.email}
                  </p>
                </div>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Logout</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ) : (
              <div className="p-4">
                <Skeleton className="h-8 w-full" />
              </div>
            )}
          </li>
        </ul>
      </nav>
    </div>
  );
}
