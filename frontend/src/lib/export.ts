import * as XLSX from 'xlsx';

export function buildDynamicFieldColumns(
  fields: { name: string; label: string }[],
  dynamicFields?: Record<string, boolean>,
): Record<string, string> {
  return Object.fromEntries(
    fields.map((field) => [field.label, dynamicFields?.[field.name] ? 'Sí' : 'No']),
  );
}

export function exportToExcel(
  rows: Record<string, string | number>[],
  filename: string,
  sheetName = 'Reporte',
) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}
