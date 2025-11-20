import { RecurringTransaction } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { addDays, addMonths, addWeeks, addYears, nextDay, setDate } from "date-fns";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(
  dateInput: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = new Date(dateInput);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  };
  return date.toLocaleDateString(undefined, defaultOptions);
}

export function slugify(text: string): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}


export const getNextOccurrence = (cursor: Date, rule: RecurringTransaction): Date => {
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