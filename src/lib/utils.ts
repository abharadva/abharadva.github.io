import { RecurringTransaction } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  nextDay,
  setDate,
  isAfter,
  isSameDay,
  isValid,
  parseISO,
} from "date-fns";
import { supabase } from "@/supabase/client";

const BUCKET_NAME = process.env.NEXT_PUBLIC_BUCKET_NAME || "blog-assets";

export function getStorageUrl(filePath: string | null | undefined): string {
  if (!filePath) return "";
  if (filePath.startsWith("http")) return filePath;
  if (!supabase) return filePath;

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
  return data.publicUrl;
}

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function parseLocalDate(
  dateInput: string | Date | null | undefined,
): Date {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date) return dateInput;

  // Handle "YYYY-MM-DD" strings specifically to prevent timezone shifts.
  // new Date("2024-05-23") creates UTC midnight, which is 2024-05-22 20:00:00 EST.
  // We want 2024-05-23 00:00:00 Local.
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [year, month, day] = dateInput.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  // Handle standard ISO strings with time components
  const parsed = parseISO(dateInput);
  if (isValid(parsed)) return parsed;

  return new Date();
}

export function formatDate(
  dateInput: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = parseLocalDate(dateInput?.toString());

  if (!isValid(date)) return "N/A";

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  };
  return date.toLocaleDateString("en-US", defaultOptions);
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

export const getNextOccurrence = (
  cursor: Date,
  rule: RecurringTransaction,
): Date => {
  const current = new Date(cursor);

  switch (rule.frequency) {
    case "daily":
      return addDays(current, 1);

    case "weekly":
      if (
        rule.occurrence_day != null &&
        rule.occurrence_day >= 0 &&
        rule.occurrence_day <= 6
      ) {
        return nextDay(current, rule.occurrence_day as any);
      }
      return addWeeks(current, 1);

    case "bi-weekly":
      if (
        rule.occurrence_day != null &&
        rule.occurrence_day >= 0 &&
        rule.occurrence_day <= 6
      ) {
        return addWeeks(nextDay(current, rule.occurrence_day as any), 1);
      }
      return addWeeks(current, 2);

    case "monthly": {
      if (
        rule.occurrence_day &&
        rule.occurrence_day >= 1 &&
        rule.occurrence_day <= 31
      ) {
        let candidate = setDate(current, rule.occurrence_day);
        if (isAfter(candidate, current) || isSameDay(candidate, current)) {
          if (isSameDay(candidate, current)) {
            let nextMonth = addMonths(current, 1);
            return setDate(nextMonth, rule.occurrence_day);
          }
          return candidate;
        }
        let nextMonth = addMonths(current, 1);
        return setDate(nextMonth, rule.occurrence_day);
      }
      return addMonths(current, 1);
    }

    case "yearly":
      return addYears(current, 1);

    default:
      return addDays(current, 1);
  }
};

export function hexToHsl(hex: string): string {
  let r = 0,
    g = 0,
    b = 0;
  if (hex.length === 4) {
    r = parseInt("0x" + hex[1] + hex[1]);
    g = parseInt("0x" + hex[2] + hex[2]);
    b = parseInt("0x" + hex[3] + hex[3]);
  } else if (hex.length === 7) {
    r = parseInt("0x" + hex[1] + hex[2]);
    g = parseInt("0x" + hex[3] + hex[4]);
    b = parseInt("0x" + hex[5] + hex[6]);
  }
  r /= 255;
  g /= 255;
  b /= 255;
  const cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin;
  let h = 0,
    s = 0,
    l = 0;

  if (delta === 0) h = 0;
  else if (cmax === r) h = ((g - b) / delta) % 6;
  else if (cmax === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);
  if (h < 0) h += 360;
  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return `${h} ${s}% ${l}%`;
}