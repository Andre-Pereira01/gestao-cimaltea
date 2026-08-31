// ── Componentes partilhados ──
import { useState, useEffect, useRef } from "react";

export const uid = () => Math.random().toString(36).slice(2, 10);

export function Badge({ children, color }) {
  const colors = {
    green: "bg-emerald-100 text-emerald-800",
    yellow: "bg-amber-100 text-amber-800",
    blue: "bg-sky-100 text-sky-800",
    gray: "bg-gray-100 text-gray-600",
    red: "bg-rose-100 text-rose-700",
    purple: "bg-purple-100 text-purple-700",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[color] || colors.gray}`}>
      {children}
    </span>
  );
}

export function Stat({ label, value, sub }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 min-w-0">
      <div className="text-2xl font-semibold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-400">{sub}</div>}
    </div>
  );
}

export function ExportDropdown({ options, label }) {
  // options = [{ label: "PDF", onClick: fn }, ...]
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="border border-gray-300 text-gray-600 text-sm px-3 py-2 rounded-lg hover:bg-gray-100 whitespace-nowrap flex items-center gap-1"
      >
        ↓ {label || "Exportar"} <span className="text-xs text-gray-400">▾</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[140px]">
          {options.map((opt, i) => (
            <button
              key={opt.label}
              onClick={() => { opt.onClick(); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${i === 0 ? "rounded-t-lg" : ""} ${i === options.length - 1 ? "rounded-b-lg" : ""} ${i > 0 ? "border-t border-gray-100" : ""}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ConfirmButton({ onClick, children, className, title }) {
  return (
    <button
      onClick={() => { if (confirm("Tens a certeza?")) onClick(); }}
      className={className}
      title={title}
    >
      {children}
    </button>
  );
}

export const isOutros = (name) => name.trim().toLowerCase() === "outros";

export function getStats(naipes) {
  let total = 0, conf = 0, pend = 0, ref = 0, outros = 0;
  for (const n of naipes) {
    if (isOutros(n.name)) { outros += n.musicians.length; continue; }
    for (const m of n.musicians) {
      total++;
      if (m.status === "confirmado") conf++; else pend++;
      if (m.reforco) ref++;
    }
  }
  return { total, conf, pend, ref, plantilla: total - ref, outros };
}

export function flatMusicians(naipes) {
  const list = [];
  let num = 1;
  for (const n of naipes) for (const m of n.musicians) {
    list.push({ ...m, naipe: n.name, globalNum: num++ });
  }
  return list;
}

export function getReforcoMusicians(naipes) {
  const list = [];
  for (const n of naipes) {
    for (const m of n.musicians) {
      if (m.reforco) list.push({ ...m, naipe: n.name });
    }
  }
  return list;
}

export function currency(val) {
  const n = Number(val);
  return isNaN(n) ? "0,00 €" : n.toFixed(2).replace(".", ",") + " €";
}