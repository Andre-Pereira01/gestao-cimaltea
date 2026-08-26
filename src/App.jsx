import { useState, useEffect, useRef, useCallback } from "react";
import { loadFromCloud, saveToCloud } from "./supabase.js";

const uid = () => Math.random().toString(36).slice(2, 10);

const INITIAL_NAIPES = [
  { id: uid(), name: "Flauta", musicians: [
    { id: uid(), name: "Alexandra Pedreira", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Ana Rita Barros", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Érica Fernandes", reforco: false, status: "pendente", comments: "Dia da defesa nacional, vai entregar declaração passada pela banda e pedir adiamento" },
    { id: uid(), name: "Evelyn Paula", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Gabriela Ferreira", reforco: false, status: "confirmado", comments: "" },
  ]},
  { id: uid(), name: "Oboé", musicians: [
    { id: uid(), name: "Rafael Figueiredo", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Gabriel Sousa", reforco: true, status: "pendente", comments: "Apenas apalavrado" },
    { id: uid(), name: "Lali Rosal", reforco: true, status: "pendente", comments: "Apenas apalavrado" },
  ]},
  { id: uid(), name: "Fagote", musicians: [
    { id: uid(), name: "Carolina Soares", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Sara Gonçalves", reforco: false, status: "confirmado", comments: "" },
  ]},
  { id: uid(), name: "Clarinete", musicians: [
    { id: uid(), name: "Ana Isabel Machado Rodrigues", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Ana Maria Silva", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Beatriz Caldas", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Carla Fernandes", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Daniela Fernandes", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "João Simões", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "João Valinho", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "João Carlos Abrantes Oterelo", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "José Miguel Pedreira Pereira", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Leonor Cardoso", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Lucas Pires", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Margarida Costa", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Mariana Moniz", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Rita Moreira", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Rodrigo Souto", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Sofia Viana", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Sara Pumar", reforco: true, status: "confirmado", comments: "" },
    { id: uid(), name: "Daniel Vieira", reforco: true, status: "confirmado", comments: "" },
  ]},
  { id: uid(), name: "Requinta", musicians: [
    { id: uid(), name: "Javier Pousa", reforco: true, status: "confirmado", comments: "" },
  ]},
  { id: uid(), name: "Clarinete Baixo", musicians: [
    { id: uid(), name: "Beatriz Duarte", reforco: false, status: "confirmado", comments: "" },
  ]},
  { id: uid(), name: "Saxofone Soprano", musicians: [
    { id: uid(), name: "Nerea Alonso Rodríguez", reforco: false, status: "pendente", comments: "Pede para ir sexta" },
  ]},
  { id: uid(), name: "Saxofone Alto", musicians: [
    { id: uid(), name: "Afonso Esteves", reforco: false, status: "pendente", comments: "Universidade" },
    { id: uid(), name: "Anna Paula", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Camila Costa", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Matilde Pires", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Vânia Fernandes", reforco: false, status: "pendente", comments: "Não deu justificação concreta após várias mensagens" },
    { id: uid(), name: "Prof. Saxofone Academia", reforco: true, status: "confirmado", comments: "" },
  ]},
  { id: uid(), name: "Saxofone Tenor", musicians: [
    { id: uid(), name: "Eduarda Simplício", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Filipe Pedreira", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Gabriel Afonso", reforco: false, status: "confirmado", comments: "" },
  ]},
  { id: uid(), name: "Saxofone Barítono", musicians: [
    { id: uid(), name: "Leandro Gonçalves", reforco: false, status: "confirmado", comments: "" },
  ]},
  { id: uid(), name: "Trompa", musicians: [
    { id: uid(), name: "Afonso Silva", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Francisco Lourenço", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "João Pereira", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Joel Santos", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Leonor Esteves", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Pedro Silva", reforco: false, status: "confirmado", comments: "" },
  ]},
  { id: uid(), name: "Trompete", musicians: [
    { id: uid(), name: "André Pereira", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "António Pereira Pereira", reforco: false, status: "pendente", comments: "Disponibilidade Setembro" },
    { id: uid(), name: "Hugo Gonçalves", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "João Lourenço", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Manuel Madarnás", reforco: true, status: "confirmado", comments: "" },
    { id: uid(), name: "Pedro Esteves", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Renato Pereira", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Tomás Lourenço", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Guilherme Tangil", reforco: true, status: "pendente", comments: "" },
  ]},
  { id: uid(), name: "Trombone", musicians: [
    { id: uid(), name: "António Afonso", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Eduardo Carvalho", reforco: true, status: "confirmado", comments: "" },
    { id: uid(), name: "João Cardoso", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Lucas Coelho", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Roberto Rodrigues", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Tomás Pereira", reforco: false, status: "confirmado", comments: "" },
  ]},
  { id: uid(), name: "Eufónio", musicians: [
    { id: uid(), name: "Helder Fernandes", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Bruno Ribeiro", reforco: true, status: "confirmado", comments: "" },
    { id: uid(), name: "Mariana Firmino", reforco: true, status: "confirmado", comments: "" },
  ]},
  { id: uid(), name: "Tuba", musicians: [
    { id: uid(), name: "Hugo Barreira", reforco: false, status: "pendente", comments: "Disponibilidade em Outubro" },
    { id: uid(), name: "João Silva", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Luís Nunes", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Ricardo Pereira", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Cesar Salceda", reforco: true, status: "confirmado", comments: "" },
  ]},
  { id: uid(), name: "Violoncelo", musicians: [
    { id: uid(), name: "Luciana Rodrigues", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Marco Machado", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Filha Cesar Salceda", reforco: true, status: "confirmado", comments: "" },
    { id: uid(), name: "Leonor Lemos", reforco: false, status: "confirmado", comments: "" },
  ]},
  { id: uid(), name: "Contrabaixo", musicians: [
    { id: uid(), name: "Carlos Passos", reforco: false, status: "confirmado", comments: "" },
  ]},
  { id: uid(), name: "Percussão", musicians: [
    { id: uid(), name: "Bruno Sanches", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Caio Rodrigues", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "David Ribeiro", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Diego Rodrigues", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Fábio Fernandes", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Francisco Simões", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Jorge Fernandes", reforco: false, status: "confirmado", comments: "" },
    { id: uid(), name: "Rodrigo Dias", reforco: false, status: "confirmado", comments: "" },
  ]},
];

const INITIAL_ROOMS = [];

// Storage via localStorage
function loadLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function saveLocal(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

function getStats(naipes) {
  let total = 0, conf = 0, pend = 0, ref = 0;
  for (const n of naipes) for (const m of n.musicians) {
    total++;
    if (m.status === "confirmado") conf++; else pend++;
    if (m.reforco) ref++;
  }
  return { total, conf, pend, ref, plantilla: total - ref };
}

function flatMusicians(naipes) {
  const list = [];
  let num = 1;
  for (const n of naipes) for (const m of n.musicians) {
    list.push({ ...m, naipe: n.name, globalNum: num++ });
  }
  return list;
}

function Badge({ children, color }) {
  const colors = {
    green: "bg-emerald-100 text-emerald-800",
    yellow: "bg-amber-100 text-amber-800",
    blue: "bg-sky-100 text-sky-800",
    gray: "bg-gray-100 text-gray-600",
    red: "bg-rose-100 text-rose-700",
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[color] || colors.gray}`}>{children}</span>;
}

function Stat({ label, value, sub }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 min-w-0">
      <div className="text-2xl font-semibold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-400">{sub}</div>}
    </div>
  );
}

function AddMusicianInline({ onAdd, onCancel }) {
  const [name, setName] = useState("");
  const [reforco, setReforco] = useState(false);
  const [status, setStatus] = useState("confirmado");
  const [comments, setComments] = useState("");
  const ref = useRef();
  useEffect(() => { ref.current?.focus(); }, []);

  const submit = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), reforco, status, comments: comments.trim() });
    setName(""); setReforco(false); setStatus("confirmado"); setComments("");
    ref.current?.focus();
  };

  return (
    <div className="px-4 py-3 bg-blue-50/50 border-t border-blue-100 space-y-2">
      <input ref={ref} className="w-full border rounded px-2 py-1 text-sm" placeholder="Nome" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} />
      <div className="flex items-center gap-4 text-xs">
        <label className="flex items-center gap-1 cursor-pointer">
          <input type="checkbox" checked={reforco} onChange={e => setReforco(e.target.checked)} /> Reforço
        </label>
        <select className="border rounded px-2 py-1 text-xs" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="confirmado">Confirmado</option>
          <option value="pendente">Pendente</option>
        </select>
      </div>
      <input className="w-full border rounded px-2 py-1 text-xs" placeholder="Comentários (opcional)" value={comments} onChange={e => setComments(e.target.value)} />
      <div className="flex gap-2">
        <button onClick={submit} className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Adicionar</button>
        <button onClick={onCancel} className="text-xs text-gray-500 px-2">Cancelar</button>
      </div>
    </div>
  );
}

function EditMusicianInline({ m, onSave, onCancel }) {
  const [name, setName] = useState(m.name);
  const [reforco, setReforco] = useState(m.reforco);
  const [status, setStatus] = useState(m.status);
  const [comments, setComments] = useState(m.comments);

  return (
    <div className="space-y-1.5">
      <input className="w-full border rounded px-2 py-1 text-sm" value={name} onChange={e => setName(e.target.value)} />
      <div className="flex items-center gap-4 text-xs">
        <label className="flex items-center gap-1 cursor-pointer">
          <input type="checkbox" checked={reforco} onChange={e => setReforco(e.target.checked)} /> Reforço
        </label>
        <select className="border rounded px-2 py-1 text-xs" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="confirmado">Confirmado</option>
          <option value="pendente">Pendente</option>
        </select>
      </div>
      <input className="w-full border rounded px-2 py-1 text-xs" placeholder="Comentários" value={comments} onChange={e => setComments(e.target.value)} />
      <div className="flex gap-2">
        <button onClick={() => onSave({ name: name.trim(), reforco, status, comments: comments.trim() })} className="text-xs bg-blue-600 text-white px-3 py-1 rounded">Guardar</button>
        <button onClick={onCancel} className="text-xs text-gray-500 px-2">Cancelar</button>
      </div>
    </div>
  );
}

function RosterTab({ naipes, setNaipes }) {
  const [editingMusician, setEditingMusician] = useState(null);
  const [addingToNaipe, setAddingToNaipe] = useState(null);
  const [newNaipeName, setNewNaipeName] = useState("");
  const [showAddNaipe, setShowAddNaipe] = useState(false);
  const [collapsed, setCollapsed] = useState({});
  const [search, setSearch] = useState("");
  const stats = getStats(naipes);

  const toggleCollapse = (id) => setCollapsed(p => ({ ...p, [id]: !p[id] }));

  const moveNaipe = (idx, dir) => {
    const next = idx + dir;
    if (next < 0 || next >= naipes.length) return;
    const arr = [...naipes];
    [arr[idx], arr[next]] = [arr[next], arr[idx]];
    setNaipes(arr);
  };

  const addNaipe = () => {
    if (!newNaipeName.trim()) return;
    setNaipes([...naipes, { id: uid(), name: newNaipeName.trim(), musicians: [] }]);
    setNewNaipeName("");
    setShowAddNaipe(false);
  };

  const removeNaipe = (id) => {
    if (!confirm("Remover este naipe e todos os músicos?")) return;
    setNaipes(naipes.filter(n => n.id !== id));
  };

  const renameNaipe = (id, newName) => {
    setNaipes(naipes.map(n => n.id === id ? { ...n, name: newName } : n));
  };

  const addMusician = (naipeId, musician) => {
    setNaipes(naipes.map(n => n.id === naipeId ? { ...n, musicians: [...n.musicians, { id: uid(), ...musician }] } : n));
    setAddingToNaipe(null);
  };

  const updateMusician = (naipeId, musicianId, updates) => {
    setNaipes(naipes.map(n => n.id === naipeId ? {
      ...n, musicians: n.musicians.map(m => m.id === musicianId ? { ...m, ...updates } : m)
    } : n));
  };

  const removeMusician = (naipeId, musicianId) => {
    setNaipes(naipes.map(n => n.id === naipeId ? {
      ...n, musicians: n.musicians.filter(m => m.id !== musicianId)
    } : n));
  };

  const moveMusicianInNaipe = (naipeId, idx, dir) => {
    setNaipes(naipes.map(n => {
      if (n.id !== naipeId) return n;
      const next = idx + dir;
      if (next < 0 || next >= n.musicians.length) return n;
      const arr = [...n.musicians];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return { ...n, musicians: arr };
    }));
  };

  let globalNum = 1;
  const searchLower = search.toLowerCase();
  const matchesSearch = (m) => !search || m.name.toLowerCase().includes(searchLower);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <Stat label="Total" value={stats.total} />
        <Stat label="Confirmados" value={stats.conf} />
        <Stat label="Pendentes" value={stats.pend} />
        <Stat label="Reforços" value={stats.ref} />
        <Stat label="Plantilla" value={stats.plantilla} sub="(sem reforços)" />
      </div>

      <div className="flex gap-2 items-center">
        <input
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Pesquisar músico..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button onClick={() => setShowAddNaipe(true)} className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap">
          + Naipe
        </button>
      </div>

      {showAddNaipe && (
        <div className="flex gap-2 items-center bg-blue-50 p-3 rounded-lg border border-blue-200">
          <input className="flex-1 border rounded px-3 py-1.5 text-sm" placeholder="Nome do naipe" value={newNaipeName} onChange={e => setNewNaipeName(e.target.value)} onKeyDown={e => e.key === "Enter" && addNaipe()} autoFocus />
          <button onClick={addNaipe} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">Adicionar</button>
          <button onClick={() => { setShowAddNaipe(false); setNewNaipeName(""); }} className="text-sm text-gray-500 px-2">✕</button>
        </div>
      )}

      {naipes.map((naipe, ni) => {
        const naipeRef = naipe.musicians.filter(m => m.reforco).length;
        const naipeStartNum = globalNum;
        const visible = naipe.musicians.filter(matchesSearch);
        const nums = {};
        naipe.musicians.forEach((m, i) => { nums[m.id] = globalNum + i; });
        globalNum += naipe.musicians.length;

        return (
          <div key={naipe.id} className="border border-gray-200 rounded-lg bg-white overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200 cursor-pointer" onClick={() => toggleCollapse(naipe.id)}>
              <span className="text-gray-400 text-xs select-none">{collapsed[naipe.id] ? "▶" : "▼"}</span>
              <span className="font-semibold text-gray-800 text-sm flex-1">{naipe.name}</span>
              <span className="text-xs text-gray-500">{naipe.musicians.length} músico{naipe.musicians.length !== 1 ? "s" : ""}</span>
              {naipeRef > 0 && <Badge color="blue">{naipeRef} ref.</Badge>}
              <span className="text-xs text-gray-400">#{naipeStartNum}–{naipeStartNum + naipe.musicians.length - 1}</span>
              <div className="flex gap-0.5 ml-1" onClick={e => e.stopPropagation()}>
                <button onClick={() => moveNaipe(ni, -1)} className="text-gray-400 hover:text-gray-700 text-xs px-1" title="Mover acima">↑</button>
                <button onClick={() => moveNaipe(ni, 1)} className="text-gray-400 hover:text-gray-700 text-xs px-1" title="Mover abaixo">↓</button>
                <button onClick={() => { const n = prompt("Renomear naipe:", naipe.name); if (n) renameNaipe(naipe.id, n); }} className="text-gray-400 hover:text-blue-600 text-xs px-1" title="Renomear">✎</button>
                <button onClick={() => removeNaipe(naipe.id)} className="text-gray-400 hover:text-red-600 text-xs px-1" title="Remover naipe">✕</button>
              </div>
            </div>

            {!collapsed[naipe.id] && (
              <div>
                {visible.length === 0 && naipe.musicians.length > 0 && search && (
                  <div className="px-4 py-3 text-xs text-gray-400 italic">Nenhum resultado para a pesquisa</div>
                )}
                {naipe.musicians.length === 0 && (
                  <div className="px-4 py-3 text-xs text-gray-400 italic">Sem músicos</div>
                )}
                {naipe.musicians.map((m, mi) => {
                  if (!matchesSearch(m)) return null;
                  const isEditing = editingMusician === m.id;
                  return (
                    <div key={m.id} className={`flex items-start gap-2 px-4 py-2 border-b border-gray-100 last:border-b-0 text-sm ${m.status === "pendente" ? "bg-amber-50/40" : ""}`}>
                      <span className="text-gray-400 text-xs w-7 text-right flex-shrink-0 pt-0.5 font-mono">{nums[m.id]}</span>
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <EditMusicianInline m={m} onSave={(updates) => { updateMusician(naipe.id, m.id, updates); setEditingMusician(null); }} onCancel={() => setEditingMusician(null)} />
                        ) : (
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`${m.status === "pendente" ? "text-gray-500 italic" : "text-gray-800"}`}>{m.name}</span>
                              {m.reforco && <Badge color="blue">reforço</Badge>}
                              {m.status === "pendente" && <Badge color="yellow">pendente</Badge>}
                              {m.status === "confirmado" && <Badge color="green">✓</Badge>}
                            </div>
                            {m.comments && <div className="text-xs text-gray-400 mt-0.5">{m.comments}</div>}
                          </div>
                        )}
                      </div>
                      {!isEditing && (
                        <div className="flex gap-0.5 flex-shrink-0 pt-0.5">
                          <button onClick={() => moveMusicianInNaipe(naipe.id, mi, -1)} className="text-gray-300 hover:text-gray-600 text-xs px-0.5">↑</button>
                          <button onClick={() => moveMusicianInNaipe(naipe.id, mi, 1)} className="text-gray-300 hover:text-gray-600 text-xs px-0.5">↓</button>
                          <button onClick={() => setEditingMusician(m.id)} className="text-gray-300 hover:text-blue-600 text-xs px-0.5">✎</button>
                          <button onClick={() => removeMusician(naipe.id, m.id)} className="text-gray-300 hover:text-red-600 text-xs px-0.5">✕</button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {addingToNaipe === naipe.id ? (
                  <AddMusicianInline onAdd={(m) => addMusician(naipe.id, m)} onCancel={() => setAddingToNaipe(null)} />
                ) : (
                  <button onClick={() => setAddingToNaipe(naipe.id)} className="w-full text-left px-4 py-2 text-xs text-blue-500 hover:bg-blue-50">+ Adicionar músico</button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function RoomsTab({ naipes, rooms, setRooms }) {
  const [selectedSize, setSelectedSize] = useState(4);
  const [selectedMusician, setSelectedMusician] = useState(null);

  const allMusicians = flatMusicians(naipes);
  const assignedIds = new Set(rooms.flatMap(r => r.musicians));
  const unassigned = allMusicians.filter(m => !assignedIds.has(m.id));

  const addRoom = () => {
    setRooms([...rooms, { id: uid(), label: `Quarto ${rooms.length + 1}`, size: selectedSize, musicians: [] }]);
  };
  const removeRoom = (roomId) => {
    setRooms(rooms.filter(r => r.id !== roomId));
  };
  const renameRoom = (roomId, label) => {
    setRooms(rooms.map(r => r.id === roomId ? { ...r, label } : r));
  };
  const assignToRoom = (roomId, musicianId) => {
    setRooms(rooms.map(r => {
      if (r.id !== roomId) return r;
      if (r.musicians.length >= r.size) return r;
      if (r.musicians.includes(musicianId)) return r;
      return { ...r, musicians: [...r.musicians, musicianId] };
    }));
    setSelectedMusician(null);
  };
  const removeFromRoom = (roomId, musicianId) => {
    setRooms(rooms.map(r => r.id === roomId ? { ...r, musicians: r.musicians.filter(id => id !== musicianId) } : r));
  };
  const getMusicianById = (id) => allMusicians.find(m => m.id === id);

  const totalBeds = rooms.reduce((s, r) => s + r.size, 0);
  const totalOccupied = rooms.reduce((s, r) => s + r.musicians.length, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Stat label="Quartos" value={rooms.length} />
        <Stat label="Camas" value={totalBeds} />
        <Stat label="Atribuídos" value={totalOccupied} />
        <Stat label="Por atribuir" value={unassigned.length} />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Novo quarto de</span>
        {[1, 2, 3, 4].map(s => (
          <button key={s} onClick={() => setSelectedSize(s)} className={`w-8 h-8 rounded-lg text-sm font-medium border ${selectedSize === s ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"}`}>{s}</button>
        ))}
        <button onClick={addRoom} className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-700 ml-2">+ Quarto</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 font-semibold text-sm text-gray-700">Por atribuir ({unassigned.length})</div>
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
              {unassigned.map(m => (
                <div key={m.id} className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 flex items-center gap-2 ${selectedMusician === m.id ? "bg-blue-100" : ""}`} onClick={() => setSelectedMusician(selectedMusician === m.id ? null : m.id)}>
                  <span className="text-gray-400 text-xs font-mono w-6 text-right">{m.globalNum}</span>
                  <span className="flex-1">{m.name}</span>
                  <span className="text-xs text-gray-400">{m.naipe}</span>
                  {m.reforco && <Badge color="blue">R</Badge>}
                </div>
              ))}
              {unassigned.length === 0 && <div className="px-4 py-6 text-xs text-gray-400 text-center">Todos atribuídos</div>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-3">
          {rooms.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-12 border border-dashed border-gray-300 rounded-lg">Nenhum quarto criado.</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rooms.map(room => {
              const free = room.size - room.musicians.length;
              return (
                <div key={room.id} className="border border-gray-200 rounded-lg bg-white">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
                    <span className="text-sm font-semibold text-gray-700 flex-1">{room.label}</span>
                    <span className="text-xs text-gray-400">{room.musicians.length}/{room.size}</span>
                    <button onClick={() => { const n = prompt("Renomear:", room.label); if (n) renameRoom(room.id, n); }} className="text-gray-400 hover:text-blue-600 text-xs">✎</button>
                    <button onClick={() => removeRoom(room.id)} className="text-gray-400 hover:text-red-600 text-xs">✕</button>
                  </div>
                  <div className="p-2 space-y-1 min-h-[60px]">
                    {room.musicians.map(mid => {
                      const m = getMusicianById(mid);
                      if (!m) return null;
                      return (
                        <div key={mid} className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded text-sm">
                          <span className="flex-1 truncate">{m.name}</span>
                          <span className="text-xs text-gray-400">{m.naipe}</span>
                          <button onClick={() => removeFromRoom(room.id, mid)} className="text-gray-400 hover:text-red-500 text-xs">✕</button>
                        </div>
                      );
                    })}
                    {Array.from({ length: free }).map((_, i) => (
                      <div key={`empty-${i}`} className={`px-2 py-1 border border-dashed rounded text-xs text-center ${selectedMusician ? "border-blue-400 text-blue-500 cursor-pointer hover:bg-blue-50" : "border-gray-200 text-gray-300"}`} onClick={() => selectedMusician && assignToRoom(room.id, selectedMusician)}>
                        {selectedMusician ? "Clica para atribuir" : "Vago"}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook: debounce save to Supabase (2s after last change)
function useCloudSync(key, data) {
  const timer = useRef(null);
  useEffect(() => {
    if (data === null) return;
    saveLocal(key, data);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => saveToCloud(key, data), 2000);
    return () => clearTimeout(timer.current);
  }, [key, data]);
}

export default function App() {
  const [naipes, setNaipes] = useState(null);
  const [rooms, setRooms] = useState(null);
  const [tab, setTab] = useState("roster");
  const [syncStatus, setSyncStatus] = useState("loading");

  // Load: cloud first, localStorage fallback, initial data last resort
  useEffect(() => {
    (async () => {
      setSyncStatus("loading");
      const cloudNaipes = await loadFromCloud("naipes");
      const cloudRooms = await loadFromCloud("rooms");

      if (cloudNaipes) {
        setNaipes(cloudNaipes);
        setRooms(cloudRooms || []);
        saveLocal("cimaltea-naipes", cloudNaipes);
        saveLocal("cimaltea-rooms", cloudRooms || []);
        setSyncStatus("cloud");
      } else {
        setNaipes(loadLocal("cimaltea-naipes", INITIAL_NAIPES));
        setRooms(loadLocal("cimaltea-rooms", INITIAL_ROOMS));
        setSyncStatus("local");
      }
    })();
  }, []);

  useCloudSync("naipes", naipes);
  useCloudSync("rooms", rooms);

  if (!naipes || !rooms) {
    return <div className="flex items-center justify-center h-screen text-gray-400">A carregar...</div>;
  }

  const stats = getStats(naipes);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">CIMALTEA 2026 — Gestão</h1>
            <p className="text-xs text-gray-400 mt-0.5">Banda Musical de Monção · 51.º Certamen Internacional de Música "Vila d'Altea"</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${syncStatus === "cloud" ? "bg-emerald-100 text-emerald-700" : syncStatus === "local" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
            {syncStatus === "cloud" ? "☁ Sincronizado" : syncStatus === "local" ? "💾 Apenas local" : "…"}
          </span>
        </div>
      </div>
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="max-w-5xl mx-auto flex gap-0">
          <button onClick={() => setTab("roster")} className={`px-4 py-3 text-sm font-medium border-b-2 ${tab === "roster" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>Músicos ({stats.total})</button>
          <button onClick={() => setTab("rooms")} className={`px-4 py-3 text-sm font-medium border-b-2 ${tab === "rooms" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>Quartos</button>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {tab === "roster" && <RosterTab naipes={naipes} setNaipes={setNaipes} />}
        {tab === "rooms" && <RoomsTab naipes={naipes} rooms={rooms} setRooms={setRooms} />}
      </div>
      <div className="max-w-5xl mx-auto px-4 pb-8 text-center">
        <button onClick={() => { if (confirm("Repor todos os dados para o estado inicial?")) { setNaipes(INITIAL_NAIPES); setRooms(INITIAL_ROOMS); } }} className="text-xs text-gray-400 hover:text-red-500">Repor dados iniciais</button>
      </div>
    </div>
  );
}
