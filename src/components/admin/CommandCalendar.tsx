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
import type { RecurringTransaction } from "@/types";
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

type CalendarItem = {
  item_id: string;
  title: string;
  start_time: string;
  end_time: string | null;
  item_type: "event" | "task" | "transaction";
  data: any;
};

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
      item.data.is_all_day,
    extendedProps: {
      type: item.item_type,
      transactionType: transactionType,
      ...restOfData,
    },
    // Visual styling
    className: cn(
      "border-l-2 pl-1 text-xs overflow-hidden",
      item.item_type === "task" && "bg-yellow-500/10 border-yellow-500",
      item.item_type === "transaction" &&
        "bg-emerald-500/10 border-emerald-500",
      item.item_type === "event" && "bg-primary/10 border-primary",
    ),
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
  const sign = isEarning ? "+" : "-";
  const amountColor = isEarning ? "text-green-500" : "text-red-500";

  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-1">
        <h3 className="font-bold text-lg">{event.title}</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <BadgeTypeIcon type={type} />
          <span className="capitalize">{type}</span>
          <span>•</span>
          <span>
            {event.start
              ? format(new Date(event.start as string), "PPP p")
              : ""}
          </span>
        </div>
      </div>

      <Separator />

      <div className="space-y-3 text-sm">
        {type === "event" && description && (
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Description
            </span>
            <p className="mt-1 text-foreground/90">{description}</p>
          </div>
        )}

        {type === "task" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </span>
              <p className="capitalize mt-1">{status}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Priority
              </span>
              <p className="capitalize mt-1">{priority}</p>
            </div>
          </div>
        )}

        {(type === "transaction" || type === "forecast") && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Type
              </span>
              <p className="capitalize mt-1">{transactionType}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Amount
              </span>
              <p
                className={cn(
                  "font-mono font-bold mt-1 text-base",
                  amountColor,
                )}
              >
                {sign}${amount?.toFixed(2)}
              </p>
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
            variant="secondary"
          >
            <ListTodo className="mr-2 size-3.5" /> Open Tasks
          </Button>
        )}
        {type === "transaction" && (
          <Button
            onClick={() => onNavigate("finance")}
            size="sm"
            variant="secondary"
          >
            <Banknote className="mr-2 size-3.5" /> Open Finance
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
      return <Banknote className="size-3" />;
    case "forecast":
      return <TrendingUp className="size-3" />;
    default:
      return <CalendarIcon className="size-3" />;
  }
};

