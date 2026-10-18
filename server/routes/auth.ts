import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { generateToken, authenticateToken, AuthenticatedRequest } from '../auth.js';

const router = Router();

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Nama pengguna atau password tidak sesuai.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ? OR id = ?').get(username, username) as any;

  if (!user) {
    return res.status(401).json({ message: 'Nama pengguna atau password tidak sesuai.' });
  }

  const isPasswordMatch = bcrypt.compareSync(password, user.password);
  if (!isPasswordMatch) {
    return res.status(401).json({ message: 'Nama pengguna atau password tidak sesuai.' });
  }

  if (user.status !== 'Aktif') {
    return res.status(403).json({ message: 'Akun Anda berstatus nonaktif. Silakan hubungi Administrator.' });
  }

  // Check if linked to a relawan record
  let relawanRecord = null;
  if (user.role === 'Relawan') {
    relawanRecord = db.prepare('SELECT id_relawan FROM relawan WHERE id_user = ?').get(user.id) as any;
  }

  const tokenUser = {
    id: user.id,
    nama: user.nama,
    username: user.username,
    role: user.role,
    id_relawan: relawanRecord ? relawanRecord.id_relawan : null,
  };

  const token = generateToken(tokenUser);

  return res.json({
    message: 'Berhasil masuk ke sistem.',
    token,
    user: {
      id: user.id,
      nama: user.nama,
      username: user.username,
      role: user.role,
      no_telepon: user.no_telepon,
      alamat: user.alamat,
      status: user.status,
      id_relawan: relawanRecord ? relawanRecord.id_relawan : null,
    },
  });
});

// Current User Info
router.get('/me', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Sesi tidak valid.' });
  }

  const user = db.prepare('SELECT id, nama, username, role, no_telepon, alamat, status, created_at FROM users WHERE id = ?').get(req.user.id) as any;
  if (!user) {
    return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
  }

  let id_relawan = null;
  if (user.role === 'Relawan') {
    const relawanRecord = db.prepare('SELECT id_relawan FROM relawan WHERE id_user = ?').get(user.id) as any;
    if (relawanRecord) {
      id_relawan = relawanRecord.id_relawan;
    }
  }

  return res.json({
    ...user,
    id_relawan,
  });
});

// Logout
router.post('/logout', (req, res) => {
  return res.json({ message: 'Berhasil keluar dari sistem.' });
});

export default router;
