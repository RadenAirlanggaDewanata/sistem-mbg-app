import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'sppg-padasuka-2-cimahi-secret-key-2026';

export interface AuthUser {
  id: number;
  nama: string;
  username: string;
  role: 'Administrator' | 'Kepala SPPG' | 'Relawan';
  id_relawan?: number | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      nama: user.nama,
      username: user.username,
      role: user.role,
      id_relawan: user.id_relawan ?? null,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Sesi kedaluwarsa atau token tidak ditemukan. Silakan masuk kembali.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token tidak valid. Silakan masuk kembali.' });
    }
    req.user = decoded as AuthUser;
    next();
  });
}

export function requireRoles(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Silakan masuk ke sistem terlebih dahulu.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Akses Ditolak: Hak akses '${req.user.role}' tidak diizinkan untuk melakukan tindakan ini.`,
      });
    }

    next();
  };
}
