// src/components/admin/admin-dashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import BlogManager from "@/components/admin/blog-manager";
import ContentManager from "@/components/admin/content-manager";
import SecuritySettings from "@/components/admin/security-settings";
import TaskManager from "@/components/admin/tasks-manager";
import NotesManager from "@/components/admin/notes-manager";
import FinanceManager from "@/components/admin/finance-manager";
import LearningManager from "@/components/admin/learning-manager";
import { supabase } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Banknote, BookText, CheckCircle, ChevronDown, Eye, LayoutTemplate, ListTodo, Lock, LogOut, TrendingDown, TrendingUp, StickyNote, ExternalLink, Calendar as CalendarIcon, BrainCircuit, Timer } from "lucide-react";
import Link from "next/link";
import { DashboardData } from "@/pages/admin/dashboard";
import { Skeleton } from "../ui/skeleton";
import { FaChartLine } from "react-icons/fa";
import CommandCalendar from "./CommandCalendar";
import { LearningSession, LearningTopic } from "@/types";

interface AdminDashboardProps {
  onLogout: () => void;
  dashboardData: DashboardData;
}

type ActiveTab =
  | "dashboard"
  | "calendar"
  | "blogs"
  | "content"
  | "security"
  | "tasks"
  | "notes"
  | "finance"
  | "learning";
type InitialAction = "createBlogPost" | "createPortfolioSection" | null;

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const SESSION_KEY = 'activeLearningSession';