export default function CommandCalendar({
  onNavigate,
}: {
  onNavigate: (tab: any) => void;
}) {
  const isMobile = useIsMobile();
  const [dateRange, setDateRange] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [filters, setFilters] = useState<string[]>([
    "event",
    "task",
    "transaction",
    "forecast",
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
    open: boolean;
    event: EventInput | null;
    anchorProps?: React.CSSProperties;
  }>({ open: false, event: null });
  const [quickAddState, setQuickAddState] = useState<{
    key: number;
    open: boolean;
    dateInfo: DateSelectArg | null;
    anchorProps: React.CSSProperties;
  }>({ key: 0, open: false, dateInfo: null, anchorProps: { display: "none" } });
  const [quickAddTitle, setQuickAddTitle] = useState("");

  const calendarContainerRef = useRef<HTMLDivElement>(null);

  // State for the form
  const [eventFormData, setEventFormData] = useState({
    id: "",
    title: "",
    description: "",
    start_time: new Date().toISOString(),
    end_time: new Date().toISOString(),
    is_all_day: false,
  });

  // Helper to update date/time from form
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

  // --- EFFECTS ---
  useEffect(() => {
    if (error)
      toast.error("Failed to load calendar data", {
        description: (error as any).message,
      });
  }, [error]);

  // --- MEMOS ---
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
        /* First candidate */
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
            className:
              "opacity-60 border-dashed border-l-2 border-muted-foreground",
          });
        }
        nextOccurrence = getNextOccurrence(nextOccurrence, rule);
      }
    });

    return [...baseEvents, ...forecastEvents].filter((event) =>
      filters.includes(event.extendedProps?.type),
    );
  }, [data, filters]);

  // --- HANDLERS ---

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setQuickAddState({
      key: 0,
      open: false,
      dateInfo: null,
      anchorProps: { display: "none" },
    });
    setViewEventState({ open: false, event: null });

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
      setViewEventState({ open: true, event: clickInfo.event as EventInput });
    } else {
      const calendarEl = calendarContainerRef.current;
      if (!calendarEl) return;
      const eventEl = clickInfo.el;
      const containerRect = calendarEl.getBoundingClientRect();
      const eventRect = eventEl.getBoundingClientRect();
      const top = eventRect.top - containerRect.top + eventRect.height / 2;
      const left = eventRect.left - containerRect.left + eventRect.width / 2;

      setViewEventState({
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
    if (!confirm("Delete this event?")) return;
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
    setViewEventState({ open: false, event: null });
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
    const { type, priority, transactionType, amount } =
      eventInfo.event.extendedProps;
    const title = eventInfo.event.title;
    const showTime = !eventInfo.event.allDay && !isMobile;

    let Icon = CalendarIcon;
    let classes = "text-primary";

    if (type === "task") {
      Icon = CheckSquare;
      classes =
        priority === "high"
          ? "text-destructive"
          : priority === "medium"
            ? "text-yellow-500"
            : "text-primary";
    } else if (type === "transaction" || type === "forecast") {
      Icon = Banknote;
      classes =
        transactionType === "earning" ? "text-green-500" : "text-red-500";
    }

    return (
      <div className="flex w-full items-center gap-1.5 overflow-hidden px-1 py-0.5 text-xs leading-none h-full">
        <Icon className={cn("size-3 shrink-0", classes)} />
        <span className="truncate flex-grow font-medium text-[10px] sm:text-xs">
          {showTime && (
            <span className="opacity-70 mr-1">{eventInfo.timeText}</span>
          )}
          {title}
        </span>
        {(type === "transaction" || type === "forecast") && (
          <span className={cn("font-mono hidden sm:inline", classes)}>
            ${amount?.toFixed(0)}
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
          <h2 className="text-2xl font-bold tracking-tight">Calendar</h2>
          <p className="text-muted-foreground text-sm hidden sm:block">
            Schedule events and track dues.
          </p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto no-scrollbar">
          <ToggleGroup
            type="multiple"
            value={filters}
            onValueChange={setFilters}
            size="sm"
            className="justify-start"
          >
            <ToggleGroupItem value="event" aria-label="Events">
              <Briefcase className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Events</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="task" aria-label="Tasks">
              <ListTodo className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Tasks</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="transaction" aria-label="Transactions">
              <Banknote className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">$</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="forecast" aria-label="Forecast">
              <TrendingUp className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Fut.</span>
            </ToggleGroupItem>
          </ToggleGroup>
          <Button
            size="sm"
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
        className="relative flex-1 min-h-0 border rounded-lg bg-card shadow-sm overflow-hidden"
        ref={calendarContainerRef}
      >
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        )}

        {/* DESKTOP POPOVER (DETAILS) */}
        {!isMobile && (
          <Popover
            open={viewEventState.open}
            onOpenChange={(open) =>
              !open && setViewEventState({ ...viewEventState, open: false })
            }
          >
            <PopoverAnchor style={viewEventState.anchorProps} />
            <PopoverContent className="w-80 p-4" align="start" side="right">
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

        {/* DESKTOP POPOVER (QUICK ADD) */}
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
            <PopoverContent className="w-80 p-3" align="start" side="bottom">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleQuickAdd();
                }}
              >
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Quick Add Event</h4>
                  <Input
                    placeholder="Event title..."
                    value={quickAddTitle}
                    onChange={(e) => setQuickAddTitle(e.target.value)}
                    autoFocus
                    className="h-8"
                  />
                  <div className="flex justify-between items-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs px-2"
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
            dayMaxEvents={isMobile ? 3 : 5}
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

      {/* CREATE/EDIT SHEET (Replaces Dialog) */}
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

      {/* MOBILE SHEET FOR EVENT DETAILS */}
      {isMobile && (
        <Sheet
          open={viewEventState.open}
          onOpenChange={(open) =>
            !open && setViewEventState({ ...viewEventState, open: false })
          }
        >
          <SheetContent side="bottom" className="h-auto max-h-[80vh]">
            {viewEventState.event && (
              <EventDetailsContent
                event={viewEventState.event}
                onEdit={() => {
                  setViewEventState({ ...viewEventState, open: false });
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
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
