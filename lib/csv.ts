// Client-side CSV export — no backend endpoint for this, so we build the
// file from data already loaded in the page and hand the browser a download.

const escapeCsvCell = (value: unknown): string => {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const toCsv = (headers: string[], rows: unknown[][]): string =>
  [headers, ...rows].map((row) => row.map(escapeCsvCell).join(",")).join("\n");

export const downloadCsv = (filename: string, headers: string[], rows: unknown[][]) => {
  const blob = new Blob([toCsv(headers, rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
