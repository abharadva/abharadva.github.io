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
  endOfYear,
  startOfYear,
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
  RadialBarChart,
} from "recharts";
import {
  Edit,
  Trash2,
  Calendar as CalendarIcon,
  Search,
  TrendingUp,
  TrendingDown,
  Target,
  Plus,
  Repeat,
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
  Home,
  LayoutDashboard,
  Menu,
  PieChart as PieChartIcon,
  X,
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
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { cn, parseLocalDate } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useConfirm } from "@/components/providers/ConfirmDialogProvider";

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
        <div
          className={cn(
            "p-2 rounded-full bg-background/50 border",
            trend === "up"
              ? "text-green-500 border-green-500/20 bg-green-500/10"
              : trend === "down"
                ? "text-red-500 border-red-500/20 bg-red-500/10"
                : "text-muted-foreground",
          )}
        >
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

const MonthlyDetailSheet = ({
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
  const monthTransactions = useMemo(
    () =>
      transactions.filter(
        (t) => format(parseLocalDate(t.date), "MMM") === month,
      ),
    [transactions, month],
  );
  const { totalIncome, totalExpenses, expenseByCategory } = useMemo(() => {
    let income = 0,
      expenses = 0;
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
      .map(([name, value], index) => ({
        name,
        value,
        fill: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
    return {
      totalIncome: income,
      totalExpenses: expenses,
      expenseByCategory: expenseData,
    };
  }, [monthTransactions]);
  const filteredTransactions = useMemo(
    () =>
      selectedCategory
        ? monthTransactions.filter(
            (t) => (t.category || "Uncategorized") === selectedCategory,
          )
        : monthTransactions,
    [monthTransactions, selectedCategory],
  );

  return (
    <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-lg w-full flex flex-col">
        <div className="flex justify-between items-center">
          <SheetHeader>
            <SheetTitle>
              Financial Details for {month}, {year}
            </SheetTitle>
          </SheetHeader>
          <SheetClose asChild>
            <Button type="button" variant="ghost">
              <X />
            </Button>
          </SheetClose>
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)] ">
          <div className="grid grid-cols-2 gap-4 my-4">
            <StatCard
              title="Income"
              value={`$${totalIncome.toFixed(2)}`}
              icon={<TrendingUp />}
            />
            <StatCard
              title="Expenses"
              value={`$${totalExpenses.toFixed(2)}`}
              icon={<TrendingDown />}
            />
          </div>
          <h4 className="font-semibold mb-2">Expense Breakdown</h4>
          <ChartContainer config={{}} className="h-64 w-full -ml-4">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  onClick={(d) =>
                    setSelectedCategory(
                      selectedCategory === d.name ? null : d.name,
                    )
                  }
                  className="cursor-pointer"
                >
                  {expenseByCategory.map((e, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={e.fill}
                      stroke={
                        selectedCategory === e.name ? "hsl(var(--primary))" : ""
                      }
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  content={<ChartTooltipContent nameKey="name" />}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="flex justify-between items-center my-4">
            <h4 className="font-semibold">
              {selectedCategory
                ? `Transactions in "${selectedCategory}"`
                : "All Transactions"}
            </h4>
            {selectedCategory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                <XIcon className="mr-2 size-4" />
                Clear
              </Button>
            )}
          </div>
          <div className="space-y-3">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-secondary"
                >
                  <div className="overflow-hidden mr-2">
                    <p className="font-medium truncate">{t.description}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {format(parseLocalDate(t.date), "MMM dd")}
                      </p>
                      {t.category && (
                        <Badge
                          variant="outline"
                          className="hidden xs:inline-flex"
                        >
                          {t.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p
                    className={cn(
                      "font-bold text-sm whitespace-nowrap",
                      t.type === "earning" ? "text-chart-2" : "text-chart-5",
                    )}
                  >
                    {t.type === "earning" ? "+" : "-"}${t.amount.toFixed(2)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-10">
                No transactions.
              </p>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

const AnnualCumulativeTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-3 shadow-sm text-sm">
        <p className="font-bold mb-1">{label}</p>
        <p
          className={cn(
            "font-mono",
            data.balance >= 0 ? "text-green-500" : "text-red-500",
          )}
        >
          End Balance: ${data.balance.toFixed(2)}
        </p>
        <Separator className="my-2" />
        <div className="space-y-1 text-xs">
          <p className="text-green-500">Earnings: ${data.income.toFixed(2)}</p>
          <p className="text-red-500">Expenses: ${data.expenses.toFixed(2)}</p>
          <p className="font-semibold">
            Net Change: ${data.netChange.toFixed(2)}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const AnalyticsTab = ({
  transactions,
  allYears,
  allCategories,
  recurring,
}: {
  transactions: Transaction[];
  allYears: number[];
  allCategories: string[];
  recurring: RecurringTransaction[];
}) => {
  const [analyticsYear, setAnalyticsYear] = useState(new Date().getFullYear());
  const [selectedMonthData, setSelectedMonthData] = useState<{
    month: string;
    year: number;
  } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [actionDialog, setActionDialog] = useState<CategoryAction>(null);
  const [manageCategory] = useManageCategoryMutation();

  const yearTransactions = useMemo(
    () =>
      transactions.filter(
        (t) => parseLocalDate(t.date).getFullYear() === analyticsYear,
      ),
    [transactions, analyticsYear],
  );

  const annualCumulativeData = useMemo(() => {
    const yearStartDate = startOfYear(new Date(analyticsYear, 0, 1));
    const startingBalance = transactions
      .filter((t) => isBefore(parseLocalDate(t.date), yearStartDate))
      .reduce(
        (acc, t) => acc + (t.type === "earning" ? t.amount : -t.amount),
        0,
      );

    const allMonths = Array.from({ length: 12 }, (_, i) => ({
      month: format(new Date(analyticsYear, i), "MMM"),
      income: 0,
      expenses: 0,
    }));

    yearTransactions.forEach((t) => {
      const monthIndex = parseLocalDate(t.date).getMonth();
      if (t.type === "earning") {
        allMonths[monthIndex].income += t.amount;
      } else {
        allMonths[monthIndex].expenses += t.amount;
      }
    });

    // Add projected recurring transactions
    recurring.forEach((rule) => {
      let nextDate = rule.last_processed_date
        ? getNextOccurrence(parseLocalDate(rule.last_processed_date), rule)
        : parseLocalDate(rule.start_date);
      while (isBefore(nextDate, startOfYear(new Date(analyticsYear, 0, 1)))) {
        nextDate = getNextOccurrence(nextDate, rule);
      }
      let safety = 0;
      while (
        isBefore(nextDate, endOfYear(new Date(analyticsYear, 0, 1))) &&
        safety < 100
      ) {
        const ruleEndDate = rule.end_date
          ? parseLocalDate(rule.end_date)
          : null;
        if (ruleEndDate && isAfter(nextDate, ruleEndDate)) break;
        const alreadyLogged = yearTransactions.some(
          (t) =>
            t.recurring_transaction_id === rule.id &&
            isSameDay(parseLocalDate(t.date), nextDate),
        );

        if (!alreadyLogged) {
          const monthIndex = nextDate.getMonth();
          if (rule.type === "earning")
            allMonths[monthIndex].income += rule.amount;
          else allMonths[monthIndex].expenses += rule.amount;
        }
        nextDate = getNextOccurrence(nextDate, rule);
        safety++;
      }
    });

    let cumulativeBalance = startingBalance;
    return allMonths.map((monthData) => {
      const netChange = monthData.income - monthData.expenses;
      cumulativeBalance += netChange;
      return { ...monthData, netChange, balance: cumulativeBalance };
    });
  }, [analyticsYear, transactions, recurring, yearTransactions]);

  const { annualStats, monthlyChartData, expenseByCategory } = useMemo(() => {
    let totalIncome = 0,
      totalExpenses = 0;
    const categoryMap: Record<string, { total: number; count: number }> = {};
    const monthlyData: Record<string, { income: number; expenses: number }> =
      {};

    yearTransactions.forEach((t) => {
      const month = format(parseLocalDate(t.date), "MMM");
      if (!monthlyData[month]) monthlyData[month] = { income: 0, expenses: 0 };
      if (t.type === "earning") {
        totalIncome += t.amount;
        monthlyData[month].income += t.amount;
      } else {
        totalExpenses += t.amount;
        monthlyData[month].expenses += t.amount;
        const category = t.category || "Uncategorized";
        if (!categoryMap[category])
          categoryMap[category] = { total: 0, count: 0 };
        categoryMap[category].total += t.amount;
        categoryMap[category].count += 1;
      }
    });

    const topCategory = Object.entries(categoryMap).sort(
      (a, b) => b[1].total - a[1].total,
    )[0];
    const allMonths = Array.from({ length: 12 }, (_, i) =>
      format(new Date(analyticsYear, i), "MMM"),
    );
    const chartData = allMonths.map((month) => ({
      month,
      ...(monthlyData[month] || { income: 0, expenses: 0 }),
    }));

    const categoryData = Object.entries(categoryMap)
      .map(([name, { total, count }], index) => ({
        name,
        total,
        count,
        avg: total / count,
        fill: COLORS[index % COLORS.length],
        percentage: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0, // Added percentage calculation
      }))
      .sort((a, b) => b.total - a.total);

    return {
      annualStats: {
        totalIncome,
        totalExpenses,
        netIncome: totalIncome - totalExpenses,
        topExpenseCategory: topCategory
          ? `${topCategory[0]} ($${topCategory[1].total.toFixed(2)})`
          : "N/A",
      },
      monthlyChartData: chartData,
      expenseByCategory: categoryData,
    };
  }, [yearTransactions, analyticsYear]);

  const handleBarClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const month = data.activePayload[0].payload.month;
      setSelectedMonthData({ month, year: analyticsYear });
    }
  };

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
    <div className="space-y-6 pb-24 md:pb-0">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Annual Report</CardTitle>
            <CardDescription>
              Financial summary for {analyticsYear}.
            </CardDescription>
          </div>
          <Select
            value={String(analyticsYear)}
            onValueChange={(v) => setAnalyticsYear(Number(v))}
          >
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allYears.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Income"
              value={`$${annualStats.totalIncome.toFixed(2)}`}
              icon={<ArrowUp />}
            />
            <StatCard
              title="Total Expenses"
              value={`$${annualStats.totalExpenses.toFixed(2)}`}
              icon={<ArrowDown />}
            />
            <StatCard
              title="Net Income"
              value={`${annualStats.netIncome < 0 ? "-" : ""}$${Math.abs(annualStats.netIncome).toFixed(2)}`}
              className={
                annualStats.netIncome < 0 ? "text-red-500" : "text-green-500"
              }
              icon={<HandCoins />}
            />
            <StatCard
              title="Top Expense"
              value={annualStats.topExpenseCategory}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Monthly Cash Flow</h3>
            <ChartContainer
              config={chartConfig}
              className="h-64 sm:h-72 w-full"
            >
              <BarChart data={monthlyChartData} onClick={handleBarClick}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickFormatter={(value) => `$${value / 1000}k`}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={40}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="income"
                  name="Income"
                  fill="var(--color-earning)"
                  radius={[4, 4, 0, 0]}
                  className="cursor-pointer"
                />
                <Bar
                  dataKey="expenses"
                  name="Expenses"
                  fill="var(--color-expense)"
                  radius={[4, 4, 0, 0]}
                  className="cursor-pointer"
                />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cumulative Balance</CardTitle>
          <CardDescription>Projected year-end trend.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-64 sm:h-72 w-full">
            <LineChart
              data={annualCumulativeData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                tickFormatter={(value) => `$${value / 1000}k`}
                width={40}
              />
              <RechartsTooltip content={<AnnualCumulativeTooltip />} />
              <ChartLegend content={<ChartLegendContent />} />
              <ReferenceLine
                y={0}
                stroke="hsl(var(--destructive))"
                strokeDasharray="3 3"
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>Spending by category.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-2">
            <ChartContainer config={{}} className="h-64 w-full">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    onClick={(data) =>
                      setSelectedCategory(
                        selectedCategory === data.name ? null : data.name,
                      )
                    }
                    className="cursor-pointer"
                  >
                    {expenseByCategory.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.fill}
                        stroke={
                          selectedCategory === entry.name
                            ? "hsl(var(--primary))"
                            : ""
                        }
                        strokeWidth={3}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    content={<ChartTooltipContent nameKey="name" />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          <div className="md:col-span-3 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[40px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenseByCategory
                  .filter((c) =>
                    selectedCategory ? c.name === selectedCategory : true,
                  )
                  .map((cat) => (
                    <TableRow key={cat.name}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: cat.fill }}
                        />
                        {cat.name}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ${cat.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreVertical className="size-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onSelect={() =>
                                setActionDialog({ type: "edit", category: cat })
                              }
                            >
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() =>
                                setActionDialog({
                                  type: "merge",
                                  category: cat,
                                })
                              }
                            >
                              Merge
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onSelect={() =>
                                setActionDialog({
                                  type: "delete",
                                  category: cat,
                                })
                              }
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedMonthData && (
        <MonthlyDetailSheet
          month={selectedMonthData.month}
          year={selectedMonthData.year}
          transactions={yearTransactions}
          onClose={() => setSelectedMonthData(null)}
        />
      )}

      {/* Category Edit Dialog - Reused from original code */}
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
                `This will remove the category tag from all associated transactions.`}
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
                    <SelectValue placeholder="Select a category..." />
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
  const percentage = Math.min(
    (goal.current_amount / goal.target_amount) * 100,
    100,
  );
  return (
    <Card className="relative flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl h-[320px] group">
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-primary/10 -z-0"
        initial={{ height: 0 }}
        animate={{ height: `${percentage}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-background/70 group-hover:bg-background/80 transition-colors z-10" />

      {/* Content Layer */}
      <div className="relative z-20 flex h-full flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="leading-tight truncate pr-4 text-foreground drop-shadow-md">
              {goal.name}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-background/50"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={onEdit}>Edit</DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onSelect={onDelete}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="flex flex-grow flex-col justify-center text-center py-4">
          <div>
            <p className="text-5xl font-black text-primary drop-shadow-sm">
              {percentage.toFixed(0)}
              <span className="text-2xl text-primary/70">%</span>
            </p>
            <p className="font-semibold text-muted-foreground text-sm mt-1">
              ${goal.current_amount.toLocaleString()} / $
              {goal.target_amount.toLocaleString()}
            </p>
          </div>
        </CardContent>

        <CardFooter className="pt-0 pb-4 px-4">
          <Button size="sm" className="w-full shadow-lg" onClick={onAddFunds}>
            <Plus className="mr-2 size-4" /> Add Funds
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
        <p
          className={cn(
            "font-mono",
            data.balance >= 0 ? "text-green-500" : "text-red-500",
          )}
        >
          Projected Balance: ${data.balance.toFixed(2)}
        </p>
        {data.events.length > 0 && (
          <div className="mt-2 border-t pt-2 space-y-1">
            {data.events.map((event: string, index: number) => (
              <p key={index} className="text-xs text-muted-foreground">
                {event}
              </p>
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
      let nextDate = rule.last_processed_date
        ? getNextOccurrence(parseLocalDate(rule.last_processed_date), rule)
        : parseLocalDate(rule.start_date);
      let safety = 0;
      while (isBefore(nextDate, lookAhead) && safety < 50) {
        if (isAfter(nextDate, lookBehind)) {
          let status: "overdue" | "due" | "upcoming" = "upcoming";
          if (isBefore(nextDate, startOfToday)) status = "overdue";
          else if (isSameDay(nextDate, startOfToday)) status = "due";
          items.push({ rule, date: new Date(nextDate), status });
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
        <p className="text-sm">No upcoming recurring payments.</p>
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
                  {status === "overdue"
                    ? "Overdue "
                    : status === "due"
                      ? "Due Today "
                      : format(date, "MMM d")}
                </span>
                <span className="hidden xs:inline">•</span>
                <span className="capitalize hidden xs:inline">
                  {rule.frequency}
                </span>
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
                  className="h-8 w-8 p-0 rounded-full shrink-0"
                >
                  <Check className="size-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Transaction</AlertDialogTitle>
                  <AlertDialogDescription>
                    Log transaction for <strong>{rule.description}</strong> on{" "}
                    <strong>{format(date, "MMM do")}</strong>?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onConfirm(rule, date)}>
                    Confirm
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
  const confirm = useConfirm();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });
  const [sheetState, setSheetState] = useState<DialogState>({ type: null });
  const [isMoreDrawerOpen, setIsMoreDrawerOpen] = useState(false);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

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
        .map(([name, value], index) => ({
          name,
          value,
          fill: COLORS[Math.floor(index % COLORS.length)],
        }))
        .sort((a, b) => b.value - a.value);
      return {
        totalEarnings: earnings,
        totalExpenses: expenses,
        netIncome: earnings - expenses,
        expenseByCategory: expenseData,
      };
    }, [filteredTransactions]);

  const allCategories = useMemo(() => {
    return Array.from(
      new Set(
        transactions
          .filter((t) => t.type === "expense" && t.category)
          .map((t) => t.category!),
      ),
    ).sort();
  }, [transactions]);

  const allYearsWithData = useMemo(() => {
    const years = new Set(
      transactions.map((t) => parseLocalDate(t.date).getFullYear()),
    );
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  const forecastData = useMemo(() => {
    const today = new Date();
    const forecastDays = 30;
    const endDate = addDays(today, forecastDays);
    const dailyChanges: Record<string, { change: number; events: string[] }> =
      {};

    recurring.forEach((rule) => {
      let nextDate = rule.last_processed_date
        ? getNextOccurrence(parseLocalDate(rule.last_processed_date), rule)
        : parseLocalDate(rule.start_date);
      while (isBefore(nextDate, today) && !isSameDay(nextDate, today)) {
        nextDate = getNextOccurrence(nextDate, rule);
      }

      while (isBefore(nextDate, endDate)) {
        const ruleEndDate = rule.end_date
          ? parseLocalDate(rule.end_date)
          : null;
        if (ruleEndDate && isAfter(nextDate, ruleEndDate)) break;
        if (isAfter(nextDate, today) || isSameDay(nextDate, today)) {
          const dayStr = format(nextDate, "yyyy-MM-dd");
          if (!dailyChanges[dayStr]) {
            dailyChanges[dayStr] = { change: 0, events: [] };
          }
          const amount = rule.type === "earning" ? rule.amount : -rule.amount;
          dailyChanges[dayStr].change += amount;
          dailyChanges[dayStr].events.push(
            `${rule.type === "earning" ? "+" : "-"}$${rule.amount.toFixed(2)}: ${rule.description}`,
          );
        }
        nextDate = getNextOccurrence(nextDate, rule);
      }
    });

    let cumulativeBalance = 0;
    return Array.from({ length: forecastDays + 1 }, (_, i) => {
      const date = addDays(today, i);
      const dayStr = format(date, "yyyy-MM-dd");
      cumulativeBalance += dailyChanges[dayStr]?.change || 0;
      return {
        date: format(date, "MMM d"),
        balance: cumulativeBalance,
        events: dailyChanges[dayStr]?.events || [],
      };
    });
  }, [recurring]);

  const handleOpenSheet = (
    type: NonNullable<DialogState["type"]>,
    data?: any,
  ) => {
    setSheetState({ type, data });
    setIsAddDrawerOpen(false); // Close add drawer if open
  };
  const handleCloseSheet = () => setSheetState({ type: null });

  const handleDelete = async (
    type: "transactions" | "recurring_transactions" | "financial_goals",
    id: string,
    message: string,
  ) => {
    const ok = await confirm({
      title: "Confirm Deletion",
      description: message,
      variant: "destructive",
    });
    if (!ok) return;
    try {
      const mutation =
        type === "transactions"
          ? deleteTransaction
          : type === "recurring_transactions"
            ? deleteRecurring
            : deleteGoal;
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
      toast.error("Invalid amount.");
      return;
    }
    try {
      await addFundsToGoal({ goal, amount }).unwrap();
      toast.success(`$${amount.toFixed(2)} added.`);
      handleCloseSheet();
    } catch (err: any) {
      toast.error("Failed to add funds", { description: err.message });
    }
  };

  const handleConfirmRecurring = async (
    rule: RecurringTransaction,
    date: Date,
  ) => {
    try {
      await saveTransaction({
        date: format(date, "yyyy-MM-dd"),
        description: rule.description,
        amount: rule.amount,
        type: rule.type,
        category: rule.category,
        recurring_transaction_id: rule.id,
      }).unwrap();
      await saveRecurring({
        id: rule.id,
        last_processed_date: format(date, "yyyy-MM-dd"),
      }).unwrap();
      toast.success("Transaction logged.");
    } catch (err: any) {
      toast.error("Failed to log", { description: err.message });
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p>Error loading data.</p>;

  const BottomNavButton = ({
    icon: Icon,
    label,
    tab,
    isActive,
  }: {
    icon: any;
    label: string;
    tab?: string;
    isActive?: boolean;
  }) => (
    <button
      onClick={() => tab && setActiveTab(tab)}
      className={cn(
        "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors",
        isActive
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="size-5" />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );

  return (
    <div className="pb-24 md:pb-0 -mt-6 lg:-mt-10">
      {/* --- HEADER (Desktop Only or simplified on Mobile) --- */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between sticky top-0 z-20 bg-background/95 backdrop-blur py-4 border-b px-4 md:px-6 -mx-4 md:-mx-8">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="size-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Finance</h2>
              <p className="text-xs text-muted-foreground hidden md:block">
                {date?.from
                  ? date.to
                    ? `${format(date.from, "MMM d")} - ${format(date.to, "MMM d, yyyy")}`
                    : format(date.from, "MMMM d, yyyy")
                  : "Select a date range"}
              </p>
            </div>
          </div>
          {/* Mobile Filters Button could go here */}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          <div className="relative flex-1 min-w-[150px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Filter..."
              className="pl-9 h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <CalendarIcon className="mr-2 size-4" /> Date
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>
          {/* Desktop Add Button */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="h-9">
                  <Plus className="mr-2 size-4" /> Add New
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => handleOpenSheet("transaction")}
                >
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
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6 mt-6"
      >
        {/* Desktop Tabs List */}
        <div className="hidden md:block">
          <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="recurring">Recurring</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/95 backdrop-blur border-t grid grid-cols-5 items-center px-2 z-50 shadow-lg">
          <BottomNavButton
            icon={Home}
            label="Home"
            tab="dashboard"
            isActive={activeTab === "dashboard"}
          />
          <BottomNavButton
            icon={ArrowRightLeft}
            label="Trans."
            tab="transactions"
            isActive={activeTab === "transactions"}
          />

          {/* Center FAB */}
          <div className="relative -top-5 flex justify-center">
            <Button
              className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 border-4 border-background"
              onClick={() => setIsAddDrawerOpen(true)}
            >
              <Plus className="size-6 text-primary-foreground" />
            </Button>
          </div>

          <BottomNavButton
            icon={Repeat}
            label="Recurring"
            tab="recurring"
            isActive={activeTab === "recurring"}
          />
          <button
            onClick={() => setIsMoreDrawerOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full h-full text-muted-foreground hover:text-foreground",
              (activeTab === "goals" || activeTab === "analytics") &&
                "text-primary",
            )}
          >
            <Menu className="size-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>

        {/* TAB CONTENT */}
        <TabsContent value="dashboard" className="space-y-6 px-1 md:px-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Net Income"
              value={`${netIncome >= 0 ? "+" : "-"}$${Math.abs(netIncome).toFixed(2)}`}
              icon={<Wallet className="size-4" />}
              trend={netIncome >= 0 ? "up" : "down"}
              className={netIncome < 0 ? "border-red-500/20" : ""}
            />
            <StatCard
              title="Earnings"
              value={`$${totalEarnings.toFixed(2)}`}
              icon={<ArrowUp className="size-4" />}
              trend="up"
            />
            <StatCard
              title="Expenses"
              value={`$${totalExpenses.toFixed(2)}`}
              icon={<ArrowDown className="size-4" />}
              trend="down"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-8 gap-6">
            {/* Forecast */}
            <Card className="lg:col-span-4 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">30-Day Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-48 w-full">
                  <ResponsiveContainer>
                    <LineChart
                      data={forecastData}
                      margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border)/0.5)"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{
                          fontSize: 10,
                          fill: "hsl(var(--muted-foreground))",
                        }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tickFormatter={(v) => `$${v}`}
                        tick={{
                          fontSize: 10,
                          fill: "hsl(var(--muted-foreground))",
                        }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <RechartsTooltip content={<CustomForecastTooltip />} />
                      <ReferenceLine
                        y={0}
                        stroke="hsl(var(--border))"
                        strokeDasharray="3 3"
                      />
                      <Line
                        type="monotone"
                        dataKey="balance"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Upcoming */}
            <Card className="lg:col-span-4 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="size-4 text-primary" /> Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[250px] overflow-y-auto pr-1">
                <UpcomingRecurringList
                  recurring={recurring}
                  onConfirm={handleConfirmRecurring}
                />
              </CardContent>
            </Card>

            {expenseByCategory.slice(0, 5).length > 0 && (
              <>
                {/* Top Categories */}
                <Card className="lg:col-span-3 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Top Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={{}} className="h-48 w-full">
                      <ResponsiveContainer>
                        <RadialBarChart
                          innerRadius="40%"
                          outerRadius="100%"
                          data={expenseByCategory.slice(0, 5)}
                          startAngle={180}
                          endAngle={-180}
                        >
                          <RadialBar
                            dataKey="value"
                            background
                            cornerRadius={10}
                          >
                            {expenseByCategory.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </RadialBar>
                        </RadialBarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                    <div className="mt-2 space-y-1">
                      {expenseByCategory.slice(0, 3).map((cat, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="flex items-center gap-1">
                            <div
                              className="size-2 rounded-full"
                              style={{
                                backgroundColor: COLORS[i % COLORS.length],
                              }}
                            />
                            {cat.name}
                          </span>
                          <span>${cat.value.toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {filteredTransactions.slice(0, 3).length > 0 && (
              <>
                {/* Recent Trans */}
                <Card className="lg:col-span-5 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableBody>
                          {filteredTransactions.slice(0, 3).map((t) => (
                            <TableRow key={t.id}>
                              <TableCell className="w-10">
                                <div
                                  className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-full",
                                    t.type === "earning"
                                      ? "bg-green-500/10"
                                      : "bg-red-500/10",
                                  )}
                                >
                                  {t.type === "earning" ? (
                                    <TrendingUp className="size-4 text-green-500" />
                                  ) : (
                                    <TrendingDown className="size-4 text-red-500" />
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <p className="font-medium">{t.description}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(t.date), "MMM dd, yyyy")}
                                </p>
                              </TableCell>
                              <TableCell className="text-right font-mono font-semibold">
                                {t.type === "earning" ? "+" : "-"}$
                                {t.amount.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="px-1 md:px-0">
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Category
                    </TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(parseLocalDate(t.date), "MMM dd")}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                            <span className="truncate max-w-[140px] sm:max-w-xs">
                              {t.description}
                            </span>
                            <span className="md:hidden text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded w-fit">
                              {t.category || "Gen"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="outline">{t.category || "–"}</Badge>
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-semibold font-mono whitespace-nowrap",
                            t.type === "earning"
                              ? "text-green-500"
                              : "text-red-500",
                          )}
                        >
                          {t.type === "earning" ? "+" : "-"}$
                          {t.amount.toFixed(2)}
                        </TableCell>
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
                                onSelect={() =>
                                  handleOpenSheet("transaction", t)
                                }
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
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="recurring" className="px-1 md:px-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Recurring Rules</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Schedule
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recurring.map((r) => {
                      let nextDueDate = "N/A";
                      try {
                        const cursor = r.last_processed_date
                          ? parseLocalDate(r.last_processed_date)
                          : parseLocalDate(r.start_date);
                        const next = r.last_processed_date
                          ? getNextOccurrence(cursor, r)
                          : cursor;
                        nextDueDate = format(next, "MMM d");
                      } catch (e) {}
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">
                            <div className="truncate max-w-[150px]">
                              {r.description}
                            </div>
                            <div className="text-xs text-muted-foreground md:hidden">
                              {r.frequency}
                            </div>
                          </TableCell>
                          <TableCell
                            className={cn(
                              r.type === "earning"
                                ? "text-green-500"
                                : "text-red-500",
                            )}
                          >
                            ${r.amount.toFixed(2)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell capitalize">
                            {r.frequency}{" "}
                            <span className="text-xs text-muted-foreground">
                              ({nextDueDate})
                            </span>
                          </TableCell>
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
                                  onSelect={() =>
                                    handleOpenSheet("recurring", r)
                                  }
                                >
                                  <Edit className="mr-2 size-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onSelect={() =>
                                    handleDelete(
                                      "recurring_transactions",
                                      r.id,
                                      "Delete rule?",
                                    )
                                  }
                                >
                                  <Trash2 className="mr-2 size-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="px-1 md:px-0">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onAddFunds={() => handleOpenSheet("addFunds", goal)}
                onEdit={() => handleOpenSheet("goal", goal)}
                onDelete={() =>
                  handleDelete("financial_goals", goal.id, `Delete goal?`)
                }
              />
            ))}
            {goals.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                No goals yet.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="px-1 md:px-0">
          <AnalyticsTab
            transactions={transactions}
            allYears={allYearsWithData}
            allCategories={allCategories}
            recurring={recurring}
          />
        </TabsContent>
      </Tabs>

      {/* --- DRAWERS & SHEETS --- */}

      {/* Add New Drawer (Mobile) */}
      <Drawer open={isAddDrawerOpen} onOpenChange={setIsAddDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Add New</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pb-8 space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start h-12 text-base"
              onClick={() => handleOpenSheet("transaction")}
            >
              <ArrowRightLeft className="mr-3 size-5 text-primary" />{" "}
              Transaction
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-12 text-base"
              onClick={() => handleOpenSheet("recurring")}
            >
              <Repeat className="mr-3 size-5 text-blue-500" /> Recurring Rule
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-12 text-base"
              onClick={() => handleOpenSheet("goal")}
            >
              <Target className="mr-3 size-5 text-orange-500" /> Goal
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* More Menu Drawer (Mobile) */}
      <Drawer open={isMoreDrawerOpen} onOpenChange={setIsMoreDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>More</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pb-8 space-y-2">
            <Button
              variant={activeTab === "goals" ? "secondary" : "ghost"}
              className="w-full justify-start h-12"
              onClick={() => {
                setActiveTab("goals");
                setIsMoreDrawerOpen(false);
              }}
            >
              <Target className="mr-3 size-5" /> Goals
            </Button>
            <Button
              variant={activeTab === "analytics" ? "secondary" : "ghost"}
              className="w-full justify-start h-12"
              onClick={() => {
                setActiveTab("analytics");
                setIsMoreDrawerOpen(false);
              }}
            >
              <LayoutDashboard className="mr-3 size-5" /> Analytics
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Main Forms Sheet (Shared) */}
      <Sheet
        open={!!sheetState.type}
        onOpenChange={(open) => !open && handleCloseSheet()}
      >
        <SheetContent className="sm:max-w-lg w-full flex flex-col">
          <div className="flex justify-between items-center">
            <SheetHeader>
              <SheetTitle className="capitalize">
                {sheetState.type === "addFunds"
                  ? "Add Funds"
                  : `${sheetState.data ? "Edit" : "New"} ${sheetState.type}`}
              </SheetTitle>
            </SheetHeader>
            <SheetClose asChild>
              <Button type="button" variant="ghost">
                <X />
              </Button>
            </SheetClose>
          </div>
          <div className="mt-4">
            {sheetState.type === "transaction" && (
              <TransactionForm
                transaction={sheetState.data}
                onSuccess={handleCloseSheet}
                categories={allCategories}
              />
            )}
            {sheetState.type === "recurring" && (
              <RecurringTransactionForm
                recurringTransaction={sheetState.data}
                onSuccess={handleCloseSheet}
              />
            )}
            {sheetState.type === "goal" && (
              <FinancialGoalForm
                goal={sheetState.data}
                onSuccess={handleCloseSheet}
              />
            )}
            {sheetState.type === "addFunds" && (
              <form onSubmit={handleAddFunds} className="space-y-4">
                <div>
                  <Label htmlFor="add-funds-amount">Amount</Label>
                  <Input
                    id="add-funds-amount"
                    name="amount"
                    type="number"
                    step="1"
                    required
                    autoFocus
                    className="text-lg"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCloseSheet}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Confirm</Button>
                </div>
              </form>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
