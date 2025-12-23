"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import {
  addDays,
  isAfter,
  isBefore,
  isSameDay,
  formatISO,
  format,
  setHours,
  setMinutes,
  startOfDay,
} from "date-fns";
import {
  Banknote,
  CheckSquare,
  Edit,
  ListTodo,
  Loader2,
  Calendar as CalendarIcon,
  Briefcase,
  TrendingUp,
  Trash2,
  Plus,
  Clock,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { cn, getNextOccurrence } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  useGetCalendarDataQuery,
  useAddEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useUpdateTaskMutation,
} from "@/store/api/adminApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConfirm } from "@/components/providers/ConfirmDialogProvider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";

type CalendarItem = {
  item_id: string;
  title: string;
  start_time: string;
  end_time: string | null;
  item_type:
    | "event"
    | "task"
    | "transaction"
    | "habit_summary"
    | "transaction_summary";
  data: any;
};

type EventType = {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  allDay: boolean;
  type: string;
  transactionType?: string;
  amount?: number;
  priority?: string;
  status?: string;
  description?: string;
  count?: number;
  completed_habits?: Array<{ title: string; color: string }>;
  total_earning?: number;
  total_expense?: number;
  transactions?: any[];
};

const mapItemToEvent = (item: CalendarItem): EventType => {
  const { type: transactionType, ...restOfData } = item.data;
  return {
    id: item.item_id,
    title: item.title,
    start: new Date(item.start_time),
    end: item.end_time ? new Date(item.end_time) : undefined,
    allDay:
      item.item_type === "task" ||
      item.item_type === "transaction" ||
      item.item_type === "habit_summary" ||
      item.item_type === "transaction_summary" ||
      item.data.is_all_day,
    type: item.item_type,
    transactionType: transactionType,
    ...restOfData,
  };
};

