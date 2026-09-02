import { useState, useEffect, useRef, useCallback } from "react";
import { loadFromCloud, saveToCloud } from "./supabase.js";
import { exportRosterPDF, exportRoomsPDF } from "./pdf-export.js";
import { exportRosterDOCX, exportRoomsDOCX } from "./docx-export.js";
import { exportRosterXLSX } from "./xlsx-export.js";
import {
  uid, Badge, Stat, ExportDropdown, isOutros, getStats,
  flatMusicians, getReforcoMusicians, currency,
} from "./components.jsx";
import {
  getStoredHash, setPassword as savePassword, verifyPassword,
  isSessionActive, setSession, clearSession,
} from "./auth.js";

// ════════════════════════════════════════════════════════════════════
// DADOS INICIAIS
// ════════════════════════════════════════════════════════════════════

const INITIAL_NAIPES = [
  { id: uid(), name: "Flauta", musicians: [
    { id: uid(), name: "Alexandra Pedreira", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Ana Rita Barros", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Érica Fernandes", reforco: false, status: "pendente", comments: "Dia da defesa nacional, vai entregar declaração passada pela banda e pedir adiamento", dni: "" },
    { id: uid(), name: "Evelyn Paula", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Gabriela Ferreira", reforco: false, status: "confirmado", comments: "", dni: "" },
  ]},
  { id: uid(), name: "Oboé", musicians: [
    { id: uid(), name: "Rafael Figueiredo", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Gabriel Sousa", reforco: true, status: "pendente", comments: "Apenas apalavrado", dni: "" },
    { id: uid(), name: "Lali Rosal", reforco: true, status: "pendente", comments: "Apenas apalavrado", dni: "" },
  ]},
  { id: uid(), name: "Fagote", musicians: [
    { id: uid(), name: "Carolina Soares", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Sara Gonçalves", reforco: false, status: "confirmado", comments: "", dni: "" },
  ]},
  { id: uid(), name: "Clarinete", musicians: [
    { id: uid(), name: "Ana Isabel Machado Rodrigues", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Ana Maria Silva", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Beatriz Caldas", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Carla Fernandes", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Daniela Fernandes", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "João Simões", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "João Valinho", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "João Carlos Abrantes Oterelo", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "José Miguel Pedreira Pereira", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Leonor Cardoso", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Lucas Pires", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Margarida Costa", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Mariana Moniz", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Rita Moreira", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Rodrigo Souto", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Sofia Viana", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Sara Pumar", reforco: true, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Daniel Vieira", reforco: true, status: "confirmado", comments: "", dni: "" },
  ]},
  { id: uid(), name: "Requinta", musicians: [
    { id: uid(), name: "Javier Pousa", reforco: true, status: "confirmado", comments: "", dni: "" },
  ]},
  { id: uid(), name: "Clarinete Baixo", musicians: [
    { id: uid(), name: "Beatriz Duarte", reforco: false, status: "confirmado", comments: "", dni: "" },
  ]},
  { id: uid(), name: "Saxofone Soprano", musicians: [
    { id: uid(), name: "Nerea Alonso Rodríguez", reforco: false, status: "pendente", comments: "Pede para ir sexta", dni: "" },
  ]},
  { id: uid(), name: "Saxofone Alto", musicians: [
    { id: uid(), name: "Afonso Esteves", reforco: false, status: "pendente", comments: "Universidade", dni: "" },
    { id: uid(), name: "Anna Paula", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Camila Costa", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Matilde Pires", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Vânia Fernandes", reforco: false, status: "pendente", comments: "Não deu justificação concreta após várias mensagens", dni: "" },
    { id: uid(), name: "Prof. Saxofone Academia", reforco: true, status: "confirmado", comments: "", dni: "" },
  ]},
  { id: uid(), name: "Saxofone Tenor", musicians: [
    { id: uid(), name: "Eduarda Simplício", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Filipe Pedreira", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Gabriel Afonso", reforco: false, status: "confirmado", comments: "", dni: "" },
  ]},
  { id: uid(), name: "Saxofone Barítono", musicians: [
    { id: uid(), name: "Leandro Gonçalves", reforco: false, status: "confirmado", comments: "", dni: "" },
  ]},
  { id: uid(), name: "Trompa", musicians: [
    { id: uid(), name: "Afonso Silva", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Francisco Lourenço", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "João Pereira", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Joel Santos", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Leonor Esteves", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Pedro Silva", reforco: false, status: "confirmado", comments: "", dni: "" },
  ]},
  { id: uid(), name: "Trompete", musicians: [
    { id: uid(), name: "André Pereira", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "António Pereira Pereira", reforco: false, status: "pendente", comments: "Disponibilidade Setembro", dni: "" },
    { id: uid(), name: "Hugo Gonçalves", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "João Lourenço", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Manuel Madarnás", reforco: true, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Pedro Esteves", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Renato Pereira", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Tomás Lourenço", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Guilherme Tangil", reforco: true, status: "pendente", comments: "", dni: "" },
  ]},
  { id: uid(), name: "Trombone", musicians: [
    { id: uid(), name: "António Afonso", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Eduardo Carvalho", reforco: true, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "João Cardoso", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Lucas Coelho", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Roberto Rodrigues", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Tomás Pereira", reforco: false, status: "confirmado", comments: "", dni: "" },
  ]},
  { id: uid(), name: "Eufónio", musicians: [
    { id: uid(), name: "Helder Fernandes", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Bruno Ribeiro", reforco: true, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Mariana Firmino", reforco: true, status: "confirmado", comments: "", dni: "" },
  ]},
  { id: uid(), name: "Tuba", musicians: [
    { id: uid(), name: "Hugo Barreira", reforco: false, status: "pendente", comments: "Disponibilidade em Outubro", dni: "" },
    { id: uid(), name: "João Silva", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Luís Nunes", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Ricardo Pereira", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Cesar Salceda", reforco: true, status: "confirmado", comments: "", dni: "" },
  ]},
  { id: uid(), name: "Violoncelo", musicians: [
    { id: uid(), name: "Luciana Rodrigues", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Marco Machado", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Filha Cesar Salceda", reforco: true, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Leonor Lemos", reforco: false, status: "confirmado", comments: "", dni: "" },
  ]},
  { id: uid(), name: "Contrabaixo", musicians: [
    { id: uid(), name: "Carlos Passos", reforco: false, status: "confirmado", comments: "", dni: "" },
  ]},
  { id: uid(), name: "Percussão", musicians: [
    { id: uid(), name: "Bruno Sanches", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Caio Rodrigues", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "David Ribeiro", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Diego Rodrigues", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Fábio Fernandes", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Francisco Simões", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Jorge Fernandes", reforco: false, status: "confirmado", comments: "", dni: "" },
    { id: uid(), name: "Rodrigo Dias", reforco: false, status: "confirmado", comments: "", dni: "" },
  ]},
];

const INITIAL_ROOMS = [];

const INITIAL_PAYMENTS = [];

const INITIAL_ACCOMMODATION = [];

const INITIAL_DOCUMENTS = [
  { id: uid(), title: "Inventário de dados (formulário online CIMALTEA)", deadline: "2026-09-15", status: "pendente", comments: "" },
  { id: uid(), title: "Listado de músicos (.xlsx) — nome, DNI, instrumento, solo, reforço", deadline: "2026-09-15", status: "pendente", comments: "Modificável até 25/11" },
  { id: uid(), title: "Certificação do listado de músicos (Secretário + Presidente)", deadline: "2026-09-15", status: "pendente", comments: "Atualizável até 28/11. Necessário por sermos banda estrangeira (ponto 6.1.b)" },
  { id: uid(), title: "4 exemplares da partitura da obra livre (O Patrulheiro da GNR)", deadline: "2026-09-15", status: "pendente", comments: "" },
  { id: uid(), title: "1 exemplar da partitura/guião da composição curta de apresentação", deadline: "2026-09-15", status: "pendente", comments: "" },
  { id: uid(), title: "Vídeo de apresentação da banda (max. 3 min, AVI/MP4 ou link)", deadline: "2026-09-15", status: "pendente", comments: "" },
  { id: uid(), title: "Fotografia recente da banda e do maestro (JPG ou link)", deadline: "2026-09-15", status: "pendente", comments: "" },
  { id: uid(), title: "Historial da banda (.doc/.txt, max 1200 caracteres)", deadline: "2026-09-15", status: "pendente", comments: "" },
  { id: uid(), title: "Curriculum do maestro (.doc/.txt, max 1200 caracteres)", deadline: "2026-09-15", status: "pendente", comments: "" },
  { id: uid(), title: "Justificante de pagamento da fiança (600€ — CaixaBank)", deadline: "2026-05-15", status: "pendente", comments: "IBAN: ES46 2100 2611 3413 0028 5423" },
];

const INITIAL_TRANSPORT = [];

const INITIAL_BALANCE = [];

// Migrate musician fields added in later versions
function migrateMusician(m) {
  return { dni: "", solo: false, email: "", phone: "", ...m };
}
function migrateNaipes(naipes) {
  return naipes.map(n => ({ ...n, musicians: n.musicians.map(migrateMusician) }));
}

// ════════════════════════════════════════════════════════════════════
// LOCAL STORAGE HELPERS
// ════════════════════════════════════════════════════════════════════

function loadLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function saveLocal(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ════════════════════════════════════════════════════════════════════
// ECRÃ DE LOGIN
// ════════════════════════════════════════════════════════════════════

function LoginScreen({ onAuth }) {
  const [mode, setMode] = useState("checking"); // checking | login | setup
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    (async () => {
    const result = await getStoredHash();

        if (!result.ok) {
          setError("Não foi possível verificar a password no cloud.");
          setMode("login");
        } else {
          setMode(result.hash ? "login" : "setup");
        }
      setTimeout(() => inputRef.current?.focus(), 100);
    })();
  }, []);

  const handleLogin = async () => {
    if (!password) return;
    setLoading(true);
    setError("");
    const result = await verifyPassword(password);

      if (result.ok && result.valid) {
        setSession();
        onAuth();
      } else if (!result.ok) {
        setError("Erro ao validar a password.");
      } else {
        setError("Password incorreta.");
        setPassword("");
      }
    setLoading(false);
  };

  const handleSetup = async () => {
    if (password.length < 4) {
      setError("Mínimo 4 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As passwords não coincidem.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await savePassword(password);
      if (!result.ok) {
        setError(result.error || "Não foi possível gravar a password.");
        return;
      }
      setSession();
      onAuth();
    } finally {
      setLoading(false);
    }
  };

  if (mode === "checking") {
    return <div className="flex items-center justify-center h-screen text-gray-400">A verificar...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-lg font-bold text-gray-900 text-center mb-1">CIMALTEA 2026</h1>
          <p className="text-xs text-gray-400 text-center mb-6">Banda Musical de Monção — Gestão</p>

          {mode === "setup" && (
            <>
              <p className="text-sm text-gray-600 mb-4">Primeira utilização. Define uma password de acesso:</p>
              <input
                ref={inputRef}
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="password"
                placeholder="Confirmar password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSetup()}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={handleSetup}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "..." : "Definir password e entrar"}
              </button>
            </>
          )}

          {mode === "login" && (
            <>
              <input
                ref={inputRef}
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "..." : "Entrar"}
              </button>
            </>
          )}

          {error && <p className="text-red-500 text-xs mt-3 text-center">{error}</p>}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// INLINE FORMS (Roster)
// ════════════════════════════════════════════════════════════════════

function AddMusicianInline({ onAdd, onCancel }) {
  const [name, setName] = useState("");
  const [reforco, setReforco] = useState(false);
  const [solo, setSolo] = useState(false);
  const [status, setStatus] = useState("confirmado");
  const [comments, setComments] = useState("");
  const [dni, setDni] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const ref = useRef();
  useEffect(() => { ref.current?.focus(); }, []);

  const submit = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), reforco, solo, status, comments: comments.trim(), dni: dni.trim(), email: email.trim(), phone: phone.trim() });
    setName(""); setReforco(false); setSolo(false); setStatus("confirmado"); setComments(""); setDni(""); setEmail(""); setPhone("");
    ref.current?.focus();
  };

  return (
    <div className="px-4 py-3 bg-blue-50/50 border-t border-blue-100 space-y-2">
      <input ref={ref} className="w-full border rounded px-2 py-1 text-sm" placeholder="Nome" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} />
      <div className="flex items-center gap-4 text-xs flex-wrap">
        <label className="flex items-center gap-1 cursor-pointer">
          <input type="checkbox" checked={reforco} onChange={e => setReforco(e.target.checked)} /> Reforço
        </label>
        <label className="flex items-center gap-1 cursor-pointer">
          <input type="checkbox" checked={solo} onChange={e => setSolo(e.target.checked)} /> Solo
        </label>
        <select className="border rounded px-2 py-1 text-xs" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="confirmado">Confirmado</option>
          <option value="pendente">Pendente</option>
        </select>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <input className="border rounded px-2 py-1 text-xs" placeholder="DNI / CC" value={dni} onChange={e => setDni(e.target.value)} />
        <input className="border rounded px-2 py-1 text-xs" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="border rounded px-2 py-1 text-xs" placeholder="Telefone" value={phone} onChange={e => setPhone(e.target.value)} />
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
  const [solo, setSolo] = useState(m.solo || false);
  const [status, setStatus] = useState(m.status);
  const [comments, setComments] = useState(m.comments);
  const [dni, setDni] = useState(m.dni || "");
  const [email, setEmail] = useState(m.email || "");
  const [phone, setPhone] = useState(m.phone || "");

  return (
    <div className="space-y-1.5">
      <input className="w-full border rounded px-2 py-1 text-sm" value={name} onChange={e => setName(e.target.value)} />
      <div className="flex items-center gap-4 text-xs flex-wrap">
        <label className="flex items-center gap-1 cursor-pointer">
          <input type="checkbox" checked={reforco} onChange={e => setReforco(e.target.checked)} /> Reforço
        </label>
        <label className="flex items-center gap-1 cursor-pointer">
          <input type="checkbox" checked={solo} onChange={e => setSolo(e.target.checked)} /> Solo
        </label>
        <select className="border rounded px-2 py-1 text-xs" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="confirmado">Confirmado</option>
          <option value="pendente">Pendente</option>
        </select>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <input className="border rounded px-2 py-1 text-xs" placeholder="DNI / CC" value={dni} onChange={e => setDni(e.target.value)} />
        <input className="border rounded px-2 py-1 text-xs" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="border rounded px-2 py-1 text-xs" placeholder="Telefone" value={phone} onChange={e => setPhone(e.target.value)} />
      </div>
      <input className="w-full border rounded px-2 py-1 text-xs" placeholder="Comentários" value={comments} onChange={e => setComments(e.target.value)} />
      <div className="flex gap-2">
        <button onClick={() => onSave({ name: name.trim(), reforco, solo, status, comments: comments.trim(), dni: dni.trim(), email: email.trim(), phone: phone.trim() })} className="text-xs bg-blue-600 text-white px-3 py-1 rounded">Guardar</button>
        <button onClick={onCancel} className="text-xs text-gray-500 px-2">Cancelar</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SEPARADOR: MÚSICOS (Roster)
// ════════════════════════════════════════════════════════════════════

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

  // Count DNIs and solos filled
  const allMusicMusicians = naipes.filter(n => !isOutros(n.name)).flatMap(n => n.musicians);
  const dniCount = allMusicMusicians.filter(m => m.dni).length;
  const soloCount = allMusicMusicians.filter(m => m.solo).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
        <Stat label="Músicos" value={stats.total} />
        <Stat label="Confirmados" value={stats.conf} />
        <Stat label="Pendentes" value={stats.pend} />
        <Stat label="Reforços" value={stats.ref} />
        <Stat label="Plantilla" value={stats.plantilla} sub="(sem reforços)" />
        <Stat label="Solos" value={soloCount} />
        <Stat label="DNI/CC" value={`${dniCount}/${stats.total}`} sub="preenchidos" />
      </div>

      <div className="flex gap-2 items-center">
        <input
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Pesquisar músico..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <ExportDropdown options={[
          { label: "PDF", onClick: () => exportRosterPDF(naipes) },
          { label: "Word (.docx)", onClick: () => exportRosterDOCX(naipes) },
          { label: "Excel CIMALTEA (.xlsx)", onClick: () => exportRosterXLSX(naipes) },
        ]} />
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
                              {m.solo && <Badge color="purple">solo</Badge>}
                              {m.status === "pendente" && <Badge color="yellow">pendente</Badge>}
                              {m.status === "confirmado" && <Badge color="green">✓</Badge>}
                              {m.dni && <span className="text-xs text-gray-400 font-mono">{m.dni}</span>}
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

// ════════════════════════════════════════════════════════════════════
// SEPARADOR: QUARTOS (Rooms)
// ════════════════════════════════════════════════════════════════════

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

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-600">Novo quarto de</span>
        {[1, 2, 3, 4].map(s => (
          <button key={s} onClick={() => setSelectedSize(s)} className={`w-8 h-8 rounded-lg text-sm font-medium border ${selectedSize === s ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"}`}>{s}</button>
        ))}
        <button onClick={addRoom} className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-700 ml-2">+ Quarto</button>
        <div className="ml-auto">
          <ExportDropdown options={[
            { label: "PDF", onClick: () => exportRoomsPDF(naipes, rooms) },
            { label: "Word (.docx)", onClick: () => exportRoomsDOCX(naipes, rooms) },
          ]} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 lg:sticky lg:top-4 self-start">
          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 font-semibold text-sm text-gray-700">Por atribuir ({unassigned.length})</div>
            <div className="max-h-[calc(100vh-8rem)] overflow-y-auto divide-y divide-gray-100">
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

// ════════════════════════════════════════════════════════════════════
// SEPARADOR: PAGAMENTOS A REFORÇOS
// ════════════════════════════════════════════════════════════════════

function PaymentsTab({ naipes, payments, setPayments }) {
  const [editing, setEditing] = useState(null);
  const reforcos = getReforcoMusicians(naipes);

  const addPayment = () => {
    const p = {
      id: uid(),
      musicianName: "",
      naipe: "",
      feePerRehearsal: 0,
      numRehearsals: 0,
      performanceFee: 0,
      travelExpenses: 0,
      fuelKm: 0,
      fuelRate: 0.10,
      mealExpenses: 0,
      otherExpenses: 0,
      otherDescription: "",
      paymentStatus: "pendente",
      paymentMethod: "",
      comments: "",
    };
    setPayments([...payments, p]);
    setEditing(p.id);
  };

  const addFromReforco = (r) => {
    // Check if already exists
    if (payments.some(p => p.musicianName === r.name && p.naipe === r.naipe)) {
      alert("Este reforço já tem um registo de pagamento.");
      return;
    }
    const p = {
      id: uid(),
      musicianName: r.name,
      naipe: r.naipe,
      feePerRehearsal: 0,
      numRehearsals: 0,
      performanceFee: 0,
      travelExpenses: 0,
      fuelKm: 0,
      fuelRate: 0.10,
      mealExpenses: 0,
      otherExpenses: 0,
      otherDescription: "",
      paymentStatus: "pendente",
      paymentMethod: "",
      comments: "",
    };
    setPayments([...payments, p]);
    setEditing(p.id);
  };

  const updatePayment = (id, field, value) => {
    setPayments(payments.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removePayment = (id) => {
    if (!confirm("Remover este registo de pagamento?")) return;
    setPayments(payments.filter(p => p.id !== id));
    if (editing === id) setEditing(null);
  };

  const calcTotal = (p) => {
    const rehearsals = (Number(p.feePerRehearsal) || 0) * (Number(p.numRehearsals) || 0);
    const performance = Number(p.performanceFee) || 0;
    const travel = Number(p.travelExpenses) || 0;
    const fuel = (Number(p.fuelKm) || 0) * (Number(p.fuelRate) || 0);
    const meals = Number(p.mealExpenses) || 0;
    const other = Number(p.otherExpenses) || 0;
    return rehearsals + performance + travel + fuel + meals + other;
  };

  const grandTotal = payments.reduce((s, p) => s + calcTotal(p), 0);
  const paidTotal = payments.filter(p => p.paymentStatus === "pago").reduce((s, p) => s + calcTotal(p), 0);
  const pendingTotal = grandTotal - paidTotal;

  // Reforços not yet with payment record
  const existingNames = new Set(payments.map(p => `${p.musicianName}||${p.naipe}`));
  const missingReforcos = reforcos.filter(r => !existingNames.has(`${r.name}||${r.naipe}`));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Stat label="Reforços" value={reforcos.length} />
        <Stat label="Total estimado" value={currency(grandTotal)} />
        <Stat label="Pago" value={currency(paidTotal)} />
        <Stat label="Pendente" value={currency(pendingTotal)} />
      </div>

      {missingReforcos.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-700 font-medium mb-2">Reforços sem registo de pagamento:</p>
          <div className="flex flex-wrap gap-1">
            {missingReforcos.map(r => (
              <button
                key={r.id}
                onClick={() => addFromReforco(r)}
                className="text-xs bg-white border border-amber-300 text-amber-800 px-2 py-1 rounded hover:bg-amber-100"
              >
                + {r.name} ({r.naipe})
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={addPayment} className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700">
          + Registo manual
        </button>
      </div>

      {payments.length === 0 && (
        <div className="text-center text-gray-400 text-sm py-12 border border-dashed border-gray-300 rounded-lg">
          Nenhum registo de pagamento. Adiciona a partir dos reforços acima ou manualmente.
        </div>
      )}

      <div className="space-y-3">
        {payments.map(p => {
          const total = calcTotal(p);
          const isEditing = editing === p.id;

          return (
            <div key={p.id} className="border border-gray-200 rounded-lg bg-white overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
                <span className="font-semibold text-gray-800 text-sm flex-1">
                  {p.musicianName || "Sem nome"} {p.naipe && <span className="text-gray-400 font-normal">({p.naipe})</span>}
                </span>
                <span className="text-sm font-semibold text-gray-900">{currency(total)}</span>
                <Badge color={p.paymentStatus === "pago" ? "green" : p.paymentStatus === "parcial" ? "yellow" : "red"}>
                  {p.paymentStatus}
                </Badge>
                <button onClick={() => setEditing(isEditing ? null : p.id)} className="text-gray-400 hover:text-blue-600 text-xs px-1">
                  {isEditing ? "▲" : "▼"}
                </button>
                <button onClick={() => removePayment(p.id)} className="text-gray-400 hover:text-red-600 text-xs px-1">✕</button>
              </div>

              {isEditing && (
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Nome</label>
                      <input className="w-full border rounded px-2 py-1.5 text-sm" value={p.musicianName} onChange={e => updatePayment(p.id, "musicianName", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Naipe</label>
                      <input className="w-full border rounded px-2 py-1.5 text-sm" value={p.naipe} onChange={e => updatePayment(p.id, "naipe", e.target.value)} />
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs font-medium text-gray-600 mb-2">Ensaios</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Valor por ensaio (€)</label>
                        <input type="number" min="0" step="5" className="w-full border rounded px-2 py-1.5 text-sm" value={p.feePerRehearsal || ""} onChange={e => updatePayment(p.id, "feePerRehearsal", e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">N.º ensaios</label>
                        <input type="number" min="0" className="w-full border rounded px-2 py-1.5 text-sm" value={p.numRehearsals || ""} onChange={e => updatePayment(p.id, "numRehearsals", e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Subtotal ensaios</label>
                        <div className="text-sm font-medium text-gray-700 py-1.5">{currency((Number(p.feePerRehearsal) || 0) * (Number(p.numRehearsals) || 0))}</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs font-medium text-gray-600 mb-2">Atuação e deslocação</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Cachet atuação (€)</label>
                        <input type="number" min="0" step="10" className="w-full border rounded px-2 py-1.5 text-sm" value={p.performanceFee || ""} onChange={e => updatePayment(p.id, "performanceFee", e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Deslocação fixa (€)</label>
                        <input type="number" min="0" step="5" className="w-full border rounded px-2 py-1.5 text-sm" value={p.travelExpenses || ""} onChange={e => updatePayment(p.id, "travelExpenses", e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Alimentação (€)</label>
                        <input type="number" min="0" step="5" className="w-full border rounded px-2 py-1.5 text-sm" value={p.mealExpenses || ""} onChange={e => updatePayment(p.id, "mealExpenses", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs font-medium text-gray-600 mb-2">Gasolina (km)</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Km total</label>
                        <input type="number" min="0" className="w-full border rounded px-2 py-1.5 text-sm" value={p.fuelKm || ""} onChange={e => updatePayment(p.id, "fuelKm", e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">€/km</label>
                        <input type="number" min="0" step="0.01" className="w-full border rounded px-2 py-1.5 text-sm" value={p.fuelRate || ""} onChange={e => updatePayment(p.id, "fuelRate", e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Subtotal gasolina</label>
                        <div className="text-sm font-medium text-gray-700 py-1.5">{currency((Number(p.fuelKm) || 0) * (Number(p.fuelRate) || 0))}</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs font-medium text-gray-600 mb-2">Outros</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Valor (€)</label>
                        <input type="number" min="0" step="5" className="w-full border rounded px-2 py-1.5 text-sm" value={p.otherExpenses || ""} onChange={e => updatePayment(p.id, "otherExpenses", e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Descrição</label>
                        <input className="w-full border rounded px-2 py-1.5 text-sm" value={p.otherDescription} onChange={e => updatePayment(p.id, "otherDescription", e.target.value)} placeholder="Ex: portagem, estacionamento" />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Estado</label>
                        <select className="w-full border rounded px-2 py-1.5 text-sm" value={p.paymentStatus} onChange={e => updatePayment(p.id, "paymentStatus", e.target.value)}>
                          <option value="pendente">Pendente</option>
                          <option value="parcial">Parcialmente pago</option>
                          <option value="pago">Pago</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Método</label>
                        <input className="w-full border rounded px-2 py-1.5 text-sm" value={p.paymentMethod} onChange={e => updatePayment(p.id, "paymentMethod", e.target.value)} placeholder="Transferência, numerário..." />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Total</label>
                        <div className="text-lg font-bold text-gray-900 py-1">{currency(total)}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Comentários</label>
                    <textarea className="w-full border rounded px-2 py-1.5 text-sm" rows="2" value={p.comments} onChange={e => updatePayment(p.id, "comments", e.target.value)} placeholder="Notas adicionais..." />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SEPARADOR: ESTADIA (Accommodation)
// ════════════════════════════════════════════════════════════════════

const REGIMES = [
  { value: "so_dormida", label: "Só dormida" },
  { value: "alojamento_pequeno_almoco", label: "Alojamento + Peq. almoço" },
  { value: "meia_pensao", label: "Meia pensão" },
  { value: "pensao_completa", label: "Pensão completa" },
  { value: "outro", label: "Outro" },
];

const BOOKING_STATUS = [
  { value: "orcamento", label: "Orçamento" },
  { value: "contactado", label: "Contactado" },
  { value: "reservado", label: "Reservado" },
  { value: "confirmado", label: "Confirmado" },
  { value: "cancelado", label: "Cancelado" },
  { value: "descartado", label: "Descartado" },
];

function AccommodationTab({ accommodation, setAccommodation }) {
  const [editing, setEditing] = useState(null);

  const addOption = () => {
    const a = {
      id: uid(),
      name: "",
      location: "",
      regime: "pensao_completa",
      pricePerPerson: 0,
      numNights: 3,
      numPeople: 85,
      totalQuote: 0,
      contactEmail: "",
      contactPhone: "",
      url: "",
      bookingStatus: "orcamento",
      checkIn: "2026-12-03",
      checkOut: "2026-12-06",
      pros: "",
      cons: "",
      comments: "",
    };
    setAccommodation([...accommodation, a]);
    setEditing(a.id);
  };

  const updateOption = (id, field, value) => {
    setAccommodation(accommodation.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const removeOption = (id) => {
    if (!confirm("Remover esta opção de alojamento?")) return;
    setAccommodation(accommodation.filter(a => a.id !== id));
    if (editing === id) setEditing(null);
  };

  const calcTotal = (a) => {
    const manual = Number(a.totalQuote) || 0;
    if (manual > 0) return manual;
    return (Number(a.pricePerPerson) || 0) * (Number(a.numNights) || 0) * (Number(a.numPeople) || 0);
  };

  const activeOptions = accommodation.filter(a => !["cancelado", "descartado"].includes(a.bookingStatus));
  const bestPrice = activeOptions.length > 0
    ? Math.min(...activeOptions.map(a => {
        const pp = Number(a.pricePerPerson) || 0;
        return pp > 0 ? pp * (Number(a.numNights) || 1) : Infinity;
      }))
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Stat label="Opções" value={accommodation.length} />
        <Stat label="Ativas" value={activeOptions.length} />
        <Stat label="Menor preço/pessoa" value={bestPrice === Infinity ? "—" : currency(bestPrice)} sub={bestPrice !== Infinity ? `${accommodation.find(a => (Number(a.pricePerPerson)||0) * (Number(a.numNights)||1) === bestPrice)?.numNights || "?"} noites` : ""} />
        <Stat label="Confirmadas" value={accommodation.filter(a => a.bookingStatus === "confirmado").length} />
      </div>

      <div className="flex gap-2">
        <button onClick={addOption} className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700">
          + Opção de alojamento
        </button>
      </div>

      {accommodation.length === 0 && (
        <div className="text-center text-gray-400 text-sm py-12 border border-dashed border-gray-300 rounded-lg">
          Nenhuma opção de alojamento registada.
        </div>
      )}

      <div className="space-y-3">
        {accommodation.map(a => {
          const total = calcTotal(a);
          const isEditing = editing === a.id;
          const statusObj = BOOKING_STATUS.find(s => s.value === a.bookingStatus);
          const regimeObj = REGIMES.find(r => r.value === a.regime);
          const statusColor = {
            orcamento: "gray", contactado: "yellow", reservado: "blue",
            confirmado: "green", cancelado: "red", descartado: "red"
          }[a.bookingStatus] || "gray";

          return (
            <div key={a.id} className={`border rounded-lg bg-white overflow-hidden ${["cancelado", "descartado"].includes(a.bookingStatus) ? "border-gray-100 opacity-60" : "border-gray-200"}`}>
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
                <span className="font-semibold text-gray-800 text-sm flex-1">
                  {a.name || "Sem nome"} {a.location && <span className="text-gray-400 font-normal">— {a.location}</span>}
                </span>
                {Number(a.pricePerPerson) > 0 && (
                  <span className="text-xs text-gray-500">{currency(a.pricePerPerson)}/pessoa/noite</span>
                )}
                <span className="text-sm font-semibold text-gray-900">{currency(total)}</span>
                <Badge color={statusColor}>{statusObj?.label || a.bookingStatus}</Badge>
                <button onClick={() => setEditing(isEditing ? null : a.id)} className="text-gray-400 hover:text-blue-600 text-xs px-1">
                  {isEditing ? "▲" : "▼"}
                </button>
                <button onClick={() => removeOption(a.id)} className="text-gray-400 hover:text-red-600 text-xs px-1">✕</button>
              </div>

              {isEditing && (
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Nome / Hotel</label>
                      <input className="w-full border rounded px-2 py-1.5 text-sm" value={a.name} onChange={e => updateOption(a.id, "name", e.target.value)} placeholder="Ex: Servigroup Benidorm" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Localização</label>
                      <input className="w-full border rounded px-2 py-1.5 text-sm" value={a.location} onChange={e => updateOption(a.id, "location", e.target.value)} placeholder="Ex: Benidorm" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Regime</label>
                      <select className="w-full border rounded px-2 py-1.5 text-sm" value={a.regime} onChange={e => updateOption(a.id, "regime", e.target.value)}>
                        {REGIMES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Preço/pessoa/noite (€)</label>
                      <input type="number" min="0" step="5" className="w-full border rounded px-2 py-1.5 text-sm" value={a.pricePerPerson || ""} onChange={e => updateOption(a.id, "pricePerPerson", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">N.º noites</label>
                      <input type="number" min="1" className="w-full border rounded px-2 py-1.5 text-sm" value={a.numNights || ""} onChange={e => updateOption(a.id, "numNights", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">N.º pessoas</label>
                      <input type="number" min="1" className="w-full border rounded px-2 py-1.5 text-sm" value={a.numPeople || ""} onChange={e => updateOption(a.id, "numPeople", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Total orçamento (€)</label>
                      <input type="number" min="0" step="50" className="w-full border rounded px-2 py-1.5 text-sm" value={a.totalQuote || ""} onChange={e => updateOption(a.id, "totalQuote", e.target.value)} placeholder="Auto se vazio" />
                      <p className="text-xs text-gray-400 mt-0.5">Calculado: {currency((Number(a.pricePerPerson) || 0) * (Number(a.numNights) || 0) * (Number(a.numPeople) || 0))}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Check-in</label>
                      <input type="date" className="w-full border rounded px-2 py-1.5 text-sm" value={a.checkIn || ""} onChange={e => updateOption(a.id, "checkIn", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Check-out</label>
                      <input type="date" className="w-full border rounded px-2 py-1.5 text-sm" value={a.checkOut || ""} onChange={e => updateOption(a.id, "checkOut", e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Email contacto</label>
                      <input type="email" className="w-full border rounded px-2 py-1.5 text-sm" value={a.contactEmail} onChange={e => updateOption(a.id, "contactEmail", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Telefone</label>
                      <input className="w-full border rounded px-2 py-1.5 text-sm" value={a.contactPhone} onChange={e => updateOption(a.id, "contactPhone", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">URL / Website</label>
                      <input type="url" className="w-full border rounded px-2 py-1.5 text-sm" value={a.url} onChange={e => updateOption(a.id, "url", e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Estado</label>
                    <select className="w-full border rounded px-2 py-1.5 text-sm" value={a.bookingStatus} onChange={e => updateOption(a.id, "bookingStatus", e.target.value)}>
                      {BOOKING_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Prós</label>
                      <textarea className="w-full border rounded px-2 py-1.5 text-sm" rows="2" value={a.pros || ""} onChange={e => updateOption(a.id, "pros", e.target.value)} placeholder="Pontos positivos..." />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Contras</label>
                      <textarea className="w-full border rounded px-2 py-1.5 text-sm" rows="2" value={a.cons || ""} onChange={e => updateOption(a.id, "cons", e.target.value)} placeholder="Pontos negativos..." />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Comentários</label>
                    <textarea className="w-full border rounded px-2 py-1.5 text-sm" rows="2" value={a.comments} onChange={e => updateOption(a.id, "comments", e.target.value)} placeholder="Notas adicionais..." />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SEPARADOR: DOCUMENTAÇÃO (Documents Checklist)
// ════════════════════════════════════════════════════════════════════

function DocumentsTab({ documents, setDocuments }) {
  const [editing, setEditing] = useState(null);

  const addDocument = () => {
    const d = { id: uid(), title: "", deadline: "", status: "pendente", comments: "" };
    setDocuments([...documents, d]);
    setEditing(d.id);
  };

  const updateDocument = (id, field, value) => {
    setDocuments(documents.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const removeDocument = (id) => {
    if (!confirm("Remover este documento?")) return;
    setDocuments(documents.filter(d => d.id !== id));
  };

  const toggleStatus = (id) => {
    const d = documents.find(x => x.id === id);
    if (!d) return;
    const next = d.status === "pendente" ? "em_preparacao" : d.status === "em_preparacao" ? "entregue" : "pendente";
    updateDocument(id, "status", next);
  };

  const total = documents.length;
  const delivered = documents.filter(d => d.status === "entregue").length;
  const inProgress = documents.filter(d => d.status === "em_preparacao").length;
  const pending = documents.filter(d => d.status === "pendente").length;

  const statusColor = (s) => s === "entregue" ? "green" : s === "em_preparacao" ? "yellow" : "red";
  const statusLabel = (s) => s === "entregue" ? "Entregue" : s === "em_preparacao" ? "Em preparação" : "Pendente";

  // Days until first deadline
  const today = new Date();
  const nextDeadline = documents
    .filter(d => d.status !== "entregue" && d.deadline)
    .map(d => new Date(d.deadline))
    .filter(d => d > today)
    .sort((a, b) => a - b)[0];
  const daysLeft = nextDeadline ? Math.ceil((nextDeadline - today) / 86400000) : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <Stat label="Total" value={total} />
        <Stat label="Entregues" value={delivered} />
        <Stat label="Em preparação" value={inProgress} />
        <Stat label="Pendentes" value={pending} />
        <Stat label="Próximo prazo" value={daysLeft !== null ? `${daysLeft} dias` : "—"} sub={nextDeadline ? nextDeadline.toLocaleDateString("pt-PT") : ""} />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
        Documentação exigida pelas bases do 51.º CIMALTEA (pontos 3.2 e 4.1). Prazo principal: 15 de setembro de 2026. Listado de músicos modificável até 25/11, certificação até 28/11.
      </div>

      <div className="flex gap-2">
        <button onClick={addDocument} className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700">
          + Documento
        </button>
      </div>

      <div className="space-y-2">
        {documents.map(d => {
          const isEditing = editing === d.id;
          const overdue = d.deadline && d.status !== "entregue" && new Date(d.deadline) < today;

          return (
            <div key={d.id} className={`border rounded-lg bg-white overflow-hidden ${overdue ? "border-red-300" : "border-gray-200"}`}>
              <div className="flex items-center gap-2 px-4 py-3">
                <button
                  onClick={() => toggleStatus(d.id)}
                  className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center text-xs
                    ${d.status === "entregue" ? "bg-emerald-500 border-emerald-500 text-white" :
                      d.status === "em_preparacao" ? "bg-amber-100 border-amber-400 text-amber-600" :
                      "bg-white border-gray-300 text-transparent hover:border-gray-400"}`}
                >
                  {d.status === "entregue" ? "✓" : d.status === "em_preparacao" ? "…" : ""}
                </button>
                <div className="flex-1 min-w-0">
                  <span className={`text-sm ${d.status === "entregue" ? "text-gray-400 line-through" : "text-gray-800"}`}>
                    {d.title || "Sem título"}
                  </span>
                  {d.deadline && (
                    <span className={`ml-2 text-xs ${overdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
                      {overdue ? "Atrasado — " : ""}até {new Date(d.deadline).toLocaleDateString("pt-PT")}
                    </span>
                  )}
                  {d.comments && !isEditing && <div className="text-xs text-gray-400 mt-0.5">{d.comments}</div>}
                </div>
                <Badge color={statusColor(d.status)}>{statusLabel(d.status)}</Badge>
                <button onClick={() => setEditing(isEditing ? null : d.id)} className="text-gray-400 hover:text-blue-600 text-xs px-1">✎</button>
                <button onClick={() => removeDocument(d.id)} className="text-gray-400 hover:text-red-600 text-xs px-1">✕</button>
              </div>

              {isEditing && (
                <div className="px-4 pb-3 space-y-2 border-t border-gray-100 pt-2">
                  <input className="w-full border rounded px-2 py-1.5 text-sm" placeholder="Título / Descrição" value={d.title} onChange={e => updateDocument(d.id, "title", e.target.value)} />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Prazo</label>
                      <input type="date" className="w-full border rounded px-2 py-1.5 text-sm" value={d.deadline} onChange={e => updateDocument(d.id, "deadline", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Estado</label>
                      <select className="w-full border rounded px-2 py-1.5 text-sm" value={d.status} onChange={e => updateDocument(d.id, "status", e.target.value)}>
                        <option value="pendente">Pendente</option>
                        <option value="em_preparacao">Em preparação</option>
                        <option value="entregue">Entregue</option>
                      </select>
                    </div>
                  </div>
                  <textarea className="w-full border rounded px-2 py-1.5 text-xs" rows="2" placeholder="Comentários / notas" value={d.comments} onChange={e => updateDocument(d.id, "comments", e.target.value)} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SEPARADOR: TRANSPORTES
// ════════════════════════════════════════════════════════════════════

const TRANSPORT_TYPES = [
  { value: "autocarro", label: "Autocarro" },
  { value: "minibus", label: "Minibus" },
  { value: "carrinha", label: "Carrinha / Van" },
  { value: "misto", label: "Misto" },
  { value: "outro_transporte", label: "Outro" },
];

const TRANSPORT_STATUS = [
  { value: "orcamento", label: "Orçamento" },
  { value: "contactado", label: "Contactado" },
  { value: "reservado", label: "Reservado" },
  { value: "confirmado", label: "Confirmado" },
  { value: "cancelado", label: "Cancelado" },
  { value: "descartado", label: "Descartado" },
];

function TransportTab({ transport, setTransport }) {
  const [editing, setEditing] = useState(null);

  const addOption = () => {
    const t = {
      id: uid(),
      company: "",
      type: "autocarro",
      route: "Monção → Altea → Monção",
      departureDate: "2026-12-03",
      returnDate: "2026-12-06",
      numVehicles: 1,
      capacity: 55,
      quotePrice: 0,
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      bookingStatus: "orcamento",
      pros: "",
      cons: "",
      comments: "",
    };
    setTransport([...transport, t]);
    setEditing(t.id);
  };

  const updateOption = (id, field, value) => {
    setTransport(transport.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeOption = (id) => {
    if (!confirm("Remover esta opção de transporte?")) return;
    setTransport(transport.filter(t => t.id !== id));
    if (editing === id) setEditing(null);
  };

  const activeOptions = transport.filter(t => !["cancelado", "descartado"].includes(t.bookingStatus));
  const totalCapacity = activeOptions.reduce((s, t) => s + (Number(t.capacity) || 0) * (Number(t.numVehicles) || 1), 0);
  const cheapest = activeOptions.length > 0
    ? Math.min(...activeOptions.map(t => Number(t.quotePrice) || Infinity))
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Stat label="Opções" value={transport.length} />
        <Stat label="Ativas" value={activeOptions.length} />
        <Stat label="Capacidade total" value={totalCapacity} sub="lugares (ativas)" />
        <Stat label="Menor orçamento" value={cheapest === Infinity ? "—" : currency(cheapest)} />
      </div>

      <div className="flex gap-2">
        <button onClick={addOption} className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700">
          + Opção de transporte
        </button>
      </div>

      {transport.length === 0 && (
        <div className="text-center text-gray-400 text-sm py-12 border border-dashed border-gray-300 rounded-lg">
          Nenhuma opção de transporte registada.
        </div>
      )}

      <div className="space-y-3">
        {transport.map(t => {
          const isEditing = editing === t.id;
          const typeObj = TRANSPORT_TYPES.find(x => x.value === t.type);
          const statusObj = TRANSPORT_STATUS.find(x => x.value === t.bookingStatus);
          const statusColor = { orcamento: "gray", contactado: "yellow", reservado: "blue", confirmado: "green", cancelado: "red", descartado: "red" }[t.bookingStatus] || "gray";

          return (
            <div key={t.id} className={`border rounded-lg bg-white overflow-hidden ${["cancelado", "descartado"].includes(t.bookingStatus) ? "border-gray-100 opacity-60" : "border-gray-200"}`}>
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
                <span className="font-semibold text-gray-800 text-sm flex-1">
                  {t.company || "Sem empresa"} <span className="text-gray-400 font-normal">— {typeObj?.label || t.type}</span>
                </span>
                {Number(t.quotePrice) > 0 && <span className="text-sm font-semibold text-gray-900">{currency(t.quotePrice)}</span>}
                <Badge color={statusColor}>{statusObj?.label || t.bookingStatus}</Badge>
                <button onClick={() => setEditing(isEditing ? null : t.id)} className="text-gray-400 hover:text-blue-600 text-xs px-1">{isEditing ? "▲" : "▼"}</button>
                <button onClick={() => removeOption(t.id)} className="text-gray-400 hover:text-red-600 text-xs px-1">✕</button>
              </div>

              {isEditing && (
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Empresa</label>
                      <input className="w-full border rounded px-2 py-1.5 text-sm" value={t.company} onChange={e => updateOption(t.id, "company", e.target.value)} placeholder="Ex: Ovnitur, Iberobus" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Tipo</label>
                      <select className="w-full border rounded px-2 py-1.5 text-sm" value={t.type} onChange={e => updateOption(t.id, "type", e.target.value)}>
                        {TRANSPORT_TYPES.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Rota</label>
                      <input className="w-full border rounded px-2 py-1.5 text-sm" value={t.route} onChange={e => updateOption(t.id, "route", e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Data ida</label>
                      <input type="date" className="w-full border rounded px-2 py-1.5 text-sm" value={t.departureDate || ""} onChange={e => updateOption(t.id, "departureDate", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Data regresso</label>
                      <input type="date" className="w-full border rounded px-2 py-1.5 text-sm" value={t.returnDate || ""} onChange={e => updateOption(t.id, "returnDate", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">N.º veículos</label>
                      <input type="number" min="1" className="w-full border rounded px-2 py-1.5 text-sm" value={t.numVehicles || ""} onChange={e => updateOption(t.id, "numVehicles", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Capacidade total</label>
                      <input type="number" min="1" className="w-full border rounded px-2 py-1.5 text-sm" value={t.capacity || ""} onChange={e => updateOption(t.id, "capacity", e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Orçamento total (€)</label>
                    <input type="number" min="0" step="50" className="w-full border rounded px-2 py-1.5 text-sm" value={t.quotePrice || ""} onChange={e => updateOption(t.id, "quotePrice", e.target.value)} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Contacto</label>
                      <input className="w-full border rounded px-2 py-1.5 text-sm" value={t.contactName} onChange={e => updateOption(t.id, "contactName", e.target.value)} placeholder="Nome" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Email</label>
                      <input type="email" className="w-full border rounded px-2 py-1.5 text-sm" value={t.contactEmail} onChange={e => updateOption(t.id, "contactEmail", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Telefone</label>
                      <input className="w-full border rounded px-2 py-1.5 text-sm" value={t.contactPhone} onChange={e => updateOption(t.id, "contactPhone", e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Estado</label>
                    <select className="w-full border rounded px-2 py-1.5 text-sm" value={t.bookingStatus} onChange={e => updateOption(t.id, "bookingStatus", e.target.value)}>
                      {TRANSPORT_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Prós</label>
                      <textarea className="w-full border rounded px-2 py-1.5 text-sm" rows="2" value={t.pros || ""} onChange={e => updateOption(t.id, "pros", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Contras</label>
                      <textarea className="w-full border rounded px-2 py-1.5 text-sm" rows="2" value={t.cons || ""} onChange={e => updateOption(t.id, "cons", e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Comentários</label>
                    <textarea className="w-full border rounded px-2 py-1.5 text-sm" rows="2" value={t.comments} onChange={e => updateOption(t.id, "comments", e.target.value)} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SEPARADOR: BALANÇO GERAL (Receitas e Despesas)
// ════════════════════════════════════════════════════════════════════

const REVENUE_CATEGORIES = [
  { value: "premio_cimaltea", label: "Prémio CIMALTEA (5.000€ ou 2.500€)" },
  { value: "ajuda_distancia", label: "Ajuda distância >500km" },
  { value: "subsidio_dgartes", label: "Subsídio DGARTES" },
  { value: "subsidio_camara", label: "Subsídio Câmara Municipal" },
  { value: "subsidio_junta", label: "Subsídio Junta Freguesia" },
  { value: "subsidio_outro", label: "Outro subsídio público" },
  { value: "quotas", label: "Quotas / Contribuição músicos" },
  { value: "patrocinio", label: "Patrocínio" },
  { value: "atividades", label: "Receita de atividades" },
  { value: "outro_receita", label: "Outro" },
];

const EXPENSE_CATEGORIES = [
  { value: "alojamento", label: "Alojamento" },
  { value: "transporte", label: "Transporte" },
  { value: "alimentacao", label: "Alimentação (extra)" },
  { value: "reforcos", label: "Pagamentos a reforços" },
  { value: "inscricao", label: "Inscrição / Fiança (600€)" },
  { value: "partituras", label: "Partituras" },
  { value: "seguro", label: "Seguro viagem" },
  { value: "material", label: "Material / Equipamento" },
  { value: "direitos_autor", label: "Direitos de autor" },
  { value: "outro_despesa", label: "Outro" },
];

const ENTRY_STATUS = [
  { value: "previsto", label: "Previsto" },
  { value: "confirmado", label: "Confirmado" },
  { value: "pago", label: "Pago / Recebido" },
];

function BalanceTab({ balance, setBalance }) {
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState("all"); // all | receita | despesa

  const addEntry = (type) => {
    const e = {
      id: uid(),
      type,
      description: "",
      amount: 0,
      category: type === "receita" ? "outro_receita" : "outro_despesa",
      date: new Date().toISOString().slice(0, 10),
      status: "previsto",
      comments: "",
    };
    setBalance([...balance, e]);
    setEditing(e.id);
  };

  const updateEntry = (id, field, value) => {
    setBalance(balance.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const removeEntry = (id) => {
    if (!confirm("Remover este registo?")) return;
    setBalance(balance.filter(e => e.id !== id));
    if (editing === id) setEditing(null);
  };

  const receitas = balance.filter(e => e.type === "receita");
  const despesas = balance.filter(e => e.type === "despesa");
  const totalReceitas = receitas.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalDespesas = despesas.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const saldo = totalReceitas - totalDespesas;
  const confirmedReceitas = receitas.filter(e => e.status !== "previsto").reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const confirmedDespesas = despesas.filter(e => e.status !== "previsto").reduce((s, e) => s + (Number(e.amount) || 0), 0);

  // Category breakdown
  const catBreakdown = (entries, categories) => {
    const map = {};
    for (const e of entries) map[e.category] = (map[e.category] || 0) + (Number(e.amount) || 0);
    return categories.map(c => ({ ...c, amount: map[c.value] || 0 })).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);
  };

  const revBreakdown = catBreakdown(receitas, REVENUE_CATEGORIES);
  const expBreakdown = catBreakdown(despesas, EXPENSE_CATEGORIES);

  const filtered = filter === "all" ? balance : balance.filter(e => e.type === filter);
  const sorted = [...filtered].sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  const allCategories = (type) => type === "receita" ? REVENUE_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Stat label="Total receitas" value={currency(totalReceitas)} sub={`Confirmado: ${currency(confirmedReceitas)}`} />
        <Stat label="Total despesas" value={currency(totalDespesas)} sub={`Confirmado: ${currency(confirmedDespesas)}`} />
        <Stat label="Saldo" value={currency(saldo)} sub={saldo >= 0 ? "Positivo" : "Negativo"} />
        <Stat label="Registos" value={balance.length} sub={`${receitas.length} rec. / ${despesas.length} desp.`} />
      </div>

      {/* Balance bar */}
      {(totalReceitas > 0 || totalDespesas > 0) && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs text-emerald-600 font-medium">Receitas</span>
            <div className="flex-1" />
            <span className="text-xs text-rose-600 font-medium">Despesas</span>
          </div>
          <div className="flex h-6 rounded-full overflow-hidden bg-gray-100">
            {totalReceitas > 0 && (
              <div className="bg-emerald-400 h-full transition-all" style={{ width: `${(totalReceitas / (totalReceitas + totalDespesas)) * 100}%` }} />
            )}
            {totalDespesas > 0 && (
              <div className="bg-rose-400 h-full transition-all" style={{ width: `${(totalDespesas / (totalReceitas + totalDespesas)) * 100}%` }} />
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-gray-500">{currency(totalReceitas)}</span>
            <div className="flex-1" />
            <span className="text-xs text-gray-500">{currency(totalDespesas)}</span>
          </div>
        </div>
      )}

      {/* Category charts */}
      {(revBreakdown.length > 0 || expBreakdown.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {revBreakdown.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-600 mb-3">Receitas por categoria</p>
              <div className="space-y-1.5">
                {revBreakdown.map(c => {
                  const maxVal = revBreakdown[0]?.amount || 1;
                  return (
                    <div key={c.value} className="flex items-center gap-2 text-xs">
                      <span className="w-36 text-right text-gray-600 truncate" title={c.label}>{c.label}</span>
                      <div className="flex-1 bg-gray-100 rounded h-4 overflow-hidden">
                        <div className="bg-emerald-400 h-4 rounded transition-all" style={{ width: `${(c.amount / maxVal) * 100}%` }} />
                      </div>
                      <span className="w-20 text-right font-mono text-gray-700">{currency(c.amount)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {expBreakdown.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-600 mb-3">Despesas por categoria</p>
              <div className="space-y-1.5">
                {expBreakdown.map(c => {
                  const maxVal = expBreakdown[0]?.amount || 1;
                  return (
                    <div key={c.value} className="flex items-center gap-2 text-xs">
                      <span className="w-36 text-right text-gray-600 truncate" title={c.label}>{c.label}</span>
                      <div className="flex-1 bg-gray-100 rounded h-4 overflow-hidden">
                        <div className="bg-rose-400 h-4 rounded transition-all" style={{ width: `${(c.amount / maxVal) * 100}%` }} />
                      </div>
                      <span className="w-20 text-right font-mono text-gray-700">{currency(c.amount)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action buttons and filter */}
      <div className="flex gap-2 items-center flex-wrap">
        <button onClick={() => addEntry("receita")} className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-emerald-700">
          + Receita
        </button>
        <button onClick={() => addEntry("despesa")} className="bg-rose-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-rose-700">
          + Despesa
        </button>
        <div className="ml-auto flex gap-1">
          {[{ v: "all", l: "Todos" }, { v: "receita", l: "Receitas" }, { v: "despesa", l: "Despesas" }].map(f => (
            <button key={f.v} onClick={() => setFilter(f.v)} className={`text-xs px-3 py-1.5 rounded-lg border ${filter === f.v ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"}`}>{f.l}</button>
          ))}
        </div>
      </div>

      {balance.length === 0 && (
        <div className="text-center text-gray-400 text-sm py-12 border border-dashed border-gray-300 rounded-lg">
          Nenhum registo financeiro. Adiciona receitas e despesas para visualizar o balanço.
        </div>
      )}

      <div className="space-y-2">
        {sorted.map(e => {
          const isEditing = editing === e.id;
          const isReceita = e.type === "receita";
          const cats = allCategories(e.type);
          const catObj = cats.find(c => c.value === e.category);
          const statusObj = ENTRY_STATUS.find(s => s.value === e.status);
          const statusColor = e.status === "pago" ? "green" : e.status === "confirmado" ? "blue" : "gray";

          return (
            <div key={e.id} className="border border-gray-200 rounded-lg bg-white overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3">
                <div className={`w-2 h-8 rounded-full flex-shrink-0 ${isReceita ? "bg-emerald-400" : "bg-rose-400"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-800 font-medium">{e.description || catObj?.label || "Sem descrição"}</span>
                    <span className="text-xs text-gray-400">{catObj?.label}</span>
                  </div>
                  {e.date && <span className="text-xs text-gray-400">{new Date(e.date).toLocaleDateString("pt-PT")}</span>}
                </div>
                <span className={`text-sm font-semibold ${isReceita ? "text-emerald-700" : "text-rose-700"}`}>
                  {isReceita ? "+" : "−"}{currency(Number(e.amount) || 0).replace(" €", "")} €
                </span>
                <Badge color={statusColor}>{statusObj?.label || e.status}</Badge>
                <button onClick={() => setEditing(isEditing ? null : e.id)} className="text-gray-400 hover:text-blue-600 text-xs px-1">{isEditing ? "▲" : "▼"}</button>
                <button onClick={() => removeEntry(e.id)} className="text-gray-400 hover:text-red-600 text-xs px-1">✕</button>
              </div>

              {isEditing && (
                <div className="px-4 pb-3 space-y-2 border-t border-gray-100 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Descrição</label>
                      <input className="w-full border rounded px-2 py-1.5 text-sm" value={e.description} onChange={ev => updateEntry(e.id, "description", ev.target.value)} placeholder="Descrição..." />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Categoria</label>
                      <select className="w-full border rounded px-2 py-1.5 text-sm" value={e.category} onChange={ev => updateEntry(e.id, "category", ev.target.value)}>
                        {cats.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Valor (€)</label>
                      <input type="number" min="0" step="10" className="w-full border rounded px-2 py-1.5 text-sm" value={e.amount || ""} onChange={ev => updateEntry(e.id, "amount", ev.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Data</label>
                      <input type="date" className="w-full border rounded px-2 py-1.5 text-sm" value={e.date || ""} onChange={ev => updateEntry(e.id, "date", ev.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Estado</label>
                      <select className="w-full border rounded px-2 py-1.5 text-sm" value={e.status} onChange={ev => updateEntry(e.id, "status", ev.target.value)}>
                        {ENTRY_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Comentários</label>
                    <textarea className="w-full border rounded px-2 py-1.5 text-xs" rows="2" value={e.comments} onChange={ev => updateEntry(e.id, "comments", ev.target.value)} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// CLOUD SYNC HOOK
// ════════════════════════════════════════════════════════════════════

function useCloudSync(key, data) {
  const timer = useRef(null);
  useEffect(() => {
    if (data === null) return;
    saveLocal(key, data);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { void saveToCloud(key, data); }, 2000);
    return () => clearTimeout(timer.current);
  }, [key, data]);
}

// ════════════════════════════════════════════════════════════════════
// APP PRINCIPAL
// ════════════════════════════════════════════════════════════════════

export default function App() {
  const [authenticated, setAuthenticated] = useState(isSessionActive());
  const [naipes, setNaipes] = useState(null);
  const [rooms, setRooms] = useState(null);
  const [payments, setPayments] = useState(null);
  const [accommodation, setAccommodation] = useState(null);
  const [transport, setTransport] = useState(null);
  const [balance, setBalance] = useState(null);
  const [documents, setDocuments] = useState(null);
  const [tab, setTab] = useState("roster");
  const [syncStatus, setSyncStatus] = useState("loading");

  // ── Load data from cloud / local ──
  useEffect(() => {
    if (!authenticated) return;
    (async () => {
      setSyncStatus("loading");
      const cloudNaipes = await loadFromCloud("naipes");
      const cloudRooms = await loadFromCloud("rooms");
      const cloudPayments = await loadFromCloud("payments");
      const cloudAccommodation = await loadFromCloud("accommodation");
      const cloudTransport = await loadFromCloud("transport");
      const cloudBalance = await loadFromCloud("balance");
      const cloudDocuments = await loadFromCloud("documents");

      const hasCloudData =
        cloudNaipes.ok &&
        !cloudNaipes.notFound &&
        Array.isArray(cloudNaipes.data);

      if (hasCloudData) {
        const migratedNaipes = migrateNaipes(cloudNaipes.data);
        const roomsData = Array.isArray(cloudRooms.data) ? cloudRooms.data : [];
        const paymentsData = Array.isArray(cloudPayments.data) ? cloudPayments.data : [];
        const accommodationData = Array.isArray(cloudAccommodation.data) ? cloudAccommodation.data : [];
        const transportData = Array.isArray(cloudTransport.data) ? cloudTransport.data : [];
        const balanceData = Array.isArray(cloudBalance.data) ? cloudBalance.data : [];
        const documentsData = Array.isArray(cloudDocuments.data) ? cloudDocuments.data : INITIAL_DOCUMENTS;

        setNaipes(migratedNaipes);
        setRooms(roomsData);
        setPayments(paymentsData);
        setAccommodation(accommodationData);
        setTransport(transportData);
        setBalance(balanceData);
        setDocuments(documentsData);
        saveLocal("cimaltea-naipes", migratedNaipes);
        saveLocal("cimaltea-rooms", roomsData);
        saveLocal("cimaltea-payments", paymentsData);
        saveLocal("cimaltea-accommodation", accommodationData);
        saveLocal("cimaltea-transport", transportData);
        saveLocal("cimaltea-balance", balanceData);
        saveLocal("cimaltea-documents", documentsData);
        setSyncStatus("cloud");
      } else {
        const localNaipes = loadLocal("cimaltea-naipes", INITIAL_NAIPES);
        const localRooms = loadLocal("cimaltea-rooms", INITIAL_ROOMS);
        const localPayments = loadLocal("cimaltea-payments", INITIAL_PAYMENTS);
        const localAccommodation = loadLocal("cimaltea-accommodation", INITIAL_ACCOMMODATION);
        const localTransport = loadLocal("cimaltea-transport", INITIAL_TRANSPORT);
        const localBalance = loadLocal("cimaltea-balance", INITIAL_BALANCE);
        const localDocuments = loadLocal("cimaltea-documents", INITIAL_DOCUMENTS);

        setNaipes(migrateNaipes(localNaipes));
        setRooms(localRooms);
        setPayments(localPayments);
        setAccommodation(localAccommodation);
        setTransport(localTransport);
        setBalance(localBalance);
        setDocuments(localDocuments);
        setSyncStatus("local");
      }
    })();
  }, [authenticated]);

  // ── Cloud sync ──
  useCloudSync("naipes", naipes);
  useCloudSync("rooms", rooms);
  useCloudSync("payments", payments);
  useCloudSync("accommodation", accommodation);
  useCloudSync("transport", transport);
  useCloudSync("balance", balance);
  useCloudSync("documents", documents);

  // ── Auth gate ──
  if (!authenticated) {
    return <LoginScreen onAuth={() => setAuthenticated(true)} />;
  }

  if (!naipes || !rooms || !payments || !accommodation || !transport || !balance || !documents) {
    return <div className="flex items-center justify-center h-screen text-gray-400">A carregar...</div>;
  }

  const stats = getStats(naipes);

  const TABS = [
    { id: "roster", label: `Músicos (${stats.total})` },
    { id: "rooms", label: "Quartos" },
    { id: "payments", label: "Pagamentos" },
    { id: "accommodation", label: "Estadia" },
    { id: "transport", label: "Transportes" },
    { id: "balance", label: "Balanço" },
    { id: "documents", label: "Documentação" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">CIMALTEA 2026 — Gestão</h1>
            <p className="text-xs text-gray-400 mt-0.5">Banda Musical de Monção · 51.º Certamen Internacional de Música "Vila d'Altea"</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${syncStatus === "cloud" ? "bg-emerald-100 text-emerald-700" : syncStatus === "local" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
            {syncStatus === "cloud" ? "☁ Sincronizado" : syncStatus === "local" ? "💾 Apenas local" : "…"}
          </span>
          <button
            onClick={() => { clearSession(); setAuthenticated(false); }}
            className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
            title="Terminar sessão"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="max-w-6xl mx-auto flex gap-0 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${tab === t.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {tab === "roster" && <RosterTab naipes={naipes} setNaipes={setNaipes} />}
        {tab === "rooms" && <RoomsTab naipes={naipes} rooms={rooms} setRooms={setRooms} />}
        {tab === "payments" && <PaymentsTab naipes={naipes} payments={payments} setPayments={setPayments} />}
        {tab === "accommodation" && <AccommodationTab accommodation={accommodation} setAccommodation={setAccommodation} />}
        {tab === "transport" && <TransportTab transport={transport} setTransport={setTransport} />}
        {tab === "balance" && <BalanceTab balance={balance} setBalance={setBalance} />}
        {tab === "documents" && <DocumentsTab documents={documents} setDocuments={setDocuments} />}
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto px-4 pb-8 text-center">
        <button onClick={() => {
          if (confirm("Repor TODOS os dados para o estado inicial? Isto apaga todas as alterações.")) {
            setNaipes(INITIAL_NAIPES);
            setRooms(INITIAL_ROOMS);
            setPayments(INITIAL_PAYMENTS);
            setAccommodation(INITIAL_ACCOMMODATION);
            setTransport(INITIAL_TRANSPORT);
            setBalance(INITIAL_BALANCE);
            setDocuments(INITIAL_DOCUMENTS);
          }
        }} className="text-xs text-gray-400 hover:text-red-500">
          Repor dados iniciais
        </button>
      </div>
    </div>
  );
}