import { createPool } from '@vercel/postgres';

const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
});

export default async function handler(req, res) {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS entries (
        id TEXT PRIMARY KEY, amount REAL NOT NULL, currency TEXT NOT NULL DEFAULT 'CNY',
        amount_cny REAL NOT NULL, payer TEXT NOT NULL, date TEXT NOT NULL,
        category TEXT DEFAULT '其他', note TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
