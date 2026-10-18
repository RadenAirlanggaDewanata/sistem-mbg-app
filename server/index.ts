import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { initDatabase } from './db.js';
import { seedData } from './seed.js';

import authRouter from './routes/auth.js';
import dashboardRouter from './routes/dashboard.js';
import sekolahRouter from './routes/sekolah.js';
import posyanduRouter from './routes/posyandu.js';
import relawanRouter from './routes/relawan.js';
import penerimaRouter from './routes/penerima.js';
import menuRouter from './routes/menu.js';
import organoleptikRouter from './routes/organoleptik.js';
import absensiRouter from './routes/absensi.js';
import laporanRouter from './routes/laporan.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database and seed initial required records
try {
  initDatabase();
  seedData();
} catch (error) {
  console.error('Database setup error:', error);
}

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/sekolah', sekolahRouter);
app.use('/api/posyandu', posyanduRouter);
app.use('/api/relawan', relawanRouter);
app.use('/api/penerima', penerimaRouter);
app.use('/api/menu', menuRouter);
app.use('/api/organoleptik', organoleptikRouter);
app.use('/api/absensi', absensiRouter);
app.use('/api/laporan', laporanRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'Sistem Informasi Pelaksanaan Program Makan Bergizi Gratis (MBG)',
    unit: 'SPPG Padasuka 2 Cimahi Tengah',
    timestamp: new Date().toISOString(),
  });
});

// Serve frontend production build if available
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) {
      return res.sendFile(path.resolve(distPath, 'index.html'));
    }
    next();
  });
}

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
