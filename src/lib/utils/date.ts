import { Timestamp } from "firebase/firestore";
import { format } from "date-fns";
import { Locale } from "date-fns";

export const safeConvertToDate = (
  date: Date | string | Timestamp | null | undefined
): Date | null => {
  if (!date) return null;
  if (typeof date === "string") return new Date(date);
  if ("toDate" in date) return date.toDate(); // Para Timestamp de Firestore
  return date as Date;
};

export const formatDate = (
  date: Date | string | Timestamp | null | undefined,
  formatStr: string,
  locale?: Locale
): string => {
  const safeDate = safeConvertToDate(date);
  return safeDate ? format(safeDate, formatStr, { locale }) : "N/A";
};
