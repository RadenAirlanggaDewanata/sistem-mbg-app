import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  School,
  Building2,
  Users2,
  HeartHandshake,
  UtensilsCrossed,
  ClipboardCheck,
  CalendarCheck,
  FileBarChart,
  LogOut,
  X,
  ChefHat,
  ShieldAlert,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogoutConfirm: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onLogoutConfirm }) => {
  const { user } = useAuth();

  // Navigation items definition
  const navItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['Administrator', 'Kepala SPPG', 'Relawan'],
    },
    {
      title: 'Data Sekolah',
      path: '/sekolah',
      icon: School,
      roles: ['Administrator', 'Kepala SPPG'],
    },
    {
      title: 'Data Posyandu',
      path: '/posyandu',
      icon: Building2,
      roles: ['Administrator', 'Kepala SPPG'],
    },
    {
      title: 'Data Relawan',
      path: '/relawan',
      icon: Users2,
      roles: ['Administrator', 'Kepala SPPG'],
    },
    {
      title: 'Data Penerima Manfaat',
      path: '/penerima-manfaat',
      icon: HeartHandshake,
      roles: ['Administrator', 'Kepala SPPG'],
    },
    {
      title: 'Menu Harian',
      path: '/menu-harian',
      icon: UtensilsCrossed,
      roles: ['Administrator', 'Kepala SPPG', 'Relawan'],
    },
    {
      title: 'Uji Organoleptik',
      path: '/uji-organoleptik',
      icon: ClipboardCheck,
      roles: ['Administrator', 'Kepala SPPG', 'Relawan'],
    },
    {
      title: 'Absensi Relawan',
      path: '/absensi-relawan',
      icon: CalendarCheck,
      roles: ['Administrator', 'Kepala SPPG', 'Relawan'],
    },
    {
      title: 'Laporan',
      path: '/laporan',
      icon: FileBarChart,
      roles: ['Administrator', 'Kepala SPPG'],
    },
  ];

  // Filter items based on current user role
  const visibleNavItems = navItems.filter(item =>
    item.roles.includes(user?.role || '')
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-900/30">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-wide text-white">SIM-MBG</div>
              <div className="text-[10px] text-emerald-400 font-medium">SPPG Padasuka 2</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card inside sidebar */}
        <div className="p-4 mx-3 my-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
          <div className="text-xs text-slate-400 font-medium">Akun Terdaftar:</div>
          <div className="text-sm font-semibold text-white truncate">{user?.nama}</div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[11px] font-medium text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
              {user?.role}
            </span>
            <span className="text-[10px] text-slate-400">@{user?.username}</span>
          </div>
        </div>

        {/* Navigation items list */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
            Menu Utama
          </div>

          {visibleNavItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/50'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer info & Logout */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          {user?.role === 'Relawan' && (
            <div className="px-3 py-2 bg-amber-950/40 border border-amber-800/50 rounded-lg text-xs text-amber-300 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Akses dibatasi sesuai wewenang petugas Relawan.</span>
            </div>
          )}

          <button
            onClick={() => {
              onClose();
              onLogoutConfirm();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-300 hover:text-white hover:bg-rose-950/50 border border-rose-900/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Logout</span>
          </button>

          <div className="text-center text-[10px] text-slate-500 pt-1">
            Skripsi MBG Cimahi © 2026
          </div>
        </div>
      </aside>
    </>
  );
};
