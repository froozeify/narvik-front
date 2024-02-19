import dayjs from "dayjs";

export function formatDateTime(date?: string): string | null {
  if (!date) return null;

  return dayjs(date).format("DD/MM/YYYY");
}

export function formatDateReadable(date?: string): string | null {
  if (!date) return null;

  return new Date(date).toLocaleString('fr-FR', {day: 'numeric', month: 'long', year: 'numeric'});
}

export function formatTimeReadable(date?: string): string | null {
  if (!date) return null;
  return new Date(date).toLocaleString('fr-FR', {hour: '2-digit', minute: '2-digit'});
}

export function formatDateInput(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  return dayjs(value).format("YYYY-MM-DD");
}
