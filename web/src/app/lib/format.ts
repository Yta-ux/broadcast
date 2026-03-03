export const formatDateTime = (date: Date): string =>
  date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatShortDay = (date: Date): string =>
  date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");

export const truncate = (text: string, n: number): string =>
  text.length > n ? `${text.slice(0, n)}…` : text;

export const toDayKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
