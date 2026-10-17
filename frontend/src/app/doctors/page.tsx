'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetchWithMeta, apiFetch } from '@/lib/api';
import { DoctorDto, CreateDoctorInput, createDoctorSchema } from '@doctor-tracker/shared';
import { usePermissions } from '@/hooks/usePermissions';
import { AppLayout } from '@/components/layout/AppLayout';
import { Stethoscope, Search, Plus, Trash2, ChevronLeft, ChevronRight, X, Mail, Phone, Building2 } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export default function DoctorsPage() {
  const queryClient = useQueryClient();
  const { can } = usePermissions();
  const canCreate = can('doctors.create');
  const canDelete = can('doctors.delete');

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [hospital, setHospital] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCreateOpen(false);
      }
    };
    if (isCreateOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreateOpen]);

  const { data: response, isLoading } = useQuery<{ data: DoctorDto[]; meta: any }>({
    queryKey: ['doctors', page, search, specialization, hospital, fromDate, toDate],
    queryFn: () => apiFetchWithMeta<DoctorDto[]>('/doctors', { params: { page, limit: 10, search, specialization, hospital, from: fromDate, to: toDate } }),
  });

  const doctors = response?.data || [];
  const meta = response?.meta || { totalPages: 1, page: 1, total: 0 };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateDoctorInput>({
    resolver: zodResolver(createDoctorSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateDoctorInput) => apiFetch('/doctors', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      setIsCreateOpen(false);
      reset();
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to create doctor');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, force }: { id: string; force?: boolean }) => {
      return apiFetch(`/doctors/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
    onError: (err: any) => {
      if (err.code === 'DOCTOR_HAS_PATIENTS') {
        if (window.confirm(`${err.message}\n\nDo you want to forcefully delete this doctor and all associated patients?`)) {
          deleteMutation.mutate({ id: err.doctorId, force: true });
        }
      } else {
        alert(err.message);
      }
    },
  });

  const onSubmit = (data: CreateDoctorInput) => {
    setErrorMsg(null);
    createMutation.mutate(data);
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Doctor Directory</h1>
            <p className="text-sm text-slate-500 mt-1">Manage medical professionals and associated patient assignments.</p>
          </div>
          {canCreate && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-teal-600/20 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add Doctor</span>
            </button>
          )}
        </div>

        {/* Filters and Search Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute inset-y-0 left-3.5 my-auto h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, specialization, hospital..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Filter Specialization"
              value={specialization}
              onChange={(e) => {
                setSpecialization(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
            <input
              type="text"
              placeholder="Filter Hospital"
              value={hospital}
              onChange={(e) => {
                setHospital(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              title="Created From"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              title="Created To"
            />
          </div>
        </div>

        {/* Doctors Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4">Doctor Name</th>
                  <th className="p-4">Specialization</th>
                  <th className="p-4">Hospital</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4 text-center">Patients</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Loading doctors directory...
                    </td>
                  </tr>
                ) : doctors.length > 0 ? (
                  doctors.map((doctor) => (
                    <tr key={doctor.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-semibold text-slate-800">
                        <Link href={`/doctors/${doctor.id}`} className="hover:text-teal-600 transition-colors">
                          {doctor.name}
                        </Link>
                      </td>
                      <td className="p-4 text-slate-600">
                        <span className="px-2.5 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium">
                          {doctor.specialization}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 flex items-center space-x-1.5 pt-5">
                        <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                        <span>{doctor.hospital}</span>
                      </td>
                      <td className="p-4 text-slate-600">
                        <div className="text-xs space-y-0.5">
                          <div className="flex items-center space-x-1.5">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <span>{doctor.email}</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            <span>{doctor.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full font-bold text-xs">
                          {doctor.patientCount || 0}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <Link
                          href={`/doctors/${doctor.id}`}
                          className="px-3 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg text-xs font-semibold transition-colors"
                        >
                          View & Patients
                        </Link>
                        {canDelete && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete ${doctor.name}?`)) {
                                deleteMutation.mutate({ id: doctor.id });
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center"
                            title="Delete Doctor"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No doctors found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs text-slate-500">
              Showing page {meta.page} of {meta.totalPages} (Total {meta.total} doctors)
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, meta.totalPages))}
                disabled={page >= meta.totalPages}
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Doctor Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Add New Doctor</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-sm">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Full Name</label>
                <input
                  {...register('name')}
                  placeholder="Dr. John Smith"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Specialization</label>
                  <input
                    {...register('specialization')}
                    placeholder="Cardiology"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  {errors.specialization && <p className="text-xs text-rose-500 mt-1">{errors.specialization.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Hospital</label>
                  <input
                    {...register('hospital')}
                    placeholder="City Hospital"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  {errors.hospital && <p className="text-xs text-rose-500 mt-1">{errors.hospital.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Email</label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="doctor@hospital.com"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Phone</label>
                  <input
                    {...register('phone')}
                    placeholder="+1-555-0199"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-teal-600/20 text-sm transition-all"
                >
                  {isSubmitting ? 'Creating...' : 'Create Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
