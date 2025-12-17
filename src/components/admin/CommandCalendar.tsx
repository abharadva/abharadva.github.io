// src/components/admin/CommandCalendar.tsx
"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  EventClickArg,
  DateSelectArg,
  EventInput,
  EventContentArg,
  EventDropArg,
} from "@fullcalendar/core";
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
} from "lucide-react";
import { cn, getNextOccurrence } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
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
import { ScrollArea } from "../ui/scroll-area";
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
import { number } from "zod";

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

// Map items to FullCalendar events
const mapItemToCalendarEvent = (item: CalendarItem): EventInput => {
  const { type: transactionType, ...restOfData } = item.data;
  return {
    id: item.item_id,
    title: item.title,
    start: item.start_time,
    end: item.end_time ?? undefined,
    allDay:
      item.item_type === "task" ||
      item.item_type === "transaction" ||
      item.item_type === "habit_summary" ||
      item.item_type === "transaction_summary" ||
      item.data.is_all_day,
    extendedProps: {
      type: item.item_type,
      transactionType: transactionType,
      ...restOfData,
    },
    // We remove default styles so our custom renderer takes over completely
    classNames: [
      "!bg-transparent",
      "!border-0",
      "!shadow-none",
      "cursor-pointer",
    ],
  };
};

const EventDetailsContent: React.FC<{
  event: EventInput;
  onEdit: () => void;
  onNavigate: (tab: any) => void;
  onDelete?: () => void;
}> = ({ event, onEdit, onNavigate, onDelete }) => {
  const { type, transactionType, amount, status, priority, description } =
    event.extendedProps || {};
  const isEarning = transactionType === "earning";
  const amountColor = isEarning ? "text-emerald-500" : "text-rose-500";

  if (type === "habit_summary") {
    return (
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <CheckSquare className="size-5 text-primary" /> Daily Habits
          </h3>
          <Badge variant="outline">
            {event.extendedProps?.count} Completed
          </Badge>
        </div>
        <ScrollArea className="h-[200px] pr-4">
          <div className="flex flex-col gap-2">
            {event.extendedProps?.completed_habits?.map((h: any, i: number) => (
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

  // --- 2. TRANSACTION SUMMARY DETAILS ---
  if (type === "transaction_summary") {
    const extendedProps = event.extendedProps || {};
    const { transactions, total_earning, total_expense } = extendedProps as {
      transactions: any[];
      total_earning: number;
      total_expense: number;
    };

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
          <span>
            {event.start
              ? format(new Date(event.start as string), "MMM d, h:mm a")
              : ""}
          </span>
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

  // --- STATES ---
  const [sheetState, setSheetState] = useState<{
    open: boolean;
    isNew: boolean;
  }>({ open: false, isNew: false });
  const [viewEventState, setViewEventState] = useState<{
    key: number;
    open: boolean;
    event: EventInput | null;
    anchorProps?: React.CSSProperties;
  }>({ open: false, event: null, key: 0 });
  const [quickAddState, setQuickAddState] = useState<{
    key: number;
    open: boolean;
    dateInfo: DateSelectArg | null;
    anchorProps: React.CSSProperties;
  }>({ key: 0, open: false, dateInfo: null, anchorProps: { display: "none" } });
  const [quickAddTitle, setQuickAddTitle] = useState("");

  const [dayListState, setDayListState] = useState<{
    open: boolean;
    date: Date | null;
    events: EventInput[];
  }>({ open: false, date: null, events: [] });

  const calendarContainerRef = useRef<HTMLDivElement>(null);

  const [eventFormData, setEventFormData] = useState({
    id: "",
    title: "",
    description: "",
    start_time: new Date().toISOString(),
    end_time: new Date().toISOString(),
    is_all_day: false,
  });

  const [moreEventsState, setMoreEventsState] = useState<{
    key: number;
    open: boolean;
    events: EventInput[];
    date: Date | null;
    anchorProps: React.CSSProperties;
  }>({
    key: 0,
    open: false,
    events: [],
    date: null,
    anchorProps: { display: "none" },
  });

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

  const events = useMemo(() => {
    if (!data) return [];
    const baseEvents = data.baseEvents.map(mapItemToCalendarEvent);
    const forecastEvents: EventInput[] = [];
    const today = new Date();
    const forecastEndDate = addDays(today, 30);

    data.recurring.forEach((rule) => {
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
            title: rule.description,
            start: nextOccurrence,
            allDay: true,
            display: "list-item",
            extendedProps: {
              type: "forecast",
              amount: rule.amount,
              transactionType: rule.type,
            },
            classNames: ["opacity-60"],
          });
        }
        nextOccurrence = getNextOccurrence(nextOccurrence, rule);
      }
    });

    return [...baseEvents, ...forecastEvents].filter((event) =>
      filters.includes(event.extendedProps?.type),
    );
  }, [data, filters]);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setQuickAddState({
      key: 0,
      open: false,
      dateInfo: null,
      anchorProps: { display: "none" },
    });
    setViewEventState({ key: 0, open: false, event: null });

    if (isMobile) {
      setEventFormData({
        id: "",
        title: "",
        description: "",
        start_time: selectInfo.start.toISOString(),
        end_time: selectInfo.end
          ? selectInfo.end.toISOString()
          : selectInfo.start.toISOString(),
        is_all_day: selectInfo.allDay,
      });
      setSheetState({ open: true, isNew: true });
    } else {
      if (!selectInfo.jsEvent || !calendarContainerRef.current) return;
      const clickEl = selectInfo.jsEvent.target as HTMLElement;
      const containerRect =
        calendarContainerRef.current.getBoundingClientRect();
      const clickRect = clickEl.getBoundingClientRect();
      const top = clickRect.top - containerRect.top;
      const left = clickRect.left - containerRect.left;

      setQuickAddTitle("");
      setQuickAddState({
        key: Date.now(),
        open: true,
        dateInfo: selectInfo,
        anchorProps: {
          position: "absolute",
          top: `${top}px`,
          left: `${left}px`,
        },
      });
    }
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    clickInfo.jsEvent.preventDefault();
    setQuickAddState({
      key: 0,
      open: false,
      dateInfo: null,
      anchorProps: { display: "none" },
    });

    if (isMobile) {
      setViewEventState({
        key: Date.now(),
        open: true,
        event: clickInfo.event as EventInput,
      });
    } else {
      const calendarEl = calendarContainerRef.current;
      if (!calendarEl) return;
      const eventEl = clickInfo.el;
      const containerRect = calendarEl.getBoundingClientRect();
      const eventRect = eventEl.getBoundingClientRect();
      const top = eventRect.top - containerRect.top + eventRect.height / 2;
      const left = eventRect.left - containerRect.left + eventRect.width / 2;

      setViewEventState({
        key: Date.now(),
        open: true,
        event: clickInfo.event as EventInput,
        anchorProps: {
          position: "absolute",
          top: `${top}px`,
          left: `${left}px`,
        },
      });
    }
  };

  const handleMoreLinkClick = (args: any) => {
    // Prevent default browser navigation/anchor jumping
    args.jsEvent.preventDefault();
    args.jsEvent.stopPropagation();

    // Extract events
    const dayEvents = args.allSegs.map((seg: any) => seg.event);

    if (isMobile) {
      // Mobile: Open Drawer
      setDayListState({
        open: true,
        date: args.date,
        events: dayEvents,
      });
    } else {
      // Desktop: Open Custom Popover
      if (!calendarContainerRef.current) return "void";

      const clickEl = args.jsEvent.target as HTMLElement;
      // Get rects
      const containerRect =
        calendarContainerRef.current.getBoundingClientRect();
      const clickRect = clickEl.getBoundingClientRect();

      // Calculate position relative to the container
      // We center the anchor horizontally on the link, and place it vertically at the middle of the link
      const top = clickRect.top - containerRect.top + clickRect.height / 2;
      const left = clickRect.left - containerRect.left + clickRect.width / 2;

      setMoreEventsState({
        key: Date.now(), // Force re-render to ensure positioning updates
        open: true,
        events: dayEvents,
        date: args.date,
        anchorProps: {
          position: "absolute",
          top: `${top}px`,
          left: `${left}px`,
          width: "1px",
          height: "1px",
          pointerEvents: "none", // Ensure the anchor doesn't block clicks
        },
      });
    }

    return "void";
  };

  const handleEventDrop = async (dropInfo: EventDropArg) => {
    const { event } = dropInfo;
    const { type } = event.extendedProps;

    try {
      if (type === "event") {
        await updateEvent({
          id: event.id,
          start_time: event.start?.toISOString(),
          end_time: event.end?.toISOString(),
        }).unwrap();
      } else if (type === "task") {
        await updateTask({
          id: event.id,
          due_date: event.start?.toISOString().split("T")[0],
        }).unwrap();
      } else {
        toast.info(
          "Only tasks and personal events can be rescheduled via drag & drop.",
        );
        dropInfo.revert();
        return;
      }
      toast.success("Rescheduled successfully.");
    } catch (err: any) {
      toast.error(`Failed to update ${type}`, { description: err.message });
      dropInfo.revert();
    }
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
      setViewEventState({ open: false, event: null, key: 0 });
    } catch (err: any) {
      toast.error("Failed to delete event", { description: err.message });
    }
  };

  const handleEditClick = () => {
    const eventToEdit = viewEventState.event;
    if (!eventToEdit) return;

    const startStr =
      eventToEdit.start instanceof Date
        ? eventToEdit.start.toISOString()
        : (eventToEdit.start as string);
    const endStr =
      eventToEdit.end instanceof Date
        ? eventToEdit.end.toISOString()
        : (eventToEdit.end as string) || startStr;

    setEventFormData({
      id: eventToEdit.id!,
      title: eventToEdit.title!,
      description: eventToEdit.extendedProps?.description || "",
      start_time: startStr,
      end_time: endStr,
      is_all_day: !!eventToEdit.allDay,
    });
    setViewEventState({ key: 0, open: false, event: null });
    setSheetState({ open: true, isNew: false });
  };

  const handleQuickAdd = async () => {
    if (!quickAddTitle.trim() || !quickAddState.dateInfo) return;
    try {
      await addEvent({
        title: quickAddTitle,
        start_time: quickAddState.dateInfo.startStr,
        end_time: quickAddState.dateInfo.endStr,
        is_all_day: quickAddState.dateInfo.allDay,
      }).unwrap();
      toast.success("Event created.");
      setQuickAddState({
        key: 0,
        open: false,
        dateInfo: null,
        anchorProps: { display: "none" },
      });
      setQuickAddTitle("");
    } catch (err: any) {
      toast.error("Failed to quick add event", { description: err.message });
    }
  };

  const handleOpenAdvancedFromQuickAdd = () => {
    if (!quickAddState.dateInfo) return;
    const { start, end, allDay } = quickAddState.dateInfo;
    setEventFormData({
      id: "",
      title: quickAddTitle,
      description: "",
      start_time: formatISO(start),
      end_time: end ? formatISO(end) : formatISO(start),
      is_all_day: allDay,
    });
    setSheetState({ open: true, isNew: true });
    setQuickAddState({
      key: 0,
      open: false,
      dateInfo: null,
      anchorProps: { display: "none" },
    });
  };

  const renderEventContent = (eventInfo: EventContentArg) => {
    const {
      type,
      priority,
      transactionType,
      amount,
      count,
      completed_habits,
      total_earning,
      total_expense,
    } = eventInfo.event.extendedProps;

    // --- 1. HABIT SUMMARY RENDER ---
    if (type === "habit_summary") {
      return (
        <div className="flex items-center w-full overflow-hidden px-1 py-1 h-full bg-secondary/30 rounded-md border border-border/30 hover:border-primary/50 hover:bg-secondary/50 transition-all group">
          <div className="flex -space-x-1.5 hover:space-x-0.5 transition-all duration-300">
            {completed_habits?.slice(0, 4).map((h: any, i: number) => (
              <TooltipProvider key={i} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger>
                    <div
                      className="size-3.5 rounded-full border border-background shadow-sm ring-1 ring-background/50 transition-transform hover:scale-125 hover:z-10"
                      style={{ backgroundColor: h.color }}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="text-xs font-medium bg-secondary text-foreground border-border">
                    {h.title}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            {completed_habits?.length > 4 && (
              <div className="size-3.5 rounded-full bg-muted border border-background flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                +{completed_habits.length - 4}
              </div>
            )}
          </div>
        </div>
      );
    }

    // --- 2. TRANSACTION SUMMARY RENDER ---
    if (type === "transaction_summary") {
      return (
        <div className="flex items-center w-full overflow-hidden px-1 py-0.5 h-full bg-card/40 rounded-sm border border-border/20 gap-2 hover:bg-card/80 transition-colors">
          <div className="flex gap-1.5 items-center font-mono text-[9px] font-bold w-full justify-center">
            {total_earning > 0 && (
              <div className="flex items-center text-emerald-500">
                <ArrowUpRight className="size-3 mr-0.5" />
                <span>{Math.round(total_earning)}</span>
              </div>
            )}
            {total_expense > 0 && (
              <div className="flex items-center text-rose-500">
                <ArrowDownLeft className="size-3 mr-0.5" />
                <span>{Math.round(total_expense)}</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    // --- 3. OTHER EVENTS RENDER ---
    let Icon = CalendarIcon;
    let containerClass = "bg-primary/10 border-l-2 border-primary text-primary";
    let value = null;

    // Tasks
    if (type === "task") {
      Icon = ListTodo;
      if (priority === "high") {
        containerClass =
          "bg-destructive/10 border-l-2 border-destructive text-destructive-foreground dark:text-destructive";
      } else if (priority === "medium") {
        containerClass =
          "bg-yellow-500/10 border-l-2 border-yellow-500 text-yellow-600 dark:text-yellow-400";
      } else {
        containerClass =
          "bg-muted/50 border-l-2 border-muted-foreground text-muted-foreground";
      }
    }
    // Forecast (Individual) or Regular Transaction in calendar view
    else if (type === "forecast" || type === "transaction") {
      Icon = type === "forecast" ? TrendingUp : Banknote;
      const isEarning = transactionType === "earning";
      containerClass = isEarning
        ? "bg-emerald-500/10 border-l-2 border-emerald-500 text-emerald-600"
        : "bg-rose-500/10 border-l-2 border-rose-500 text-rose-600";

      if (type === "forecast") containerClass += " opacity-70 border-dashed";

      value = (
        <span className="flex items-center gap-0.5">
          {isEarning ? (
            <ArrowUpRight className="size-2.5" />
          ) : (
            <ArrowDownLeft className="size-2.5" />
          )}
          ${Math.round(amount)}
        </span>
      );
    }

    return (
      <div
        className={cn(
          "flex items-center gap-1.5 w-full overflow-hidden px-1.5 py-0.5 text-[10px] leading-tight h-full rounded-sm shadow-sm transition-all hover:brightness-95",
          containerClass,
        )}
      >
        <Icon className="size-3 shrink-0 opacity-80" />
        <span className="truncate flex-grow font-semibold">
          {eventInfo.event.title}
        </span>
        {value && (
          <span className="font-mono font-bold whitespace-nowrap opacity-90">
            {value}
          </span>
        )}
      </div>
    );
  };

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
              className="data-[state=on]:bg-yellow-500/20 data-[state=on]:text-yellow-600 dark:data-[state=on]:text-yellow-400"
            >
              <ListTodo className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Tasks</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="habit_summary"
              aria-label="Habits"
              className="data-[state=on]:bg-blue-500/20 data-[state=on]:text-blue-600 dark:data-[state=on]:text-blue-400"
            >
              <CheckSquare className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Habits</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="transaction_summary"
              aria-label="Transactions"
              className="data-[state=on]:bg-emerald-500/20 data-[state=on]:text-emerald-600 dark:data-[state=on]:text-emerald-400"
            >
              <Banknote className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Finance</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="forecast"
              aria-label="Forecast"
              className="data-[state=on]:bg-purple-500/20 data-[state=on]:text-purple-600 dark:data-[state=on]:text-purple-400"
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
      <div
        className="relative flex-1 min-h-0 border rounded-xl bg-card/40 shadow-sm overflow-hidden backdrop-blur-sm"
        ref={calendarContainerRef}
      >
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <Loader2 className="size-10 animate-spin text-primary" />
          </div>
        )}

        {!isMobile && (
          <Popover
            key={viewEventState.key}
            open={viewEventState.open}
            onOpenChange={(open) =>
              !open &&
              setViewEventState({ ...viewEventState, open: false, key: 0 })
            }
          >
            {/* Ensure this renders a div for the style prop to work */}
            <PopoverAnchor asChild>
              <div style={viewEventState.anchorProps} />
            </PopoverAnchor>

            <PopoverContent
              className="w-80 p-4 shadow-xl border-border/60"
              align="start"
              side="right" // Consistent side with the list popover
              collisionPadding={10}
            >
              {viewEventState.event && (
                <EventDetailsContent
                  event={viewEventState.event}
                  onEdit={handleEditClick}
                  onNavigate={onNavigate}
                  onDelete={
                    viewEventState.event.extendedProps?.type === "event"
                      ? () => handleDeleteEvent(viewEventState.event?.id)
                      : undefined
                  }
                />
              )}
            </PopoverContent>
          </Popover>
        )}

        {/* ... (keep quick add popover same as before) ... */}
        {!isMobile && (
          <Popover
            key={quickAddState.key}
            open={quickAddState.open}
            onOpenChange={(open) =>
              !open &&
              setQuickAddState({
                key: 0,
                open: false,
                dateInfo: null,
                anchorProps: { display: "none" },
              })
            }
          >
            <PopoverAnchor style={quickAddState.anchorProps} />
            <PopoverContent
              className="w-80 p-3 shadow-xl"
              align="start"
              side="bottom"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleQuickAdd();
                }}
              >
                <div className="space-y-3">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Clock className="size-4 text-primary" /> Quick Add Event
                  </h4>
                  <Input
                    placeholder="Meeting with..."
                    value={quickAddTitle}
                    onChange={(e) => setQuickAddTitle(e.target.value)}
                    autoFocus
                    className="h-9"
                  />
                  <div className="flex justify-between items-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
                      onClick={handleOpenAdvancedFromQuickAdd}
                    >
                      More options
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="h-7 px-3"
                      disabled={!quickAddTitle.trim()}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </form>
            </PopoverContent>
          </Popover>
        )}

        <div className="themed-calendar h-full w-full text-sm">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: isMobile ? "prev" : "prev,next today",
              center: "title",
              right: isMobile
                ? "next"
                : "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            initialView={"dayGridMonth"}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={1}
            moreLinkClick={handleMoreLinkClick}
            events={events}
            datesSet={(arg) =>
              setDateRange({
                start: arg.view.currentStart.toISOString(),
                end: arg.view.currentEnd.toISOString(),
              })
            }
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            eventContent={renderEventContent}
            height="100%"
            handleWindowResize={true}
            stickyHeaderDates={true}
          />
        </div>
      </div>

      {/* ... (keep Create/Edit Sheet same as before) ... */}
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
              <Button type="button" variant="ghost">
                <X />
              </Button>
            </SheetClose>
          </div>
          <form
            onSubmit={handleEventFormSubmit}
            className="flex-1 flex flex-col justify-between"
          >
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
                <Button type="submit">
                  {sheetState.isNew ? "Create" : "Save"}
                </Button>
              </div>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {isMobile && (
        <Drawer
          open={viewEventState.open}
          onOpenChange={(open) =>
            !open &&
            setViewEventState({ ...viewEventState, open: false, key: 0 })
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
                  onEdit={() => {
                    setViewEventState({
                      ...viewEventState,
                      open: false,
                      key: 0,
                    });
                    handleEditClick();
                  }}
                  onNavigate={onNavigate}
                  onDelete={
                    viewEventState.event.extendedProps?.type === "event"
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
      )}

      {/* "More Events" Popover for Desktop */}
      {!isMobile && (
        <Popover
          open={moreEventsState.open}
          onOpenChange={(open) => {
            // Only allow closing via clicking outside or explicit close
            // This prevents flickering if the user clicks the anchor area
            if (!open) {
              setMoreEventsState((prev) => ({ ...prev, open: false }));
            }
          }}
        >
          {/* 
             We use a div as a virtual anchor. 
             Ensure PopoverAnchor passes the ref or style correctly in your UI library implementation.
             If your PopoverAnchor doesn't support style, wrap a div inside it.
          */}
          <PopoverAnchor asChild>
            <div style={moreEventsState.anchorProps} />
          </PopoverAnchor>

          <PopoverContent
            className="w-72 p-0 overflow-hidden shadow-xl border-border"
            align="center"
            side="right" // "right" usually looks best for calendar popovers, falls back to others
            collisionPadding={10}
          >
            {/* Header */}
            <div className="bg-muted/40 p-3 border-b flex items-center justify-between">
              <span className="font-semibold text-sm">
                {moreEventsState.date
                  ? format(moreEventsState.date, "EEEE, MMM do")
                  : "Events"}
              </span>
              <div className="text-xs text-muted-foreground font-mono bg-background px-1.5 py-0.5 rounded border">
                {moreEventsState.events.length} items
              </div>
            </div>

            {/* List of Events */}
            <ScrollArea className="h-[max(200px,35vh)] max-h-[350px]">
              <div className="flex flex-col p-1.5 gap-1">
                {moreEventsState.events.map((event, i) => {
                  const type = event.extendedProps?.type;
                  const title = event.title;
                  const time = event.start
                    ? format(event.start as Date, "h:mm a")
                    : "All Day";

                  // Determine Icon and Color
                  let Icon = CalendarIcon;
                  let colorClass = "bg-primary/10 text-primary";
                  let borderClass = "hover:border-primary/50";

                  switch (type) {
                    case "task":
                      Icon = ListTodo;
                      colorClass =
                        "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
                      borderClass = "hover:border-yellow-500/50";
                      break;
                    case "transaction":
                    case "transaction_summary":
                      Icon = Banknote;
                      colorClass =
                        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500";
                      borderClass = "hover:border-emerald-500/50";
                      break;
                    case "habit_summary":
                      Icon = CheckSquare;
                      colorClass =
                        "bg-blue-500/10 text-blue-600 dark:text-blue-500";
                      borderClass = "hover:border-blue-500/50";
                      break;
                    case "forecast":
                      Icon = TrendingUp;
                      colorClass =
                        "bg-purple-500/10 text-purple-600 dark:text-purple-500";
                      borderClass = "hover:border-purple-500/50";
                      break;
                  }

                  return (
                    <button
                      key={i}
                      className={cn(
                        "flex items-center gap-3 w-full p-2 text-left rounded-md border border-transparent transition-all duration-200 group",
                        "hover:bg-accent hover:shadow-sm",
                        borderClass,
                      )}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent bubbling

                        // 1. Close the List Popover
                        setMoreEventsState((prev) => ({
                          ...prev,
                          open: false,
                        }));

                        // 2. Open the View Details Popover immediately
                        // We use the EXACT same anchorProps to make the transition feel unified
                        setViewEventState({
                          key: Date.now(),
                          open: true,
                          event: event,
                          anchorProps: moreEventsState.anchorProps,
                        });
                      }}
                    >
                      <div
                        className={cn(
                          "size-8 shrink-0 rounded-md flex items-center justify-center transition-colors",
                          colorClass,
                        )}
                      >
                        <Icon className="size-4" />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <span className="font-medium text-sm truncate leading-tight">
                          {title}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                            {type?.replace("_", " ")}
                          </span>
                          {!event.allDay && type === "event" && (
                            <>
                              <span className="text-[8px] text-muted-foreground">
                                •
                              </span>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {time}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="size-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      )}

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
                    // Small timeout to allow drawer to close before opening next one
                    setTimeout(() => {
                      if (isMobile)
                        setViewEventState({
                          key: Date.now(),
                          open: true,
                          event,
                        });
                      else {
                        // For desktop, simulate the click behavior or just open state
                        // Calculating exact position is hard here without an element ref, so center or just use state
                        // For now, let's just open the state, the popover needs an anchor.
                        // We will use a fallback anchor or centered.
                        // Actually, standard behavior for "more" popover is just showing the list.
                        // But since we want to VIEW details, we need a way.
                        // Let's just set state and maybe use a fixed centered modal logic if anchor missing?
                        // Or better: reuse the Mobile Drawer logic for Desktop too in this specific "Overflow" case.
                        // Simplest: Re-open the drawer with the details.
                        // But we just closed it.
                        // Let's implement a 'selectedEvent' inside THIS drawer.
                      }
                    }, 100);
                  }}
                  className="p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
                >
                  {/* Re-use the render logic visually, but expanded */}
                  <div className="flex items-center gap-3">
                    {event?.extendedProps?.type === "habit_summary" ? (
                      <CheckSquare className="size-5 text-blue-500" />
                    ) : event?.extendedProps?.type === "task" ? (
                      <ListTodo className="size-5 text-yellow-500" />
                    ) : event?.extendedProps?.type === "transaction" ? (
                      <Banknote className="size-5 text-green-500" />
                    ) : (
                      <CalendarIcon className="size-5 text-primary" />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{event.title}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {event?.extendedProps?.type.replace("_", " ")}
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
