import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const HEADER = "Banda Musical de Monção";
const SUB = "51.º Certamen Internacional de Música \"Vila d'Altea\" — Dezembro 2026";

function addHeader(doc, title) {
  const w = doc.internal.pageSize.getWidth();
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, w / 2, 20, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(HEADER, w / 2, 27, { align: "center" });
  doc.text(SUB, w / 2, 32, { align: "center" });
  doc.setTextColor(0);
  return 40;
}

function addFooter(doc) {
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Página ${i} de ${pages}`, w / 2, h - 10, { align: "center" });
    doc.text(new Date().toLocaleDateString("pt-PT"), w - 15, h - 10, { align: "right" });
  }
}

export function exportRosterPDF(naipes) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let y = addHeader(doc, "Listagem de Músicos");

  // Stats
  let total = 0, conf = 0, pend = 0, ref = 0;
  for (const n of naipes) for (const m of n.musicians) {
    total++; if (m.status === "confirmado") conf++; else pend++; if (m.reforco) ref++;
  }

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Total: ${total}    Confirmados: ${conf}    Pendentes: ${pend}    Reforços: ${ref}    Plantilla: ${total - ref}`, 14, y);
  y += 6;

  // Build table data
  const rows = [];
  let num = 1;
  for (const n of naipes) {
    for (const m of n.musicians) {
      rows.push([
        num++,
        m.name,
        n.name,
        m.reforco ? "Sim" : "",
        m.status === "confirmado" ? "Confirmado" : "Pendente",
        m.comments || "",
      ]);
    }
  }

  autoTable(doc, {
    startY: y,
    head: [["N.º", "Nome", "Naipe", "Reforço", "Estado", "Observações"]],
    body: rows,
    styles: { fontSize: 8, cellPadding: 1.5 },
    headStyles: { fillColor: [41, 65, 107], fontStyle: "bold", fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 10, halign: "right" },
      1: { cellWidth: 45 },
      2: { cellWidth: 28 },
      3: { cellWidth: 14, halign: "center" },
      4: { cellWidth: 20 },
      5: { cellWidth: 55 },
    },
    didParseCell: (data) => {
      if (data.section === "body") {
        const status = data.row.raw[4];
        if (status === "Pendente") {
          data.cell.styles.textColor = [160, 120, 0];
          data.cell.styles.fontStyle = "italic";
        }
        const reforco = data.row.raw[3];
        if (reforco === "Sim" && data.column.index === 3) {
          data.cell.styles.textColor = [30, 100, 160];
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  addFooter(doc);
  doc.save("listagem_musicos_cimaltea.pdf");
}

export function exportRoomsPDF(naipes, rooms) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let y = addHeader(doc, "Distribuição de Quartos");

  // Build musician lookup
  const allMusicians = [];
  let num = 1;
  for (const n of naipes) for (const m of n.musicians) {
    allMusicians.push({ ...m, naipe: n.name, globalNum: num++ });
  }
  const byId = Object.fromEntries(allMusicians.map(m => [m.id, m]));
  const assignedIds = new Set(rooms.flatMap(r => r.musicians));
  const unassigned = allMusicians.filter(m => !assignedIds.has(m.id));

  // Stats
  const totalBeds = rooms.reduce((s, r) => s + r.size, 0);
  const totalOccupied = rooms.reduce((s, r) => s + r.musicians.length, 0);
  doc.setFontSize(9);
  doc.text(`Quartos: ${rooms.length}    Camas: ${totalBeds}    Atribuídos: ${totalOccupied}    Por atribuir: ${unassigned.length}`, 14, y);
  y += 6;

  // Room tables
  const rows = [];
  for (const room of rooms) {
    const occupants = room.musicians
      .map(id => byId[id])
      .filter(Boolean)
      .map(m => `${m.name} (${m.naipe})`)
      .join(", ");
    const free = room.size - room.musicians.length;
    rows.push([
      room.label,
      String(room.size),
      `${room.musicians.length}/${room.size}`,
      occupants || "—",
      free > 0 ? String(free) : "",
    ]);
  }

  if (rows.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["Quarto", "Capac.", "Ocupação", "Ocupantes", "Vagas"]],
      body: rows,
      styles: { fontSize: 8, cellPadding: 1.5 },
      headStyles: { fillColor: [41, 65, 107], fontStyle: "bold", fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 14, halign: "center" },
        2: { cellWidth: 16, halign: "center" },
        3: { cellWidth: 105 },
        4: { cellWidth: 12, halign: "center" },
      },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // Unassigned list
  if (unassigned.length > 0) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Por atribuir", 14, y);
    y += 4;

    const unRows = unassigned.map(m => [m.globalNum, m.name, m.naipe]);
    autoTable(doc, {
      startY: y,
      head: [["N.º", "Nome", "Naipe"]],
      body: unRows,
      styles: { fontSize: 8, cellPadding: 1.5 },
      headStyles: { fillColor: [140, 140, 140], fontStyle: "bold", fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 10, halign: "right" },
        1: { cellWidth: 60 },
        2: { cellWidth: 30 },
      },
      margin: { left: 14, right: 14 },
    });
  }

  addFooter(doc);
  doc.save("quartos_cimaltea.pdf");
}
