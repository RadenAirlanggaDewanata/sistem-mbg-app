import { Router } from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRoles } from '../auth.js';

const router = Router();

// List Posyandu (Administrator & Kepala SPPG)
router.get('/', authenticateToken, requireRoles('Administrator', 'Kepala SPPG'), (req, res) => {
  const { search, status } = req.query;
  let query = 'SELECT * FROM posyandu WHERE 1=1';
  const params: any[] = [];

  if (search) {
    query += ' AND (nama_posyandu LIKE ? OR rw LIKE ? OR ketua_posyandu LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (status && status !== 'Semua') {
    query += ' AND status = ?';
    params.push(status);
  }

  query += ' ORDER BY id_posyandu ASC';

  try {
    const list = db.prepare(query).all(...params);
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data posyandu.' });
  }
});

// Create Posyandu (Administrator only)
router.post('/', authenticateToken, requireRoles('Administrator'), (req, res) => {
  const { nama_posyandu, rw, kelurahan, ketua_posyandu, no_telepon, jumlah_penerima, status } = req.body;

  if (!nama_posyandu || !rw || !ketua_posyandu) {
    return res.status(400).json({ message: 'Nama posyandu, RW, dan nama ketua posyandu wajib diisi.' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO posyandu (nama_posyandu, rw, kelurahan, ketua_posyandu, no_telepon, jumlah_penerima, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      nama_posyandu,
      rw,
      kelurahan || 'Padasuka',
      ketua_posyandu,
      no_telepon || '',
      Number(jumlah_penerima) || 0,
      status || 'Aktif'
    );

    const created = db.prepare('SELECT * FROM posyandu WHERE id_posyandu = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal menambahkan posyandu: ' + error.message });
  }
});

// Update Posyandu (Administrator only)
router.put('/:id', authenticateToken, requireRoles('Administrator'), (req, res) => {
  const { id } = req.params;
  const { nama_posyandu, rw, kelurahan, ketua_posyandu, no_telepon, jumlah_penerima, status } = req.body;

  try {
    const stmt = db.prepare(`
      UPDATE posyandu
      SET nama_posyandu = ?, rw = ?, kelurahan = ?, ketua_posyandu = ?, no_telepon = ?, jumlah_penerima = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id_posyandu = ?
    `);

    const result = stmt.run(
      nama_posyandu,
      rw,
      kelurahan || 'Padasuka',
      ketua_posyandu,
      no_telepon || '',
      Number(jumlah_penerima) || 0,
      status || 'Aktif',
      id
    );

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Data posyandu tidak ditemukan.' });
    }

    const updated = db.prepare('SELECT * FROM posyandu WHERE id_posyandu = ?').get(id);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal memperbarui posyandu: ' + error.message });
  }
});

// Delete Posyandu (Administrator only) - with relation guard
router.delete('/:id', authenticateToken, requireRoles('Administrator'), (req, res) => {
  const { id } = req.params;

  try {
    // Check relation
    const relatedCount = db.prepare('SELECT COUNT(*) as count FROM penerima_manfaat WHERE id_posyandu = ?').get(id) as { count: number };
    if (relatedCount && relatedCount.count > 0) {
      return res.status(400).json({
        message: `Posyandu tidak dapat dihapus karena masih memiliki ${relatedCount.count} data Penerima Manfaat yang terhubung.`,
      });
    }

    const result = db.prepare('DELETE FROM posyandu WHERE id_posyandu = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Data posyandu tidak ditemukan.' });
    }

    res.json({ message: 'Data posyandu berhasil dihapus.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal menghapus posyandu: ' + error.message });
  }
});

export default router;
