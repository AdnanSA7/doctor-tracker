'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { DashboardSummaryDto, DashboardAnalyticsDto } from '@doctor-tracker/shared';
import { AppLayout } from '@/components/layout/AppLayout';
import { Stethoscope, Users, UserCheck, TrendingUp, Activity, Plus } from 'lucide-react';
import Link from 'next/link';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0d9488', '#0284c7', '#6366f1', '#ec4899', '#f59e0b', '#10b981'];

export default function DashboardPage() {
  const { data: summary, isLoading: loadingSummary } = useQuery<DashboardSummaryDto>({
    queryKey: ['dashboard-summary'],
    queryFn: () => apiFetch<DashboardSummaryDto>('/dashboard/summary'),
  });

  const { data: analytics, isLoading: loadingAnalytics } = useQuery<DashboardAnalyticsDto>({
    queryKey: ['dashboard-analytics'],
    queryFn: () => apiFetch<DashboardAnalyticsDto>('/dashboard/analytics'),
  });

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Top greeting & quick actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Welcome back, Administrator</h1>
            <p className="text-sm text-slate-500 mt-1">Here is the real-time operational overview of Doctor Tracker.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/doctors"
              className="inline-flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-teal-600/20 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Manage Doctors</span>
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Doctors</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">
                {loadingSummary ? '...' : summary?.totalDoctors || 0}
              </h3>
            </div>
            <div className="h-14 w-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
              <Stethoscope className="h-7 w-7" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Patients</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">
                {loadingSummary ? '...' : summary?.totalPatients || 0}
              </h3>
            </div>
            <div className="h-14 w-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center">
              <Users className="h-7 w-7" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Patients per Doctor (Avg)</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">
                {loadingSummary ? '...' : summary?.patientsPerDoctorAvg || 0}
              </h3>
            </div>
            <div className="h-14 w-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <UserCheck className="h-7 w-7" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Patients per Doctor Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
              <Activity className="h-5 w-5 text-teal-600" />
              <span>Patients Assigned per Doctor</span>
            </h3>
            <div className="h-72 w-full">
              {loadingAnalytics ? (
                <div className="h-full flex items-center justify-center text-slate-400">Loading analytics...</div>
              ) : analytics?.patientsPerDoctor && analytics.patientsPerDoctor.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.patientsPerDoctor}>
                    <XAxis dataKey="doctorName" stroke="#64748b" fontSize={12} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="count" fill="#0d9488" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">No analytics data available</div>
              )}
            </div>
          </div>

          {/* Condition Distribution Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-sky-600" />
              <span>Patient Condition Distribution</span>
            </h3>
            <div className="h-72 w-full flex items-center justify-center">
              {loadingAnalytics ? (
                <div className="text-slate-400">Loading analytics...</div>
              ) : analytics?.conditionDistribution && analytics.conditionDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.conditionDistribution}
                      dataKey="count"
                      nameKey="condition"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ condition, percent }) => `${condition} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {analytics.conditionDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-slate-400 text-sm">No condition data available</div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Records Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Doctors */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Recently Added Doctors</h3>
              <Link href="/doctors" className="text-sm font-semibold text-teal-600 hover:text-teal-700">
                View All →
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {summary?.recentDoctors && summary.recentDoctors.length > 0 ? (
                summary.recentDoctors.map((doc) => (
                  <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <Link href={`/doctors/${doc.id}`} className="font-semibold text-slate-800 hover:text-teal-600">
                        {doc.name}
                      </Link>
                      <p className="text-xs text-slate-500">{doc.specialization} • {doc.hospital}</p>
                    </div>
                    <span className="text-xs text-slate-400">{new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400 text-sm">No doctors found</div>
              )}
            </div>
          </div>

          {/* Recent Patients */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Recently Added Patients</h3>
              <Link href="/patients" className="text-sm font-semibold text-teal-600 hover:text-teal-700">
                View All →
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {summary?.recentPatients && summary.recentPatients.length > 0 ? (
                summary.recentPatients.map((patient) => (
                  <div key={patient.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <span className="font-semibold text-slate-800">{patient.name}</span>
                      <p className="text-xs text-slate-500">Condition: {patient.condition} (Dr. {patient.doctor?.name || 'Unassigned'})</p>
                    </div>
                    <span className="text-xs text-slate-400">{new Date(patient.createdAt).toLocaleDateString()}</span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400 text-sm">No patients found</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
