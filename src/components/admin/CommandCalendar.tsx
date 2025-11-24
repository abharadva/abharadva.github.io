// src/components/admin/CommandCalendar.tsx
"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
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
  ViewApi,
} from "@fullcalendar/core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  addDays,
  addWeeks,
  isAfter,
  isBefore,
  isSameDay,
  nextDay,
  setDate,
  addMonths,
  addYears,
  formatISO,
} from "date-fns";
import type { RecurringTransaction } from "@/types";
import {
  Banknote,
  CheckSquare,
  Edit,
  ListTodo,
  Loader2,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
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

type CalendarItem = {
  item_id: string;
  title: string;
  start_time: string;
  end_time: string | null;
  item_type: "event" | "task" | "transaction";
  data: any;
};

const getNextOccurrence = (cursor: Date, rule: RecurringTransaction): Date => {
  let next = new Date(cursor);
  switch (rule.frequency) {
    case "daily":
      return addDays(next, 1);
    case "weekly":
      return rule.occurrence_day !== null && rule.occurrence_day !== undefined
        ? nextDay(next, rule.occurrence_day as any)
        : addWeeks(next, 1);
    case "bi-weekly":
      return rule.occurrence_day !== null && rule.occurrence_day !== undefined
        ? nextDay(addWeeks(next, 1), rule.occurrence_day as any)
        : addWeeks(next, 2);
    case "monthly":
      next = addMonths(next, 1);
      return rule.occurrence_day ? setDate(next, rule.occurrence_day) : next;
    case "yearly":
      return addYears(next, 1);
    default:
      return addDays(next, 1);
  }
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
    display: "list-item",
  };
};

const CalendarPopoverContent: React.FC<{
  event: EventInput;
  onEdit: () => void;
  onNavigate: (tab: any) => void;
}> = ({ event, onEdit, onNavigate }) => {
  const { type, transactionType, amount, status, priority, description } =
    event.extendedProps || {};
  const isEarning = transactionType === "earning";
  const sign = isEarning ? "+" : "-";
  const amountColor = isEarning ? "text-chart-2" : "text-chart-5";

  return (
    <PopoverContent className="w-80">
      <div className="space-y-4">
        <h3 className="font-semibold text-base">{event.title}</h3>
        <Separator />
        <div className="space-y-2 text-sm">
          {type === "event" && description && (
            <p className="text-muted-foreground">{description}</p>
          )}
          {type === "task" && (
            <>
              {" "}
              <p>
                {" "}
                <strong>Status:</strong>{" "}
                <span className="capitalize">{status}</span>{" "}
              </p>{" "}
              <p>
                {" "}
                <strong>Priority:</strong>{" "}
                <span className="capitalize">{priority}</span>{" "}
              </p>{" "}
            </>
          )}
          {(type === "transaction" || type === "forecast") && (
            <>
              {" "}
              <p>
                {" "}
                <strong>Type:</strong>{" "}
                <span className="capitalize">{transactionType}</span>{" "}
              </p>{" "}
              <p>
                {" "}
                <strong>Amount:</strong>{" "}
                <span className={cn("font-mono font-semibold", amountColor)}>
                  {" "}
                  {sign}${amount?.toFixed(2)}{" "}
                </span>{" "}
              </p>{" "}
            </>
          )}
        </div>
        <Separator />
        <div className="flex gap-2">
          {type === "event" && (
            <Button onClick={onEdit} size="sm">
              <Edit className="mr-2 size-4" />
              Edit
            </Button>
          )}
          {type === "task" && (
            <Button
              onClick={() => onNavigate("tasks")}
              size="sm"
              variant="secondary"
            >
              <ListTodo className="mr-2 size-4" />
              Go to Tasks
            </Button>
          )}
          {type === "transaction" && (
            <Button
              onClick={() => onNavigate("finance")}
              size="sm"
              variant="secondary"
            >
              <Banknote className="mr-2 size-4" />
              Go to Finance
            </Button>
          )}
        </div>
      </div>
    </PopoverContent>
  );
};

