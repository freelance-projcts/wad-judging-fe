// Client-side CSV export — no backend endpoint for this, so we build the
// file from data already loaded in the page and hand the browser a download.

const escapeCsvCell = (value: unknown): string => {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const toCsv = (headers: string[], rows: unknown[][]): string =>
  [headers, ...rows].map((row) => row.map(escapeCsvCell).join(",")).join("\n");

const downloadBlob = (filename: string, content: string) => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const downloadCsv = (filename: string, headers: string[], rows: unknown[][]) =>
  downloadBlob(filename, toCsv(headers, rows));

/** One CSV file made of several distinct tables, each with its own title + header row, separated by a blank line. */
export const downloadCsvSections = (
  filename: string,
  sections: { title?: string; headers: string[]; rows: unknown[][] }[],
) =>
  downloadBlob(
    filename,
    sections
      .map((section) => (section.title ? `${section.title}\n${toCsv(section.headers, section.rows)}` : toCsv(section.headers, section.rows)))
      .join("\n\n"),
  );
