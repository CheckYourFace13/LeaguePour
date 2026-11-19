/**
 * CSV writer for venue data exports. Quotes every field and neutralises spreadsheet formula
 * injection: a cell that starts with = + - @ (or tab/CR) is prefixed with an apostrophe so Excel,
 * Numbers and Google Sheets show it as text instead of evaluating it. Inquiry fields are typed by
 * the public, so this matters.
 */

export type CsvCell = string | number | boolean | Date | null | undefined;

export function csvCell(value: CsvCell): string {
  let s: string;
  if (value == null) s = "";
  else if (value instanceof Date) s = Number.isNaN(value.getTime()) ? "" : value.toISOString();
  else s = String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export function toCsv(headers: string[], rows: CsvCell[][]): string {
  const lines = [headers.map(csvCell).join(",")];
  for (const row of rows) lines.push(row.map(csvCell).join(","));
  // BOM so Excel opens UTF-8 names (accents, emoji) correctly.
  return "﻿" + lines.join("\r\n") + "\r\n";
}

export function csvResponse(filename: string, body: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename.replace(/[^a-zA-Z0-9._-]/g, "-")}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}

/** Date-only (YYYY-MM-DD, UTC) for spreadsheet-friendly columns. */
export function ymd(d: Date | null | undefined): string {
  return d ? d.toISOString().slice(0, 10) : "";
}
