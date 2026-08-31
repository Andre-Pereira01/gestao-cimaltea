// ── Exportação XLSX (formato CIMALTEA) ──
import * as XLSX from "xlsx";

const isOutros = (name) => name.trim().toLowerCase() === "outros";

export function exportRosterXLSX(naipes) {
  const musicNaipes = naipes.filter(n => !isOutros(n.name));

  const rows = [];
  let num = 1;
  for (const n of musicNaipes) {
    for (const m of n.musicians) {
      rows.push({
        "N.º": num++,
        "Nombre y Apellidos": m.name,
        "DNI": m.dni || "",
        "Instrumento": n.name,
        "Solo": m.solo ? "Sí" : "No",
        "Ajena a la plantilla": m.reforco ? "Sí" : "No",
        "E-mail": m.email || "",
        "Teléfono": m.phone || "",
      });
    }
  }

  const ws = XLSX.utils.json_to_sheet(rows);

  ws["!cols"] = [
    { wch: 5 },
    { wch: 38 },
    { wch: 16 },
    { wch: 22 },
    { wch: 6 },
    { wch: 22 },
    { wch: 28 },
    { wch: 16 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Listado Músicos");
  XLSX.writeFile(wb, "listado_musicos_cimaltea.xlsx");
}