import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { rows } = await sql`SELECT * FROM entries ORDER BY date DESC, created_at DESC`;
      return res.json(rows);
    }

    if (req.method === 'POST') {
      const { id, amount, currency, amount_cny, payer, date, category, note } = req.body || {};
      if (!id || !amount || !payer || !date) {
        return res.status(400).json({ error: '缺少必填字段' });
      }
      await sql`
        INSERT INTO entries (id, amount, currency, amount_cny, payer, date, category, note)
        VALUES (${id}, ${amount}, ${currency||'CNY'}, ${amount_cny||amount}, ${payer}, ${date}, ${category||'其他'}, ${note||''})
      `;
      return res.json({ ok: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: '缺少 id' });
      await sql`DELETE FROM entries WHERE id = ${id}`;
      return res.json({ ok: true });
    }

    if (req.method === 'PUT') {
      const { id, category, note } = req.body || {};
      if (!id) return res.status(400).json({ error: '缺少 id' });
      if (category !== undefined) {
        await sql`UPDATE entries SET category = ${category}, updated_at = NOW() WHERE id = ${id}`;
      }
      if (note !== undefined) {
        await sql`UPDATE entries SET note = ${note}, updated_at = NOW() WHERE id = ${id}`;
      }
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
