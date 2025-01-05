import { isToday, isYesterday, isThisWeek, isThisMonth, isThisYear, parseISO } from "date-fns";

export type DateGroup = 
  | "Today"
  | "Yesterday"
  | "Last 7 days"
  | "Last month"
  | "Over a month ago"
  | "Older";

export const getDateGroup = (date: Date | string): DateGroup => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(parsedDate)) return "Today";
  if (isYesterday(parsedDate)) return "Yesterday";
  if (isThisWeek(parsedDate)) return "Last 7 days";
  if (isThisMonth(parsedDate)) return "Last month";
  if (isThisYear(parsedDate)) return "Over a month ago";
  return "Older";
};

export const DATE_GROUP_ORDER: DateGroup[] = [
  "Today",
  "Yesterday",
  "Last 7 days",
  "Last month",
  "Over a month ago",
  "Older"
];