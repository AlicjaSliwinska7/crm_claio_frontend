// Prosty, bez zależności zewnętrznych
export function downloadCsv(filename, rows) {
  const csv = rows.map(r => r.map(cell =>
    `"${String(cell ?? '').replace(/"/g, '""')}"`
  ).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
export const exportCSVFile = downloadCsv;

export function exportXLSFile(filename, htmlTableString) {
  const blob = new Blob([htmlTableString], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.xls') ? filename : `${filename}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}
