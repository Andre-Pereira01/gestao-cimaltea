// ── Exportação DOCX ──
import {
  Document, Paragraph, Table, TableRow, TableCell, TextRun,
  HeadingLevel, AlignmentType, WidthType, BorderStyle, Packer,
  Header, Footer, PageNumber, NumberFormat,
} from "docx";

const HEADER_TEXT = "Banda Musical de Monção";
const SUB_TEXT = '51.º Certamen Internacional de Música "Vila d\'Altea" — Dezembro 2026';

function headerParagraphs(title) {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: title, bold: true, size: 32, font: "Calibri" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [new TextRun({ text: HEADER_TEXT, size: 18, color: "666666", font: "Calibri" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: SUB_TEXT, size: 18, color: "666666", font: "Calibri" })],
    }),
  ];
}

function cell(text, opts = {}) {
  const { bold, italic, color, width, align, shading } = opts;
  return new TableCell({
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    shading: shading ? { fill: shading } : undefined,
    children: [
      new Paragraph({
        alignment: align || AlignmentType.LEFT,
        children: [
          new TextRun({
            text: String(text ?? ""),
            bold, italic, size: 18,
            color: color || "000000",
            font: "Calibri",
          }),
        ],
      }),
    ],
  });
}

function headerCell(text, width) {
  return cell(text, { bold: true, color: "FFFFFF", width, shading: "29416B" });
}

const isOutros = (name) => name.trim().toLowerCase() === "outros";

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportRosterDOCX(naipes) {
  const musicNaipes = naipes.filter(n => !isOutros(n.name));
  const outrosNaipes = naipes.filter(n => isOutros(n.name));

  let total = 0, conf = 0, pend = 0, ref = 0;
  for (const n of musicNaipes) for (const m of n.musicians) {
    total++; if (m.status === "confirmado") conf++; else pend++; if (m.reforco) ref++;
  }
  const outros = outrosNaipes.reduce((s, n) => s + n.musicians.length, 0);

  const statsText = `Músicos: ${total}    Confirmados: ${conf}    Pendentes: ${pend}    Reforços: ${ref}    Plantilla: ${total - ref}    Outros: ${outros}`;

  // Build rows
  const rows = [
    new TableRow({
      tableHeader: true,
      children: [
        headerCell("N.º", 6),
        headerCell("Nome", 26),
        headerCell("Naipe", 16),
        headerCell("DNI/CC", 14),
        headerCell("Reforço", 8),
        headerCell("Estado", 12),
        headerCell("Observações", 18),
      ],
    }),
  ];

  let num = 1;
  for (const n of musicNaipes) {
    for (const m of n.musicians) {
      const isPend = m.status === "pendente";
      rows.push(
        new TableRow({
          children: [
            cell(num++, { align: AlignmentType.RIGHT, width: 6 }),
            cell(m.name, { italic: isPend, color: isPend ? "A07800" : undefined, width: 26 }),
            cell(n.name, { width: 16 }),
            cell(m.dni || "", { width: 14 }),
            cell(m.reforco ? "Sim" : "", { bold: m.reforco, color: m.reforco ? "1E64A0" : undefined, align: AlignmentType.CENTER, width: 8 }),
            cell(isPend ? "Pendente" : "Confirmado", { italic: isPend, color: isPend ? "A07800" : undefined, width: 12 }),
            cell(m.comments || "", { width: 18 }),
          ],
        })
      );
    }
  }

  const children = [
    ...headerParagraphs("Listagem de Músicos"),
    new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: statsText, size: 18, font: "Calibri" })] }),
    new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }),
  ];

  // Outros
  const outrosMusicians = outrosNaipes.flatMap(n => n.musicians);
  if (outrosMusicians.length > 0) {
    children.push(
      new Paragraph({ spacing: { before: 400, after: 100 }, children: [new TextRun({ text: "Outros (não músicos)", bold: true, size: 24, font: "Calibri" })] })
    );
    const outrosRows = [
      new TableRow({
        tableHeader: true,
        children: [headerCell("N.º", 10), headerCell("Nome", 40), headerCell("Estado", 20), headerCell("Observações", 30)],
      }),
    ];
    outrosMusicians.forEach((m, i) => {
      outrosRows.push(new TableRow({
        children: [
          cell(i + 1, { align: AlignmentType.RIGHT, width: 10 }),
          cell(m.name, { width: 40 }),
          cell(m.status === "confirmado" ? "Confirmado" : "Pendente", { width: 20 }),
          cell(m.comments || "", { width: 30 }),
        ],
      }));
    });
    children.push(new Table({ rows: outrosRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 720, bottom: 720, left: 720, right: 720 },
        },
      },
      headers: {
        default: new Header({ children: [] }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "Página ", size: 16, color: "999999", font: "Calibri" }),
                new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "999999", font: "Calibri" }),
                new TextRun({ text: " de ", size: 16, color: "999999", font: "Calibri" }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: "999999", font: "Calibri" }),
                new TextRun({ text: `    ${new Date().toLocaleDateString("pt-PT")}`, size: 16, color: "999999", font: "Calibri" }),
              ],
            }),
          ],
        }),
      },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveBlob(blob, "listagem_musicos_cimaltea.docx");
}

