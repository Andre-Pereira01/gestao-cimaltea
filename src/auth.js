// ── Autenticação ──
// Hash SHA-256 via Web Crypto API + Supabase para persistência

import { loadFromCloud, saveToCloud } from "./supabase.js";

const SESSION_KEY = "cimaltea_auth_session";
const LOCAL_HASH_KEY = "cimaltea_auth_hash_backup";

async function sha256(text) {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function getStoredHash() {
  const cloud = await loadFromCloud("auth_hash");

  if (cloud.ok && !cloud.notFound && typeof cloud.data === "string" && cloud.data) {
    return { ok: true, source: "cloud", hash: cloud.data };
  }

  const local = localStorage.getItem(LOCAL_HASH_KEY);
  if (cloud.ok && cloud.notFound && local) {
    return { ok: true, source: "local", hash: local };
  }

  if (!cloud.ok) {
    return { ok: false, source: "read-error", hash: null, error: cloud.error || "Erro ao ler hash" };
  }

  if (cloud.ok && !cloud.notFound) {
    return { ok: false, source: "invalid", hash: null, error: "Hash cloud inválido" };
  }

  return { ok: true, source: "missing", hash: null };
}

export async function setPassword(password) {
  const hash = await sha256(password);

  const result = await saveToCloud("auth_hash", hash);
  if (!result.ok) {
    return { ok: false, hash: null, error: result.error || "Erro ao gravar hash" };
  }

  try {
    localStorage.setItem(LOCAL_HASH_KEY, hash);
  } catch {
    return { ok: false, hash, error: "Password gravada no cloud, mas não foi possível criar backup local" };
  }

  return { ok: true, hash };
}

export async function verifyPassword(password) {
  const stored = await getStoredHash();

  if (!stored.ok) return stored;

  if (!stored.hash) return { ok: true, valid: false, source: stored.source };

  const hash = await sha256(password);
  return {
    ok: true,
    valid: hash === stored.hash,
    source: stored.source,
  };
}
export function isSessionActive() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function setSession() {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {}
}

export function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {}
}