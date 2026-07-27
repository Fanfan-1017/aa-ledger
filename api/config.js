import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { rows } = await sql`SELECT * FROM config`;
      const cfg = {};
      rows.forEach(r => { cfg[r.key] = r.value; });
      return res.json(cfg);
    }

    if (req.method === 'POST') {
      const { key, value } = req.body || {};
      if (!key) return res.status(400).json({ error: '缺少 key' });
      await sql`
        INSERT INTO config (key, value) VALUES (${key}, ${value||''})
        ON CONFLICT (key) DO UPDATE SET value = ${value||''}, updated_at = NOW()
      `;
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
