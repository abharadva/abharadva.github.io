
/*
This file has been completely restyled to adopt the neo-brutalist aesthetic.
- All modern, subtle styles (`rounded-lg`, `shadow-sm`, theme variables) have been replaced with hard shadows, thick borders, and a high-contrast palette.
- The layout is simplified, using bold `Card` components with hard shadows for stats.
- The `Tabs` component has been replaced with simple, bordered buttons for a rawer feel.
- A custom `StatCard` component is introduced to encapsulate the brutalist card style.
- The header is made bolder with a thick bottom border. "MFA Enabled" uses a custom, bordered badge.
- The logout button now uses the redesigned `Button` component with its new destructive variant style.
- The font is switched to 'Space Mono' via the global `font-mono` class.
*/
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import BlogManager from "@/components/admin/blog-manager";
import ContentManager from "@/components/admin/content-manager";
import SecuritySettings from "@/components/admin/security-settings";
import TaskManager from "@/components/admin/tasks-manager";
import NotesManager from "@/components/admin/notes-manager";
import FinanceManager from "@/components/admin/finance-manager";
import { supabase } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Banknote,
  BookText,
  CheckCircle,
  ChevronDown,
  Eye,
  LayoutTemplate,
  ListTodo,
  Lock,
  LogOut,
  TrendingDown,
  TrendingUp,
  StickyNote,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { DashboardData } from "@/pages/admin/dashboard";
import { Skeleton } from "../ui/skeleton";
import { FaChartLine } from "react-icons/fa";

interface AdminDashboardProps {
  onLogout: () => void;
  dashboardData: DashboardData;
}

type ActiveTab =
  | "blogs"
  | "content"
  | "security"
  | "dashboard"
  | "tasks"
  | "notes"
  | "finance";
type InitialAction = "createBlogPost" | "createPortfolioSection" | null;

