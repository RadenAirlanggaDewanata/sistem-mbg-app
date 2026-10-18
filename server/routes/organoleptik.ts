import { Router } from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRoles } from '../auth.js';

const router = Router();

// List Uji Organoleptik
router.get('/', authenticateToken, (req, res) => {
  const { search, tanggal_awal, tanggal_akhir, id_menu } = req.query;

  let query = `
    SELECT 
      u.*,
      m.nama_menu,
      m.deskripsi as deskripsi_menu
    FROM uji_organoleptik u
    JOIN menu_harian m ON u.id_menu = m.id_menu
    WHERE 1=1
  `;
  const params: any[] = [];

  if (search) {
    query += ' AND (m.nama_menu LIKE ? OR u.keterangan LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (id_menu) {
    query += ' AND u.id_menu = ?';
    params.push(id_menu);
  }

  if (tanggal_awal) {
    query += ' AND u.tanggal >= ?';
    params.push(tanggal_awal);
  }

  if (tanggal_akhir) {
    query += ' AND u.tanggal <= ?';
    params.push(tanggal_akhir);
  }

  query += ' ORDER BY u.tanggal DESC, u.id_uji DESC';

  try {
    const list = db.prepare(query).all(...params);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal mengambil data uji organoleptik: ' + error.message });
  }
});

// Create Uji Organoleptik (Administrator only)
router.post('/', authenticateToken, requireRoles('Administrator'), (req, res) => {
  const { id_menu, tanggal, warna, aroma, rasa, tekstur, keterangan } = req.body;

  if (!id_menu || !tanggal || !warna || !aroma || !rasa || !tekstur) {
    return res.status(400).json({ message: 'Menu, tanggal, dan seluruh indikator organoleptik wajib diisi.' });
  }

  try {
    // Validate menu existence
    const menuExists = db.prepare('SELECT id_menu FROM menu_harian WHERE id_menu = ?').get(id_menu);
    if (!menuExists) {
      return res.status(400).json({ message: 'Menu harian yang dipilih tidak valid.' });
    }

    const stmt = db.prepare(`
      INSERT INTO uji_organoleptik (id_menu, tanggal, warna, aroma, rasa, tekstur, keterangan)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      Number(id_menu),
      tanggal,
      Number(warna),
      Number(aroma),
      Number(rasa),
      Number(tekstur),
      keterangan || ''
    );

    const created = db.prepare(`
      SELECT u.*, m.nama_menu, m.deskripsi as deskripsi_menu
      FROM uji_organoleptik u
      JOIN menu_harian m ON u.id_menu = m.id_menu
      WHERE u.id_uji = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal menambahkan uji organoleptik: ' + error.message });
  }
});

// Update Uji Organoleptik (Administrator only)
router.put('/:id', authenticateToken, requireRoles('Administrator'), (req, res) => {
  const { id } = req.params;
  const { id_menu, tanggal, warna, aroma, rasa, tekstur, keterangan } = req.body;

  try {
    const stmt = db.prepare(`
      UPDATE uji_organoleptik
      SET id_menu = ?, tanggal = ?, warna = ?, aroma = ?, rasa = ?, tekstur = ?, keterangan = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id_uji = ?
    `);

    const result = stmt.run(
      Number(id_menu),
      tanggal,
      Number(warna),
      Number(aroma),
      Number(rasa),
      Number(tekstur),
      keterangan || '',
      id
    );

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Data uji organoleptik tidak ditemukan.' });
    }

    const updated = db.prepare(`
      SELECT u.*, m.nama_menu, m.deskripsi as deskripsi_menu
      FROM uji_organoleptik u
      JOIN menu_harian m ON u.id_menu = m.id_menu
      WHERE u.id_uji = ?
    `).get(id);

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal memperbarui uji organoleptik: ' + error.message });
  }
});

// Delete Uji Organoleptik (Administrator only)
router.delete('/:id', authenticateToken, requireRoles('Administrator'), (req, res) => {
  const { id } = req.params;

  try {
    const result = db.prepare('DELETE FROM uji_organoleptik WHERE id_uji = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Data uji organoleptik tidak ditemukan.' });
    }
    res.json({ message: 'Data uji organoleptik berhasil dihapus.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal menghapus data uji organoleptik: ' + error.message });
  }
});

export default router;
