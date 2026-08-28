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

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      return { ok: false, notFound: false, data: null, error: errorText || `Supabase error ${res.status}` };
    }

    const rows = await res.json();
    return {
      ok: true,
      notFound: rows.length === 0,
      data: rows.length > 0 ? rows[0].data : null,
    };
  } catch (error) {
    return { ok: false, notFound: false, data: null, error: error.message || "Erro de ligação ao Supabase" };
  }
}

export async function saveToCloud(id, data) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/app_data`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({ id, data, updated_at: new Date().toISOString() }),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      return { ok: false, error: errorText || `Supabase error ${res.status}` };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message || "Erro de ligação ao Supabase" };
  }
}