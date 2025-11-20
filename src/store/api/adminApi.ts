// src/store/api/adminApi.ts
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "@/supabase/client";
import type { Factor } from "@supabase/supabase-js";
import type {
  Event,
  BlogPost,
  Note,
  Task,
  SubTask,
  Transaction,
  RecurringTransaction,
  FinancialGoal,
  LearningSubject,
  LearningTopic,
  LearningSession,
  PortfolioSection,
  PortfolioItem,
  SiteContent,
} from "@/types";

type NavLink = {
  id: string;
  label: string;
  href: string;
  display_order: number;
  is_visible: boolean;
};
type StorageAsset = {
  id: string;
  file_name: string;
  file_path: string;
  mime_type: string | null;
  size_kb: number | null;
  alt_text: string | null;
  used_in: { type: string; id: string }[] | null;
  created_at: string;
};
type CalendarItem = {
  item_id: string;
  title: string;
  start_time: string;
  end_time: string | null;
  item_type: "event" | "task" | "transaction";
  data: any;
};

const BUCKET_NAME = process.env.NEXT_PUBLIC_BUCKET_NAME || "blog-assets";

// Define a service using a base query and expected endpoints
export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: [
    "Notes",
    "Tasks",
    "Transactions",
    "Recurring",
    "Goals",
    "Learning",
    "PortfolioContent",
    "Assets",
    "Navigation",
    "SiteSettings",
    "AdminPosts",
    "Calendar",
    "Dashboard",
    "MFA",
  ],
  endpoints: (builder) => ({
    // Auth & Security
    getMfaFactors: builder.query<Factor[], void>({
      queryFn: async () => {
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (error) return { error };
        return { data: data?.totp || [] };
      },
      providesTags: ["MFA"],
    }),
    unenrollMfaFactor: builder.mutation<void, string>({
      queryFn: async (factorId) => {
        const { error } = await supabase.auth.mfa.unenroll({ factorId });
        if (error) return { error };
        return { data: undefined };
      },
      invalidatesTags: ["MFA"],
    }),
    updateUserPassword: builder.mutation<void, string>({
      queryFn: async (newPassword) => {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (error) return { error };
        return { data: undefined };
      },
    }),
    signOut: builder.mutation<void, void>({
      queryFn: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) return { error };
        return { data: undefined };
      },
    }),
    // Dashboard Data
    getDashboardData: builder.query<any, void>({
      queryFn: async () => {
        const now = new Date();
        const firstDayOfMonth = new Date(
          now.getFullYear(),
          now.getMonth(),
          1,
        ).toISOString();
        const startOfWeek = new Date(
          now.setDate(now.getDate() - now.getDay()),
        ).toISOString();

        const promises = [
          supabase
            .from("blog_posts")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("portfolio_sections")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("portfolio_items")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("blog_posts")
            .select("id, title, updated_at, slug")
            .order("updated_at", { ascending: false })
            .limit(3),
          supabase
            .from("tasks")
            .select("*", { count: "exact", head: true })
            .neq("status", "done"),
          supabase.from("notes").select("*", { count: "exact", head: true }),
          supabase
            .from("notes")
            .select("id, title, content")
            .eq("is_pinned", true)
            .limit(3),
          supabase
            .from("transactions")
            .select("type, amount")
            .gte("date", firstDayOfMonth),
          supabase.rpc("get_total_blog_views"),
          supabase
            .from("tasks")
            .select("*", { count: "exact", head: true })
            .eq("status", "done")
            .gte("updated_at", startOfWeek),
          supabase
            .from("learning_sessions")
            .select("duration_minutes")
            .gte("start_time", firstDayOfMonth),
          supabase
            .from("learning_topics")
            .select("*", { count: "exact", head: true })
            .in("status", ["Learning", "Practicing"]),
        ];

        const results = await Promise.all(promises);
        const errors = results.map((r) => r.error).filter(Boolean);
        if (errors.length > 0) return { error: errors[0] };

        const [
          { count: totalPosts },
          { count: portfolioSections },
          { count: portfolioItems },
          { data: recentPostsData },
          { count: pendingTasksCount },
          { count: totalNotesCount },
          { data: pinnedNotesData },
          { data: monthlyTransactionsData },
          { data: totalViewsRes },
          { count: tasksCompletedCount },
          { data: learningSessionsData },
          { count: topicsInProgressCount },
        ] = results as any[];

        let monthlyEarnings = 0,
          monthlyExpenses = 0;
        if (monthlyTransactionsData) {
          for (const t of monthlyTransactionsData) {
            if (t.type === "earning") monthlyEarnings += t.amount;
            else if (t.type === "expense") monthlyExpenses += t.amount;
          }
        }
        const totalMinutes =
          learningSessionsData?.reduce(
            (sum: number, s: any) => sum + (s.duration_minutes || 0),
            0,
          ) || 0;
        const learningHoursThisMonth = parseFloat(
          (totalMinutes / 60).toFixed(1),
        );

        const data = {
          stats: {
            totalPosts: totalPosts || 0,
            portfolioSections: portfolioSections || 0,
            portfolioItems: portfolioItems || 0,
            pendingTasks: pendingTasksCount || 0,
            totalNotes: totalNotesCount || 0,
            monthlyEarnings,
            monthlyExpenses,
            monthlyNet: monthlyEarnings - monthlyExpenses,
            totalBlogViews: totalViewsRes || 0,
            tasksCompletedThisWeek: tasksCompletedCount || 0,
            learningHoursThisMonth,
            topicsInProgress: topicsInProgressCount || 0,
          },
          recentPosts: recentPostsData || [],
          pinnedNotes: pinnedNotesData || [],
        };

        return { data };
      },
      providesTags: [
        "Dashboard",
        "AdminPosts",
        "Notes",
        "Tasks",
        "Transactions",
        "Learning",
        "PortfolioContent",
      ],
    }),

    // Calendar Data
    getCalendarData: builder.query<
      { baseEvents: CalendarItem[]; recurring: RecurringTransaction[] },
      { start: string; end: string }
    >({
      queryFn: async ({ start, end }) => {
        const [calendarDataRes, recurringRes] = await Promise.all([
          supabase.rpc("get_calendar_data", {
            start_date_param: start,
            end_date_param: end,
          }),
          supabase.from("recurring_transactions").select("*"),
        ]);

        if (calendarDataRes.error || recurringRes.error) {
          return { error: calendarDataRes.error || recurringRes.error };
        }

        return {
          data: {
            baseEvents: calendarDataRes.data,
            recurring: recurringRes.data,
          },
        };
      },
      providesTags: ["Calendar", "Tasks", "Transactions", "Recurring"],
    }),
    addEvent: builder.mutation<Event, Partial<Event>>({
      queryFn: async (event) => {
        const { data, error } = await supabase
          .from("events")
          .insert(event)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Calendar"],
    }),
    updateEvent: builder.mutation<Event, Partial<Event>>({
      queryFn: async (event) => {
        const { id, ...updateData } = event;
        const { data, error } = await supabase
          .from("events")
          .update(updateData)
          .eq("id", id!)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Calendar"],
    }),
    deleteEvent: builder.mutation<{ id: string }, string>({
      queryFn: async (id) => {
        const { error } = await supabase.from("events").delete().eq("id", id);
        if (error) return { error };
        return { data: { id } };
      },
      invalidatesTags: ["Calendar"],
    }),

    // Blog Posts (Admin)
    getAdminBlogPosts: builder.query<BlogPost[], void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) return { error };
        return { data };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "AdminPosts" as const, id })),
              { type: "AdminPosts", id: "LIST" },
            ]
          : [{ type: "AdminPosts", id: "LIST" }],
    }),
    addBlogPost: builder.mutation<BlogPost, Partial<BlogPost>>({
      queryFn: async (post) => {
        const { data, error } = await supabase
          .from("blog_posts")
          .insert(post)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: [{ type: "AdminPosts", id: "LIST" }],
    }),
    updateBlogPost: builder.mutation<BlogPost, Partial<BlogPost>>({
      queryFn: async (post) => {
        const { id, ...updateData } = post;
        const { data, error } = await supabase
          .from("blog_posts")
          .update(updateData)
          .eq("id", id!)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: (result, error, arg) => [
        { type: "AdminPosts", id: arg.id },
      ],
    }),
    deleteBlogPost: builder.mutation<{ post: BlogPost }, BlogPost>({
      queryFn: async (post) => {
        if (
          post.cover_image_url &&
          post.cover_image_url.includes(process.env.NEXT_PUBLIC_SUPABASE_URL!)
        ) {
          const pathSegments = post.cover_image_url.split("/");
          const imagePath = pathSegments
            .slice(pathSegments.indexOf(BUCKET_NAME) + 1)
            .join("/");
          if (imagePath.startsWith("blog_images/")) {
            await supabase.storage.from(BUCKET_NAME).remove([imagePath]);
          }
        }
        const { error } = await supabase
          .from("blog_posts")
          .delete()
          .eq("id", post.id);
        if (error) return { error };
        return { data: { post } };
      },
      invalidatesTags: (result, error, arg) => [
        { type: "AdminPosts", id: "LIST" },
        { type: "AdminPosts", id: arg.id },
      ],
    }),

    // Notes
    getNotes: builder.query<Note[], void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from("notes")
          .select("*")
          .order("is_pinned", { ascending: false })
          .order("updated_at", { ascending: false });
        if (error) return { error };
        return { data };
      },
      providesTags: ["Notes"],
    }),
    updateNote: builder.mutation<Note, Partial<Note>>({
      queryFn: async (note) => {
        const { id, ...updateData } = note;
        const { data, error } = await supabase
          .from("notes")
          .update(updateData)
          .eq("id", id!)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Notes"],
    }),
    addNote: builder.mutation<Note, Partial<Note>>({
      queryFn: async (note) => {
        const { data, error } = await supabase
          .from("notes")
          .insert(note)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Notes"],
    }),
    deleteNote: builder.mutation<{ id: string }, string>({
      queryFn: async (id) => {
        const { error } = await supabase.from("notes").delete().eq("id", id);
        if (error) return { error };
        return { data: { id } };
      },
      invalidatesTags: ["Notes"],
    }),

    // Tasks
    getTasks: builder.query<Task[], void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from("tasks")
          .select("*, sub_tasks(*)")
          .order("created_at", { ascending: false });
        if (error) return { error };
        return { data };
      },
      providesTags: ["Tasks"],
    }),
    addTask: builder.mutation<Task, Partial<Task>>({
      queryFn: async (task) => {
        const { data, error } = await supabase
          .from("tasks")
          .insert(task)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Tasks"],
    }),
    updateTask: builder.mutation<Task, Partial<Task>>({
      queryFn: async (task) => {
        const { id, ...updateData } = task;
        const { data, error } = await supabase
          .from("tasks")
          .update(updateData)
          .eq("id", id!)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Tasks", "Calendar"],
    }),
    deleteTask: builder.mutation<{ id: string }, string>({
      queryFn: async (id) => {
        const { error } = await supabase.from("tasks").delete().eq("id", id);
        if (error) return { error };
        return { data: { id } };
      },
      invalidatesTags: ["Tasks", "Calendar"],
    }),
    addSubTask: builder.mutation<SubTask, Partial<SubTask>>({
      queryFn: async (subTask) => {
        const { data, error } = await supabase
          .from("sub_tasks")
          .insert(subTask)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Tasks"],
    }),
    updateSubTask: builder.mutation<SubTask, Partial<SubTask>>({
      queryFn: async (subTask) => {
        const { id, ...updateData } = subTask;
        const { data, error } = await supabase
          .from("sub_tasks")
          .update(updateData)
          .eq("id", id!)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Tasks"],
    }),
    deleteSubTask: builder.mutation<{ id: string }, string>({
      queryFn: async (id) => {
        const { error } = await supabase
          .from("sub_tasks")
          .delete()
          .eq("id", id);
        if (error) return { error };
        return { data: { id } };
      },
      invalidatesTags: ["Tasks"],
    }),

    // Finance
    getFinancialData: builder.query<
      {
        transactions: Transaction[];
        goals: FinancialGoal[];
        recurring: RecurringTransaction[];
      },
      void
    >({
      queryFn: async () => {
        const [tranRes, goalRes, recurRes] = await Promise.all([
          supabase
            .from("transactions")
            .select("*")
            .order("date", { ascending: false }),
          supabase.from("financial_goals").select("*").order("target_date"),
          supabase
            .from("recurring_transactions")
            .select("*")
            .order("start_date"),
        ]);
        if (tranRes.error || goalRes.error || recurRes.error) {
          return { error: tranRes.error || goalRes.error || recurRes.error };
        }
        return {
          data: {
            transactions: tranRes.data,
            goals: goalRes.data,
            recurring: recurRes.data,
          },
        };
      },
      providesTags: ["Transactions", "Goals", "Recurring"],
    }),
    saveTransaction: builder.mutation<Transaction, Partial<Transaction>>({
      queryFn: async (transaction) => {
        const { id, ...updateData } = transaction;
        const promise = id
          ? supabase.from("transactions").update(updateData).eq("id", id)
          : supabase.from("transactions").insert(updateData);
        const { data, error } = await promise.select().single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Transactions", "Calendar"],
    }),
    deleteTransaction: builder.mutation<{ id: string }, string>({
      queryFn: async (id) => {
        const { error } = await supabase
          .from("transactions")
          .delete()
          .eq("id", id);
        if (error) return { error };
        return { data: { id } };
      },
      invalidatesTags: ["Transactions", "Calendar"],
    }),
    saveRecurring: builder.mutation<
      RecurringTransaction,
      Partial<RecurringTransaction>
    >({
      queryFn: async (rec) => {
        const { id, ...updateData } = rec;
        const promise = id
          ? supabase
              .from("recurring_transactions")
              .update(updateData)
              .eq("id", id)
          : supabase.from("recurring_transactions").insert(updateData);
        const { data, error } = await promise.select().single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Recurring", "Calendar"],
    }),
    deleteRecurring: builder.mutation<{ id: string }, string>({
      queryFn: async (id) => {
        const { error } = await supabase
          .from("recurring_transactions")
          .delete()
          .eq("id", id);
        if (error) return { error };
        return { data: { id } };
      },
      invalidatesTags: ["Recurring", "Calendar"],
    }),
    saveGoal: builder.mutation<FinancialGoal, Partial<FinancialGoal>>({
      queryFn: async (goal) => {
        const { id, ...updateData } = goal;
        const promise = id
          ? supabase.from("financial_goals").update(updateData).eq("id", id)
          : supabase.from("financial_goals").insert(updateData);
        const { data, error } = await promise.select().single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Goals"],
    }),
    addFundsToGoal: builder.mutation<
      FinancialGoal,
      { goal: FinancialGoal; amount: number }
    >({
      queryFn: async ({ goal, amount }) => {
        const newCurrentAmount = goal.current_amount + amount;
        const { data, error } = await supabase
          .from("financial_goals")
          .update({ current_amount: newCurrentAmount })
          .eq("id", goal.id)
          .select()
          .single();
        if (error) return { error };

        const { error: transError } = await supabase
          .from("transactions")
          .insert({
            date: new Date().toISOString().split("T")[0],
            description: `Contribution to goal: ${goal.name}`,
            amount: amount,
            type: "expense",
            category: "Savings & Goals",
          });
        if (transError)
          console.warn(
            "Goal updated, but failed to create a matching transaction.",
            transError,
          );

        return { data };
      },
      invalidatesTags: ["Goals", "Transactions"],
    }),
    deleteGoal: builder.mutation<{ id: string }, string>({
      queryFn: async (id) => {
        const { error } = await supabase
          .from("financial_goals")
          .delete()
          .eq("id", id);
        if (error) return { error };
        return { data: { id } };
      },
      invalidatesTags: ["Goals"],
    }),
    manageCategory: builder.mutation<
      any,
      { type: "edit" | "merge" | "delete"; oldName: string; newName?: string }
    >({
      queryFn: async ({ type, oldName, newName }) => {
        let rpcName:
          | "rename_transaction_category"
          | "merge_transaction_categories"
          | "delete_transaction_category"
          | null = null;
        let params: any = {};

        if (type === "edit" && newName) {
          rpcName = "rename_transaction_category";
          params = { old_name: oldName, new_name: newName };
        } else if (type === "merge" && newName) {
          rpcName = "merge_transaction_categories";
          params = { source_name: oldName, target_name: newName };
        } else if (type === "delete") {
          rpcName = "delete_transaction_category";
          params = { category_name: oldName };
        }

        if (!rpcName)
          return {
            error: {
              message: "Invalid action",
              details: "",
              hint: "",
              code: "400",
            },
          };

        const { error } = await supabase.rpc(rpcName, params);
        if (error) return { error };
        return { data: {} };
      },
      invalidatesTags: ["Transactions"],
    }),

    // Learning
    getLearningData: builder.query<
      {
        subjects: LearningSubject[];
        topics: LearningTopic[];
        sessions: LearningSession[];
      },
      void
    >({
      queryFn: async () => {
        const [subjectsRes, topicsRes, sessionsRes] = await Promise.all([
          supabase.from("learning_subjects").select("*").order("name"),
          supabase.from("learning_topics").select("*").order("title"),
          supabase
            .from("learning_sessions")
            .select("*")
            .order("start_time", { ascending: false })
            .limit(100),
        ]);
        if (subjectsRes.error || topicsRes.error || sessionsRes.error) {
          return {
            error: subjectsRes.error || topicsRes.error || sessionsRes.error,
          };
        }
        return {
          data: {
            subjects: subjectsRes.data,
            topics: topicsRes.data,
            sessions: sessionsRes.data,
          },
        };
      },
      providesTags: ["Learning"],
    }),
    addLearningSession: builder.mutation<
      LearningSession,
      Partial<LearningSession>
    >({
      queryFn: async (session) => {
        const { data, error } = await supabase
          .from("learning_sessions")
          .insert(session)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Learning"],
    }),
    updateLearningSession: builder.mutation<
      LearningSession,
      Partial<LearningSession>
    >({
      queryFn: async (session) => {
        const { id, ...updateData } = session;
        const { data, error } = await supabase
          .from("learning_sessions")
          .update(updateData)
          .eq("id", id!)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Learning"],
    }),
    deleteLearningSession: builder.mutation<{ id: string }, string>({
      queryFn: async (id) => {
        const { error } = await supabase
          .from("learning_sessions")
          .delete()
          .eq("id", id);
        if (error) return { error };
        return { data: { id } };
      },
      invalidatesTags: ["Learning"],
    }),
    saveSubject: builder.mutation<LearningSubject, Partial<LearningSubject>>({
      queryFn: async (subject) => {
        const { id, ...updateData } = subject;
        const promise = id
          ? supabase.from("learning_subjects").update(updateData).eq("id", id)
          : supabase.from("learning_subjects").insert(updateData);
        const { data, error } = await promise.select().single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Learning"],
    }),
    deleteSubject: builder.mutation<{ id: string }, string>({
      queryFn: async (id) => {
        const { error } = await supabase
          .from("learning_subjects")
          .delete()
          .eq("id", id);
        if (error) return { error };
        return { data: { id } };
      },
      invalidatesTags: ["Learning"],
    }),
    saveTopic: builder.mutation<LearningTopic, Partial<LearningTopic>>({
      queryFn: async (topic) => {
        const { id, ...updateData } = topic;
        const promise = id
          ? supabase.from("learning_topics").update(updateData).eq("id", id)
          : supabase.from("learning_topics").insert(updateData);
        const { data, error } = await promise.select().single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Learning"],
    }),
    deleteTopic: builder.mutation<{ id: string }, string>({
      queryFn: async (id) => {
        const { error } = await supabase
          .from("learning_topics")
          .delete()
          .eq("id", id);
        if (error) return { error };
        return { data: { id } };
      },
      invalidatesTags: ["Learning"],
    }),

    // Site Settings & Content
    getSiteSettings: builder.query<
      { identity: SiteContent; settings: { portfolio_mode: string } },
      void
    >({
      queryFn: async () => {
        const [identityRes, settingsRes] = await Promise.all([
          supabase.from("site_identity").select("*").single(),
          supabase.from("site_settings").select("portfolio_mode").single(),
        ]);
        if (identityRes.error || settingsRes.error)
          return { error: identityRes.error || settingsRes.error };
        return {
          data: {
            identity: identityRes.data as SiteContent,
            settings: settingsRes.data,
          },
        };
      },
      providesTags: ["SiteSettings"],
    }),
    updateSiteSettings: builder.mutation<
      void,
      { identity: Partial<SiteContent>; settings: { portfolio_mode: string } }
    >({
      queryFn: async ({ identity, settings }) => {
        const [identityRes, settingsRes] = await Promise.all([
          supabase.from("site_identity").update(identity).eq("id", 1),
          supabase.from("site_settings").update(settings).eq("id", 1),
        ]);
        if (identityRes.error || settingsRes.error)
          return { error: identityRes.error || settingsRes.error };
        return { data: undefined };
      },
      invalidatesTags: ["SiteSettings", "Navigation"], // Invalidate nav in case mode changed
    }),
    getNavLinksAdmin: builder.query<NavLink[], void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from("navigation_links")
          .select("*")
          .order("display_order");
        if (error) return { error };
        return { data };
      },
      providesTags: ["Navigation"],
    }),
    saveNavLink: builder.mutation<NavLink, Partial<NavLink>>({
      queryFn: async (link) => {
        const { id, ...updateData } = link;
        const promise = id
          ? supabase.from("navigation_links").update(updateData).eq("id", id)
          : supabase.from("navigation_links").insert(updateData);
        const { data, error } = await promise.select().single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Navigation"],
    }),
    deleteNavLink: builder.mutation<{ id: string }, string>({
      queryFn: async (id) => {
        const { error } = await supabase
          .from("navigation_links")
          .delete()
          .eq("id", id);
        if (error) return { error };
        return { data: { id } };
      },
      invalidatesTags: ["Navigation"],
    }),
    getPortfolioContent: builder.query<PortfolioSection[], void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from("portfolio_sections")
          .select(`*, portfolio_items (*)`)
          .order("page_path")
          .order("display_order", { ascending: true })
          .order("display_order", {
            foreignTable: "portfolio_items",
            ascending: true,
          });
        if (error) return { error };
        return { data };
      },
      providesTags: ["PortfolioContent"],
    }),
    saveSection: builder.mutation<PortfolioSection, Partial<PortfolioSection>>({
      queryFn: async (section) => {
        const { id, ...updateData } = section;
        const promise = id
          ? supabase.from("portfolio_sections").update(updateData).eq("id", id)
          : supabase.from("portfolio_sections").insert(updateData);
        const { data, error } = await promise.select().single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["PortfolioContent"],
    }),
    deleteSection: builder.mutation<{ id: string }, string>({
      queryFn: async (id) => {
        const { error } = await supabase
          .from("portfolio_sections")
          .delete()
          .eq("id", id);
        if (error) return { error };
        return { data: { id } };
      },
      invalidatesTags: ["PortfolioContent"],
    }),
    savePortfolioItem: builder.mutation<PortfolioItem, Partial<PortfolioItem>>({
      queryFn: async (item) => {
        const { id, ...updateData } = item;
        const promise = id
          ? supabase.from("portfolio_items").update(updateData).eq("id", id)
          : supabase.from("portfolio_items").insert(updateData);
        const { data, error } = await promise.select().single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["PortfolioContent", "Assets"],
    }),
    deletePortfolioItem: builder.mutation<{ id: string }, string>({
      queryFn: async (id) => {
        const { error } = await supabase
          .from("portfolio_items")
          .delete()
          .eq("id", id);
        if (error) return { error };
        return { data: { id } };
      },
      invalidatesTags: ["PortfolioContent", "Assets"],
    }),
    updateSectionOrder: builder.mutation<void, string[]>({
      queryFn: async (sectionIds) => {
        const { error } = await supabase.rpc("update_section_order", {
          section_ids: sectionIds,
        });
        if (error) return { error };
        return { data: undefined };
      },
      invalidatesTags: ["PortfolioContent"],
    }),

    // Assets
    getAssets: builder.query<StorageAsset[], void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from("storage_assets")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) return { error };
        return { data };
      },
      providesTags: ["Assets"],
    }),
    addAsset: builder.mutation<StorageAsset, Partial<StorageAsset>>({
      queryFn: async (asset) => {
        const { data, error } = await supabase
          .from("storage_assets")
          .insert(asset)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Assets"],
    }),
    updateAsset: builder.mutation<StorageAsset, Partial<StorageAsset>>({
      queryFn: async (asset) => {
        const { id, ...updateData } = asset;
        const { data, error } = await supabase
          .from("storage_assets")
          .update(updateData)
          .eq("id", id!)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Assets"],
    }),
    deleteAsset: builder.mutation<{ asset: StorageAsset }, StorageAsset>({
      queryFn: async (asset) => {
        const { error: storageError } = await supabase.storage
          .from(process.env.NEXT_PUBLIC_BUCKET_NAME || "blog-assets")
          .remove([asset.file_path]);
        if (storageError) return { error: storageError };
        const { error: dbError } = await supabase
          .from("storage_assets")
          .delete()
          .eq("id", asset.id);
        if (dbError) return { error: dbError };
        return { data: { asset } };
      },
      invalidatesTags: ["Assets"],
    }),
    rescanAssetUsage: builder.mutation<void, void>({
      queryFn: async () => {
        const { error } = await supabase.rpc("update_asset_usage");
        if (error) return { error };
        return { data: undefined };
      },
      invalidatesTags: ["Assets"],
    }),
  }),
});

export const {
  useGetDashboardDataQuery,
  useGetCalendarDataQuery,
  useAddEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useGetAdminBlogPostsQuery,
  useAddBlogPostMutation,
  useUpdateBlogPostMutation,
  useDeleteBlogPostMutation,
  useGetNotesQuery,
  useUpdateNoteMutation,
  useAddNoteMutation,
  useDeleteNoteMutation,
  useGetTasksQuery,
  useAddTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useAddSubTaskMutation,
  useUpdateSubTaskMutation,
  useDeleteSubTaskMutation,
  useGetFinancialDataQuery,
  useSaveTransactionMutation,
  useDeleteTransactionMutation,
  useSaveRecurringMutation,
  useDeleteRecurringMutation,
  useSaveGoalMutation,
  useAddFundsToGoalMutation,
  useDeleteGoalMutation,
  useManageCategoryMutation,
  useGetLearningDataQuery,
  useAddLearningSessionMutation,
  useUpdateLearningSessionMutation,
  useDeleteLearningSessionMutation,
  useSaveSubjectMutation,
  useDeleteSubjectMutation,
  useSaveTopicMutation,
  useDeleteTopicMutation,
  useGetSiteSettingsQuery,
  useUpdateSiteSettingsMutation,
  useGetNavLinksAdminQuery,
  useSaveNavLinkMutation,
  useDeleteNavLinkMutation,
  useGetPortfolioContentQuery,
  useSaveSectionMutation,
  useDeleteSectionMutation,
  useSavePortfolioItemMutation,
  useDeletePortfolioItemMutation,
  useUpdateSectionOrderMutation,
  useGetAssetsQuery,
  useAddAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
  useRescanAssetUsageMutation,
  useGetMfaFactorsQuery,
  useUnenrollMfaFactorMutation,
  useUpdateUserPasswordMutation,
  useSignOutMutation,
} = adminApi;
