"use client";
import React, { useState, useEffect, useMemo, FormEvent, useCallback } from "react";
import { supabase } from "@/supabase/client";
import type { FinancialGoal, RecurringTransaction, Transaction } from "@/types";
import { DateRange } from "react-day-picker";
import { addDays, addMonths, addWeeks, addYears, format, startOfMonth, subMonths, differenceInDays, isBefore, isAfter, isSameDay, nextDay, setDate } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import TransactionForm from "@/components/admin/transaction-form";
import RecurringTransactionForm from "@/components/admin/recurring-transaction-form";
import FinancialGoalForm from "@/components/admin/financial-goal-form";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig, } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, ResponsiveContainer } from "recharts";
import { Edit, Trash2, Calendar as CalendarIcon, Search, TrendingUp, TrendingDown, PiggyBank, Target, Plus, Repeat, AlertCircle, Copy, ArrowDown, ArrowUp, X as XIcon, HandCoins, MoreVertical } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Separator } from "../ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import dynamic from "next/dynamic";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import { Progress } from "../ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

// --- DYNAMIC IMPORTS ---
const Calendar = dynamic(() => import('@/components/ui/calendar').then(mod => mod.Calendar), {
    ssr: false,
    loading: () => <div className="p-4">Loading Calendar...</div>
});

// --- CONSTANTS & TYPES ---
const chartConfig = { earning: { label: "Earnings", color: "hsl(var(--chart-2))" }, expense: { label: "Expenses", color: "hsl(var(--chart-5))" } };
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658"];
type DialogState = { type: "transaction" | "recurring" | "goal" | "addFunds" | null; data?: any; };

// --- REUSABLE COMPONENTS ---
const StatCard: React.FC<{ title: string; value: string | number; icon?: React.ReactNode; helpText?: string; className?: string }> = ({ title, value, icon, helpText, className }) => (
    <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                {icon}
            </div>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
        </CardContent>
    </Card>
);

// --- NEW CATEGORIES TAB COMPONENT ---
type CategoryData = { name: string; total: number; count: number; percentage: number; };
type CategoryAction = { type: 'edit' | 'merge' | 'delete', category: CategoryData } | null;