export default function CommandCalendar({
  onNavigate,
}: {
  onNavigate: (tab: any) => void;
}) {
  const [dateRange, setDateRange] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const { data, isLoading, error } = useGetCalendarDataQuery(
    dateRange ?? skipToken,
  );

  const [addEvent] = useAddEventMutation();
  const [updateEvent] = useUpdateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();
  const [updateTask] = useUpdateTaskMutation();

  const [dialogState, setDialogState] = useState<{
    open: boolean;
    data?: any;
    isNew: boolean;
  }>({ open: false, isNew: false });
  const [popoverState, setPopoverState] = useState<{
    open: boolean;
    anchorProps: React.CSSProperties;
    event: EventInput | null;
  }>({ open: false, anchorProps: { display: "none" }, event: null });
  const calendarContainerRef = useRef<HTMLDivElement>(null);
  const [eventFormData, setEventFormData] = useState({
    id: "",
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    is_all_day: false,
  });

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
          });
        }
        nextOccurrence = getNextOccurrence(nextOccurrence, rule);
      }
    });

    return [...baseEvents, ...forecastEvents];
  }, [data]);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setPopoverState({
      open: false,
      anchorProps: { display: "none" },
      event: null,
    });
    setEventFormData({
      id: "",
      title: "",
      description: "",
      start_time: formatISO(selectInfo.start).slice(0, 16),
      end_time: selectInfo.end ? formatISO(selectInfo.end).slice(0, 16) : "",
      is_all_day: selectInfo.allDay,
    });
    setDialogState({ open: true, isNew: true });
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    clickInfo.jsEvent.preventDefault();
    const calendarEl = calendarContainerRef.current;
    if (!calendarEl) return;
    const eventEl = clickInfo.el;
    const containerRect = calendarEl.getBoundingClientRect();
    const eventRect = eventEl.getBoundingClientRect();
    const top = eventRect.top - containerRect.top + eventRect.height / 2;
    const left = eventRect.left - containerRect.left + eventRect.width / 2;
    setPopoverState({
      open: true,
      anchorProps: { position: "absolute", top: `${top}px`, left: `${left}px` },
      event: clickInfo.event as EventInput,
    });
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
      toast.success(
        `${type.charAt(0).toUpperCase() + type.slice(1)} rescheduled successfully.`,
      );
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
      start_time: new Date(eventFormData.start_time).toISOString(),
      end_time: eventFormData.end_time
        ? new Date(eventFormData.end_time).toISOString()
        : null,
      is_all_day: eventFormData.is_all_day,
    };

    try {
      if (dialogState.isNew) {
        await addEvent(dataToSave).unwrap();
      } else {
        await updateEvent(dataToSave).unwrap();
      }
      toast.success(
        `Event ${dialogState.isNew ? "created" : "updated"} successfully.`,
      );
      setDialogState({ open: false, isNew: false });
    } catch (err: any) {
      toast.error("Failed to save event", { description: err.message });
    }
  };

  const handleDeleteEvent = async () => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteEvent(eventFormData.id).unwrap();
      toast.success("Event deleted.");
      setDialogState({ open: false, isNew: false });
    } catch (err: any) {
      toast.error("Failed to delete event", { description: err.message });
    }
  };

  const handleEditClick = () => {
    const eventToEdit = popoverState.event;
    if (!eventToEdit) return;

    setEventFormData({
      id: eventToEdit.id!,
      title: eventToEdit.title!,
      description: eventToEdit.extendedProps?.description || "",
      start_time:
        eventToEdit.start && !(eventToEdit.start instanceof Array)
          ? formatISO(
            new Date(eventToEdit.start as string | number | Date),
          ).slice(0, 16)
          : "",
      end_time:
        eventToEdit.end && !(eventToEdit.end instanceof Array)
          ? formatISO(
            new Date(eventToEdit.end as string | number | Date),
          ).slice(0, 16)
          : "",
      is_all_day: !!eventToEdit.allDay,
    });

    setPopoverState({
      open: false,
      anchorProps: { display: "none" },
      event: null,
    });
    setDialogState({ open: true, isNew: false });
  };

  const renderEventContent = (eventInfo: EventContentArg) => {
    const { type, priority, transactionType, amount } =
      eventInfo.event.extendedProps;

    if (type === "event" || type === "task") {
      const isEvent = type === "event";
      const icon = isEvent ? (
        <Calendar className="size-3.5 shrink-0" />
      ) : (
        <CheckSquare className="size-3.5 shrink-0" />
      );
      const iconClass = isEvent
        ? ""
        : cn({
          "text-destructive": priority === "high",
          "text-chart-3": priority === "medium",
          "text-primary": priority === "low",
        });

      return (
        <div className="flex w-full items-center gap-2 overflow-hidden p-1 text-xs text-foreground">
          <div className={cn("flex h-full items-center", iconClass)}>
            {icon}
          </div>
          <span className="truncate flex-grow">{eventInfo.event.title}</span>
        </div>
      );
    }

    if (type === "transaction" || type === "forecast") {
      const isForecast = type === "forecast";
      const isEarning = transactionType === "earning";
      const sign = isEarning ? "+" : "-";
      const amountColor = isEarning ? "text-chart-2" : "text-chart-5";
      const iconColor = isEarning ? "bg-chart-2" : "bg-chart-5";
      return (
        <div
          className={cn(
            "flex w-full items-start gap-2 overflow-hidden p-1 text-xs",
            isForecast && "opacity-60",
          )}
        >
          <div
            className={cn(
              "mt-1.5 size-2 shrink-0 rounded-full",
              iconColor,
              isForecast && "opacity-50",
            )}
          />
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-foreground">
              {eventInfo.event.title}
            </span>
            <span
              className={cn("font-mono text-[10px] font-semibold", amountColor)}
            >{`${sign}$${amount?.toFixed(2)}`}</span>
          </div>
        </div>
      );
    }

    return <i>{eventInfo.event.title}</i>;
  };

  return (
    <div
      ref={calendarContainerRef}
      className="relative rounded-lg border bg-card p-4 themed-calendar"
    >
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/80 backdrop-blur-sm rounded-lg">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      )}
      <Popover
        open={popoverState.open}
        onOpenChange={(open) =>
          !open &&
          setPopoverState({
            open: false,
            anchorProps: { display: "none" },
            event: null,
          })
        }
      >
        <PopoverAnchor style={popoverState.anchorProps} />
        {popoverState.event && (
          <CalendarPopoverContent
            event={popoverState.event}
            onEdit={handleEditClick}
            onNavigate={(tab) => {
              setPopoverState({
                open: false,
                anchorProps: { display: "none" },
                event: null,
              });
              onNavigate(tab);
            }}
          />
        )}
      </Popover>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
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
        height="auto"
      />
      <Dialog
        open={dialogState.open}
        onOpenChange={(open) =>
          !open && setDialogState({ ...dialogState, open: false })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg">
              {dialogState.isNew ? "Create New Event" : "Edit Event"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEventFormSubmit} className="space-y-4 pt-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={eventFormData.title}
                onChange={(e) =>
                  setEventFormData({ ...eventFormData, title: e.target.value })
                }
                required
              />
            </div>
            <div>
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
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_all_day"
                checked={eventFormData.is_all_day}
                onCheckedChange={(c) =>
                  setEventFormData({ ...eventFormData, is_all_day: c })
                }
              />
              <Label htmlFor="is_all_day">All-day event</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_time">Start</Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  value={eventFormData.start_time}
                  onChange={(e) =>
                    setEventFormData({
                      ...eventFormData,
                      start_time: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_time">End</Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  value={eventFormData.end_time}
                  onChange={(e) =>
                    setEventFormData({
                      ...eventFormData,
                      end_time: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="flex justify-between pt-4">
              {!dialogState.isNew && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteEvent}
                >
                  Delete
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <DialogClose asChild>
                  <Button type="button" variant="ghost">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">
                  {dialogState.isNew ? "Create" : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
