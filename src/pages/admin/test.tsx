// src/pages/admin/test.tsx - CORRECTED

import { AdminLayout } from "@/components/admin/AdminLayout";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle, Loader2, FlaskConical, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { store } from "@/store/store";
import {
    adminApi,
    useGetSiteSettingsQuery,
    useUpdateSiteSettingsMutation,
    // --- CORRECTED HOOK IMPORTS ---
    useAddBlogPostMutation, useUpdateBlogPostMutation, useDeleteBlogPostMutation,
    useAddNoteMutation, useUpdateNoteMutation, useDeleteNoteMutation,
    useAddTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation,
    useAddSubTaskMutation, useUpdateSubTaskMutation, useDeleteSubTaskMutation,
    useSaveTransactionMutation, useDeleteTransactionMutation,
    useSaveRecurringMutation, useDeleteRecurringMutation,
    useSaveGoalMutation, useDeleteGoalMutation,
    useSaveSubjectMutation, useDeleteSubjectMutation,
    useSaveTopicMutation, useDeleteTopicMutation,
    useSaveSectionMutation, useDeleteSectionMutation,
    useSavePortfolioItemMutation, useDeletePortfolioItemMutation,
    useSaveNavLinkMutation, useDeleteNavLinkMutation,
    useAddEventMutation, useUpdateEventMutation, useDeleteEventMutation,
    useAddAssetMutation, useUpdateAssetMutation, useDeleteAssetMutation
} from "@/store/api/adminApi";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

type TestStatus = "pending" | "running" | "success" | "fail";
interface TestLog {
    name: string;
    status: TestStatus;
    message?: string;
    duration?: number;
}

const LogIcon = ({ status }: { status: TestStatus }) => {
    switch (status) {
        case "running": return <Loader2 className="size-4 animate-spin text-blue-500" />;
        case "success": return <CheckCircle className="size-4 text-green-500" />;
        case "fail": return <XCircle className="size-4 text-destructive" />;
        default: return <div className="size-4" />;
    }
};

