// Client-side CSV export — no backend endpoint for this, so we build the
// file from data already loaded in the page and hand the browser a download.

import { provinceLabel, type Gender, type Province } from "./domain";

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

// Gymnastics reports refer to gender as "Men"/"Women", not the "Male"/"Female"
// labels used elsewhere in the app's own filters/forms (lib/domain.ts genderLabel) —
// kept local to the CSV banner rather than changing that shared label everywhere.
const eventGenderTerm = (gender?: Gender): string | undefined =>
  gender === "MALE" ? "Men" : gender === "FEMALE" ? "Women" : gender === "OTHER" ? "Other" : undefined;

export type ReportInfo = {
  /** e.g. "Team Performance", "Top 8", "Performance 2", "All Rounders". */
  type: string;
  eventName?: string;
  gender?: Gender;
  province?: Province | null;
};

/** Every exported CSV opens with this banner, matching the department's paper report layout. */
const reportBanner = (report: ReportInfo): string => {
  const eventLine = [report.eventName, eventGenderTerm(report.gender)].filter(Boolean).join(" - ");
  const infoLines: string[] = [];
  if (eventLine) infoLines.push(`EVENT : ${eventLine}`);
  if (report.province) infoLines.push(`PROVINCE : ${provinceLabel(report.province)} Province`);

  return [
    `NATIONAL SPORTS GAMES - ${new Date().getFullYear()}`,
    "Department of Sports Development",
    `Gymnastics - ${report.type}`,
    ...infoLines,
  ].join("\n");
};

export const downloadCsv = (
  filename: string,
  headers: string[],
  rows: unknown[][],
  report: ReportInfo,
) => downloadBlob(filename, `${reportBanner(report)}\n\n${toCsv(headers, rows)}`);

/** One CSV file made of several distinct tables, each with its own title + header row, separated by a blank line. */
export const downloadCsvSections = (
  filename: string,
  sections: { title?: string; headers: string[]; rows: unknown[][] }[],
  report: ReportInfo,
) =>
  downloadBlob(
    filename,
    `${reportBanner(report)}\n\n` +
      sections
        .map((section) => (section.title ? `${section.title}\n${toCsv(section.headers, section.rows)}` : toCsv(section.headers, section.rows)))
        .join("\n\n"),
  );
