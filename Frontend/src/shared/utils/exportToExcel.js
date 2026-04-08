/**
 * Export an array of objects to a styled .xlsx file and trigger download.
 * xlsx is lazy-loaded (~1 MB) only when the user actually clicks Export.
 *
 * @param {Object[]} data      – Array of row objects.
 * @param {Object}   [options]
 * @param {string}   [options.fileName="export"]       – File name without extension.
 * @param {string}   [options.sheetName="Sheet1"]      – Worksheet tab name.
 * @param {Array}    [options.columns]                 – Column definitions: { header, key, width? }
 */

let _XLSX = null;

async function loadXLSX() {
  if (!_XLSX) {
    _XLSX = await import("xlsx");
  }
  return _XLSX;
}

export async function exportToExcel(data, options = {}) {
  const {
    fileName = "export",
    sheetName = "Sheet1",
    columns,
  } = options;

  if (!data || data.length === 0) {
    alert("No data to export.");
    return;
  }

  const XLSX = await loadXLSX();

  // Build rows
  let headers;
  let rows;

  if (columns && columns.length > 0) {
    headers = columns.map((c) => c.header);
    rows = data.map((item) =>
      columns.map((c) => {
        const val = typeof c.key === "function" ? c.key(item) : item[c.key];
        return val ?? "";
      })
    );
  } else {
    headers = Object.keys(data[0]);
    rows = data.map((item) => headers.map((h) => item[h] ?? ""));
  }

  // Create worksheet from array-of-arrays
  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Auto-fit column widths
  const colWidths = headers.map((h, i) => {
    const customWidth = columns?.[i]?.width;
    if (customWidth) return { wch: customWidth };

    const maxLen = Math.max(
      h.length,
      ...rows.map((r) => String(r[i] ?? "").length)
    );
    return { wch: Math.min(maxLen + 2, 50) };
  });
  ws["!cols"] = colWidths;

  // Bold header row
  const range = XLSX.utils.decode_range(ws["!ref"]);
  for (let col = range.s.c; col <= range.e.c; col++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c: col });
    if (ws[addr]) {
      ws[addr].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "8B5CF6" } },
        alignment: { horizontal: "center" },
      };
    }
  }

  // Create workbook and push sheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Trigger download
  const timestamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${fileName}_${timestamp}.xlsx`);
}
