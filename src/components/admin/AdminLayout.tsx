// src/components/admin/AdminLayout.tsx
import { useState, ReactNode } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Sidebar } from "@/components/admin/Sidebar";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, Timer, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "../ui/separator";
import { useAppSelector } from "@/store/hooks";
import {
  useGetLearningDataQuery,
  useSignOutMutation,
} from "@/store/api/adminApi";

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
};

export function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open sidebar</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <Sidebar onLinkClick={() => setMobileSidebarOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="h-6 w-px bg-border lg:hidden" aria-hidden="true" />

          <div className="flex flex-1 items-center justify-end gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
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
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">Back to Portfolio</Link>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="mr-2 size-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