export default function AdminDashboard({
  onLogout,
  dashboardData,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const [initialAction, setInitialAction] = useState<InitialAction>(null);

  useEffect(() => {
    const checkMfaStatus = async () => {
      const { data: aalData } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      setIsMfaEnabled(aalData?.currentLevel === "aal2");
    };
    checkMfaStatus();
  }, []);

  const tabs = [
    { id: "dashboard", label: "Overview", icon: <FaChartLine className="size-4" /> },
    { id: "blogs", label: "Blog", icon: <BookText className="size-4" /> },
    { id: "content", label: "Content", icon: <LayoutTemplate className="size-4" /> },
    { id: "tasks", label: "Tasks", icon: <ListTodo className="size-4" /> },
    { id: "notes", label: "Notes", icon: <StickyNote className="size-4" /> },
    { id: "finance", label: "Finance", icon: <Banknote className="size-4" /> },
    { id: "security", label: "Security", icon: <Lock className="size-4" /> },
  ];

  const handleActionCompleted = () => {
    setInitialAction(null);
  };
  
  const activeTabInfo = tabs.find((tab) => tab.id === activeTab);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon?: JSX.Element;
    className?: string;
  }> = ({ title, value, icon, className }) => (
    <div className={className}>
      <div className="h-full rounded-none border-2 border-black bg-white p-4">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-bold text-neutral-600 uppercase">
            {title}
          </h3>
          {icon && <div className="text-neutral-500">{icon}</div>}
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-mono">
      <header className="sticky top-0 z-10 border-b-2 border-black bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-bold text-black sm:text-2xl">
              ADMIN
            </h1>
            <div className="flex items-center gap-4">
              {isMfaEnabled && (
                <Badge>
                  <Lock className="mr-1.5 size-3" /> MFA Enabled
                </Badge>
              )}
              <Button variant="destructive" size="sm" onClick={onLogout}>
                <LogOut className="mr-1.5 size-4" /> LOGOUT
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-neutral-600">
              Manage your portfolio and content.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* --- RESPONSIVE NAVIGATION --- */}
          {/* Desktop Sidebar Navigation (Visible on lg screens and up) */}
          <nav className="hidden lg:flex lg:w-48 lg:flex-col lg:gap-1">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "secondary" : "ghost"}
                className="justify-start gap-2"
                onClick={() => {
                  setActiveTab(tab.id as ActiveTab);
                  setInitialAction(null);
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </Button>
            ))}
          </nav>

          {/* Mobile Dropdown Navigation (Hidden on lg screens and up) */}
          <nav className="lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <div className="flex items-center gap-2">
                    {activeTabInfo?.icon}
                    <span>{activeTabInfo?.label}</span>
                  </div>
                  <ChevronDown className="size-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width]"
                align="start"
              >
                {tabs.map((tab) => (
                  <DropdownMenuItem
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as ActiveTab);
                      setInitialAction(null);
                    }}
                    className="gap-2"
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <main className="flex-1">
            {activeTab === "dashboard" && (
              <motion.section
                key="dashboard-overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="mb-4 text-xl font-bold">This Month's Summary</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {!dashboardData.stats ? (
                      Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
                    ) : (
                      <>
                        <StatCard title="Monthly Earnings" value={dashboardData.stats.monthlyEarnings.toLocaleString("en-US", { style: "currency", currency: "USD" })} icon={<TrendingUp className="size-4 text-green-500" />} />
                        <StatCard title="Monthly Expenses" value={dashboardData.stats.monthlyExpenses.toLocaleString("en-US", { style: "currency", currency: "USD" })} icon={<TrendingDown className="size-4 text-red-500" />} />
                        <StatCard title="Monthly Net" value={dashboardData.stats.monthlyNet.toLocaleString("en-US", { style: "currency", currency: "USD" })} icon={<Banknote className="size-4" />} />
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-xl font-bold">At a Glance</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {!dashboardData.stats ? (
                      Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
                    ) : (
                      <>
                        <StatCard title="Pending Tasks" value={dashboardData.stats.pendingTasks} icon={<ListTodo className="size-4" />}  />
                        <StatCard title="Tasks Done (Week)" value={dashboardData.stats.tasksCompletedThisWeek} icon={<CheckCircle className="size-4" />} />
                        <StatCard title="Total Notes" value={dashboardData.stats.totalNotes} icon={<StickyNote className="size-4" />} />
                        <StatCard title="Total Blog Views" value={dashboardData.stats.totalBlogViews.toLocaleString()} icon={<Eye className="size-4" />} />
                      </>
                    )}
                  </div>
                </div>

                {dashboardData.pinnedNotes.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-xl font-bold">Pinned Notes</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {dashboardData.pinnedNotes.map((note) => (
                        <Card key={note.id}>
                          <CardHeader><CardTitle className="truncate text-base">{note.title || "Untitled Note"}</CardTitle></CardHeader>
                          <CardContent>
                            <p className="line-clamp-3 text-sm text-neutral-600">{note.content}</p>
                            <Button size="sm" variant="secondary" className="mt-4 text-xs" onClick={() => setActiveTab("notes")}>Go to Note</Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {dashboardData.recentPosts.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-xl font-bold">Recently Updated Blog Posts</h3>
                    <Card>
                      <CardContent className="space-y-3 p-4">
                        {dashboardData.recentPosts.map((post) => (
                          <div key={post.id} className="flex flex-col items-start gap-2 rounded-none bg-white p-3 sm:flex-row sm:items-center sm:justify-between hover:bg-neutral-50 border-y-2 border-transparent hover:border-black">
                            <div>
                              <button onClick={() => setActiveTab("blogs")} className="text-left font-semibold text-black hover:text-blue-600 hover:underline">{post.title}</button>
                              <p className="text-xs text-neutral-500">Updated: {new Date(post.updated_at || "").toLocaleDateString()}</p>
                            </div>
                            <div className="flex w-full shrink-0 space-x-2 sm:w-auto">
                              <Button asChild variant="ghost" size="sm" className="flex-1">
                                <Link href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" aria-label={`View post: ${post.title}`}>
                                  <ExternalLink className="mr-1 size-3.5" /> View
                                </Link>
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1" onClick={() => setActiveTab("blogs")}>Edit</Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </motion.section>
            )}

            {activeTab !== "dashboard" && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="rounded-none border-2 border-black bg-white p-4 sm:p-6"
              >
                {activeTab === "blogs" && <BlogManager startInCreateMode={initialAction === "createBlogPost"} onActionHandled={handleActionCompleted} />}
                {activeTab === "content" && <ContentManager />}
                {activeTab === "tasks" && <TaskManager />}
                {activeTab === "notes" && <NotesManager />}
                {activeTab === "finance" && <FinanceManager />}
                {activeTab === "security" && <SecuritySettings />}
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}