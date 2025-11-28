// src/components/admin/finance-manager.tsx
"use client";
import React, { useState, useMemo, FormEvent } from "react";
import type { FinancialGoal, RecurringTransaction, Transaction } from "@/types";
import { DateRange } from "react-day-picker";
import {
  addDays,
  format,
  startOfMonth,
  subMonths,
  differenceInDays,
  isBefore,
  isAfter,
  isSameDay,
  startOfDay,
} from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import TransactionForm from "@/components/admin/transaction-form";
import RecurringTransactionForm from "@/components/admin/recurring-transaction-form";
import FinancialGoalForm from "@/components/admin/financial-goal-form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Line,
  LineChart,
  Tooltip as RechartsTooltip,
  ReferenceLine,
  RadialBar,
  RadialBarChart
} from "recharts";
import {
  Edit,
  Trash2,
  Calendar as CalendarIcon,
  Search,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Target,
  Plus,
  Repeat,
  AlertCircle,
  Copy,
  ArrowDown,
  ArrowUp,
  X as XIcon,
  HandCoins,
  MoreVertical,
  MoreHorizontal,
  Clock,
  Check,
  Filter,
  ArrowRightLeft,
  Wallet,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { Separator } from "../ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import dynamic from "next/dynamic";
import { Badge } from "../ui/badge";
import { cn, parseLocalDate } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import { Progress } from "../ui/progress";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet";
import {
  useGetFinancialDataQuery,
  useDeleteTransactionMutation,
  useDeleteRecurringMutation,
  useDeleteGoalMutation,
  useAddFundsToGoalMutation,
  useManageCategoryMutation,
  useSaveTransactionMutation,
  useSaveRecurringMutation,
} from "@/store/api/adminApi";
import { getNextOccurrence } from "@/lib/utils";
import LoadingSpinner from "./LoadingSpinner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";

// --- DYNAMIC IMPORTS ---
const Calendar = dynamic(
  () => import("@/components/ui/calendar").then((mod) => mod.Calendar),
  {
    ssr: false,
    loading: () => <div className="p-4">Loading Calendar...</div>,
  },
);

// --- CONSTANTS & TYPES ---
const chartConfig = {
  earning: { label: "Earnings", color: "hsl(var(--chart-2))" },
  expense: { label: "Expenses", color: "hsl(var(--chart-5))" },
};
const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--primary))",
  "hsl(var(--accent))",
];
type DialogState = {
  type: "transaction" | "recurring" | "goal" | "addFunds" | null;
  data?: any;
};

// --- REUSABLE COMPONENTS ---
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  helpText?: string;
  className?: string;
  trend?: "up" | "down" | "neutral";
}> = ({ title, value, icon, helpText, className, trend }) => (
  <Card className={cn("overflow-hidden", className)}>
    <CardHeader className="pb-2">
      <div className="flex items-start justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-full bg-background/50 border",
          trend === 'up' ? "text-green-500 border-green-500/20 bg-green-500/10" :
            trend === 'down' ? "text-red-500 border-red-500/20 bg-red-500/10" : "text-muted-foreground")}>
          {icon}
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
    </CardContent>
  </Card>
);

type CategoryData = {
  name: string;
  total: number;
  count: number;
  percentage: number;
};
type CategoryAction = {
  type: "edit" | "merge" | "delete";
  category: CategoryData;
} | null;

