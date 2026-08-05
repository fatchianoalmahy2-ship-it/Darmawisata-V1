import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatWhatsAppLink(phone?: string, text?: string): string {
  if (!phone) return "";
  // Strip all non-digit characters
  let clean = phone.replace(/\D/g, "");
  // Replace leading 0 with 62
  if (clean.startsWith("0")) {
    clean = "62" + clean.slice(1);
  } else if (clean.startsWith("8")) {
    clean = "628" + clean.slice(1);
  } else if (!clean.startsWith("62") && clean.length > 0) {
    clean = "62" + clean;
  }
  
  const encodedText = text ? encodeURIComponent(text) : "";
  return `https://wa.me/${clean}${encodedText ? `?text=${encodedText}` : ""}`;
}

export function normalizeClassName(className?: string): string {
  if (!className) return 'XII';
  let trimmed = className.trim();
  if (!trimmed.toUpperCase().startsWith('XII')) {
    trimmed = `XII ${trimmed}`;
  } else if (/^XII[A-Za-z0-9]/i.test(trimmed)) {
    trimmed = 'XII ' + trimmed.slice(3).trim();
  }
  return trimmed;
}

export function sortClassesAlphabetically<T extends { name: string }>(classesList: T[]): T[] {
  if (!classesList || !Array.isArray(classesList)) return [];
  return [...classesList]
    .map((c) => ({
      ...c,
      name: normalizeClassName(c.name),
    }))
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
}
