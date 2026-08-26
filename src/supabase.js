// ── Configuração Supabase ──
// Substitui estes valores pelos do teu projeto Supabase (Settings → API)
const SUPABASE_URL = 'https://mifbfbzrxtmpcmdgszyq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_bOOevfNbKYrpiEAuJ6Hu9Q_8BUfA7zk';

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

export async function loadFromCloud(id) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/app_data?id=eq.${id}&select=data`,
      { headers }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return rows.length > 0 ? rows[0].data : null;
  } catch {
    return null;
  }
}

export async function saveToCloud(id, data) {
  try {
    // Upsert: insere ou atualiza
    await fetch(`${SUPABASE_URL}/rest/v1/app_data`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({ id, data, updated_at: new Date().toISOString() }),
    });
  } catch {
    // Falha silenciosa — localStorage serve de backup
  }
}
