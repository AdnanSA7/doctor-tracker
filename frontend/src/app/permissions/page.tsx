'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { KeyRound, CheckCircle2, ShieldAlert } from 'lucide-react';

interface RolePermissionDto {
  role: string;
  canViewDashboard: boolean;
  canManageDoctors: boolean;
  canManagePatients: boolean;
  canManageUsers: boolean;
  canDeleteRecords: boolean;
}

export default function PermissionsPage() {
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data: permissions = [], isLoading } = useQuery<RolePermissionDto[]>({
    queryKey: ['permissions'],
    queryFn: () => apiFetch<RolePermissionDto[]>('/permissions'),
  });

  const updateMutation = useMutation({
    mutationFn: (perm: RolePermissionDto) =>
      apiFetch(`/permissions/${perm.role}`, { method: 'PUT', body: JSON.stringify(perm) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      setSuccessMsg('Permissions updated successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to update permissions');
    },
  });

  const handleToggle = (role: string, field: keyof RolePermissionDto, value: boolean) => {
    const current = permissions.find(p => p.role === role);
    if (!current) return;
    const updated = { ...current, [field]: value };
    updateMutation.mutate(updated);
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Role & Menu Access Matrix</h1>
            <p className="text-sm text-slate-500 mt-1">Configure feature access rights and powers for each user role.</p>
          </div>
        </div>

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl flex items-center space-x-3 text-sm shadow-sm">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4">Role</th>
                  <th className="p-4 text-center">Dashboard Access</th>
                  <th className="p-4 text-center">Manage Doctors</th>
                  <th className="p-4 text-center">Manage Patients</th>
                  <th className="p-4 text-center">User Management</th>
                  <th className="p-4 text-center">Delete Records</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">Loading permission matrix...</td>
                  </tr>
                ) : permissions.length > 0 ? (
                  permissions.map((perm) => (
                    <tr key={perm.role} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold text-slate-800 uppercase tracking-wide">
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          perm.role === 'admin' ? 'bg-indigo-50 text-indigo-700' :
                          perm.role === 'manager' ? 'bg-teal-50 text-teal-700' :
                          perm.role === 'staff' ? 'bg-sky-50 text-sky-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {perm.role}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={perm.canViewDashboard}
                          onChange={(e) => handleToggle(perm.role, 'canViewDashboard', e.target.checked)}
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded cursor-pointer"
                        />
                      </td>
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={perm.canManageDoctors}
                          onChange={(e) => handleToggle(perm.role, 'canManageDoctors', e.target.checked)}
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded cursor-pointer"
                        />
                      </td>
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={perm.canManagePatients}
                          onChange={(e) => handleToggle(perm.role, 'canManagePatients', e.target.checked)}
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded cursor-pointer"
                        />
                      </td>
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={perm.canManageUsers}
                          onChange={(e) => handleToggle(perm.role, 'canManageUsers', e.target.checked)}
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded cursor-pointer"
                        />
                      </td>
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={perm.canDeleteRecords}
                          onChange={(e) => handleToggle(perm.role, 'canDeleteRecords', e.target.checked)}
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">No permissions found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
