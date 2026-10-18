import { Router } from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRoles } from '../auth.js';

const router = Router();

// List Menu Harian
router.get('/', authenticateToken, (req, res) => {
  const { search, tanggal_awal, tanggal_akhir } = req.query;
  let query = 'SELECT * FROM menu_harian WHERE 1=1';
  const params: any[] = [];

  if (search) {
    query += ' AND (nama_menu LIKE ? OR deskripsi LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (tanggal_awal) {
    query += ' AND tanggal >= ?';
    params.push(tanggal_awal);
  }

  if (tanggal_akhir) {
    query += ' AND tanggal <= ?';
    params.push(tanggal_akhir);
  }

  query += ' ORDER BY tanggal DESC, id_menu DESC';

  try {
    const list = db.prepare(query).all(...params);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal mengambil data menu: ' + error.message });
  }
});

// Get single Menu Detail
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  try {
    const menu = db.prepare('SELECT * FROM menu_harian WHERE id_menu = ?').get(id);
    if (!menu) {
      return res.status(404).json({ message: 'Menu tidak ditemukan.' });
    }
    // Also fetch associated organoleptic evaluations
    const ujiList = db.prepare('SELECT * FROM uji_organoleptik WHERE id_menu = ? ORDER BY tanggal DESC').all(id);
    res.json({ ...menu, uji_organoleptik: ujiList });
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal mengambil detail menu: ' + error.message });
  }
});

// Create Menu Harian (Administrator only)
router.post('/', authenticateToken, requireRoles('Administrator'), (req, res) => {
  const { tanggal, nama_menu, deskripsi } = req.body;

  if (!tanggal || !nama_menu || !deskripsi) {
    return res.status(400).json({ message: 'Tanggal, nama menu, dan deskripsi wajib diisi.' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO menu_harian (tanggal, nama_menu, deskripsi)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(tanggal, nama_menu, deskripsi);
    const created = db.prepare('SELECT * FROM menu_harian WHERE id_menu = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal menambahkan menu harian: ' + error.message });
  }
});

// Update Menu Harian (Administrator only)
router.put('/:id', authenticateToken, requireRoles('Administrator'), (req, res) => {
  const { id } = req.params;
  const { tanggal, nama_menu, deskripsi } = req.body;

  try {
    const stmt = db.prepare(`
      UPDATE menu_harian
      SET tanggal = ?, nama_menu = ?, deskripsi = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id_menu = ?
    `);

    const result = stmt.run(tanggal, nama_menu, deskripsi, id);
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Menu tidak ditemukan.' });
    }

    const updated = db.prepare('SELECT * FROM menu_harian WHERE id_menu = ?').get(id);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal memperbarui menu harian: ' + error.message });
  }
});

// Delete Menu Harian (Administrator only) - with relation guard to Uji Organoleptik
router.delete('/:id', authenticateToken, requireRoles('Administrator'), (req, res) => {
  const { id } = req.params;

  try {
    // Check relation
    const relatedCount = db.prepare('SELECT COUNT(*) as count FROM uji_organoleptik WHERE id_menu = ?').get(id) as { count: number };
    if (relatedCount && relatedCount.count > 0) {
      return res.status(400).json({
        message: 'Menu ini tidak dapat dihapus karena sudah memiliki data penilaian Uji Organoleptik.',
      });
    }

    const result = db.prepare('DELETE FROM menu_harian WHERE id_menu = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Menu tidak ditemukan.' });
    }

    res.json({ message: 'Menu harian berhasil dihapus.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal menghapus menu: ' + error.message });
  }
});

export default router;
