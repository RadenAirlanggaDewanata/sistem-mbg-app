import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, LogOut, ShieldCheck, MapPin, Calendar, Clock, UserCheck } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  onLogoutConfirm: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onLogoutConfirm }) => {
  const { user } = useAuth();
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' WIB'
      );
      setDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getRoleBadgeStyle = (role?: string) => {
    switch (role) {
      case 'Administrator':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Kepala SPPG':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Relawan':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 no-print">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Hamburger & Unit info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 lg:hidden"
            title="Buka menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <MapPin className="w-3 h-3 text-emerald-600" />
                <span>SPPG Padasuka 2 Cimahi Tengah</span>
              </div>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight hidden sm:block">
              Sistem Informasi Pelaksanaan Program Makan Bergizi Gratis (MBG)
            </h1>
          </div>
        </div>

        {/* Right: Date, Clock & User Info */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Live Date & Clock (desktop) */}
          <div className="hidden md:flex flex-col text-right text-xs text-slate-500 border-r border-slate-200 pr-5">
            <span className="flex items-center justify-end gap-1 font-medium text-slate-700">
              <Calendar className="w-3 h-3 text-slate-400" />
              {date}
            </span>
            <span className="flex items-center justify-end gap-1 font-mono text-slate-500">
              <Clock className="w-3 h-3 text-emerald-500" />
              {time}
            </span>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-900">{user?.nama || 'Petugas'}</div>
              <div className="flex justify-end">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${getRoleBadgeStyle(
                    user?.role
                  )}`}
                >
                  <ShieldCheck className="w-3 h-3 mr-1 inline" />
                  {user?.role}
                </span>
              </div>
            </div>

            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 font-bold shadow-sm">
              <UserCheck className="w-5 h-5 text-emerald-600" />
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogoutConfirm}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
              title="Logout dari sistem"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
