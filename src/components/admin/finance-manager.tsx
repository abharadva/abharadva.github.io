"use client";
import React, { useState, useEffect, useMemo, FormEvent, useCallback } from "react";
import { supabase } from "@/supabase/client";
import type { FinancialGoal, RecurringTransaction, Transaction } from "@/types";
import { DateRange } from "react-day-picker";
import { addDays, addMonths, addWeeks, addYears, format, startOfMonth, subMonths, differenceInDays, isBefore, isAfter, isSameDay, nextDay, setDate } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, } from "@/components/ui/dialog";
import TransactionForm from "@/components/admin/transaction-form";
import RecurringTransactionForm from "@/components/admin/recurring-transaction-form";
import FinancialGoalForm from "@/components/admin/financial-goal-form";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig, } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from "recharts";
import { Edit, Trash2, Calendar as CalendarIcon, Search, TrendingUp, TrendingDown, PiggyBank, Target, Plus, Repeat } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const chartConfig = { earning: { label: "Earnings", color: "hsl(var(--chart-2))" }, expense: { label: "Expenses", color: "hsl(var(--chart-5))" } };
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];
type DialogState = { type: "transaction" | "recurring" | "goal" | "addFunds" | null; data?: any; };

const GoalCard = ({ goal, onAddFunds, onEdit, onDelete }: { goal: FinancialGoal, onAddFunds: () => void, onEdit: () => void, onDelete: () => void }) => {
    const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
    const remainingAmount = goal.target_amount - goal.current_amount;
    const remainingDays = goal.target_date ? differenceInDays(new Date(goal.target_date), new Date()) : null;

    return (
        <Card className="relative flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <motion.div
                className="absolute bottom-0 left-0 right-0 bg-primary/10 -z-0"
                initial={{ height: 0 }}
                animate={{ height: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            />

            <div className="relative z-10 flex h-full flex-col">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <CardTitle className="leading-tight">{goal.name}</CardTitle>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="-mr-2 -mt-2 size-7 text-muted-foreground"><Edit className="size-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={onEdit}>Edit Goal</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-500" onClick={onDelete}>Delete Goal</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>

                <CardContent className="flex flex-grow flex-col justify-between text-center">
                    <div>
                        <p className="text-6xl font-black text-primary/80">{progress.toFixed(0)}<span className="text-4xl text-primary/50">%</span></p>
                        <p className="font-semibold text-muted-foreground">
                            ${goal.current_amount.toLocaleString()} / ${goal.target_amount.toLocaleString()}
                        </p>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1 rounded-md bg-background/50 p-2">
                            <p className="text-xs font-semibold uppercase text-muted-foreground">Remaining</p>
                            <p className="text-lg font-bold text-foreground">
                                ${remainingAmount > 0 ? remainingAmount.toLocaleString() : 0}
                            </p>
                        </div>
                        <div className="space-y-1 rounded-md bg-background/50 p-2">
                            <p className="text-xs font-semibold uppercase text-muted-foreground">Time Left</p>
                            {remainingDays !== null ? (
                                <p className={`text-lg font-bold ${remainingDays < 0 ? 'text-destructive' : 'text-foreground'}`}>
                                    {remainingDays < 0 ? `Overdue` : `${remainingDays}d`}
                                </p>
                            ) : (
                                <p className="text-lg font-bold text-foreground">-</p>
                            )}
                        </div>
                    </div>
                </CardContent>

                <CardFooter>
                    <Button size="sm" className="w-full" onClick={onAddFunds}><Plus className="mr-2 size-4" />Add Funds</Button>
                </CardFooter>
            </div>
        </Card>
    );
};

const getNextOccurrence = (cursor: Date, rule: RecurringTransaction): Date => {
    let next = new Date(cursor);
    switch (rule.frequency) {
        case 'daily': return addDays(next, 1);
        case 'weekly':
            return rule.occurrence_day !== null && rule.occurrence_day !== undefined
                ? nextDay(next, rule.occurrence_day as any)
                : addWeeks(next, 1);
        case 'bi-weekly':
            return rule.occurrence_day !== null && rule.occurrence_day !== undefined
                ? nextDay(addWeeks(next, 1), rule.occurrence_day as any)
                : addWeeks(next, 2);
        case 'monthly':
            next = addMonths(next, 1);
            return rule.occurrence_day ? setDate(next, rule.occurrence_day) : next;
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
    const [analyticsYear, setAnalyticsYear] = useState(new Date().getFullYear());

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
        } catch (err: any) {
            setError(err.message);
            toast.error("Data Load Error", { description: err.message });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadAllFinancialData(); }, [loadAllFinancialData]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter((t) => {
            const transactionDate = new Date(t.date + 'T00:00:00'); // Ensure date is parsed correctly without timezone shifts
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

    const cashFlowData = useMemo(() => {
        const monthlyData: Record<string, { earning: number; expense: number }> = {};
        const sixMonthsAgo = subMonths(new Date(), 5);
        const relevantTransactions = transactions.filter((t) => new Date(t.date + 'T00:00:00') >= startOfMonth(sixMonthsAgo));
        for (const t of relevantTransactions) {
            const month = format(new Date(t.date + 'T00:00:00'), "MMM yy");
            if (!monthlyData[month]) monthlyData[month] = { earning: 0, expense: 0 };
            if (t.type === "earning") monthlyData[month].earning += t.amount;
            else monthlyData[month].expense += t.amount;
        }
        return Object.entries(monthlyData)
            .map(([name, values]) => ({ name, ...values }))
            .sort((a, b) => new Date(`01 ${a.name}`).getTime() - new Date(`01 ${b.name}`).getTime())
            .slice(-6);
    }, [transactions]);
    
    const analyticsData = useMemo(() => {
        const monthlyData: Record<string, { income: number; expenses: number; net: number }> = {};
        const yearTransactions = transactions.filter(t => new Date(t.date + 'T00:00:00').getFullYear() === analyticsYear);
        for (const t of yearTransactions) {
            const month = format(new Date(t.date + 'T00:00:00'), 'MMM');
            if (!monthlyData[month]) monthlyData[month] = { income: 0, expenses: 0, net: 0 };
            if (t.type === 'earning') { monthlyData[month].income += t.amount; } 
            else { monthlyData[month].expenses += t.amount; }
        }
        for (const month in monthlyData) { monthlyData[month].net = monthlyData[month].income - monthlyData[month].expenses; }
        const allMonths = Array.from({ length: 12 }, (_, i) => format(new Date(analyticsYear, i), 'MMM'));
        return allMonths.map(month => ({ month, ...(monthlyData[month] || { income: 0, expenses: 0, net: 0 }) }));
    }, [transactions, analyticsYear]);
    
    const handleSaveSuccess = () => { loadAllFinancialData(); setDialogState({ type: null }); };
    const handleDelete = async (tableName: string, id: string, message: string) => { if (!confirm(message)) return; const { error } = await supabase.from(tableName).delete().eq("id", id); if (error) { toast.error(`Failed to delete: ${error.message}`); } else { toast.success("Item deleted."); await loadAllFinancialData(); } };
    const handleAddFunds = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const amount = parseFloat(formData.get("amount") as string);
        const goal = dialogState.data as FinancialGoal;
        if (!amount || amount <= 0 || !goal) { toast.error("Invalid amount provided."); return; }
        const newCurrentAmount = goal.current_amount + amount;
        const { error: goalError } = await supabase.from("financial_goals").update({ current_amount: newCurrentAmount }).eq("id", goal.id);
        if (goalError) { toast.error("Failed to update goal", { description: goalError.message }); return; }
        const { error: transError } = await supabase.from("transactions").insert({ date: new Date().toISOString().split("T")[0], description: `Contribution to goal: ${goal.name}`, amount: amount, type: "expense", category: "Savings & Goals", });
        if (transError) { toast.warning("Goal updated, but failed to create a matching transaction.", { description: transError.message, }); } else { toast.success(`$${amount.toFixed(2)} added to "${goal.name}"`); }
        await handleSaveSuccess();
    };
    
    const forecast = useMemo(() => {
        const upcomingTransactions: { description: string, amount: number, type: 'earning' | 'expense', date: Date }[] = [];
        const today = new Date(); today.setHours(0,0,0,0);
        const next30Days = addDays(today, 30);
        recurring.forEach(rule => {
            let cursor = rule.last_processed_date ? new Date(rule.last_processed_date + 'T00:00:00') : new Date(rule.start_date + 'T00:00:00');
            if (isBefore(cursor, new Date(rule.start_date + 'T00:00:00'))) cursor = new Date(rule.start_date + 'T00:00:00');
            let nextOccurrence = new Date(cursor);
            if (rule.last_processed_date && (isAfter(nextOccurrence, today) || isSameDay(nextOccurrence, today))) {} 
            else { nextOccurrence = getNextOccurrence(cursor, rule); }
            const ruleEndDate = rule.end_date ? new Date(rule.end_date + 'T00:00:00') : null;
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-2xl font-bold">Finance Command Center</h2><p className="text-muted-foreground">Strategic overview, planning, and transaction management.</p></div><div className="flex flex-wrap gap-2"><Button onClick={() => setDialogState({ type: "goal" })}> <Target className="mr-2 size-4" /> New Goal</Button><Button onClick={() => setDialogState({ type: "recurring" })}> <Repeat className="mr-2 size-4" /> New Recurring</Button><Button onClick={() => setDialogState({ type: "transaction" })}> <Plus className="mr-2 size-4" /> New Transaction</Button></div></div>
            <Tabs defaultValue="dashboard">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5"><TabsTrigger value="dashboard">Dashboard</TabsTrigger><TabsTrigger value="transactions">Transactions</TabsTrigger><TabsTrigger value="recurring">Recurring</TabsTrigger><TabsTrigger value="goals">Goals</TabsTrigger><TabsTrigger value="analytics">Analytics</TabsTrigger></TabsList>
                <TabsContent value="dashboard" className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader><CardTitle>Net Income Overview</CardTitle><CardDescription>Total earnings minus total expenses for: {date?.from ? format(date.from, "LLL dd, y") : '...'} - {date?.to ? format(date.to, "LLL dd, y") : '...'}</CardDescription></CardHeader>
                                <CardContent className="space-y-6"><div className={`text-5xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>{netIncome >= 0 ? '+' : '-'}${Math.abs(netIncome).toFixed(2)}</div><div className="flex justify-around items-center pt-4 border-t"><div className="text-center"><p className="text-sm text-muted-foreground flex items-center gap-1"><TrendingUp className="size-4 text-green-500" /> Total Earnings</p><p className="text-2xl font-semibold">${totalEarnings.toFixed(2)}</p></div><Separator orientation="vertical" className="h-12" /><div className="text-center"><p className="text-sm text-muted-foreground flex items-center gap-1"><TrendingDown className="size-4 text-red-500" /> Total Expenses</p><p className="text-2xl font-semibold">${totalExpenses.toFixed(2)}</p></div></div></CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Cash Flow (Last 6 Months)</CardTitle></CardHeader>
                                <CardContent><ChartContainer config={chartConfig} className="h-64 w-full"><BarChart data={cashFlowData}><CartesianGrid vertical={false} /><XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} /><YAxis tickLine={false} axisLine={false} tickMargin={8} /><ChartTooltip content={<ChartTooltipContent />} /><ChartLegend content={<ChartLegendContent />} /><Bar dataKey="earning" fill="var(--color-earning)" radius={4} /><Bar dataKey="expense" fill="var(--color-expense)" radius={4} /></BarChart></ChartContainer></CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Goals at a Glance</CardTitle><CardDescription>A summary of your active financial targets.</CardDescription></CardHeader>
                                <CardContent className="space-y-6">{goals.length > 0 ? goals.map(goal => { const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100); const remainingAmount = goal.target_amount - goal.current_amount; const remainingDays = goal.target_date ? differenceInDays(new Date(goal.target_date), new Date()) : null; return (<div key={goal.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><div className="flex-grow"><p className="font-semibold">{goal.name}</p><p className="text-sm text-muted-foreground">${goal.current_amount.toLocaleString()} / ${goal.target_amount.toLocaleString()}</p></div><div className="flex items-center gap-4 w-full sm:w-auto"><TooltipProvider delayDuration={100}><Tooltip><TooltipTrigger asChild><div className="relative h-6 w-28 rounded-full bg-muted overflow-hidden"><motion.div className="absolute left-0 top-0 h-full rounded-full bg-primary" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, ease: "easeOut" }} /><span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary-foreground">{progress.toFixed(0)}%</span></div></TooltipTrigger>{remainingDays !== null && (<TooltipContent><p>{remainingDays < 0 ? `${Math.abs(remainingDays)} days overdue` : `${remainingDays} days remaining`}</p></TooltipContent>)}</Tooltip></TooltipProvider><div className="text-right w-24"><p className="text-xs text-muted-foreground">Remaining</p><p className="font-bold text-base">${remainingAmount > 0 ? remainingAmount.toLocaleString() : 0}</p></div></div></div>)}) : <p className="text-muted-foreground text-sm py-4 text-center">No goals set. Create one in the 'Goals' tab to see progress here.</p>}</CardContent>
                                {goals.length > 0 && (<CardFooter><p className="text-xs text-muted-foreground">Manage your goals in the 'Goals' tab.</p></CardFooter>)}
                            </Card>
                        </div>
                        <div className="lg:col-span-1 space-y-6">
                            <Card>
                                <CardHeader><CardTitle>Expense Breakdown</CardTitle></CardHeader>
                                <CardContent>{expenseByCategory.length > 0 ? <ChartContainer config={{}} className="h-64 w-full"><PieChart><Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>{expenseByCategory.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><ChartTooltip content={<ChartTooltipContent nameKey="name" />} /></PieChart></ChartContainer> : <div className="flex h-64 items-center justify-center"><p className="text-muted-foreground text-center">No expense data for this period.</p></div>}</CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Upcoming in 30 Days</CardTitle></CardHeader>
                                <CardContent className="space-y-3">{forecast.upcomingTransactions.length > 0 ? forecast.upcomingTransactions.map((t, i) => (<div key={i} className="flex justify-between items-center text-sm"><div><p className="font-semibold">{t.description}</p><p className="text-xs text-muted-foreground">Due in {differenceInDays(t.date, new Date())} days ({format(t.date, 'MMM dd')})</p></div><p className={`font-bold ${t.type === 'earning' ? 'text-green-600' : 'text-red-600'}`}>{t.type === 'earning' ? '+' : '-'}${t.amount.toFixed(2)}</p></div>)) : <p className="text-sm text-muted-foreground text-center py-8">No upcoming recurring transactions.</p>}</CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="transactions" className="mt-6 space-y-4">
                    <Card><CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"><div className="relative flex-grow"><Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" /><Input placeholder="Search descriptions..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div><Popover><PopoverTrigger asChild><Button variant="outline" className="w-full justify-start text-left font-normal sm:w-auto"><CalendarIcon className="mr-2 size-4" />{date?.from ? (date.to ? `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}` : format(date.from, "LLL dd, y")) : <span>Pick a date range</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} /></PopoverContent></Popover></CardContent></Card>
                    <Card><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="w-[100px] text-center">Actions</TableHead></TableRow></TableHeader><TableBody>{filteredTransactions.length > 0 ? (filteredTransactions.map((t) => (<TableRow key={t.id}><TableCell>{format(new Date(t.date + 'T00:00:00'), "MMM dd, yyyy")}</TableCell><TableCell className="font-medium">{t.description}</TableCell><TableCell>{t.category || "–"}</TableCell><TableCell className={`text-right font-bold ${t.type === "earning" ? "text-green-600" : "text-red-600"}`}>{t.type === "earning" ? "+" : "-"}${t.amount.toFixed(2)}</TableCell><TableCell className="text-center"><Button variant="ghost" size="icon" className="size-8" onClick={() => setDialogState({ type: "transaction", data: t })}><Edit className="size-4" /></Button><Button variant="ghost" size="icon" className="size-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete("transactions", t.id, "Are you sure you want to delete this transaction?")}><Trash2 className="size-4" /></Button></TableCell></TableRow>))) : (<TableRow><TableCell colSpan={5} className="h-24 text-center">No transactions found for the selected filters.</TableCell></TableRow>)}</TableBody></Table></Card>
                </TabsContent>
                <TabsContent value="recurring">
                    <Card><CardHeader><CardTitle>Recurring Transactions</CardTitle><CardDescription>Automate your regular income and expenses to forecast cash flow. Due transactions are logged automatically.</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Description</TableHead><TableHead>Amount</TableHead><TableHead>Schedule</TableHead><TableHead>Next Due</TableHead><TableHead className="text-center">Actions</TableHead></TableRow></TableHeader><TableBody>{recurring.map((r) => { let schedule: string = r.frequency; if ((r.frequency === 'weekly' || r.frequency === 'bi-weekly') && r.occurrence_day !== null && r.occurrence_day !== undefined) { const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; schedule = `${r.frequency} on ${days[r.occurrence_day]}`; } else if (r.frequency === 'monthly' && r.occurrence_day) { schedule = `monthly on the ${r.occurrence_day}th`; } let nextDueDate = 'N/A'; try { let cursor = r.last_processed_date ? new Date(r.last_processed_date + 'T00:00:00') : new Date(r.start_date + 'T00:00:00'); if (isBefore(cursor, new Date(r.start_date + 'T00:00:00'))) cursor = new Date(r.start_date + 'T00:00:00'); const next = (r.last_processed_date && isAfter(new Date(r.last_processed_date + 'T00:00:00'), new Date())) ? cursor : getNextOccurrence(cursor, r); nextDueDate = format(next, 'MMM dd, yyyy'); } catch (e) { console.error("Date calculation error", e); } return (<TableRow key={r.id}><TableCell className="font-medium">{r.description}</TableCell><TableCell className={r.type === 'earning' ? 'text-green-600' : 'text-red-600'}>${r.amount.toFixed(2)}</TableCell><TableCell className="capitalize">{schedule}</TableCell><TableCell>{nextDueDate}</TableCell><TableCell className="text-center"><Button variant="ghost" size="icon" className="size-8" onClick={() => setDialogState({ type: 'recurring', data: r })}><Edit className="size-4" /></Button><Button variant="ghost" size="icon" className="size-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete("recurring_transactions", r.id, `Delete rule "${r.description}"?`)}><Trash2 className="size-4" /></Button></TableCell></TableRow>) })} {recurring.length === 0 && <TableRow><TableCell colSpan={5} className="h-24 text-center">No recurring transaction rules found.</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
                </TabsContent>
                <TabsContent value="goals">
                    <Card><CardHeader><CardTitle>Financial Goals</CardTitle><CardDescription>Set targets and track your progress towards them.</CardDescription></CardHeader><CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{goals.map((goal) => (<GoalCard key={goal.id} goal={goal} onAddFunds={() => setDialogState({ type: 'addFunds', data: goal })} onEdit={() => setDialogState({ type: 'goal', data: goal })} onDelete={() => handleDelete("financial_goals", goal.id, `Delete goal "${goal.name}"?`)} />))} {goals.length === 0 && <p className="text-muted-foreground col-span-full text-center py-12">No goals set yet. Click "New Goal" to start planning.</p>}</CardContent></Card>
                </TabsContent>
                <TabsContent value="analytics">
                    <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle>Annual Report</CardTitle><CardDescription>Month-by-month financial summary for the selected year.</CardDescription></div><Select value={String(analyticsYear)} onValueChange={(v) => setAnalyticsYear(Number(v))}><SelectTrigger className="w-[120px]"><SelectValue placeholder="Select Year" /></SelectTrigger><SelectContent>{Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (<SelectItem key={year} value={String(year)}>{year}</SelectItem>))}</SelectContent></Select></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Month</TableHead><TableHead className="text-right text-green-600">Income</TableHead><TableHead className="text-right text-red-600">Expenses</TableHead><TableHead className="text-right">Net Income</TableHead></TableRow></TableHeader><TableBody>{analyticsData.map(row => (<TableRow key={row.month}><TableCell className="font-medium">{row.month}</TableCell><TableCell className="text-right text-green-600">+${row.income.toFixed(2)}</TableCell><TableCell className="text-right text-red-600">-${row.expenses.toFixed(2)}</TableCell><TableCell className={`text-right font-bold ${row.net >= 0 ? 'text-foreground' : 'text-destructive'}`}>{row.net < 0 ? '-' : ''}${Math.abs(row.net).toFixed(2)}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
                </TabsContent>
            </Tabs>
            <Dialog open={!!dialogState.type} onOpenChange={(open) => !open && setDialogState({ type: null })}>
                <DialogContent>{dialogState.type === 'transaction' && (<><DialogHeader><DialogTitle>{dialogState.data ? "Edit" : "Add"} Transaction</DialogTitle></DialogHeader><TransactionForm transaction={dialogState.data} onSuccess={handleSaveSuccess} /></>)}{dialogState.type === 'recurring' && (<><DialogHeader><DialogTitle>{dialogState.data ? "Edit" : "Create"} Recurring Rule</DialogTitle></DialogHeader><RecurringTransactionForm recurringTransaction={dialogState.data} onSuccess={handleSaveSuccess} /></>)}{dialogState.type === 'goal' && (<><DialogHeader><DialogTitle>{dialogState.data ? "Edit" : "Create"} Financial Goal</DialogTitle></DialogHeader><FinancialGoalForm goal={dialogState.data} onSuccess={handleSaveSuccess} /></>)}{dialogState.type === 'addFunds' && (<><DialogHeader><DialogTitle>Add Funds to "{dialogState.data?.name}"</DialogTitle></DialogHeader><form onSubmit={handleAddFunds} className="space-y-4 pt-4"><div><Label htmlFor="add-funds-amount">Amount</Label><Input id="add-funds-amount" name="amount" type="number" step="1" required autoFocus /></div><div className="flex justify-end gap-2"><DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose><Button type="submit">Confirm Contribution</Button></div></form></>)}</DialogContent>
            </Dialog>
        </div>
    );
}