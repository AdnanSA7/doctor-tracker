'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { AdminUserDto } from '@doctor-tracker/shared';
import { User, Menu } from 'lucide-react';

interface HeaderProps {
  onOpenMobile?: () => void;
}

export function Header({ onOpenMobile }: HeaderProps) {
  const pathname = usePathname();

  const { data: user } = useQuery<AdminUserDto>({
    queryKey: ['auth-me'],
    queryFn: () => apiFetch<AdminUserDto>('/auth/me'),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const getTitle = () => {
    if (pathname === '/') return 'Administrative Dashboard';
    if (pathname.startsWith('/doctors')) return 'Doctor Management';
    if (pathname.startsWith('/patients')) return 'Patient Management';
    if (pathname.startsWith('/users')) return 'User Administration';
    if (pathname.startsWith('/permissions')) return 'Access Matrix';
    return 'Control Center';
  };

  const displayName = user?.name || 'Administrator';
  const displayRole = user?.role ? user.role.toUpperCase() : 'ADMIN';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobile}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="Open mobile navigation menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h2 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">{getTitle()}</h2>
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
          <div className="h-7 w-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-semibold text-xs">
            <User className="h-4 w-4" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-800 leading-tight">{displayName}</span>
            <span className="text-[10px] font-semibold text-teal-700 tracking-wider uppercase">{displayRole}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
