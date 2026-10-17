'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, apiFetchWithMeta } from '@/lib/api';
import { DoctorDto, PatientDto, CreatePatientInput, createPatientSchema, UpdateDoctorInput, updateDoctorSchema } from '@doctor-tracker/shared';
import { usePermissions } from '@/hooks/usePermissions';
import { AppLayout } from '@/components/layout/AppLayout';
import { Stethoscope, ArrowLeft, Mail, Phone, Building2, UserPlus, Trash2, Search, X, Edit3 } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export default function DoctorDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const doctorId = params.id as string;
  const { can } = usePermissions();

  const canUpdateDoctor = can('doctors.update');
  const canCreatePatient = can('patients.create');
  const canDeletePatient = can('patients.delete');

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [editErrorMsg, setEditErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAddPatientOpen(false);
        setIsEditOpen(false);
      }
    };
    if (isAddPatientOpen || isEditOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddPatientOpen, isEditOpen]);

  const { data: doctor, isLoading: loadingDoctor } = useQuery<DoctorDto>({
    queryKey: ['doctor', doctorId],
    queryFn: () => apiFetch<DoctorDto>(`/doctors/${doctorId}`),
  });

  const { data: patientsRes, isLoading: loadingPatients } = useQuery<{ data: PatientDto[]; meta: any }>({
    queryKey: ['doctor-patients', doctorId, page, search],
    queryFn: () => apiFetchWithMeta<PatientDto[]>(`/doctors/${doctorId}/patients`, { params: { page, limit: 10, search } }),
  });

  const patients = patientsRes?.data || [];
  const meta = patientsRes?.meta || { totalPages: 1, page: 1, total: 0 };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreatePatientInput>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: { doctorId },
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: editErrors, isSubmitting: isEditSubmitting },
  } = useForm<UpdateDoctorInput>({
    resolver: zodResolver(updateDoctorSchema),
    values: doctor ? {
      name: doctor.name,
      specialization: doctor.specialization,
      hospital: doctor.hospital,
      phone: doctor.phone,
      email: doctor.email,
    } : undefined,
  });

  const updateDoctorMutation = useMutation({
    mutationFn: (data: UpdateDoctorInput) =>
      apiFetch(`/doctors/${doctorId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      setIsEditOpen(false);
    },
    onError: (err: any) => {
      setEditErrorMsg(err.message || 'Failed to update doctor');
    },
  });

  const addPatientMutation = useMutation({
    mutationFn: (data: CreatePatientInput) =>
      apiFetch(`/doctors/${doctorId}/patients`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-patients', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['doctor', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      setIsAddPatientOpen(false);
      reset();
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to add patient');
    },
  });

  const deletePatientMutation = useMutation({
    mutationFn: (patientId: string) => apiFetch(`/patients/${patientId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-patients', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['doctor', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
    onError: (err: any) => {
      alert(err.message);
    },
  });

  const onSubmitPatient = (data: CreatePatientInput) => {
    setErrorMsg(null);
    addPatientMutation.mutate({ ...data, doctorId });
  };

  const onSubmitEditDoctor = (data: UpdateDoctorInput) => {
    setEditErrorMsg(null);
    updateDoctorMutation.mutate(data);
  };

  if (loadingDoctor) {
    return (
      <AppLayout>
        <div className="p-12 text-center text-slate-400">Loading doctor profile...</div>
      </AppLayout>
    );
  }

  if (!doctor) {
    return (
      <AppLayout>
        <div className="p-12 text-center text-slate-600">
          <h2 className="text-xl font-bold">Doctor not found</h2>
          <Link href="/doctors" className="text-teal-600 underline mt-2 inline-block">Return to Doctors Directory</Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Back Link */}
        <div>
          <Link href="/doctors" className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-500 hover:text-teal-600">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Doctors Directory</span>
          </Link>
        </div>

        {/* Doctor Profile Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-start space-x-4">
            <div className="h-16 w-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center shrink-0">
              <Stethoscope className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-slate-800">{doctor.name}</h1>
                <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-semibold">
                  {doctor.specialization}
                </span>
              </div>
              <p className="text-sm text-slate-500 flex items-center space-x-1.5 mt-1">
                <Building2 className="h-4 w-4 text-slate-400" />
                <span>{doctor.hospital}</span>
              </p>
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-600">
                <span className="flex items-center space-x-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span>{doctor.email}</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>{doctor.phone}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {canUpdateDoctor && (
              <button
                onClick={() => setIsEditOpen(true)}
                className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit Doctor</span>
              </button>
            )}
            {canCreatePatient && (
              <button
                onClick={() => setIsAddPatientOpen(true)}
                className="inline-flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-teal-600/20 transition-all"
              >
                <UserPlus className="h-4 w-4" />
                <span>Add Patient to Doctor</span>
              </button>
            )}
          </div>
        </div>

        {/* Associated Patients Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Assigned Patients ({doctor.patientCount || 0})</h3>
              <p className="text-xs text-slate-500 mt-0.5">Patients currently under the care of {doctor.name}.</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search assigned patients..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4">Patient Name</th>
                  <th className="p-4">Age / Gender</th>
                  <th className="p-4">Condition</th>
                  <th className="p-4">Contact</th>
                  {canDeletePatient && <th className="p-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loadingPatients ? (
                  <tr>
                    <td colSpan={canDeletePatient ? 5 : 4} className="p-8 text-center text-slate-400">Loading patients...</td>
                  </tr>
                ) : patients.length > 0 ? (
                  patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-semibold text-slate-800">{patient.name}</td>
                      <td className="p-4 text-slate-600">{patient.age} yrs {patient.gender ? `(${patient.gender})` : ''}</td>
                      <td className="p-4 text-slate-600">
                        <span className="px-2.5 py-1 bg-sky-50 text-sky-700 rounded-full text-xs font-medium">
                          {patient.condition}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 text-xs">
                        <div>{patient.email || 'No email'}</div>
                        <div>{patient.phone || 'No phone'}</div>
                      </td>
                      {canDeletePatient && (
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to remove patient ${patient.name}?`)) {
                                deletePatientMutation.mutate(patient.id);
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center"
                            title="Remove Patient"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={canDeletePatient ? 5 : 4} className="p-8 text-center text-slate-400">No patients assigned to this doctor yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Doctor Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Edit Doctor: {doctor.name}</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            {editErrorMsg && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-sm">
                {editErrorMsg}
              </div>
            )}

            <form onSubmit={handleSubmitEdit(onSubmitEditDoctor)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Full Name</label>
                <input
                  {...registerEdit('name')}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                {editErrors.name && <p className="text-xs text-rose-500 mt-1">{editErrors.name.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Specialization</label>
                  <input
                    {...registerEdit('specialization')}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  {editErrors.specialization && <p className="text-xs text-rose-500 mt-1">{editErrors.specialization.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Hospital</label>
                  <input
                    {...registerEdit('hospital')}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  {editErrors.hospital && <p className="text-xs text-rose-500 mt-1">{editErrors.hospital.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Email</label>
                  <input
                    {...registerEdit('email')}
                    type="email"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  {editErrors.email && <p className="text-xs text-rose-500 mt-1">{editErrors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Phone</label>
                  <input
                    {...registerEdit('phone')}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  {editErrors.phone && <p className="text-xs text-rose-500 mt-1">{editErrors.phone.message}</p>}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditSubmitting}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-teal-600/20 text-sm transition-all"
                >
                  {isEditSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {isAddPatientOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Add Patient to {doctor.name}</h3>
              <button onClick={() => setIsAddPatientOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-sm">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmitPatient)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Patient Name</label>
                <input
                  {...register('name')}
                  placeholder="Jane Doe"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Age</label>
                  <input
                    {...register('age', { valueAsNumber: true })}
                    type="number"
                    placeholder="35"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  {errors.age && <p className="text-xs text-rose-500 mt-1">{errors.age.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Gender</label>
                  <select
                    {...register('gender')}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Condition</label>
                <input
                  {...register('condition')}
                  placeholder="Hypertension"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                {errors.condition && <p className="text-xs text-rose-500 mt-1">{errors.condition.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Email (Optional)</label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="patient@example.com"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Phone (Optional)</label>
                  <input
                    {...register('phone')}
                    placeholder="+1-555-0199"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddPatientOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-teal-600/20 text-sm transition-all"
                >
                  {isSubmitting ? 'Adding...' : 'Add Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
