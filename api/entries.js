import { createPool } from '@vercel/postgres';

const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
});

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { rows } = await pool.query('SELECT * FROM entries ORDER BY date DESC, created_at DESC');
      return res.json(rows);
    }

    if (req.method === 'POST') {
      const { id, amount, currency, amount_cny, payer, date, category, note } = req.body || {};
      if (!id || !amount || !payer || !date) {
        return res.status(400).json({ error: '缺少必填字段' });
      }
      await pool.query(
        'INSERT INTO entries (id, amount, currency, amount_cny, payer, date, category, note) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        [id, amount, currency||'CNY', amount_cny||amount, payer, date, category||'其他', note||'']
      );
      return res.json({ ok: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: '缺少 id' });
      await pool.query('DELETE FROM entries WHERE id = $1', [id]);
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