export async function exportRoomsDOCX(naipes, rooms) {
  const allMusicians = [];
  let num = 1;
  for (const n of naipes) for (const m of n.musicians) {
    allMusicians.push({ ...m, naipe: n.name, globalNum: num++ });
  }
  const byId = Object.fromEntries(allMusicians.map(m => [m.id, m]));
  const assignedIds = new Set(rooms.flatMap(r => r.musicians));
  const unassigned = allMusicians.filter(m => !assignedIds.has(m.id));

  const totalBeds = rooms.reduce((s, r) => s + r.size, 0);
  const totalOccupied = rooms.reduce((s, r) => s + r.musicians.length, 0);
  const statsText = `Quartos: ${rooms.length}    Camas: ${totalBeds}    Atribuídos: ${totalOccupied}    Por atribuir: ${unassigned.length}`;

  // Rooms table
  const tableRows = [
    new TableRow({
      tableHeader: true,
      children: [
        headerCell("Quarto", 14),
        headerCell("Capac.", 8),
        headerCell("Ocupação", 10),
        headerCell("Ocupantes", 58),
        headerCell("Vagas", 10),
      ],
    }),
  ];

  for (const room of rooms) {
    const occupants = room.musicians
      .map(id => byId[id])
      .filter(Boolean)
      .map(m => `${m.name} (${m.naipe})`)
      .join(", ");
    const free = room.size - room.musicians.length;
    tableRows.push(new TableRow({
      children: [
        cell(room.label, { width: 14 }),
        cell(room.size, { align: AlignmentType.CENTER, width: 8 }),
        cell(`${room.musicians.length}/${room.size}`, { align: AlignmentType.CENTER, width: 10 }),
        cell(occupants || "—", { width: 58 }),
        cell(free > 0 ? String(free) : "", { align: AlignmentType.CENTER, width: 10 }),
      ],
    }));
  }

  const children = [
    ...headerParagraphs("Distribuição de Quartos"),
    new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: statsText, size: 18, font: "Calibri" })] }),
  ];

  if (rooms.length > 0) {
    children.push(new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
  }

  // Unassigned
  if (unassigned.length > 0) {
    children.push(
      new Paragraph({ spacing: { before: 400, after: 100 }, children: [new TextRun({ text: "Por atribuir", bold: true, size: 24, font: "Calibri" })] })
    );
    const unRows = [
      new TableRow({
        tableHeader: true,
        children: [headerCell("N.º", 10), headerCell("Nome", 50), headerCell("Naipe", 40)],
      }),
    ];
    unassigned.forEach(m => {
      unRows.push(new TableRow({
        children: [
          cell(m.globalNum, { align: AlignmentType.RIGHT, width: 10 }),
          cell(m.name, { width: 50 }),
          cell(m.naipe, { width: 40 }),
        ],
      }));
    });
    children.push(new Table({ rows: unRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } },
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "Página ", size: 16, color: "999999", font: "Calibri" }),
                new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "999999", font: "Calibri" }),
                new TextRun({ text: " de ", size: 16, color: "999999", font: "Calibri" }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: "999999", font: "Calibri" }),
                new TextRun({ text: `    ${new Date().toLocaleDateString("pt-PT")}`, size: 16, color: "999999", font: "Calibri" }),
              ],
            }),
          ],
        }),
      },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveBlob(blob, "quartos_cimaltea.docx");
}