export default function AdminDashboard({ onLogout, dashboardData }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("learning");
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const [initialAction, setInitialAction] = useState<InitialAction>(null);

  const [activeLearningSession, setActiveLearningSession] = useState<LearningSession | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
const [learningTopics, setLearningTopics] = useState<Pick<LearningTopic, "id" | "title">[]>([]);
  // **NEW**: Restore session from localStorage on initial load
  useEffect(() => {
    try {
      const savedSessionJSON = localStorage.getItem(SESSION_KEY);
      if (savedSessionJSON) {
        const savedSession = JSON.parse(savedSessionJSON) as LearningSession;
        if (savedSession && savedSession.start_time) {
          setActiveLearningSession(savedSession);
          console.log("Restored active session from localStorage.");
        }
      }
    } catch (error) {
      console.error("Failed to parse session from localStorage", error);
      localStorage.removeItem(SESSION_KEY);
    }
  }, []);

  useEffect(() => {
    const fetchTopics = async () => {
      const { data } = await supabase.from('learning_topics').select('id, title');
      if (data) setLearningTopics(data);
    };
    fetchTopics();

    const checkMfaStatus = async () => {
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      setIsMfaEnabled(aalData?.currentLevel === "aal2");
    };
    checkMfaStatus();

    let interval: NodeJS.Timeout;
    if (activeLearningSession) {
      interval = setInterval(() => {
        const start = new Date(activeLearningSession.start_time).getTime();
        setElapsedTime(Math.floor((new Date().getTime() - start) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeLearningSession]);

  const handleStartSession = (session: LearningSession) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setActiveLearningSession(session);
  };

  const handleStopSession = () => {
    localStorage.removeItem(SESSION_KEY);
    setActiveLearningSession(null);
    setElapsedTime(0);
  };

  const tabs = [
    { id: "dashboard", label: "Overview", icon: <FaChartLine className="size-4" /> },
    { id: "blogs", label: "Blog", icon: <BookText className="size-4" /> },
    { id: "calendar", label: "Calendar", icon: <CalendarIcon className="size-4" /> },
    { id: "content", label: "Content", icon: <LayoutTemplate className="size-4" /> },
    { id: "tasks", label: "Tasks", icon: <ListTodo className="size-4" /> },
    { id: "notes", label: "Notes", icon: <StickyNote className="size-4" /> },
    { id: "finance", label: "Finance", icon: <Banknote className="size-4" /> },
    { id: "learning", label: "Learning", icon: <BrainCircuit className="size-4" /> },
    { id: "security", label: "Security", icon: <Lock className="size-4" /> },
  ];

  const handleActionCompleted = () => { setInitialAction(null); };
  const activeTabInfo = tabs.find((tab) => tab.id === activeTab);
  const currentTopicName = activeLearningSession ? learningTopics.find(t => t.id === activeLearningSession.topic_id)?.title : null;

  const StatCard: React.FC<{ title: string; value: string | number; icon?: JSX.Element; className?: string; }> = ({ title, value, icon, className }) => (
    <Card className={className + " bg-secondary/50 transition-all duration-300 hover:border-primary"}><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="font-mono text-sm font-medium uppercase text-muted-foreground">{title}</CardTitle>{icon && <div className="text-muted-foreground">{icon}</div>}</CardHeader><CardContent><div className="font-mono text-2xl font-bold">{value}</div></CardContent></Card>
  );

  return (
    <div className="min-h-screen bg-background font-sans">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="font-mono text-xl font-bold text-foreground sm:text-2xl">ADMIN_PANEL</h1>
            <div className="flex items-center gap-4">
              {activeLearningSession && (<button onClick={() => setActiveTab('learning')} className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"><Timer className="size-4 animate-pulse" /><div className="flex items-center gap-2"><span className="hidden sm:inline truncate max-w-[150px]">{currentTopicName || 'Session'}</span><span className="font-mono tracking-wider">{formatTime(elapsedTime)}</span></div></button>)}
              {isMfaEnabled && (<Badge variant="outline" className="border-green-500/50 text-green-400"><Lock className="mr-1.5 size-3" /> AAL2 VERIFIED</Badge>)}
              <Button variant="destructive" size="sm" onClick={onLogout}><LogOut className="mr-1.5 size-4" /> Logout</Button>
            </div>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8"><h2 className="text-3xl font-bold tracking-tight">Dashboard</h2><p className="text-muted-foreground">System overview and content management hub.</p></div>
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          <nav className="hidden lg:flex lg:w-48 lg:flex-col lg:gap-1">{tabs.map((tab) => (<Button key={tab.id} variant={activeTab === tab.id ? "secondary" : "ghost"} className="justify-start gap-2" onClick={() => { setActiveTab(tab.id as ActiveTab); setInitialAction(null); }}>{tab.icon} <span>{tab.label}</span></Button>))}</nav>
          <nav className="lg:hidden"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" className="w-full justify-between"><div className="flex items-center gap-2">{activeTabInfo?.icon} <span>{activeTabInfo?.label}</span></div><ChevronDown className="size-4 opacity-50" /></Button></DropdownMenuTrigger><DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]" align="start">{tabs.map((tab) => (<DropdownMenuItem key={tab.id} onClick={() => { setActiveTab(tab.id as ActiveTab); setInitialAction(null); }} className="gap-2">{tab.icon} <span>{tab.label}</span></DropdownMenuItem>))}</DropdownMenuContent></DropdownMenu></nav>
          <main className="flex-1">
            {activeTab === "dashboard" && (
              <motion.section key="dashboard-overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-8">
                <div>
                  <h3 className="mb-4 text-xl font-bold">This Month's Summary</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {!dashboardData.stats ? (Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)) : (
                      <>
                        <StatCard title="Monthly Earnings" value={dashboardData.stats.monthlyEarnings.toLocaleString("en-US", { style: "currency", currency: "USD" })} icon={<TrendingUp className="size-4" />} />
                        <StatCard title="Monthly Expenses" value={dashboardData.stats.monthlyExpenses.toLocaleString("en-US", { style: "currency", currency: "USD" })} icon={<TrendingDown className="size-4" />} />
                        <StatCard title="Monthly Net" value={dashboardData.stats.monthlyNet.toLocaleString("en-US", { style: "currency", currency: "USD" })} icon={<Banknote className="size-4" />} />
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="mb-4 text-xl font-bold">At a Glance</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {!dashboardData.stats ? (Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)) : (
                      <>
                        <StatCard title="Pending Tasks" value={dashboardData.stats.pendingTasks} icon={<ListTodo className="size-4" />} />
                        <StatCard title="Tasks Done (Week)" value={dashboardData.stats.tasksCompletedThisWeek} icon={<CheckCircle className="size-4" />} />
                        <StatCard title="Total Notes" value={dashboardData.stats.totalNotes} icon={<StickyNote className="size-4" />} />
                        <StatCard title="Topics In Progress" value={dashboardData.stats.topicsInProgress} icon={<BrainCircuit className="size-4" />} />
                        <StatCard title="Learning (Month)" value={`${dashboardData.stats.learningHoursThisMonth} hrs`} icon={<Timer className="size-4" />} />
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
                            <p className="line-clamp-3 text-sm text-muted-foreground">{note.content}</p>
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
                      <CardContent className="p-4 space-y-3">
                        {dashboardData.recentPosts.map((post) => (
                          <div key={post.id} className="flex flex-col items-start gap-2 rounded-lg p-3 hover:bg-secondary sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <button onClick={() => setActiveTab("blogs")} className="text-left font-semibold text-foreground hover:text-accent hover:underline">{post.title}</button>
                              <p className="text-xs text-muted-foreground">Updated: {new Date(post.updated_at || "").toLocaleDateString()}</p>
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
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="rounded-lg border bg-card p-4 sm:p-6">
                {activeTab === "calendar" && <CommandCalendar onNavigate={(tab) => setActiveTab(tab)} />}
                {activeTab === "blogs" && <BlogManager startInCreateMode={initialAction === "createBlogPost"} onActionHandled={handleActionCompleted} />}
                {activeTab === "content" && <ContentManager />}
                {activeTab === "tasks" && <TaskManager />}
                {activeTab === "notes" && <NotesManager />}
                {activeTab === "finance" && <FinanceManager />}
                {activeTab === "learning" && <LearningManager activeSession={activeLearningSession} elapsedTime={elapsedTime} onStartSession={handleStartSession} onStopSession={handleStopSession} />}
                {activeTab === "security" && <SecuritySettings />}
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}