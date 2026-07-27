import { createPool } from '@vercel/postgres';

const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
});

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { rows } = await pool.query('SELECT * FROM config');
      const cfg = {};
      rows.forEach(r => { cfg[r.key] = r.value; });
      return res.json(cfg);
    }

    if (req.method === 'POST') {
      const { key, value } = req.body || {};
      if (!key) return res.status(400).json({ error: '缺少 key' });
      await pool.query(
        'INSERT INTO config (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=$2, updated_at=NOW()',
        [key, value||'']
      );
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
