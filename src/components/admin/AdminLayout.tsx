// src/components/admin/AdminLayout.tsx
import React, { useState, ReactNode } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Sidebar } from "@/components/admin/Sidebar";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Menu,
  Timer,
  Loader2,
  Home,
  ChevronRight,
  User as UserIcon,
  Plus,
  StickyNote,
  ListTodo,
  Banknote,
  ExternalLink,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "../ui/separator";
import { useAppSelector } from "@/store/hooks";
import {
  useGetLearningDataQuery,
  useSignOutMutation,
} from "@/store/api/adminApi";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
};

const Breadcrumbs = () => {
  const router = useRouter();
  const pathSegments = router.asPath.split("/").filter((segment) => segment);

  if (pathSegments.length <= 1) {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Home className="h-4 w-4" /> Dashboard
      </div>
    );
  }

  return (
    <nav className="hidden items-center gap-2 text-sm font-medium md:flex">
      <Link href="/admin" className="text-muted-foreground hover:text-foreground">
        Admin
      </Link>
      {pathSegments.slice(1).map((segment, index) => {
        const isLast = index === pathSegments.length - 2;
        const href = "/admin/" + pathSegments.slice(1, index + 2).join("/");
        return (
          <React.Fragment key={href}>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            {isLast ? (
              <span className="font-semibold text-foreground capitalize">{segment}</span>
            ) : (
              <Link href={href} className="text-muted-foreground hover:text-foreground capitalize">{segment}</Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { session } = useAuthGuard();

  const { activeSession, elapsedTime } = useAppSelector(
    (state) => state.learningSession,
  );
  const { data: learningData } = useGetLearningDataQuery();
  const [signOut] = useSignOutMutation();

  const handleLogout = async () => {
    await signOut().unwrap();
    router.replace("/admin/login");
  };

  const currentTopicName = activeSession
    ? learningData?.topics.find((t) => t.id === activeSession.topic_id)?.title
    : null;

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <Sidebar />
      </div>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background/80 px-4 shadow-sm backdrop-blur-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden -ml-2">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open sidebar</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <Sidebar onLinkClick={() => setMobileSidebarOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="h-6 w-px bg-border lg:hidden" aria-hidden="true" />
          
          <Breadcrumbs />

          <div className="flex flex-1 items-center justify-end gap-x-4 self-stretch lg:gap-x-6">
            {activeSession && (
              <Button
                variant="ghost"
                onClick={() => router.push("/admin/learning")}
                className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
              >
                <Timer className="size-4 animate-pulse" />
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline truncate max-w-[150px]">
                    {currentTopicName || "Session"}
                  </span>
                  {elapsedTime === null ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <span className="font-mono tracking-wider">
                      {formatTime(elapsedTime)}
                    </span>
                  )}
                </div>
              </Button>
            )}
            
            <Separator orientation="vertical" className="h-6" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{session?.user.email?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:block text-sm font-medium">{session?.user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/"><ExternalLink className="mr-2 h-4 w-4"/>Back to Portfolio</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>

      {/* Global Quick Add FAB */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-10" size="icon">
            <Plus className="h-6 w-6" />
            <span className="sr-only">Quick Add</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="mb-2">
          <DropdownMenuLabel>Quick Add</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/admin/tasks')}><ListTodo className="mr-2 h-4 w-4" />New Task</DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/admin/notes')}><StickyNote className="mr-2 h-4 w-4" />New Note</DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/admin/finance')}><Banknote className="mr-2 h-4 w-4" />New Transaction</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

    </div>
  );
}