export default function AdminTestPage() {
    const { isLoading: isAuthLoading } = useAuthGuard();
    const [logs, setLogs] = useState<TestLog[]>([]);
    const [isTesting, setIsTesting] = useState(false);
    const logContainerRef = useRef<HTMLDivElement>(null);

    // --- Mutation Hooks (Corrected names) ---
    const [addBlogPost] = useAddBlogPostMutation();
    const [updateBlogPost] = useUpdateBlogPostMutation();
    const [deleteBlogPost] = useDeleteBlogPostMutation();
    const [addNote] = useAddNoteMutation();
    const [updateNote] = useUpdateNoteMutation();
    const [deleteNote] = useDeleteNoteMutation();
    const [addTask] = useAddTaskMutation();
    const [updateTask] = useUpdateTaskMutation();
    const [deleteTask] = useDeleteTaskMutation();
    const [addSubTask] = useAddSubTaskMutation();
    const [updateSubTask] = useUpdateSubTaskMutation();
    const [deleteSubTask] = useDeleteSubTaskMutation();
    const [saveTransaction] = useSaveTransactionMutation();
    const [deleteTransaction] = useDeleteTransactionMutation();
    const [saveRecurring] = useSaveRecurringMutation();
    const [deleteRecurring] = useDeleteRecurringMutation();
    const [saveGoal] = useSaveGoalMutation();
    const [deleteGoal] = useDeleteGoalMutation();
    const [saveSubject] = useSaveSubjectMutation();
    const [deleteSubject] = useDeleteSubjectMutation();
    const [saveTopic] = useSaveTopicMutation();
    const [deleteTopic] = useDeleteTopicMutation();
    const [saveSection] = useSaveSectionMutation();
    const [deleteSection] = useDeleteSectionMutation();
    const [savePortfolioItem] = useSavePortfolioItemMutation();
    const [deletePortfolioItem] = useDeletePortfolioItemMutation();
    const [saveNavLink] = useSaveNavLinkMutation();
    const [deleteNavLink] = useDeleteNavLinkMutation();
    const [addEvent] = useAddEventMutation();
    const [updateEvent] = useUpdateEventMutation();
    const [deleteEvent] = useDeleteEventMutation();
    const [addAsset] = useAddAssetMutation();
    const [updateAsset] = useUpdateAssetMutation();
    const [deleteAsset] = useDeleteAssetMutation();
    const { data: siteSettingsData } = useGetSiteSettingsQuery();
    const [updateSiteSettings] = useUpdateSiteSettingsMutation();

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    const addLog = (log: TestLog) => {
        setLogs(prev => {
            const existingIndex = prev.findIndex(l => l.name === log.name);
            if (existingIndex > -1) {
                const newLogs = [...prev];
                newLogs[existingIndex] = log;
                return newLogs;
            }
            return [...prev, log];
        });
    };

    const runTest = async (name: string, testFn: () => Promise<any>) => {
        addLog({ name, status: 'running' });
        const startTime = Date.now();
        try {
            const result = await testFn();
            const duration = Date.now() - startTime;
            addLog({ name, status: 'success', duration });
            return result;
        } catch (error: any) {
            const duration = Date.now() - startTime;
            const message = error.data?.message || error.message || JSON.stringify(error);
            addLog({ name, status: 'fail', message, duration });
            throw new Error(`Test failed: ${name}`);
        }
    };

    const handleRunAllTests = async () => {
        setIsTesting(true);
        setLogs([]);
        store.dispatch(adminApi.util.resetApiState());

        const testId = `test-${Date.now()}`;

        try {
            // Test Blog Posts
            const postRes = await runTest("Blog: Create", () => addBlogPost({ title: `[TEST] ${testId}`, slug: testId, content: "c" }).unwrap());
            await runTest("Blog: Update", () => updateBlogPost({ id: postRes.id, title: `[TEST] ${testId} [U]` }).unwrap());
            await runTest("Blog: Delete", () => deleteBlogPost(postRes).unwrap());

            // Test Notes
            const noteRes = await runTest("Notes: Create", () => addNote({ title: `[TEST] ${testId}` }).unwrap());
            await runTest("Notes: Update", () => updateNote({ id: noteRes.id, content: "[U]" }).unwrap());
            await runTest("Notes: Delete", () => deleteNote(noteRes.id).unwrap());

            // Test Tasks & Sub-tasks
            const taskRes = await runTest("Tasks: Create", () => addTask({ title: `[TEST] ${testId}` }).unwrap());
            await runTest("Tasks: Update", () => updateTask({ id: taskRes.id, status: 'inprogress' }).unwrap());
            const subTaskRes = await runTest("SubTasks: Create", () => addSubTask({ task_id: taskRes.id, title: "[TEST] Subtask" }).unwrap());
            await runTest("SubTasks: Update", () => updateSubTask({ id: subTaskRes.id, is_completed: true }).unwrap());
            await runTest("SubTasks: Delete", () => deleteSubTask(subTaskRes.id).unwrap());
            await runTest("Tasks: Delete", () => deleteTask(taskRes.id).unwrap());

            // Test Transactions
            const transRes = await runTest("Transactions: Create", () => saveTransaction({ date: '2024-01-01', description: `[TEST] ${testId}`, amount: 1, type: 'expense' }).unwrap());
            await runTest("Transactions: Delete", () => deleteTransaction(transRes.id).unwrap());

            // Test Recurring
            const recurRes = await runTest("Recurring: Create", () => saveRecurring({ description: `[TEST] ${testId}`, amount: 1, type: 'expense', frequency: 'monthly', start_date: '2024-01-01' }).unwrap());
            await runTest("Recurring: Delete", () => deleteRecurring(recurRes.id).unwrap());

            // Test Goals
            const goalRes = await runTest("Goals: Create", () => saveGoal({ name: `[TEST] ${testId}`, target_amount: 100 }).unwrap());
            await runTest("Goals: Update", () => saveGoal({ id: goalRes.id, current_amount: 50 }).unwrap()); // Corrected to use saveGoal
            await runTest("Goals: Delete", () => deleteGoal(goalRes.id).unwrap());

            // Test Learning
            const subjectRes = await runTest("Subjects: Create", () => saveSubject({ name: `[TEST] ${testId}` }).unwrap());
            const topicRes = await runTest("Topics: Create", () => saveTopic({ title: `[TEST] ${testId}`, subject_id: subjectRes.id }).unwrap());
            await runTest("Topics: Update", () => saveTopic({ id: topicRes.id, status: 'Learning' }).unwrap()); // Corrected to use saveTopic
            await runTest("Topics: Delete", () => deleteTopic(topicRes.id).unwrap());
            await runTest("Subjects: Delete", () => deleteSubject(subjectRes.id).unwrap());

            // Test Portfolio
            const sectionRes = await runTest("Sections: Create", () => saveSection({ title: `[TEST] ${testId}`, type: 'list_items', page_path: '/test' }).unwrap());
            const itemRes = await runTest("Items: Create", () => savePortfolioItem({ section_id: sectionRes.id, title: `[TEST] ${testId}` }).unwrap()); // Corrected name
            await runTest("Items: Update", () => savePortfolioItem({ id: itemRes.id, subtitle: '[U]' }).unwrap()); // Corrected name
            await runTest("Items: Delete", () => deletePortfolioItem(itemRes.id).unwrap()); // Corrected name
            await runTest("Sections: Delete", () => deleteSection(sectionRes.id).unwrap());

            // Test Nav Links
            const navRes = await runTest("NavLinks: Create", () => saveNavLink({ label: `[TEST] ${testId}`, href: `/${testId}` }).unwrap());
            await runTest("NavLinks: Update", () => saveNavLink({ id: navRes.id, is_visible: false }).unwrap()); // Corrected to use saveNavLink
            await runTest("NavLinks: Delete", () => deleteNavLink(navRes.id).unwrap());

            // Test Events
            const eventRes = await runTest("Events: Create", () => addEvent({ title: `[TEST] ${testId}`, start_time: new Date().toISOString() }).unwrap());
            await runTest("Events: Update", () => updateEvent({ id: eventRes.id, description: "[U]" }).unwrap());
            await runTest("Events: Delete", () => deleteEvent(eventRes.id).unwrap());

            // Test Assets
            const assetRes = await runTest("Assets: Create", () => addAsset({ file_name: `[TEST] ${testId}`, file_path: `test/${testId}` }).unwrap());
            await runTest("Assets: Update", () => updateAsset({ id: assetRes.id, alt_text: "[U]" }).unwrap());
            await runTest("Assets: Delete", () => deleteAsset(assetRes).unwrap());

            // Test Site Settings (Read -> Update -> Revert)
            if (siteSettingsData) {
                const originalMode = siteSettingsData.settings.portfolio_mode;
                const newMode = originalMode === 'multi-page' ? 'single-page' : 'multi-page';
                await runTest("SiteSettings: Update", () => updateSiteSettings({ settings: { portfolio_mode: newMode }, identity: {} }).unwrap());
                await runTest("SiteSettings: Revert", () => updateSiteSettings({ settings: { portfolio_mode: originalMode }, identity: {} }).unwrap());
            } else {
                addLog({ name: 'SiteSettings: Skipped', status: 'success', message: 'Original settings not loaded.' });
            }

            toast.success("All tests completed successfully!");
        } catch (error) {
            toast.error("A test failed. Stopping execution.");
        } finally {
            setIsTesting(false);
            store.dispatch(adminApi.util.invalidateTags([
                "AdminPosts", "Notes", "Tasks", "Transactions", "Recurring", "Goals", "Learning",
                "PortfolioContent", "Assets", "Navigation", "SiteSettings", "Calendar", "Dashboard"
            ]));
        }
    };

    if (isAuthLoading) {
        return <AdminLayout><LoadingSpinner /></AdminLayout>;
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">CRUD Integration Test</h2>
                        <p className="text-muted-foreground">
                            Run a full Create, Read, Update, Delete cycle on all database tables.
                        </p>
                    </div>
                    <Button onClick={handleRunAllTests} disabled={isTesting} size="lg">
                        {isTesting ? (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : (
                            <FlaskConical className="mr-2 size-4" />
                        )}
                        {isTesting ? "Running Tests..." : "Run All Tests"}
                    </Button>
                </div>

                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>
                        This will perform live database operations. While it cleans up after itself, running this on a production database is not recommended.
                    </AlertDescription>
                </Alert>

                <Card>
                    <CardHeader>
                        <CardTitle>Test Log</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea ref={logContainerRef} className="h-96 w-full rounded-md border p-4 font-mono text-sm">
                            {logs.length === 0 && !isTesting && (
                                <div className="flex h-full items-center justify-center text-muted-foreground">
                                    Click "Run All Tests" to begin.
                                </div>
                            )}
                            {logs.map((log, index) => (
                                <div key={index} className="flex items-center gap-3 py-1">
                                    <LogIcon status={log.status} />
                                    <span className={cn("flex-1", log.status === 'fail' && "text-destructive")}>{log.name}</span>
                                    {log.duration !== undefined && <span className="text-xs text-muted-foreground">{log.duration}ms</span>}
                                    {log.status === 'fail' && <span className="text-xs text-destructive truncate">{log.message}</span>}
                                </div>
                            ))}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}