const CategoriesTab = ({ transactions, totalExpenses, allCategories, onRefresh }: { transactions: Transaction[], totalExpenses: number, allCategories: string[], onRefresh: () => void }) => {
    const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
    const [actionDialog, setActionDialog] = useState<CategoryAction>(null);

    const categoryData: CategoryData[] = useMemo(() => {
        const expenseTransactions = transactions.filter(t => t.type === 'expense');
        const categoryMap: Record<string, { total: number, count: number }> = {};

        expenseTransactions.forEach(t => {
            const category = t.category || 'Uncategorized';
            if (!categoryMap[category]) categoryMap[category] = { total: 0, count: 0 };
            categoryMap[category].total += t.amount;
            categoryMap[category].count += 1;
        });

        return Object.entries(categoryMap)
            .map(([name, { total, count }]) => ({ name, total, count, percentage: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0 }))
            .sort((a, b) => b.total - a.total);
    }, [transactions, totalExpenses]);

    const handleAction = async (type: 'edit' | 'merge' | 'delete', oldName: string, newName?: string) => {
        let rpcName: 'rename_transaction_category' | 'merge_transaction_categories' | 'delete_transaction_category' | null = null;
        let params: any = {};
        let successMessage = "";

        if (type === 'edit' && newName) {
            rpcName = 'rename_transaction_category';
            params = { old_name: oldName, new_name: newName };
            successMessage = `Category "${oldName}" renamed to "${newName}".`;
        } else if (type === 'merge' && newName) {
            rpcName = 'merge_transaction_categories';
            params = { source_name: oldName, target_name: newName };
            successMessage = `Category "${oldName}" merged into "${newName}".`;
        } else if (type === 'delete') {
            rpcName = 'delete_transaction_category';
            params = { category_name: oldName };
            successMessage = `Category "${oldName}" removed from transactions.`;
        }

        if (!rpcName) return;

        const { error } = await supabase.rpc(rpcName, params);
        if (error) { toast.error(`Failed to ${type} category`, { description: error.message }); }
        else { toast.success(successMessage); onRefresh(); }
        setActionDialog(null);
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Expense Categories</CardTitle>
                    <CardDescription>Breakdown of expenses by category for the selected period. Click a card to see transactions.</CardDescription>
                </CardHeader>
                <CardContent>
                    {categoryData.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {categoryData.map(cat => (
                                <Card key={cat.name} className="flex flex-col cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg" onClick={() => setSelectedCategory(cat)}>
                                    <CardHeader className="flex-row items-start justify-between pb-2">
                                        <h3 className="font-bold">{cat.name}</h3>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="size-7 -mt-2 -mr-2" onClick={e => e.stopPropagation()}>
                                                    <MoreVertical className="size-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent onClick={e => e.stopPropagation()}>
                                                <DropdownMenuItem onSelect={() => setActionDialog({ type: 'edit', category: cat })}>Rename</DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => setActionDialog({ type: 'merge', category: cat })}>Merge into...</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive" onSelect={() => setActionDialog({ type: 'delete', category: cat })}>Delete Category</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </CardHeader>
                                    <CardContent className="flex-grow space-y-3">
                                        <p className="text-2xl font-bold">${cat.total.toFixed(2)}</p>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Progress value={cat.percentage} className="h-2" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{cat.percentage.toFixed(1)}% of total expenses</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </CardContent>
                                    <CardFooter className="text-xs text-muted-foreground pt-3 border-t">{cat.count} transactions</CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : <p className="text-center py-10 text-muted-foreground">No expense data for the selected period.</p>}
                </CardContent>
            </Card>

            <Sheet open={!!selectedCategory} onOpenChange={(open) => !open && setSelectedCategory(null)}>
                <SheetContent className="sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle>Transactions for "{selectedCategory?.name}"</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100vh-8rem)] pr-4 mt-4">
                        <div className="space-y-3">
                            {transactions.filter(t => (t.category || 'Uncategorized') === selectedCategory?.name).map(t => (
                                <div key={t.id} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary">
                                    <div>
                                        <p className="font-medium">{t.description}</p>
                                        <p className="text-xs text-muted-foreground">{format(new Date(t.date), "MMM dd, yyyy")}</p>
                                    </div>
                                    <p className="font-bold text-sm text-red-500">-${t.amount.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>

            <Dialog open={!!actionDialog} onOpenChange={open => !open && setActionDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="capitalize">{actionDialog?.type} Category: "{actionDialog?.category.name}"</DialogTitle>
                        <DialogDescription>
                            {actionDialog?.type === 'edit' && 'This will rename the category for all associated transactions.'}
                            {actionDialog?.type === 'merge' && `This will merge all "${actionDialog.category.name}" transactions into another category.`}
                            {actionDialog?.type === 'delete' && `This will remove the category tag from all associated transactions, setting them to "Uncategorized".`}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const formData = new FormData(e.currentTarget); const newName = formData.get('newName') as string; if (actionDialog) handleAction(actionDialog.type, actionDialog.category.name, newName); }}>
                        {actionDialog?.type === 'edit' && (<div className="space-y-2 py-4">
                            <Label htmlFor="newName">New Category Name</Label>
                            <Input id="newName" name="newName" defaultValue={actionDialog.category.name} required autoFocus />
                        </div>)}
                        {actionDialog?.type === 'merge' && (<div className="space-y-2 py-4">
                            <Label htmlFor="newName">Target Category</Label>
                            <Select name="newName" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category to merge into..." />
                                </SelectTrigger>
                                <SelectContent>{allCategories.filter(c => c !== actionDialog.category.name).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>)}
                        {actionDialog?.type === 'delete' && (<div className="py-4 text-sm text-destructive-foreground bg-destructive/90 p-4 rounded-md">Are you sure? This action cannot be undone.</div>)}
                        <DialogFooter className="mt-4">
                            <Button type="button" variant="ghost" onClick={() => setActionDialog(null)}>Cancel</Button>
                            <Button type="submit" variant={actionDialog?.type === 'delete' ? 'destructive' : 'default'}>Confirm</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

// --- EXISTING COMPONENTS (NO CHANGES) ---
const AnalyticsTab = ({ transactions, allYears }: { transactions: Transaction[], allYears: number[] }) => {
    const [analyticsYear, setAnalyticsYear] = useState(new Date().getFullYear());
    const [selectedMonthData, setSelectedMonthData] = useState<{ month: string; year: number } | null>(null);

    const yearTransactions = useMemo(() => {
        return transactions.filter(t => new Date(t.date).getFullYear() === analyticsYear);
    }, [transactions, analyticsYear]);

    const annualStats = useMemo(() => {
        let totalIncome = 0;
        let totalExpenses = 0;
        const expenseByCategory: Record<string, number> = {};

        yearTransactions.forEach(t => {
            if (t.type === 'earning') {
                totalIncome += t.amount;
            } else {
                totalExpenses += t.amount;
                const category = t.category || 'Uncategorized';
                expenseByCategory[category] = (expenseByCategory[category] || 0) + t.amount;
            }
        });
        const topCategory = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1])[0];

        return {
            totalIncome,
            totalExpenses,
            netIncome: totalIncome - totalExpenses,
            avgMonthlyExpense: totalExpenses / 12,
            topExpenseCategory: topCategory ? `${topCategory[0]} ($${topCategory[1].toFixed(2)})` : 'N/A'
        };
    }, [yearTransactions]);

    const monthlyChartData = useMemo(() => {
        const monthlyData: Record<string, { income: number; expenses: number }> = {};
        for (const t of yearTransactions) {
            const month = format(new Date(t.date), 'MMM');
            if (!monthlyData[month]) monthlyData[month] = { income: 0, expenses: 0 };
            if (t.type === 'earning') monthlyData[month].income += t.amount;
            else monthlyData[month].expenses += t.amount;
        }
        const allMonths = Array.from({ length: 12 }, (_, i) => format(new Date(analyticsYear, i), 'MMM'));
        return allMonths.map(month => ({ month, ...(monthlyData[month] || { income: 0, expenses: 0 }) }));
    }, [yearTransactions, analyticsYear]);

    const handleBarClick = (data: any) => {
        if (data && data.activePayload && data.activePayload.length > 0) {
            const month = data.activePayload[0].payload.month;
            setSelectedMonthData({ month, year: analyticsYear });
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle>Annual Report</CardTitle>
                        <CardDescription>Interactive financial summary for the selected year.</CardDescription>
                    </div>
                    <Select value={String(analyticsYear)} onValueChange={(v) => setAnalyticsYear(Number(v))}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>{allYears.map(year => (<SelectItem key={year} value={String(year)}>{year}</SelectItem>))}</SelectContent>
                    </Select>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard title="Total Income" value={`$${annualStats.totalIncome.toFixed(2)}`} icon={<ArrowUp className="size-5 text-green-500" />} />
                        <StatCard title="Total Expenses" value={`$${annualStats.totalExpenses.toFixed(2)}`} icon={<ArrowDown className="size-5 text-red-500" />} />
                        <StatCard title="Net Income" value={`${annualStats.netIncome < 0 ? '-' : ''}$${Math.abs(annualStats.netIncome).toFixed(2)}`} className={annualStats.netIncome < 0 ? "text-red-500" : "text-green-500"} icon={<HandCoins className="size-5" />} />
                        <StatCard title="Top Expense" value={annualStats.topExpenseCategory} helpText="Category with highest spending" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Monthly Cash Flow</h3>
                        <p className="text-sm text-muted-foreground mb-4 -mt-3">Click on a month's bar for a detailed breakdown.</p>
                        <ChartContainer config={chartConfig} className="h-72 w-full">
                            <BarChart data={monthlyChartData} onClick={handleBarClick}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis tickFormatter={(value) => `$${value / 1000}k`} tickLine={false} axisLine={false} tickMargin={8} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar dataKey="income" name="Income" fill="var(--color-earning)" radius={[4, 4, 0, 0]} className="cursor-pointer" />
                                <Bar dataKey="expenses" name="Expenses" fill="var(--color-expense)" radius={[4, 4, 0, 0]} className="cursor-pointer" />
                            </BarChart>
                        </ChartContainer>
                    </div>
                </CardContent>
            </Card>

            {selectedMonthData && (
                <MonthlyDetailDialog
                    month={selectedMonthData.month}
                    year={selectedMonthData.year}
                    transactions={yearTransactions}
                    onClose={() => setSelectedMonthData(null)}
                />
            )}
        </div>
    );
};

const MonthlyDetailDialog = ({ month, year, transactions, onClose }: { month: string, year: number, transactions: Transaction[], onClose: () => void }) => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const monthTransactions = useMemo(() => {
        return transactions.filter(t => format(new Date(t.date), 'MMM') === month);
    }, [transactions, month]);

    const { totalIncome, totalExpenses, expenseByCategory } = useMemo(() => {
        let income = 0;
        let expenses = 0;
        const categoryMap: Record<string, number> = {};
        monthTransactions.forEach(t => {
            if (t.type === 'earning') income += t.amount;
            else {
                expenses += t.amount;
                const cat = t.category || 'Uncategorized';
                categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
            }
        });
        const expenseData = Object.entries(categoryMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
        return { totalIncome: income, totalExpenses: expenses, expenseByCategory: expenseData };
    }, [monthTransactions]);

    const filteredTransactions = useMemo(() => {
        if (!selectedCategory) return monthTransactions;
        return monthTransactions.filter(t => (t.category || 'Uncategorized') === selectedCategory);
    }, [monthTransactions, selectedCategory]);

    const handlePieClick = (data: any) => {
        if (data && data.name) {
            setSelectedCategory(data.name === selectedCategory ? null : data.name);
        }
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Financial Details for {month}, {year}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full pt-4 overflow-hidden">
                    {/* Left Column: Charts and Stats */}
                    <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-2 gap-4">
                            <StatCard title="Month's Income" value={`$${totalIncome.toFixed(2)}`} className="bg-secondary" />
                            <StatCard title="Month's Expenses" value={`$${totalExpenses.toFixed(2)}`} className="bg-secondary" />
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Expense Breakdown</h4>
                            <p className="text-xs text-muted-foreground mb-2 -mt-1">Click a slice to filter transactions.</p>
                            <ChartContainer config={{}} className="h-64 w-full">
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} onClick={handlePieClick} className="cursor-pointer">
                                            {expenseByCategory.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={selectedCategory === entry.name ? 'hsl(var(--primary))' : ''} strokeWidth={3} />)}
                                        </Pie>
                                        <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </div>
                    </div>
                    {/* Right Column: Transaction List */}
                    <div className="flex flex-col h-full">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold">{selectedCategory ? `Transactions in "${selectedCategory}"` : 'All Transactions This Month'}</h4>
                            {selectedCategory && <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)}>
                                <XIcon className="mr-2 size-4" />Clear Filter</Button>}
                        </div>
                        <ScrollArea className="flex-grow pr-4 -mr-4">
                            <div className="space-y-3">
                                {filteredTransactions.length > 0 ? filteredTransactions.map(t => (
                                    <div key={t.id} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary">
                                        <div>
                                            <p className="font-medium">{t.description}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs text-muted-foreground">{format(new Date(t.date), "MMM dd")}</p>
                                                {t.category && <Badge variant="outline">{t.category}</Badge>}
                                            </div>
                                        </div>
                                        <p className={cn("font-bold text-sm", t.type === 'earning' ? 'text-green-500' : 'text-red-500')}>
                                            {t.type === 'earning' ? '+' : '-'}${t.amount.toFixed(2)}
                                        </p>
                                    </div>
                                )) : <p className="text-center text-muted-foreground py-10">No transactions found.</p>}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

const GoalCard = ({ goal, onAddFunds, onEdit, onDelete }: { goal: FinancialGoal, onAddFunds: () => void, onEdit: () => void, onDelete: () => void }) => {
    const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
    const remainingAmount = goal.target_amount - goal.current_amount;
    const remainingDays = goal.target_date ? differenceInDays(new Date(goal.target_date), new Date()) : null;

    return (
        <Card className="relative flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <motion.div className="absolute bottom-0 left-0 right-0 bg-primary/10 -z-0" initial={{ height: 0 }} animate={{ height: `${progress}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
            <div className="relative z-10 flex h-full flex-col">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <CardTitle className="leading-tight">{goal.name}</CardTitle>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="-mr-2 -mt-2 size-7 text-muted-foreground">
                                    <Edit className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={onEdit}>Edit Goal</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-500" onClick={onDelete}>Delete Goal</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-grow flex-col justify-between text-center">
                    <div>
                        <p className="text-6xl font-black text-primary/80">{progress.toFixed(0)}<span className="text-4xl text-primary/50">%</span>
                        </p>
                        <p className="font-semibold text-muted-foreground">${goal.current_amount.toLocaleString()} / ${goal.target_amount.toLocaleString()}</p>
                    </div>
                    <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1 rounded-md bg-background/50 p-2">
                            <p className="text-xs font-semibold uppercase text-muted-foreground">Remaining</p>
                            <p className="text-lg font-bold text-foreground">${remainingAmount > 0 ? remainingAmount.toLocaleString() : 0}</p>
                        </div>
                        <div className="space-y-1 rounded-md bg-background/50 p-2">
                            <p className="text-xs font-semibold uppercase text-muted-foreground">Time Left</p>{remainingDays !== null ? (<p className={`text-lg font-bold ${remainingDays < 0 ? 'text-destructive' : 'text-foreground'}`}>{remainingDays < 0 ? `Overdue` : `${remainingDays}d`}</p>) : (<p className="text-lg font-bold text-foreground">-</p>)}</div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button size="sm" className="w-full" onClick={onAddFunds}>
                        <Plus className="mr-2 size-4" />Add Funds</Button>
                </CardFooter>
            </div>
        </Card>
    );
};

const getNextOccurrence = (cursor: Date, rule: RecurringTransaction): Date => {
    let next = new Date(cursor);
    switch (rule.frequency) {
        case 'daily': return addDays(next, 1);
        case 'weekly': return rule.occurrence_day !== null && rule.occurrence_day !== undefined ? nextDay(next, rule.occurrence_day as any) : addWeeks(next, 1);
        case 'bi-weekly': return rule.occurrence_day !== null && rule.occurrence_day !== undefined ? nextDay(addWeeks(next, 1), rule.occurrence_day as any) : addWeeks(next, 2);
        case 'monthly': next = addMonths(next, 1); return rule.occurrence_day ? setDate(next, rule.occurrence_day) : next;
        case 'yearly': return addYears(next, 1);
        default: return addDays(next, 1);
    }
};

export default function FinanceManager() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [goals, setGoals] = useState<FinancialGoal[]>([]);
    const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [date, setDate] = useState<DateRange | undefined>({ from: startOfMonth(new Date()), to: new Date() });
    const [dialogState, setDialogState] = useState<DialogState>({ type: null });

    const loadAllFinancialData = useCallback(async () => {
        setIsLoading(true); setError(null);
        try {
            const [tranRes, goalRes, recurRes] = await Promise.all([
                supabase.from("transactions").select("*").order("date", { ascending: false }),
                supabase.from("financial_goals").select("*").order("target_date"),
                supabase.from("recurring_transactions").select("*").order("start_date")
            ]);
            if (tranRes.error || goalRes.error || recurRes.error) throw new Error(tranRes.error?.message || "Failed to load data");
            setTransactions(tranRes.data || []);
            setGoals(goalRes.data || []);
            setRecurring(recurRes.data || []);
        } catch (err: any) { setError(err.message); toast.error("Data Load Error", { description: err.message }); }
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => { loadAllFinancialData(); }, [loadAllFinancialData]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter((t) => {
            const transactionDate = new Date(t.date);
            const descriptionMatch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
            if (!date?.from) return descriptionMatch;
            const toDate = date.to ? addDays(date.to, 1) : new Date(8640000000000000);
            const dateMatch = transactionDate >= date.from && transactionDate < toDate;
            return descriptionMatch && dateMatch;
        });
    }, [transactions, searchTerm, date]);

    const { totalEarnings, totalExpenses, netIncome, expenseByCategory } = useMemo(() => {
        let earnings = 0, expenses = 0; const categoryMap: Record<string, number> = {};
        for (const t of filteredTransactions) {
            if (t.type === "earning") earnings += t.amount;
            else { expenses += t.amount; const category = t.category || "Uncategorized"; categoryMap[category] = (categoryMap[category] || 0) + t.amount; }
        }
        const expenseData = Object.entries(categoryMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
        return { totalEarnings: earnings, totalExpenses: expenses, netIncome: earnings - expenses, expenseByCategory: expenseData };
    }, [filteredTransactions]);

    const allCategories = useMemo(() => {
        const categories = new Set(transactions.filter(t => t.type === 'expense' && t.category).map(t => t.category!));
        return Array.from(categories).sort();
    }, [transactions]);

    const allYearsWithData = useMemo(() => {
        const years = new Set(transactions.map(t => new Date(t.date).getFullYear()));
        const currentYear = new Date().getFullYear();
        years.add(currentYear);
        return Array.from(years).sort((a, b) => b - a);
    }, [transactions]);

    const cashFlowData = useMemo(() => {
        const monthlyData: Record<string, { earning: number; expense: number }> = {};
        const sixMonthsAgo = subMonths(new Date(), 5);
        const relevantTransactions = transactions.filter((t) => new Date(t.date) >= startOfMonth(sixMonthsAgo));
        for (const t of relevantTransactions) {
            const month = format(new Date(t.date), "MMM yy");
            if (!monthlyData[month]) monthlyData[month] = { earning: 0, expense: 0 };
            if (t.type === "earning") monthlyData[month].earning += t.amount;
            else monthlyData[month].expense += t.amount;
        }
        return Object.entries(monthlyData).map(([name, values]) => ({ name, ...values })).slice(-6);
    }, [transactions]);
    const forecast = useMemo(() => {
        const upcomingTransactions: { description: string, amount: number, type: 'earning' | 'expense', date: Date }[] = [];
        const today = new Date();
        const next30Days = addDays(today, 30);
        recurring.forEach(rule => {
            let cursor = rule.last_processed_date ? new Date(rule.last_processed_date) : new Date(rule.start_date);
            if (isBefore(cursor, new Date(rule.start_date))) { cursor = new Date(rule.start_date); }
            let nextOccurrence = new Date(cursor);
            if (rule.last_processed_date && (isAfter(nextOccurrence, today) || isSameDay(nextOccurrence, today))) { /* First candidate */ }
            else { nextOccurrence = getNextOccurrence(cursor, rule); }
            const ruleEndDate = rule.end_date ? new Date(rule.end_date) : null;
            while (isBefore(nextOccurrence, next30Days)) {
                if (ruleEndDate && isAfter(nextOccurrence, ruleEndDate)) break;
                if ((isAfter(nextOccurrence, today) || isSameDay(nextOccurrence, today))) {
                    upcomingTransactions.push({ description: rule.description, amount: rule.amount, type: rule.type, date: nextOccurrence });
                }
                nextOccurrence = getNextOccurrence(nextOccurrence, rule);
            }
        });
        return { upcomingTransactions: upcomingTransactions.sort((a, b) => a.date.getTime() - b.date.getTime()) };
    }, [recurring]);

    const handleSaveSuccess = () => { loadAllFinancialData(); setDialogState({ type: null }); };
    const handleDelete = async (tableName: string, id: string, message: string) => { if (!confirm(message)) return; const { error } = await supabase.from(tableName).delete().eq("id", id); if (error) { toast.error(`Failed to delete: ${error.message}`); } else { toast.success("Item deleted."); await loadAllFinancialData(); } };

    const handleDuplicateTransaction = (transaction: Transaction) => {
        const { id, created_at, updated_at, ...duplicatableData } = transaction;
        const newTransactionData = {
            ...duplicatableData,
            date: new Date().toISOString().split('T')[0], // Default to today's date
            description: `${transaction.description} (Copy)`,
        };
        // Open the dialog with this pre-filled data, but without an ID, so it acts as a "new" transaction
        setDialogState({ type: "transaction", data: newTransactionData });
    };

    const handleAddFunds = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const amount = parseFloat(formData.get("amount") as string);
        const goal = dialogState.data as FinancialGoal;
        if (!amount || amount <= 0 || !goal) { toast.error("Invalid amount provided."); return; }
        const newCurrentAmount = goal.current_amount + amount;
        const { error: goalError } = await supabase.from("financial_goals").update({ current_amount: newCurrentAmount }).eq("id", goal.id);
        if (goalError) { toast.error("Failed to update goal", { description: goalError.message }); return; }
        const { error: transError } = await supabase.from("transactions").insert({ date: new Date().toISOString().split("T")[0], description: `Contribution to goal: ${goal.name}`, amount: amount, type: "expense", category: "Savings & Goals" });
        if (transError) { toast.warning("Goal updated, but failed to create a matching transaction.", { description: transError.message }); }
        else { toast.success(`$${amount.toFixed(2)} added to "${goal.name}"`); }
        await handleSaveSuccess();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Finance Command Center</h2>
                    <p className="text-muted-foreground">Strategic overview, planning, and transaction management.</p>
                </div>
                <Menubar>
                    <MenubarMenu>
                        <MenubarTrigger>
                            <Plus className="size-4" />
                        </MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem onSelect={() => setDialogState({ type: "transaction" })}>
                                <Plus className="mr-2 size-4" /> New Transaction</MenubarItem>
                            <MenubarItem onSelect={() => setDialogState({ type: "recurring" })}>
                                <Repeat className="mr-2 size-4" /> New Recurring</MenubarItem>
                            <MenubarItem onSelect={() => setDialogState({ type: "goal" })}>
                                <Target className="mr-2 size-4" /> New Goal</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                </Menubar>
            </div>
            <Tabs defaultValue="dashboard">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                    <TabsTrigger value="recurring">Recurring</TabsTrigger>
                    <TabsTrigger value="goals">Goals</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>
                {/* Dashboard Tab - No changes */}
                <TabsContent value="dashboard" className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Net Income Overview</CardTitle>
                                    <CardDescription>Total earnings minus total expenses for the selected period: {date?.from ? format(date.from, "LLL dd, y") : '...'} - {date?.to ? format(date.to, "LLL dd, y") : '...'}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className={`text-5xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>{netIncome >= 0 ? '+' : '-'}${Math.abs(netIncome).toFixed(2)}</div>
                                    <div className="flex justify-around items-center pt-4 border-t">
                                        <div className="text-center">
                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                <TrendingUp className="size-4 text-green-500" /> Total Earnings</p>
                                            <p className="text-2xl font-semibold">${totalEarnings.toFixed(2)}</p>
                                        </div>
                                        <Separator orientation="vertical" className="h-12" />
                                        <div className="text-center">
                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                <TrendingDown className="size-4 text-red-500" /> Total Expenses</p>
                                            <p className="text-2xl font-semibold">${totalExpenses.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Cash Flow (Last 6 Months)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer config={chartConfig} className="h-64 w-full">
                                        <BarChart data={cashFlowData}>
                                            <CartesianGrid vertical={false} />
                                            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                                            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <ChartLegend content={<ChartLegendContent />} />
                                            <Bar dataKey="earning" fill="var(--color-earning)" radius={4} />
                                            <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
                                        </BarChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Goals at a Glance</CardTitle>
                                    <CardDescription>A summary of your active financial targets.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">{goals.length > 0 ? goals.map(goal => {
                                    const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100); const remainingAmount = goal.target_amount - goal.current_amount; const remainingDays = goal.target_date ? differenceInDays(new Date(goal.target_date), new Date()) : null; return (<div key={goal.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="flex-grow">
                                            <p className="font-semibold">{goal.name}</p>
                                            <p className="text-sm text-muted-foreground">${goal.current_amount.toLocaleString()} / ${goal.target_amount.toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            <TooltipProvider delayDuration={100}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="relative h-6 w-28 rounded-full bg-muted overflow-hidden">
                                                            <motion.div className="absolute left-0 top-0 h-full rounded-full bg-primary" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
                                                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary-foreground">{progress.toFixed(0)}%</span>
                                                        </div>
                                                    </TooltipTrigger>{remainingDays !== null && (<TooltipContent>
                                                        <p>{remainingDays < 0 ? `${Math.abs(remainingDays)} days overdue` : `${remainingDays} days remaining`}</p>
                                                    </TooltipContent>)}</Tooltip>
                                            </TooltipProvider>
                                            <div className="text-right w-24">
                                                <p className="text-xs text-muted-foreground">Remaining</p>
                                                <p className="font-bold text-base">${remainingAmount > 0 ? remainingAmount.toLocaleString() : 0}</p>
                                            </div>
                                        </div>
                                    </div>)
                                }) : <p className="text-muted-foreground text-sm py-4 text-center">No goals set. Create one in the 'Goals' tab to see progress here.</p>}</CardContent>
                                {goals.length > 0 && (<CardFooter>
                                    <p className="text-xs text-muted-foreground">Manage your goals in the 'Goals' tab.</p>
                                </CardFooter>)}
                            </Card>
                        </div>
                        <div className="lg:col-span-1 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Expense Breakdown</CardTitle>
                                </CardHeader>
                                <CardContent>{expenseByCategory.length > 0 ? <ChartContainer config={{}} className="h-64 w-full">
                                    <PieChart>
                                        <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>{expenseByCategory.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie>
                                        <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                                    </PieChart>
                                </ChartContainer> : <div className="flex h-64 items-center justify-center">
                                    <p className="text-muted-foreground text-center">No expense data for this period.</p>
                                </div>}</CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Upcoming in 30 Days</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">{forecast.upcomingTransactions.length > 0 ? forecast.upcomingTransactions.map((t, i) => (<div key={i} className="flex justify-between items-center text-sm">
                                    <div>
                                        <p className="font-semibold">{t.description}</p>
                                        <p className="text-xs text-muted-foreground">Due in {differenceInDays(t.date, new Date())} days ({format(t.date, 'MMM dd')})</p>
                                    </div>
                                    <p className={`font-bold ${t.type === 'earning' ? 'text-green-600' : 'text-red-600'}`}>{t.type === 'earning' ? '+' : '-'}${t.amount.toFixed(2)}</p>
                                </div>)) : <p className="text-sm text-muted-foreground text-center py-8">No upcoming recurring transactions.</p>}</CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
                {/* Transactions Tab - No changes */}
                <TabsContent value="transactions" className="mt-6 space-y-4">
                    <Card>
                        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                            <div className="relative flex-grow">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input placeholder="Search descriptions..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal sm:w-auto">
                                        <CalendarIcon className="mr-2 size-4" />{date?.from ? (date.to ? `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}` : format(date.from, "LLL dd, y")) : <span>Pick a date range</span>}</Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} />
                                </PopoverContent>
                            </Popover>
                        </CardContent>
                    </Card>
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>{filteredTransactions.length > 0 ? (filteredTransactions.map((t) => (
                                <ContextMenu key={t.id}>
                                    <ContextMenuTrigger asChild>
                                        <TableRow>
                                            <TableCell>{format(new Date(t.date), "MMM dd, yyyy")}</TableCell>
                                            <TableCell className="font-medium">{t.description}</TableCell>
                                            <TableCell>{t.category || "–"}</TableCell>
                                            <TableCell className={`text-right font-bold ${t.type === "earning" ? "text-green-600" : "text-red-600"}`}>{t.type === "earning" ? "+" : "-"}${t.amount.toFixed(2)}</TableCell>
                                        </TableRow>
                                    </ContextMenuTrigger>
                                    <ContextMenuContent className="w-48">
                                        <ContextMenuItem onSelect={() => setDialogState({ type: "transaction", data: t })}>
                                            <Edit className="mr-2 size-4" /> Edit</ContextMenuItem>
                                        <ContextMenuItem onSelect={() => handleDuplicateTransaction(t)}>
                                            <Copy className="mr-2 size-4" /> Duplicate</ContextMenuItem>
                                        <ContextMenuSeparator />
                                        <ContextMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onSelect={() => handleDelete("transactions", t.id, "Are you sure you want to delete this transaction?")}>
                                            <Trash2 className="mr-2 size-4" /> Delete</ContextMenuItem>
                                    </ContextMenuContent>
                                </ContextMenu>
                            ))) : (<TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">No transactions found for the selected filters.</TableCell>
                            </TableRow>)}</TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                <TabsContent value="categories" className="mt-6">
                    <CategoriesTab transactions={filteredTransactions} totalExpenses={totalExpenses} allCategories={allCategories} onRefresh={loadAllFinancialData} />
                </TabsContent>

                <TabsContent value="recurring">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recurring Transactions</CardTitle>
                            <CardDescription>Automate your regular income and expenses to forecast cash flow. Due transactions are logged automatically.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Schedule</TableHead>
                                        <TableHead>Next Due</TableHead>
                                        <TableHead className="text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>{recurring.map((r) => {
                                    let schedule: string = r.frequency; if ((r.frequency === 'weekly' || r.frequency === 'bi-weekly') && r.occurrence_day !== null && r.occurrence_day !== undefined) { const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; schedule = `${r.frequency} on ${days[r.occurrence_day]}`; } else if (r.frequency === 'monthly' && r.occurrence_day) { schedule = `monthly on the ${r.occurrence_day}th`; } let nextDueDate = 'N/A'; try { let cursor = r.last_processed_date ? new Date(r.last_processed_date) : new Date(r.start_date); if (isBefore(cursor, new Date(r.start_date))) cursor = new Date(r.start_date); const next = (r.last_processed_date && isAfter(new Date(r.last_processed_date), new Date())) ? cursor : getNextOccurrence(cursor, r); nextDueDate = format(next, 'MMM dd, yyyy'); } catch (e) { console.error("Date calculation error", e); } return (<TableRow key={r.id}>
                                        <TableCell className="font-medium">{r.description}</TableCell>
                                        <TableCell className={r.type === 'earning' ? 'text-green-600' : 'text-red-600'}>${r.amount.toFixed(2)}</TableCell>
                                        <TableCell className="capitalize">{schedule}</TableCell>
                                        <TableCell>{nextDueDate}</TableCell>
                                        <TableCell className="text-center">
                                            <Button variant="ghost" size="icon" className="size-8" onClick={() => setDialogState({ type: 'recurring', data: r })}>
                                                <Edit className="size-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="size-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete("recurring_transactions", r.id, `Delete rule "${r.description}"?`)}>
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>)
                                })} {recurring.length === 0 && <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">No recurring transaction rules found.</TableCell>
                                </TableRow>}</TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="goals">
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Goals</CardTitle>
                            <CardDescription>Set targets and track your progress towards them.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{goals.map((goal) => (<GoalCard key={goal.id} goal={goal} onAddFunds={() => setDialogState({ type: 'addFunds', data: goal })} onEdit={() => setDialogState({ type: 'goal', data: goal })} onDelete={() => handleDelete("financial_goals", goal.id, `Delete goal "${goal.name}"?`)} />))} {goals.length === 0 && <p className="text-muted-foreground col-span-full text-center py-12">No goals set yet. Click "New Goal" to start planning.</p>}</CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="analytics" className="mt-6">
                    <AnalyticsTab transactions={transactions} allYears={allYearsWithData} />
                </TabsContent>

            </Tabs>
            <Dialog open={!!dialogState.type} onOpenChange={(open) => !open && setDialogState({ type: null })}>
                <DialogContent>
                    {dialogState.type === 'transaction' && (<>
                        <DialogHeader>
                            <DialogTitle>{dialogState.data?.id ? "Edit" : "Add"} Transaction</DialogTitle>
                        </DialogHeader>
                        <TransactionForm
                            transaction={dialogState.data}
                            onSuccess={handleSaveSuccess}
                            categories={allCategories}
                        />                    </>)}
                    {dialogState.type === 'recurring' && (<>
                        <DialogHeader>
                            <DialogTitle>{dialogState.data ? "Edit" : "Create"} Recurring Rule</DialogTitle>
                        </DialogHeader>
                        <RecurringTransactionForm recurringTransaction={dialogState.data} onSuccess={handleSaveSuccess} />
                    </>)}
                    {dialogState.type === 'goal' && (<>
                        <DialogHeader>
                            <DialogTitle>{dialogState.data ? "Edit" : "Create"} Financial Goal</DialogTitle>
                        </DialogHeader>
                        <FinancialGoalForm goal={dialogState.data} onSuccess={handleSaveSuccess} />
                    </>)}
                    {dialogState.type === 'addFunds' && (<>
                        <DialogHeader>
                            <DialogTitle>Add Funds to "{dialogState.data?.name}"</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddFunds} className="space-y-4 pt-4">
                            <div>
                                <Label htmlFor="add-funds-amount">Amount</Label>
                                <Input id="add-funds-amount" name="amount" type="number" step="1" required autoFocus />
                            </div>
                            <div className="flex justify-end gap-2">
                                <DialogClose asChild>
                                    <Button type="button" variant="ghost">Cancel</Button>
                                </DialogClose>
                                <Button type="submit">Confirm Contribution</Button>
                            </div>
                        </form>
                    </>)}
                </DialogContent>
            </Dialog>
        </div>
    );
}