const EventDetailsContent: React.FC<{
  event: EventType;
  onEdit: () => void;
  onNavigate: (tab: any) => void;
  onDelete?: () => void;
}> = ({ event, onEdit, onNavigate, onDelete }) => {
  const { type, transactionType, amount, status, priority, description } =
    event;
  const isEarning = transactionType === "earning";
  const amountColor = isEarning ? "text-emerald-500" : "text-rose-500";

  if (type === "habit_summary") {
    return (
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <CheckSquare className="size-5 text-primary" /> Daily Habits
          </h3>
          <Badge variant="outline">{event.count} Completed</Badge>
        </div>
        <ScrollArea className="h-[200px] pr-4">
          <div className="flex flex-col gap-2">
            {event.completed_habits?.map((h: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 p-2 rounded-lg bg-secondary/50 border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="size-3 rounded-full ring-2 ring-background shadow-sm"
                    style={{ backgroundColor: h.color }}
                  />
                  <span className="font-medium text-sm">{h.title}</span>
                </div>
                <div className="size-6 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Plus className="size-3 text-green-500" />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  if (type === "transaction_summary") {
    const { transactions, total_earning, total_expense } = event;

    return (
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Banknote className="size-5 text-primary" /> Daily Finance
          </h3>
          <Badge variant="outline">{transactions?.length || 0} Records</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 text-center">
            <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
              Income
            </span>
            <div className="text-emerald-500 font-mono font-bold text-xl flex items-center justify-center gap-1">
              <ArrowUpRight className="size-5" />$
              {total_earning?.toLocaleString()}
            </div>
          </div>
          <div className="bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 text-center">
            <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
              Expenses
            </span>
            <div className="text-rose-500 font-mono font-bold text-xl flex items-center justify-center gap-1">
              <ArrowDownLeft className="size-5" />$
              {total_expense?.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-2">
          Breakdown
        </div>
        <ScrollArea className="h-[180px] pr-4">
          <div className="flex flex-col gap-2">
            {transactions?.map((t: any, i: number) => (
              <div
                key={i}
                className="flex justify-between items-center p-2.5 rounded-lg border bg-card/40 text-sm"
              >
                <span className="truncate max-w-[180px] font-medium">
                  {t.description}
                </span>
                <span
                  className={cn(
                    "font-mono font-bold flex items-center gap-1",
                    t.type === "earning" ? "text-emerald-500" : "text-rose-500",
                  )}
                >
                  {t.type === "earning" ? (
                    <ArrowUpRight className="size-3" />
                  ) : (
                    <ArrowDownLeft className="size-3" />
                  )}
                  ${t.amount}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="pt-2">
          <Button
            onClick={() => onNavigate("finance")}
            size="sm"
            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            Manage in Finance
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-1">
        <h3 className="font-bold text-lg leading-tight">{event.title}</h3>
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
          <BadgeTypeIcon type={type} />
          <span>{type}</span>
          <span>•</span>
          <span>{format(event.start, "MMM d, h:mm a")}</span>
        </div>
      </div>

      <Separator />

      <div className="space-y-4 text-sm">
        {type === "event" && description && (
          <div className="bg-secondary/30 p-3 rounded-md text-muted-foreground italic">
            "{description}"
          </div>
        )}

        {type === "task" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Status
              </span>
              <Badge variant={status === "done" ? "default" : "secondary"}>
                {status}
              </Badge>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Priority
              </span>
              <div className="flex items-center gap-2 font-medium">
                <div
                  className={cn(
                    "size-2 rounded-full",
                    priority === "high"
                      ? "bg-destructive"
                      : priority === "medium"
                        ? "bg-yellow-500"
                        : "bg-blue-500",
                  )}
                />
                <span className="capitalize">{priority}</span>
              </div>
            </div>
          </div>
        )}

        {(type === "transaction" || type === "forecast") && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-card border shadow-sm">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                Amount
              </span>
              <div
                className={cn(
                  "font-mono text-2xl font-bold flex items-center gap-1",
                  amountColor,
                )}
              >
                {isEarning ? (
                  <ArrowUpRight className="size-5" />
                ) : (
                  <ArrowDownLeft className="size-5" />
                )}
                ${amount?.toFixed(2)}
              </div>
            </div>
            <div
              className={cn(
                "p-2 rounded-full",
                isEarning ? "bg-emerald-500/10" : "bg-rose-500/10",
              )}
            >
              {isEarning ? (
                <ArrowDownLeft className={cn("size-6", amountColor)} />
              ) : (
                <ArrowUpRight className={cn("size-6", amountColor)} />
              )}
            </div>
          </div>
        )}
      </div>

      <Separator />

      <div className="flex justify-end gap-2">
        {type === "event" && (
          <>
            <Button variant="outline" onClick={onEdit} size="sm">
              <Edit className="mr-2 size-3.5" /> Edit
            </Button>
            {onDelete && (
              <Button variant="destructive" onClick={onDelete} size="sm">
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </>
        )}
        {type === "task" && (
          <Button
            onClick={() => onNavigate("tasks")}
            size="sm"
            className="bg-primary/10 text-primary hover:bg-primary/20 border-transparent shadow-none"
          >
            <ListTodo className="mr-2 size-3.5" /> Go to Board
          </Button>
        )}
        {type === "transaction" && (
          <Button
            onClick={() => onNavigate("finance")}
            size="sm"
            className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-transparent shadow-none"
          >
            <Banknote className="mr-2 size-3.5" /> View Finance
          </Button>
        )}
      </div>
    </div>
  );
};

const BadgeTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "event":
      return <Briefcase className="size-3" />;
    case "task":
      return <ListTodo className="size-3" />;
    case "transaction":
    case "transaction_summary":
      return <Banknote className="size-3" />;
    case "forecast":
      return <TrendingUp className="size-3" />;
    case "habit":
    case "habit_summary":
      return <CheckSquare className="size-3" />;
    default:
      return <CalendarIcon className="size-3" />;
  }
};

export default function CommandCalendar({
  onNavigate,
}: {
  onNavigate: (tab: any) => void;
}) {
  const confirm = useConfirm();
  const isMobile = useIsMobile();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateRange, setDateRange] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [filters, setFilters] = useState<string[]>([
    "event",
    "task",
    "transaction_summary",
    "forecast",
    "habit_summary",
  ]);

  const { data, isLoading, error } = useGetCalendarDataQuery(
    dateRange ?? skipToken,
  );
  const [addEvent] = useAddEventMutation();
  const [updateEvent] = useUpdateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();
  const [updateTask] = useUpdateTaskMutation();

  const [sheetState, setSheetState] = useState<{
    open: boolean;
    isNew: boolean;
  }>({ open: false, isNew: false });
  const [viewEventState, setViewEventState] = useState<{
    open: boolean;
    event: EventType | null;
  }>({ open: false, event: null });

  const [eventFormData, setEventFormData] = useState({
    id: "",
    title: "",
    description: "",
    start_time: new Date().toISOString(),
    end_time: new Date().toISOString(),
    is_all_day: false,
  });

  const [dayListState, setDayListState] = useState<{
    open: boolean;
    date: Date | null;
    events: EventType[];
  }>({ open: false, date: null, events: [] });

  const updateDateTime = (
    field: "start_time" | "end_time",
    newDate: Date | undefined,
    newTimeStr?: string,
  ) => {
    if (!newDate) return;

    let updatedDate = newDate;

    if (newTimeStr) {
      const [hours, minutes] = newTimeStr.split(":").map(Number);
      updatedDate = setMinutes(setHours(newDate, hours), minutes);
    } else if (eventFormData.is_all_day) {
      updatedDate = startOfDay(newDate);
    } else {
      const oldDate = new Date(eventFormData[field]);
      updatedDate = setMinutes(
        setHours(newDate, oldDate.getHours()),
        oldDate.getMinutes(),
      );
    }

    setEventFormData((prev) => ({
      ...prev,
      [field]: updatedDate.toISOString(),
    }));
  };

  useEffect(() => {
    if (error)
      toast.error("Failed to load calendar data", {
        description: (error as any).message,
      });
  }, [error]);

  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);

    setDateRange({
      start: start.toISOString(),
      end: end.toISOString(),
    });
  }, [currentDate]);

  const events = useMemo(() => {
    if (!data) return [];
    const baseEvents = data.baseEvents.map(mapItemToEvent);
    const forecastEvents: EventType[] = [];
    const today = new Date();
    const forecastEndDate = addDays(today, 30);

    data.recurring?.forEach((rule) => {
      let cursor = rule.last_processed_date
        ? new Date(rule.last_processed_date)
        : new Date(rule.start_date);
      if (isBefore(cursor, new Date(rule.start_date))) {
        cursor = new Date(rule.start_date);
      }
      let nextOccurrence = new Date(cursor);
      if (
        rule.last_processed_date &&
        (isAfter(nextOccurrence, today) || isSameDay(nextOccurrence, today))
      ) {
      } else {
        nextOccurrence = getNextOccurrence(cursor, rule);
      }
      const ruleEndDate = rule.end_date ? new Date(rule.end_date) : null;
      while (isBefore(nextOccurrence, forecastEndDate)) {
        if (ruleEndDate && isAfter(nextOccurrence, ruleEndDate)) break;
        if (
          isAfter(nextOccurrence, today) ||
          isSameDay(nextOccurrence, today)
        ) {
          forecastEvents.push({
            id: `forecast-${rule.id}-${nextOccurrence.getTime()}`,
            title: rule.description,
            start: nextOccurrence,
            allDay: true,
            type: "forecast",
            amount: rule.amount,
            transactionType: rule.type,
          });
        }
        nextOccurrence = getNextOccurrence(nextOccurrence, rule);
      }
    });

    return [...baseEvents, ...forecastEvents].filter((event) =>
      filters.includes(event.type),
    );
  }, [data, filters]);

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + direction,
        1,
      ),
    );
  };

  const handleEventFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = {
      id: eventFormData.id,
      title: eventFormData.title,
      description: eventFormData.description || null,
      start_time: eventFormData.start_time,
      end_time: eventFormData.end_time || null,
      is_all_day: eventFormData.is_all_day,
    };

    try {
      if (sheetState.isNew) {
        await addEvent(dataToSave).unwrap();
      } else {
        await updateEvent(dataToSave).unwrap();
      }
      toast.success(
        `Event ${sheetState.isNew ? "created" : "updated"} successfully.`,
      );
      setSheetState({ open: false, isNew: false });
    } catch (err: any) {
      toast.error("Failed to save event", { description: err.message });
    }
  };

  const handleDeleteEvent = async (id?: string) => {
    const targetId = id || eventFormData.id;
    if (!targetId) return;

    const isConfirmed = await confirm({
      title: "Delete Event?",
      description: "Are you sure you want to delete this event?",
      variant: "destructive",
      confirmText: "Delete",
    });

    if (!isConfirmed) return;

    try {
      await deleteEvent(targetId).unwrap();
      toast.success("Event deleted.");
      setSheetState({ open: false, isNew: false });
      setViewEventState({ open: false, event: null });
    } catch (err: any) {
      toast.error("Failed to delete event", { description: err.message });
    }
  };

  const handleEditClick = () => {
    const eventToEdit = viewEventState.event;
    if (!eventToEdit) return;

    setEventFormData({
      id: eventToEdit.id,
      title: eventToEdit.title,
      description: eventToEdit.description || "",
      start_time: eventToEdit.start.toISOString(),
      end_time:
        eventToEdit.end?.toISOString() || eventToEdit.start.toISOString(),
      is_all_day: eventToEdit.allDay,
    });
    setViewEventState({ open: false, event: null });
    setSheetState({ open: true, isNew: false });
  };

  const EventBadge = ({ event }: { event: EventType }) => {
    const colors = {
      event: "bg-blue-500/20 text-blue-600 border-blue-500/30",
      task: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
      transaction: "bg-green-500/20 text-green-600 border-green-500/30",
      transaction_summary:
        "bg-emerald-500/20 text-emerald-600 border-emerald-500/30",
      habit_summary: "bg-purple-500/20 text-purple-600 border-purple-500/30",
      forecast:
        "bg-purple-500/10 text-purple-600 border-purple-500/20 border-dashed",
    };

    const icons = {
      event: <Briefcase className="w-3 h-3" />,
      task: <ListTodo className="w-3 h-3" />,
      transaction: <Banknote className="w-3 h-3" />,
      transaction_summary: <Banknote className="w-3 h-3" />,
      habit_summary: <CheckSquare className="w-3 h-3" />,
      forecast: <TrendingUp className="w-3 h-3" />,
    };

    return (
      <div
        className={cn(
          "text-xs px-2 py-1 rounded border flex items-center gap-1 truncate cursor-pointer hover:opacity-80 transition-opacity",
          colors[event.type as keyof typeof colors],
        )}
        onClick={() => {
          setViewEventState({
            open: true,
            event: event,
          });
        }}
      >
        {icons[event.type as keyof typeof icons]}
        <span className="truncate">{event.title}</span>
        {event.type === "transaction" && event.amount && (
          <span className="font-mono ml-auto text-[10px]">${event.amount}</span>
        )}
      </div>
    );
  };

  const days = getDaysInMonth();

  return (
    <div className="space-y-4 h-[calc(100vh-6rem)] flex flex-col">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarIcon className="size-6 text-primary" /> Command Calendar
          </h2>
          <p className="text-muted-foreground text-sm hidden sm:block">
            Your centralized timeline for money, tasks, and habits.
          </p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto no-scrollbar">
          <ToggleGroup
            type="multiple"
            value={filters}
            onValueChange={setFilters}
            size="sm"
            className="justify-start bg-secondary/50 p-1 rounded-lg border border-border/50"
          >
            <ToggleGroupItem
              value="event"
              aria-label="Events"
              className="data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
            >
              <Briefcase className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Events</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="task"
              aria-label="Tasks"
              className="data-[state=on]:bg-yellow-500/20 data-[state=on]:text-yellow-600"
            >
              <ListTodo className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Tasks</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="habit_summary"
              aria-label="Habits"
              className="data-[state=on]:bg-blue-500/20 data-[state=on]:text-blue-600"
            >
              <CheckSquare className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Habits</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="transaction_summary"
              aria-label="Transactions"
              className="data-[state=on]:bg-emerald-500/20 data-[state=on]:text-emerald-600"
            >
              <Banknote className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Finance</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="forecast"
              aria-label="Forecast"
              className="data-[state=on]:bg-purple-500/20 data-[state=on]:text-purple-600"
            >
              <TrendingUp className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Forecast</span>
            </ToggleGroupItem>
          </ToggleGroup>
          <Button
            size="sm"
            className="shadow-md"
            onClick={() => {
              setEventFormData({
                id: "",
                title: "",
                description: "",
                start_time: new Date().toISOString(),
                end_time: new Date().toISOString(),
                is_all_day: false,
              });
              setSheetState({ open: true, isNew: true });
            }}
          >
            <Plus className="size-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Event</span>
          </Button>
        </div>
      </div>

      {/* CALENDAR CONTAINER */}
      <div className="relative flex-1 min-h-0 border rounded-xl bg-card/40 shadow-sm overflow-hidden backdrop-blur-sm">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <Loader2 className="size-10 animate-spin text-primary" />
          </div>
        )}

        <div className="h-full flex flex-col">
          {/* Calendar Header */}
          <div className="p-4 border-b border-border shrink-0">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth(-1)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <h2 className="text-lg md:text-xl font-bold">
                {currentDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth(1)}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <ScrollArea className="flex-1">
            <div className="p-2 md:p-4">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center text-xs md:text-sm font-semibold text-muted-foreground py-2"
                    >
                      {isMobile ? day.charAt(0) : day}
                    </div>
                  ),
                )}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1 md:gap-2">
                {days.map((day, index) => {
                  const dayEvents = getEventsForDate(day.date);
                  const isToday =
                    day.date.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={index}
                      className={cn(
                        "min-h-[80px] md:min-h-[120px] p-1 md:p-2 rounded-lg border transition-all",
                        day.isCurrentMonth
                          ? "bg-card border-border"
                          : "bg-muted/30 border-border/50 opacity-50",
                        isToday && "ring-2 ring-primary",
                      )}
                    >
                      <div
                        className={cn(
                          "text-xs md:text-sm font-semibold mb-1",
                          isToday
                            ? "bg-primary text-primary-foreground w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center"
                            : "text-foreground",
                        )}
                      >
                        {day.date.getDate()}
                      </div>

                      <div className="space-y-1">
                        {dayEvents.slice(0, isMobile ? 2 : 3).map((event) => (
                          <EventBadge key={event.id} event={event} />
                        ))}
                        {dayEvents.length > (isMobile ? 2 : 3) && (
                          <button
                            className="text-xs text-primary hover:text-primary/80 font-medium"
                            onClick={() => {
                              setDayListState({
                                open: true,
                                date: day.date,
                                events: dayEvents,
                              });
                            }}
                          >
                            +{dayEvents.length - (isMobile ? 2 : 3)} more
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Event Details Drawer/Sheet */}
      {isMobile ? (
        <Drawer
          open={viewEventState.open}
          onOpenChange={(open) =>
            !open && setViewEventState({ open: false, event: null })
          }
        >
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>Event Details</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 pt-0">
              {viewEventState.event && (
                <EventDetailsContent
                  event={viewEventState.event}
                  onEdit={handleEditClick}
                  onNavigate={onNavigate}
                  onDelete={
                    viewEventState.event.type === "event"
                      ? () => handleDeleteEvent(viewEventState.event?.id)
                      : undefined
                  }
                />
              )}
            </div>
            <DrawerFooter className="pt-2">
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Sheet
          open={viewEventState.open}
          onOpenChange={(open) =>
            !open && setViewEventState({ open: false, event: null })
          }
        >
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Event Details</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              {viewEventState.event && (
                <EventDetailsContent
                  event={viewEventState.event}
                  onEdit={handleEditClick}
                  onNavigate={onNavigate}
                  onDelete={
                    viewEventState.event.type === "event"
                      ? () => handleDeleteEvent(viewEventState.event?.id)
                      : undefined
                  }
                />
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Create/Edit Event Sheet */}
      <Sheet
        open={sheetState.open}
        onOpenChange={(open) =>
          !open && setSheetState({ ...sheetState, open: false })
        }
      >
        <SheetContent className="sm:max-w-lg w-full flex flex-col">
          <div className="flex justify-between items-center">
            <SheetHeader>
              <SheetTitle>
                {sheetState.isNew ? "Create New Event" : "Edit Event"}
              </SheetTitle>
              <SheetDescription>
                {sheetState.isNew
                  ? "Add a new event to your calendar."
                  : "Update existing event details."}
              </SheetDescription>
            </SheetHeader>
            <SheetClose asChild>
              <Button type="button" variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
          <div className="flex-1 flex flex-col justify-between mt-4">
            <ScrollArea className="h-full pr-6 -mr-6">
              <div className="space-y-4 pt-4">
                <div className="space-y-1">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={eventFormData.title}
                    onChange={(e) =>
                      setEventFormData({
                        ...eventFormData,
                        title: e.target.value,
                      })
                    }
                    required
                    autoFocus
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={eventFormData.description}
                    onChange={(e) =>
                      setEventFormData({
                        ...eventFormData,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2 border p-3 rounded-md bg-secondary/20">
                  <Switch
                    id="is_all_day"
                    checked={eventFormData.is_all_day}
                    onCheckedChange={(c) =>
                      setEventFormData({ ...eventFormData, is_all_day: c })
                    }
                  />
                  <Label
                    htmlFor="is_all_day"
                    className="cursor-pointer font-medium"
                  >
                    All-day event
                  </Label>
                </div>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Start</Label>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "flex-1 justify-start text-left font-normal",
                              !eventFormData.start_time &&
                                "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {eventFormData.start_time ? (
                              format(new Date(eventFormData.start_time), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={new Date(eventFormData.start_time)}
                            onSelect={(date) =>
                              updateDateTime("start_time", date)
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {!eventFormData.is_all_day && (
                        <Input
                          type="time"
                          className="w-32"
                          value={format(
                            new Date(eventFormData.start_time),
                            "HH:mm",
                          )}
                          onChange={(e) =>
                            updateDateTime(
                              "start_time",
                              new Date(eventFormData.start_time),
                              e.target.value,
                            )
                          }
                        />
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>End</Label>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "flex-1 justify-start text-left font-normal",
                              !eventFormData.end_time &&
                                "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {eventFormData.end_time ? (
                              format(new Date(eventFormData.end_time), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={new Date(eventFormData.end_time)}
                            onSelect={(date) =>
                              updateDateTime("end_time", date)
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {!eventFormData.is_all_day && (
                        <Input
                          type="time"
                          className="w-32"
                          value={format(
                            new Date(eventFormData.end_time),
                            "HH:mm",
                          )}
                          onChange={(e) =>
                            updateDateTime(
                              "end_time",
                              new Date(eventFormData.end_time),
                              e.target.value,
                            )
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
            <SheetFooter className="flex-col sm:flex-row gap-2 pt-4 border-t mt-4">
              {!sheetState.isNew && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleDeleteEvent()}
                  className="w-full sm:w-auto sm:mr-auto"
                >
                  Delete
                </Button>
              )}
              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setSheetState({ ...sheetState, open: false })}
                >
                  Cancel
                </Button>
                <Button onClick={handleEventFormSubmit}>
                  {sheetState.isNew ? "Create" : "Save"}
                </Button>
              </div>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>

      {/* Day Events List Drawer */}
      <Drawer
        open={dayListState.open}
        onOpenChange={(open) =>
          !open && setDayListState({ ...dayListState, open: false })
        }
      >
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="text-left border-b pb-4">
            <DrawerTitle className="flex items-center gap-2">
              <span className="text-muted-foreground font-normal">
                {dayListState.date ? format(dayListState.date, "EEEE") : ""}
              </span>
              <span>
                {dayListState.date ? format(dayListState.date, "MMM do") : ""}
              </span>
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-4 overflow-y-auto">
            <div className="flex flex-col gap-2">
              {dayListState.events.map((event, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setDayListState({ ...dayListState, open: false });
                    setTimeout(() => {
                      setViewEventState({
                        open: true,
                        event,
                      });
                    }, 100);
                  }}
                  className="p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <BadgeTypeIcon type={event.type} />
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{event.title}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {event.type.replace("_", " ")}
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