const CategoriesTab = ({
  transactions,
  totalExpenses,
  allCategories,
}: {
  transactions: Transaction[];
  totalExpenses: number;
  allCategories: string[];
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(
    null,
  );
  const [actionDialog, setActionDialog] = useState<CategoryAction>(null);
  const [manageCategory] = useManageCategoryMutation();

  const categoryData: CategoryData[] = useMemo(() => {
    const expenseTransactions = transactions.filter(
      (t) => t.type === "expense",
    );
    const categoryMap: Record<string, { total: number; count: number }> = {};

    expenseTransactions.forEach((t) => {
      const category = t.category || "Uncategorized";
      if (!categoryMap[category])
        categoryMap[category] = { total: 0, count: 0 };
      categoryMap[category].total += t.amount;
      categoryMap[category].count += 1;
    });

    return Object.entries(categoryMap)
      .map(([name, { total, count }]) => ({
        name,
        total,
        count,
        percentage: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [transactions, totalExpenses]);

  const handleAction = async (
    type: "edit" | "merge" | "delete",
    oldName: string,
    newName?: string,
  ) => {
    try {
      await manageCategory({ type, oldName, newName }).unwrap();
      toast.success(`Category action "${type}" successful.`);
    } catch (err: any) {
      toast.error(`Failed to ${type} category`, { description: err.message });
    }
    setActionDialog(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Expense Categories</CardTitle>
          <CardDescription>
            Breakdown of expenses by category for the selected period. Click a
            card to see transactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categoryData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryData.map((cat) => (
                <Card
                  key={cat.name}
                  className="flex flex-col cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg"
                  onClick={() => setSelectedCategory(cat)}
                >
                  <CardHeader className="flex-row items-start justify-between pb-2">
                    <h3 className="font-bold">{cat.name}</h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 -mt-2 -mr-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem
                          onSelect={() =>
                            setActionDialog({ type: "edit", category: cat })
                          }
                        >
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() =>
                            setActionDialog({ type: "merge", category: cat })
                          }
                        >
                          Merge into...
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={() =>
                            setActionDialog({ type: "delete", category: cat })
                          }
                        >
                          Delete Category
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-3">
                    <p className="text-2xl font-bold">
                      ${cat.total.toFixed(2)}
                    </p>
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
                  <CardFooter className="text-xs text-muted-foreground pt-3 border-t">
                    {cat.count} transactions
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center py-10 text-muted-foreground">
              No expense data for the selected period.
            </p>
          )}
        </CardContent>
      </Card>

      <Sheet
        open={!!selectedCategory}
        onOpenChange={(open) => !open && setSelectedCategory(null)}
      >
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Transactions for "{selectedCategory?.name}"</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-8rem)] pr-4 mt-4">
            <div className="space-y-3">
              {transactions
                .filter(
                  (t) =>
                    (t.category || "Uncategorized") === selectedCategory?.name,
                )
                .map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-secondary"
                  >
                    <div>
                      <p className="font-medium">{t.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(t.date), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <p className="font-bold text-sm text-chart-5">
                      -${t.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <Dialog
        open={!!actionDialog}
        onOpenChange={(open) => !open && setActionDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">
              {actionDialog?.type} Category: "{actionDialog?.category.name}"
            </DialogTitle>
            <DialogDescription>
              {actionDialog?.type === "edit" &&
                "This will rename the category for all associated transactions."}
              {actionDialog?.type === "merge" &&
                `This will merge all "${actionDialog.category.name}" transactions into another category.`}
              {actionDialog?.type === "delete" &&
                `This will remove the category tag from all associated transactions, setting them to "Uncategorized".`}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newName = formData.get("newName") as string;
              if (actionDialog)
                handleAction(
                  actionDialog.type,
                  actionDialog.category.name,
                  newName,
                );
            }}
          >
            {actionDialog?.type === "edit" && (
              <div className="space-y-2 py-4">
                <Label htmlFor="newName">New Category Name</Label>
                <Input
                  id="newName"
                  name="newName"
                  defaultValue={actionDialog.category.name}
                  required
                  autoFocus
                />
              </div>
            )}
            {actionDialog?.type === "merge" && (
              <div className="space-y-2 py-4">
                <Label htmlFor="newName">Target Category</Label>
                <Select name="newName" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category to merge into..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories
                      .filter((c) => c !== actionDialog.category.name)
                      .map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {actionDialog?.type === "delete" && (
              <div className="py-4 text-sm text-destructive-foreground bg-destructive/90 p-4 rounded-md">
                Are you sure? This action cannot be undone.
              </div>
            )}
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setActionDialog(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={
                  actionDialog?.type === "delete" ? "destructive" : "default"
                }
              >
                Confirm
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const MonthlyDetailSheet = ({ month, year, transactions, onClose }: { month: string; year: number; transactions: Transaction[]; onClose: () => void; }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const monthTransactions = useMemo(() => transactions.filter((t) => format(parseLocalDate(t.date), "MMM") === month), [transactions, month]);
  const { totalIncome, totalExpenses, expenseByCategory } = useMemo(() => {
    let income = 0, expenses = 0;
    const categoryMap: Record<string, number> = {};
    monthTransactions.forEach((t) => {
      if (t.type === "earning") income += t.amount;
      else {
        expenses += t.amount;
        const cat = t.category || "Uncategorized";
        categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
      }
    });
    const expenseData = Object.entries(categoryMap).map(([name, value], index) => ({ name, value, fill: COLORS[index % COLORS.length] })).sort((a, b) => b.value - a.value);
    return { totalIncome: income, totalExpenses: expenses, expenseByCategory: expenseData };
  }, [monthTransactions]);
  const filteredTransactions = useMemo(() => selectedCategory ? monthTransactions.filter((t) => (t.category || "Uncategorized") === selectedCategory) : monthTransactions, [monthTransactions, selectedCategory]);

  return (
    <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Financial Details for {month}, {year}</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] pr-4 mt-4">
          <div className="grid grid-cols-2 gap-4 my-4">
            <StatCard title="Income" value={`$${totalIncome.toFixed(2)}`} icon={<TrendingUp />} />
            <StatCard title="Expenses" value={`$${totalExpenses.toFixed(2)}`} icon={<TrendingDown />} />
          </div>
          <h4 className="font-semibold mb-2">Expense Breakdown</h4>
          <ChartContainer config={{}} className="h-64 w-full -ml-4">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} onClick={(d) => setSelectedCategory(selectedCategory === d.name ? null : d.name)} className="cursor-pointer">{expenseByCategory.map((e, i) => (<Cell key={`cell-${i}`} fill={e.fill} stroke={selectedCategory === e.name ? "hsl(var(--primary))" : ""} strokeWidth={2} />))}</Pie>
                <RechartsTooltip content={<ChartTooltipContent nameKey="name" />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="flex justify-between items-center my-4">
            <h4 className="font-semibold">{selectedCategory ? `Transactions in "${selectedCategory}"` : "All Transactions"}</h4>
            {selectedCategory && <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)}>
              <XIcon className="mr-2 size-4" />Clear</Button>}
          </div>
          <div className="space-y-3">{filteredTransactions.length > 0 ? (filteredTransactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary">
              <div>
                <p className="font-medium">{t.description}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">{format(parseLocalDate(t.date), "MMM dd")}</p>{t.category && <Badge variant="outline">{t.category}</Badge>}</div>
              </div>
              <p className={cn("font-bold text-sm", t.type === "earning" ? "text-chart-2" : "text-chart-5")}>{t.type === "earning" ? "+" : "-"}${t.amount.toFixed(2)}</p>
            </div>))) : <p className="text-center text-muted-foreground py-10">No transactions.</p>}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

const AnalyticsTab = ({ transactions, allYears, allCategories }: { transactions: Transaction[]; allYears: number[]; allCategories: string[] }) => {
  const [analyticsYear, setAnalyticsYear] = useState(new Date().getFullYear());
  const [selectedMonthData, setSelectedMonthData] = useState<{ month: string; year: number } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const yearTransactions = useMemo(() => {
    // Using parseLocalDate for correct year grouping
    return transactions.filter(t => parseLocalDate(t.date).getFullYear() === analyticsYear)
  }, [transactions, analyticsYear]);

  const { annualStats, monthlyChartData, expenseByCategory } = useMemo(() => {
    let totalIncome = 0, totalExpenses = 0;
    const categoryMap: Record<string, { total: number, count: number }> = {};
    const monthlyData: Record<string, { income: number; expenses: number }> = {};

    yearTransactions.forEach(t => {
      // Using parseLocalDate for correct month grouping
      const month = format(parseLocalDate(t.date), "MMM");
      if (!monthlyData[month]) monthlyData[month] = { income: 0, expenses: 0 };

      if (t.type === 'earning') {
        totalIncome += t.amount;
        monthlyData[month].income += t.amount;
      } else {
        totalExpenses += t.amount;
        monthlyData[month].expenses += t.amount;
        const category = t.category || "Uncategorized";
        if (!categoryMap[category]) categoryMap[category] = { total: 0, count: 0 };
        categoryMap[category].total += t.amount;
        categoryMap[category].count += 1;
      }
    });

    const topCategory = Object.entries(categoryMap).sort((a, b) => b[1].total - a[1].total)[0];
    const allMonths = Array.from({ length: 12 }, (_, i) => format(new Date(analyticsYear, i), "MMM"));
    const chartData = allMonths.map(month => ({ month, ...(monthlyData[month] || { income: 0, expenses: 0 }) }));

    const categoryData = Object.entries(categoryMap)
      .map(([name, { total, count }], index) => ({ name, total, count, avg: total / count, fill: COLORS[index % COLORS.length] }))
      .sort((a, b) => b.total - a.total);

    return {
      annualStats: {
        totalIncome, totalExpenses, netIncome: totalIncome - totalExpenses,
        topExpenseCategory: topCategory ? `${topCategory[0]} ($${topCategory[1].total.toFixed(2)})` : "N/A",
      },
      monthlyChartData: chartData,
      expenseByCategory: categoryData
    };
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
              <SelectValue />
            </SelectTrigger>
            <SelectContent>{allYears.map((year) => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}</SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Income" value={`$${annualStats.totalIncome.toFixed(2)}`} icon={<ArrowUp />} />
            <StatCard title="Total Expenses" value={`$${annualStats.totalExpenses.toFixed(2)}`} icon={<ArrowDown />} />
            <StatCard title="Net Income" value={`${annualStats.netIncome < 0 ? "-" : ""}$${Math.abs(annualStats.netIncome).toFixed(2)}`} className={annualStats.netIncome < 0 ? "text-red-500" : "text-green-500"} icon={<HandCoins />} />
            <StatCard title="Top Expense" value={annualStats.topExpenseCategory} />
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
      <Card>
        <CardHeader>
          <CardTitle>Category Deep Dive</CardTitle>
          <CardDescription>Explore spending habits across categories for the selected year.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-2">
            <ChartContainer config={{}} className="h-64 w-full">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={expenseByCategory} dataKey="total" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} onClick={(data) => setSelectedCategory(selectedCategory === data.name ? null : data.name)} className="cursor-pointer">
                    {expenseByCategory.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} stroke={selectedCategory === entry.name ? "hsl(var(--primary))" : ""} strokeWidth={3} />))}
                  </Pie>
                  <RechartsTooltip content={<ChartTooltipContent nameKey="name" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          <div className="md:col-span-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Count</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Avg.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenseByCategory.filter(c => selectedCategory ? c.name === selectedCategory : true).map(cat => (
                  <TableRow key={cat.name}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.fill }} />{cat.name}</TableCell>
                    <TableCell className="text-right font-mono">${cat.total.toFixed(2)}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell">{cat.count}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell font-mono">${cat.avg.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedMonthData && <MonthlyDetailSheet month={selectedMonthData.month} year={selectedMonthData.year} transactions={yearTransactions} onClose={() => setSelectedMonthData(null)} />}
    </div>
  );
};

const MonthlyDetailDialog = ({
  month,
  year,
  transactions,
  onClose,
}: {
  month: string;
  year: number;
  transactions: Transaction[];
  onClose: () => void;
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const monthTransactions = useMemo(() => {
    return transactions.filter(
      (t) => format(new Date(t.date), "MMM") === month,
    );
  }, [transactions, month]);

  const { totalIncome, totalExpenses, expenseByCategory } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    const categoryMap: Record<string, number> = {};
    monthTransactions.forEach((t) => {
      if (t.type === "earning") income += t.amount;
      else {
        expenses += t.amount;
        const cat = t.category || "Uncategorized";
        categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
      }
    });
    const expenseData = Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    return {
      totalIncome: income,
      totalExpenses: expenses,
      expenseByCategory: expenseData,
    };
  }, [monthTransactions]);

  const filteredTransactions = useMemo(() => {
    if (!selectedCategory) return monthTransactions;
    return monthTransactions.filter(
      (t) => (t.category || "Uncategorized") === selectedCategory,
    );
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
          <DialogTitle>
            Financial Details for {month}, {year}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full pt-4 overflow-hidden">
          {/* Left Column: Charts and Stats */}
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                title="Month's Income"
                value={`$${totalIncome.toFixed(2)}`}
                className="bg-secondary"
              />
              <StatCard
                title="Month's Expenses"
                value={`$${totalExpenses.toFixed(2)}`}
                className="bg-secondary"
              />
            </div>
            <div>
              <h4 className="font-semibold mb-2">Expense Breakdown</h4>
              <p className="text-xs text-muted-foreground mb-2 -mt-1">
                Click a slice to filter transactions.
              </p>
              <ChartContainer config={{}} className="h-64 w-full">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={expenseByCategory}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      onClick={handlePieClick}
                      className="cursor-pointer"
                    >
                      {expenseByCategory.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke={
                            selectedCategory === entry.name
                              ? "hsl(var(--primary))"
                              : ""
                          }
                          strokeWidth={3}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={<ChartTooltipContent nameKey="name" />}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
          {/* Right Column: Transaction List */}
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold">
                {selectedCategory
                  ? `Transactions in "${selectedCategory}"`
                  : "All Transactions This Month"}
              </h4>
              {selectedCategory && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  <XIcon className="mr-2 size-4" />
                  Clear Filter
                </Button>
              )}
            </div>
            <ScrollArea className="flex-grow pr-4 -mr-4">
              <div className="space-y-3">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-secondary"
                    >
                      <div>
                        <p className="font-medium">{t.description}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(t.date), "MMM dd")}
                          </p>
                          {t.category && (
                            <Badge variant="outline">{t.category}</Badge>
                          )}
                        </div>
                      </div>
                      <p
                        className={cn(
                          "font-bold text-sm",
                          t.type === "earning"
                            ? "text-chart-2"
                            : "text-chart-5",
                        )}
                      >
                        {t.type === "earning" ? "+" : "-"}${t.amount.toFixed(2)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-10">
                    No transactions found.
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const GoalCard = ({
  goal,
  onAddFunds,
  onEdit,
  onDelete,
}: {
  goal: FinancialGoal;
  onAddFunds: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const progress = Math.min(
    (goal.current_amount / goal.target_amount) * 100,
    100,
  );
  const remainingAmount = goal.target_amount - goal.current_amount;
  const remainingDays = goal.target_date
    ? differenceInDays(new Date(goal.target_date), new Date())
    : null;

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
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={onEdit}> <Edit className="mr-2 size-4" /> Edit</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onSelect={onDelete}> <Trash2 className="mr-2 size-4" /> Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="flex flex-grow flex-col justify-between text-center">
          <div>
            <p className="text-6xl font-black text-primary/80">
              {progress.toFixed(0)}
              <span className="text-4xl text-primary/50">%</span>
            </p>
            <p className="font-semibold text-muted-foreground">
              ${goal.current_amount.toLocaleString()} / $
              {goal.target_amount.toLocaleString()}
            </p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1 rounded-md bg-background/50 p-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Remaining
              </p>
              <p className="text-lg font-bold text-foreground">
                ${remainingAmount > 0 ? remainingAmount.toLocaleString() : 0}
              </p>
            </div>
            <div className="space-y-1 rounded-md bg-background/50 p-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Time Left
              </p>
              {remainingDays !== null ? (
                <p
                  className={`text-lg font-bold ${remainingDays < 0 ? "text-destructive" : "text-foreground"}`}
                >
                  {remainingDays < 0 ? `Overdue` : `${remainingDays}d`}
                </p>
              ) : (
                <p className="text-lg font-bold text-foreground">-</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button size="sm" className="w-full" onClick={onAddFunds}>
            <Plus className="mr-2 size-4" />
            Add Funds
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
};

const CustomForecastTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-3 shadow-sm text-sm">
        <p className="font-bold mb-1">{label}</p>
        <p className={cn("font-mono", data.balance >= 0 ? "text-green-500" : "text-red-500")}>
          Projected Balance: ${data.balance.toFixed(2)}
        </p>
        {data.events.length > 0 && (
          <div className="mt-2 border-t pt-2 space-y-1">
            {data.events.map((event: string, index: number) => (
              <p key={index} className="text-xs text-muted-foreground">{event}</p>
            ))}
          </div>
        )}
      </div>
    );
  }
  return null;
};

const UpcomingRecurringList = ({
  recurring,
  onConfirm,
}: {
  recurring: RecurringTransaction[];
  onConfirm: (rule: RecurringTransaction, date: Date) => void;
}) => {
  const upcomingItems = useMemo(() => {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const lookAhead = addDays(today, 45);
    const lookBehind = subMonths(today, 12);

    const items: {
      rule: RecurringTransaction;
      date: Date;
      status: "overdue" | "due" | "upcoming";
    }[] = [];

    recurring.forEach((rule) => {
      let nextDate: Date;

      // Use parseLocalDate to ensure we start from exact Local date 00:00:00
      if (rule.last_processed_date) {
        nextDate = getNextOccurrence(parseLocalDate(rule.last_processed_date), rule);
      } else {
        nextDate = parseLocalDate(rule.start_date);
      }

      let safety = 0;
      while (isBefore(nextDate, lookAhead) && safety < 50) {
        if (isAfter(nextDate, lookBehind)) {
          let status: "overdue" | "due" | "upcoming" = "upcoming";

          if (isBefore(nextDate, startOfToday)) {
            status = "overdue";
          } else if (isSameDay(nextDate, startOfToday)) {
            status = "due";
          }

          items.push({
            rule,
            date: new Date(nextDate),
            status,
          });
        }
        nextDate = getNextOccurrence(nextDate, rule);
        safety++;
      }
    });

    return items.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [recurring]);

  if (upcomingItems.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground border rounded-lg border-dashed bg-muted/20">
        <CalendarIcon className="mb-3 size-10 opacity-20" />
        <p className="text-sm">
          No upcoming recurring payments in the next 45 days.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {upcomingItems.map(({ rule, date, status }, index) => (
        <div
          key={`${rule.id}-${date.toISOString()}-${index}`}
          className={cn(
            "flex items-center justify-between rounded-lg border p-3 shadow-sm transition-all hover:bg-secondary/40",
            status === "overdue" && "border-destructive/30 bg-destructive/5",
            status === "due" && "border-primary/30 bg-primary/5",
          )}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
                rule.type === "earning"
                  ? "bg-green-500/10 text-green-500 border-green-500/20"
                  : "bg-red-500/10 text-red-500 border-red-500/20",
              )}
            >
              {rule.type === "earning" ? (
                <ArrowUp className="size-4" />
              ) : (
                <ArrowDown className="size-4" />
              )}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate font-medium leading-tight">
                {rule.description}
              </span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span
                  className={cn(
                    "font-medium",
                    status === "overdue" && "text-destructive",
                    status === "due" && "text-primary",
                  )}
                >
                  {status === "overdue" ? "Overdue " : ""}
                  {status === "due" ? "Due Today " : ""}
                  {status === "upcoming" ? format(date, "MMM d") : format(date, "MMM d, yyyy")}
                </span>
                <span>•</span>
                <span className="capitalize">{rule.frequency}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-semibold">
              ${rule.amount.toFixed(2)}
            </span>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant={status === "overdue" ? "destructive" : "outline"}
                  className="h-8 w-8 p-0 rounded-full"
                >
                  <Check className="size-4" />
                  <span className="sr-only">Confirm</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Transaction</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will create a real transaction record for{" "}
                    <strong>{rule.description}</strong> on{" "}
                    <strong>{format(date, "MMMM do, yyyy")}</strong>.
                    <br />
                    <br />
                    It will link back to this recurring rule and mark it as processed up to this date.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onConfirm(rule, date)}>
                    Confirm & Log
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  );
};


export default function FinanceManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });
  const [sheetState, setSheetState] = useState<DialogState>({ type: null });


  const { data: financialData, isLoading, error } = useGetFinancialDataQuery();
  const [deleteTransaction] = useDeleteTransactionMutation();
  const [deleteRecurring] = useDeleteRecurringMutation();
  const [deleteGoal] = useDeleteGoalMutation();
  const [addFundsToGoal] = useAddFundsToGoalMutation();
  const [saveTransaction] = useSaveTransactionMutation();
  const [saveRecurring] = useSaveRecurringMutation();

  const { transactions = [], goals = [], recurring = [] } = financialData || {};

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const transactionDate = parseLocalDate(t.date);
      const descriptionMatch = t.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      if (!date?.from) return descriptionMatch;
      const toDate = date.to ? addDays(date.to, 1) : new Date(8640000000000000);
      const dateMatch =
        transactionDate >= date.from && transactionDate < toDate;
      return descriptionMatch && dateMatch;
    });
  }, [transactions, searchTerm, date]);

  const { totalEarnings, totalExpenses, netIncome, expenseByCategory } =
    useMemo(() => {
      let earnings = 0,
        expenses = 0;
      const categoryMap: Record<string, number> = {};
      for (const t of filteredTransactions) {
        if (t.type === "earning") earnings += t.amount;
        else {
          expenses += t.amount;
          const category = t.category || "Uncategorized";
          categoryMap[category] = (categoryMap[category] || 0) + t.amount;
        }
      }
      const expenseData = Object.entries(categoryMap)
        .map(([name, value], index) => ({ name, value, fill: COLORS[Math.floor(index % COLORS.length)] }))
        .sort((a, b) => b.value - a.value);
      return {
        totalEarnings: earnings,
        totalExpenses: expenses,
        netIncome: earnings - expenses,
        expenseByCategory: expenseData,
      };
    }, [filteredTransactions]);

  const allCategories = useMemo(() => {
    const categories = new Set(
      transactions
        .filter((t) => t.type === "expense" && t.category)
        .map((t) => t.category!),
    );
    return Array.from(categories).sort();
  }, [transactions]);

  const allYearsWithData = useMemo(() => {
    const years = new Set(
      transactions.map((t) => parseLocalDate(t.date).getFullYear()),
    );
    const currentYear = new Date().getFullYear();
    years.add(currentYear);
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  const forecastData = useMemo(() => {
    const today = new Date();
    const forecastDays = 30;
    const endDate = addDays(today, forecastDays);
    const dailyChanges: Record<string, { change: number; events: string[] }> = {};

    recurring.forEach((rule) => {
      let nextDate = rule.last_processed_date
        ? getNextOccurrence(parseLocalDate(rule.last_processed_date), rule)
        : parseLocalDate(rule.start_date);

      // Skip past overdue items for the graph
      while (isBefore(nextDate, today) && !isSameDay(nextDate, today)) {
        nextDate = getNextOccurrence(nextDate, rule);
      }

      while (isBefore(nextDate, endDate)) {
        const ruleEndDate = rule.end_date ? parseLocalDate(rule.end_date) : null;
        if (ruleEndDate && isAfter(nextDate, ruleEndDate)) break;

        if (isAfter(nextDate, today) || isSameDay(nextDate, today)) {
          const dayStr = format(nextDate, "yyyy-MM-dd");
          if (!dailyChanges[dayStr]) { dailyChanges[dayStr] = { change: 0, events: [] }; }
          const amount = rule.type === 'earning' ? rule.amount : -rule.amount;
          dailyChanges[dayStr].change += amount;
          dailyChanges[dayStr].events.push(`${rule.type === 'earning' ? '+' : '-'}$${rule.amount.toFixed(2)}: ${rule.description}`);
        }
        nextDate = getNextOccurrence(nextDate, rule);
      }
    });

    let cumulativeBalance = 0;
    return Array.from({ length: forecastDays + 1 }, (_, i) => {
      const date = addDays(today, i);
      const dayStr = format(date, "yyyy-MM-dd");
      const dayChange = dailyChanges[dayStr]?.change || 0;
      cumulativeBalance += dayChange;
      return { date: format(date, "MMM d"), balance: cumulativeBalance, events: dailyChanges[dayStr]?.events || [] };
    });
  }, [recurring]);

  const primaryGoal = useMemo(() => {
    if (goals.length === 0) return null;
    // Create a shallow copy before sorting
    const sortedGoals = [...goals].sort((a, b) =>
      (a.target_date || "z").localeCompare(b.target_date || "z")
    );
    return sortedGoals[0];
  }, [goals]);

  const goalProgress = primaryGoal ? (primaryGoal.current_amount / primaryGoal.target_amount) * 100 : 0;
  const handleOpenSheet = (type: NonNullable<DialogState['type']>, data?: any) => setSheetState({ type, data });
  const handleCloseSheet = () => setSheetState({ type: null });

  const handleDelete = async (
    type: "transactions" | "recurring_transactions" | "financial_goals",
    id: string,
    message: string,
  ) => {
    if (!confirm(message)) return;
    const mutation =
      type === "transactions"
        ? deleteTransaction
        : type === "recurring_transactions"
          ? deleteRecurring
          : deleteGoal;

    try {
      await mutation(id).unwrap();
      toast.success("Item deleted.");
    } catch (err: any) {
      toast.error(`Failed to delete: ${err.message}`);
    }
  };

  const handleAddFunds = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get("amount") as string);
    const goal = sheetState.data as FinancialGoal;
    if (!amount || amount <= 0 || !goal) {
      toast.error("Invalid amount provided.");
      return;
    }

    try {
      await addFundsToGoal({ goal, amount }).unwrap();
      toast.success(`$${amount.toFixed(2)} added to "${goal.name}"`);
      handleCloseSheet();
    } catch (err: any) {
      toast.error("Failed to add funds", { description: err.message });
    }
  };

  const handleConfirmRecurring = async (rule: RecurringTransaction, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd'); // Format for DB

    try {
      // 1. Create the actual transaction record
      await saveTransaction({
        date: dateStr,
        description: rule.description,
        amount: rule.amount,
        type: rule.type,
        category: rule.category,
        recurring_transaction_id: rule.id, // LINKING TO SOURCE
      }).unwrap();

      // 2. Update the recurring rule so it knows it was processed up to this date
      await saveRecurring({
        id: rule.id,
        last_processed_date: dateStr,
        // We need to pass required fields to satisfy TS if using a partial update, 
        // but since we are just updating one field via ID, the API usually handles partials.
        // However, checking RecurringTransactionForm, let's ensure we send minimal required info if needed.
        // Based on adminApi definition: `saveRecurring` takes Partial<RecurringTransaction> and merges.
      }).unwrap();

      toast.success("Transaction logged successfully.");
    } catch (err: any) {
      toast.error("Failed to log transaction", { description: err.message });
    }
  };


  if (isLoading) return <LoadingSpinner />;
  if (error) return <p>Error loading data.</p>;

  return (
    <div className="-mt-10 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between sticky top-0 z-20 bg-background/95 backdrop-blur py-4 border-b -mx-6 px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Wallet className="size-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Finance</h2>
            <p className="text-xs text-muted-foreground">
              {date?.from ? (
                date.to ? `${format(date.from, "MMM d")} - ${format(date.to, "MMM d, yyyy")}` : format(date.from, "MMMM d, yyyy")
              ) : "Select a date range"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Filter transactions..."
              className="pl-9 w-[200px] lg:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal">
                <CalendarIcon className="mr-2 size-4" />
                Date
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="mr-2 size-4" /> Add New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => handleOpenSheet("transaction")}>
                <ArrowRightLeft className="mr-2 size-4" /> Transaction
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleOpenSheet("recurring")}>
                <Repeat className="mr-2 size-4" /> Recurring Rule
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleOpenSheet("goal")}>
                <Target className="mr-2 size-4" /> Goal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-[600px] lg:grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="recurring">Recurring</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard
              title="Net Income"
              value={`${netIncome >= 0 ? '+' : '-'}$${Math.abs(netIncome).toFixed(2)}`}
              icon={<Wallet className="size-5" />}
              trend={netIncome >= 0 ? "up" : "down"}
              className={netIncome < 0 ? "border-red-500/20" : ""}
            />
            <StatCard
              title="Total Earnings"
              value={`$${totalEarnings.toFixed(2)}`}
              icon={<ArrowUp className="size-5" />}
              trend="up"
            />
            <StatCard
              title="Total Expenses"
              value={`$${totalExpenses.toFixed(2)}`}
              icon={<ArrowDown className="size-5" />}
              trend="down"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-8 gap-6">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>30-Day Cash Flow Forecast</CardTitle>
                <CardDescription>Projected change based on recurring transactions.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <ChartContainer config={{}} className="h-48 w-full">
                      <ResponsiveContainer>
                        <LineChart data={forecastData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
                          <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickLine={false} axisLine={false} />
                          <YAxis tickFormatter={(value) => `$${value}`} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickLine={false} axisLine={false} />
                          <RechartsTooltip content={<CustomForecastTooltip />} />
                          <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                          <Line type="monotone" dataKey="balance" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                  <div className="md:col-span-1 space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground">Upcoming</h4>
                    {forecastData.flatMap(d => d.events).slice(0, 3).map((event, i) => (
                      <p key={i} className="text-xs truncate">{event}</p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-4 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="size-5 text-primary" />
                  Upcoming & Due
                </CardTitle>
                <CardDescription>Confirm recurring items to log them as transactions.</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[350px] overflow-y-auto pr-2">
                <UpcomingRecurringList
                  recurring={recurring}
                  onConfirm={handleConfirmRecurring}
                />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Goals at a Glance</CardTitle>
              </CardHeader>
              <CardContent>
                {goals.length > 0 ? (
                  <div className="space-y-4">
                    {goals.slice(0, 3).map((goal) => {
                      const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
                      return (
                        <div key={goal.id} className="group cursor-pointer" onClick={() => (document.querySelector('button[value="goals"]') as HTMLButtonElement)?.click()}>
                          <div className="flex justify-between text-xs font-medium text-muted-foreground mb-1">
                            <span className="truncate group-hover:text-primary">{goal.name}</span>
                            <span>{progress.toFixed(0)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>${goal.current_amount.toLocaleString()}</span>
                            <span>${goal.target_amount.toLocaleString()}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="mx-auto size-8 text-muted-foreground opacity-50 mb-2" />
                    <p className="text-sm text-muted-foreground">No goals set yet.</p>
                    <Button variant="link" size="sm" className="p-0 h-auto mt-1" onClick={() => handleOpenSheet("goal")}>Create a goal</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Top Expense Categories</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center items-center">
                <ChartContainer config={{}} className="h-48 w-full">
                  <ResponsiveContainer>
                    <RadialBarChart innerRadius="30%" outerRadius="100%" data={expenseByCategory.slice(0, 5)} startAngle={180} endAngle={-180}>
                      <RadialBar dataKey="value" background cornerRadius={10}>{expenseByCategory.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</RadialBar>
                      <RechartsTooltip
                        content={({ active, payload }) => {
                          if (active && payload?.length) {
                            const { name, value } = payload[0].payload;

                            return (
                              <div className="p-2 border bg-popover rounded-md shadow-sm text-sm">
                                <p className="font-bold">
                                  {name}: ${value.toFixed(2)}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    {filteredTransactions.slice(0, 3).map(t => (
                      <TableRow key={t.id}>
                        <TableCell className="w-10">
                          <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", t.type === 'earning' ? 'bg-green-500/10' : 'bg-red-500/10')}>
                            {t.type === 'earning' ? <TrendingUp className="size-4 text-green-500" /> : <TrendingDown className="size-4 text-red-500" />}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{t.description}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(t.date), "MMM dd, yyyy")}</p>
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          {t.type === 'earning' ? '+' : '-'}${t.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

        </TabsContent>

        <TabsContent value="transactions" className="mt-6 space-y-4">
          <Card>
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search descriptions..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* Removed Date Picker from here */}
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon"><Filter className="size-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSearchTerm("")}>Clear Search</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Category
                  </TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((t) => (
                    <TableRow key={t.id} className="group">
                      <TableCell className="text-xs text-muted-foreground">
                        {format(parseLocalDate(t.date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="font-medium flex items-center gap-2">
                        {t.type === "earning" ? (
                          <TrendingUp className="size-4 text-green-500 shrink-0" />
                        ) : (
                          <TrendingDown className="size-4 text-red-500 shrink-0" />
                        )}
                        {t.description}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{t.category || "–"}</Badge>
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-semibold font-mono",
                          t.type === "earning"
                            ? "text-green-500"
                            : "text-red-500",
                        )}
                      >
                        {t.type === "earning" ? "+" : "-"}
                        ${t.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={() => handleOpenSheet("transaction", t)}
                            >
                              <Edit className="mr-2 size-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onSelect={() =>
                                handleDelete(
                                  "transactions",
                                  t.id,
                                  `Delete transaction "${t.description}"?`,
                                )
                              }
                            >
                              <Trash2 className="mr-2 size-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="recurring">
          <Card>
            <CardHeader>
              <CardTitle>Recurring Transactions</CardTitle>
              <CardDescription>
                Automate your regular income and expenses to forecast cash flow.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Next Due</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recurring.map((r) => {
                    let schedule: string = r.frequency;
                    if (
                      (r.frequency === "weekly" ||
                        r.frequency === "bi-weekly") &&
                      r.occurrence_day !== null &&
                      r.occurrence_day !== undefined
                    ) {
                      const days = [
                        "Sun",
                        "Mon",
                        "Tue",
                        "Wed",
                        "Thu",
                        "Fri",
                        "Sat",
                      ];
                      schedule = `${r.frequency} on ${days[r.occurrence_day]}`;
                    } else if (
                      r.frequency === "monthly" &&
                      r.occurrence_day
                    ) {
                      schedule = `monthly on the ${r.occurrence_day}th`;
                    }

                    // Use new parseLocalDate for consistent display
                    let nextDueDate = "N/A";
                    try {
                      const cursor = r.last_processed_date
                        ? parseLocalDate(r.last_processed_date)
                        : parseLocalDate(r.start_date);

                      // If using last_processed, the next occurrence is strictly 1 interval away.
                      // If using start_date (never processed), the start_date ITSELF is the first occurrence.
                      const next = r.last_processed_date
                        ? getNextOccurrence(cursor, r)
                        : cursor;

                      nextDueDate = format(next, "MMM dd, yyyy");
                    } catch (e) {
                      console.error("Date error", e);
                    }

                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">
                          {r.description}
                        </TableCell>
                        <TableCell
                          className={
                            r.type === "earning"
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          ${r.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="capitalize">{schedule}</TableCell>
                        <TableCell>{nextDueDate}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onSelect={() => handleOpenSheet("recurring", r)}
                              >
                                <Edit className="mr-2 size-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onSelect={() =>
                                  handleDelete(
                                    "recurring_transactions",
                                    r.id,
                                    `Delete rule "${r.description}"?`,
                                  )
                                }
                              >
                                <Trash2 className="mr-2 size-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {recurring.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No recurring transaction rules found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
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
            <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {goals.map((goal) => (<GoalCard key={goal.id} goal={goal} onAddFunds={() => handleOpenSheet("addFunds", goal)} onEdit={() => handleOpenSheet("goal", goal)} onDelete={() => handleDelete("financial_goals", goal.id, `Delete goal "${goal.name}"?`)} />))}
              {goals.length === 0 && <p className="text-muted-foreground col-span-full text-center py-12">No goals set yet. Click "Quick Add" to start planning.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <AnalyticsTab transactions={transactions} allYears={allYearsWithData} allCategories={allCategories} />
        </TabsContent>
      </Tabs>

      <Sheet open={!!sheetState.type} onOpenChange={(open) => !open && handleCloseSheet()}>
        <SheetContent className="sm:max-w-lg">
          {sheetState.type === 'transaction' && (<> <SheetHeader>
            <SheetTitle>{sheetState.data?.id ? "Edit" : "Add"} Transaction</SheetTitle>
            <SheetDescription>Track your earnings or expenses.</SheetDescription>
          </SheetHeader>
            <TransactionForm transaction={sheetState.data} onSuccess={handleCloseSheet} categories={allCategories} />
          </>)}
          {sheetState.type === 'recurring' && (<> <SheetHeader>
            <SheetTitle>{sheetState.data ? "Edit" : "Create"} Recurring Rule</SheetTitle>
            <SheetDescription>Automate your regular income and expenses.</SheetDescription>
          </SheetHeader>
            <RecurringTransactionForm recurringTransaction={sheetState.data} onSuccess={handleCloseSheet} />
          </>)}
          {sheetState.type === 'goal' && (<> <SheetHeader>
            <SheetTitle>{sheetState.data ? "Edit" : "Create"} Financial Goal</SheetTitle>
            <SheetDescription>Set a target and track your progress.</SheetDescription>
          </SheetHeader>
            <FinancialGoalForm goal={sheetState.data} onSuccess={handleCloseSheet} />
          </>)}
          {sheetState.type === "addFunds" && (<>
            <SheetHeader>
              <SheetTitle>Add Funds to "{sheetState.data?.name}"</SheetTitle>
            </SheetHeader>
            <form onSubmit={handleAddFunds} className="space-y-4 pt-4">
              <div>
                <Label htmlFor="add-funds-amount">Amount</Label>
                <Input id="add-funds-amount" name="amount" type="number" step="1" required autoFocus />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={handleCloseSheet}>Cancel</Button>
                <Button type="submit">Confirm Contribution</Button>
              </div>
            </form>
          </>)}
        </SheetContent>
      </Sheet>
    </div>
  );
}