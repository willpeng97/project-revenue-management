import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    minimumFractionDigits: 0,
  }).format(num || 0);
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("zh-TW");
}

export function formValue(fd: FormData, key: string): string {
  const v = fd.get(key);
  return v ? String(v) : "";
}

export function formValueOptional(fd: FormData, key: string): string | undefined {
  const v = fd.get(key);
  return v ? String(v) : undefined;
}

export function decimalToNumber(value: { toString(): string } | number | null | undefined) {
  if (value == null) return 0;
  return typeof value === "number" ? value : parseFloat(value.toString());
}
