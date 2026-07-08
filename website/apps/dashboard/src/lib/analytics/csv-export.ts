export function downloadCSV(rows: { [key: string]: string | number | undefined }[], filename: string) {
  const csvRows = rows.map((row) =>
    Object.values(row).map((val) => {
      const str = String(val ?? '');
      return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
    })
  );

  const csv = csvRows.map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
