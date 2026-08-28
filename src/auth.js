// ── Autenticação ──
// Hash SHA-256 via Web Crypto API + Supabase para persistência

import { loadFromCloud, saveToCloud } from "./supabase.js";

const SESSION_KEY = "cimaltea_auth_session";

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
  return cloud || null;
}

export async function setPassword(password) {
  const hash = await sha256(password);
  await saveToCloud("auth_hash", hash);
  return hash;
}

export async function verifyPassword(password) {
  const stored = await getStoredHash();
  if (!stored) return false;
  const hash = await sha256(password);
  return hash === stored;
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