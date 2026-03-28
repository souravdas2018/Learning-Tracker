// Author: Sourav Kumar Das
'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardAPI, aiAPI } from '@/services/api';
import Layout from '@/components/Layout';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line,
} from 'recharts';

interface TopUser  { id: string; name: string; email: string; timeSpent: number; }
interface RiskItem { area: string; detail: string; action: string; }
interface TopCourse { id: string; title: string; enrollmentCount: number; }
interface GapItem  { topic: string; rationale: string; priority: 'high' | 'medium' | 'low'; }
interface AdminChatMessage { role: 'user' | 'assistant'; content: string; }

interface AdminDashboardData {
  users: { total: number; active: number; inactive: number; newThisMonth: number; withNoEnrollments: number; };
  courses: { total: number; totalModules: number; averageModulesPerCourse: number; withNoEnrollments: number; };
  enrollments: { total: number; active: number; averagePerCourse: number; };
  mostPopularCourse: { id: string; title: string; enrollmentCount: number } | null;
  top5Courses: TopCourse[];
  recentEnrollments: { day: string; count: number }[];
  engagement: { totalLearningTime: number; averageProgress: number; usersWithActivity: number; averageLearningTimePerUser: number; };
  topActiveUsers: TopUser[];
  progressDistribution: { range: string; count: number }[];
  admins: { total: number; pendingApprovals: number; };
}

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const formatTime = (m: number) => { const h = Math.floor(m / 60); return h > 0 ? `${h}h ${m % 60}m` : `${m}m`; };

// Gradient KPI card — matches user dashboard aesthetic
function KpiCard({ value, label, sub, gradient, border, textColor, subColor, iconBg, icon }: {
  value: string | number; label: string; sub: string;
  gradient: string; border: string; textColor: string; subColor: string; iconBg: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={`stat-card bg-gradient-to-br ${gradient} border ${border}`}>
      <div className="p-5 flex items-center justify-between">
        <div>
          <p className={`text-xs font-semibold ${subColor} uppercase tracking-wider mb-1`}>{label}</p>
          <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
          <p className={`text-xs mt-1 ${subColor} opacity-80`}>{sub}</p>
        </div>
        <div className={`p-3 ${iconBg} rounded-xl flex-shrink-0`}>
          <svg className={`w-6 h-6 ${subColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">{icon}</svg>
        </div>
      </div>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-sm font-bold text-gray-800">{value}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [riskAnalysis, setRiskAnalysis] = useState<{ riskLevel: string; summary: string; risks: RiskItem[] } | null>(null);
  const [riskLoading, setRiskLoading] = useState(false);
  const [contentGap, setContentGap] = useState<{ gaps: GapItem[]; insight: string } | null>(null);
  const [gapLoading, setGapLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<AdminChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatAsking, setChatAsking] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!authLoading && (!user || !isAdmin)) router.push('/login'); }, [user, isAdmin, authLoading, router]);
  useEffect(() => { if (user && isAdmin) fetchData(); }, [user, isAdmin]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const r = await dashboardAPI.getAdminDashboard();
      setData(r.data);
      fetchAiSummary(r.data);
      fetchRiskAnalysis(r.data);
      fetchContentGap(r.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchAiSummary = async (d: AdminDashboardData) => {
    const cached = sessionStorage.getItem('admin_ai_summary');
    if (cached) { setAiSummary(cached); return; }
    try {
      setSummaryLoading(true);
      const res = await aiAPI.getAdminSummary(d);
      setAiSummary(res.data.summary);
      sessionStorage.setItem('admin_ai_summary', res.data.summary);
    } catch { /* non-critical */ } finally { setSummaryLoading(false); }
  };

  const fetchRiskAnalysis = async (d: AdminDashboardData) => {
    const cached = sessionStorage.getItem('admin_risk_analysis');
    if (cached) { try { setRiskAnalysis(JSON.parse(cached)); } catch {} return; }
    try {
      setRiskLoading(true);
      const res = await aiAPI.getAtRiskAnalysis(d);
      setRiskAnalysis(res.data);
      sessionStorage.setItem('admin_risk_analysis', JSON.stringify(res.data));
    } catch { /* non-critical */ } finally { setRiskLoading(false); }
  };

  const fetchContentGap = async (d: AdminDashboardData) => {
    const cached = sessionStorage.getItem('admin_content_gap');
    if (cached) { try { setContentGap(JSON.parse(cached)); } catch {} return; }
    try {
      setGapLoading(true);
      const res = await aiAPI.getContentGapAnalysis(d);
      setContentGap(res.data);
      sessionStorage.setItem('admin_content_gap', JSON.stringify(res.data));
    } catch { /* non-critical */ } finally { setGapLoading(false); }
  };

  const handleAdminChat = async () => {
    const q = chatInput.trim();
    if (!q || chatAsking) return;
    const updated: AdminChatMessage[] = [...chatHistory, { role: 'user', content: q }];
    setChatHistory(updated);
    setChatInput('');
    setChatAsking(true);
    setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    try {
      const res = await aiAPI.adminChat(q, updated, data ?? undefined);
      const final: AdminChatMessage[] = [...updated, { role: 'assistant', content: res.data.answer }];
      setChatHistory(final);
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch { /* non-critical */ } finally { setChatAsking(false); }
  };

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mx-auto" />
        <p className="mt-4 text-sm text-gray-500 font-medium">Loading admin dashboard…</p>
      </div>
    </div>
  );

  if (!data) return (
    <Layout isAdmin><div className="text-center py-20 text-gray-400">Failed to load dashboard data.</div></Layout>
  );

  const userStatusData = [
    { name: 'Active',   value: data.users.active },
    { name: 'Inactive', value: data.users.inactive },
  ];

  return (
    <>
    <Layout isAdmin>
      <div className="px-4 py-6 sm:px-0 animate-fade-in">

        {/* ── Header ── */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
            <p className="text-gray-500 mt-1 text-sm">Platform overview and analytics.</p>
          </div>
          <button onClick={() => router.push('/dashboard/admin/manage')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white text-sm font-semibold rounded-xl shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Manage
          </button>
        </div>

        {/* ── AI Platform Summary banner ── */}
        {(summaryLoading || aiSummary) && (
          <div className="mb-6 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-violet-50 p-4 flex items-start gap-3 shadow-soft">
            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-soft">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">AI Platform Summary</p>
              {summaryLoading ? (
                <div className="space-y-2">
                  <div className="h-3 bg-blue-200/60 rounded-full shimmer w-full" />
                  <div className="h-3 bg-blue-200/60 rounded-full shimmer w-4/5" />
                  <div className="h-3 bg-blue-200/60 rounded-full shimmer w-3/5" />
                </div>
              ) : (
                <p className="text-sm text-gray-700 leading-relaxed">{aiSummary}</p>
              )}
            </div>
          </div>
        )}

        {/* ── Row 1: Primary KPI cards ── */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-5">
          <KpiCard value={data.users.total} label="Total Users" sub={`${data.users.active} currently active`}
            gradient="from-blue-50 to-blue-100" border="border-blue-200" textColor="text-blue-700" subColor="text-blue-600" iconBg="bg-blue-200"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />} />
          <KpiCard value={data.courses.total} label="Total Courses" sub={`${data.courses.totalModules} modules`}
            gradient="from-emerald-50 to-emerald-100" border="border-emerald-200" textColor="text-emerald-700" subColor="text-emerald-600" iconBg="bg-emerald-200"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />} />
          <KpiCard value={data.enrollments.total} label="Total Enrollments" sub={`${data.enrollments.active} active`}
            gradient="from-purple-50 to-purple-100" border="border-purple-200" textColor="text-purple-700" subColor="text-purple-600" iconBg="bg-purple-200"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />} />
          <KpiCard value={formatTime(data.engagement.totalLearningTime)} label="Total Learning Time" sub={`${data.engagement.usersWithActivity} learners`}
            gradient="from-orange-50 to-amber-100" border="border-orange-200" textColor="text-orange-700" subColor="text-orange-600" iconBg="bg-orange-200"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />} />
        </div>

        {/* ── Row 2: Secondary metric cards ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            { value: data.users.newThisMonth,         label: 'New Users This Month',       color: 'text-sky-600',    bg: 'bg-sky-50 border-sky-100' },
            { value: data.courses.averageModulesPerCourse, label: 'Avg Modules / Course',   color: 'text-teal-600',   bg: 'bg-teal-50 border-teal-100' },
            { value: data.users.withNoEnrollments,    label: 'Users Not Enrolled',          color: 'text-red-500',    bg: 'bg-red-50 border-red-100' },
            { value: data.courses.withNoEnrollments,  label: 'Courses With 0 Enrollments',  color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-100' },
          ].map((c, i) => (
            <div key={i} className={`rounded-2xl border p-4 text-center shadow-soft ${c.bg}`}>
              <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{c.label}</p>
            </div>
          ))}
        </div>

        {/* ── Row 3: User status pie + Enrollment trend ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="chart-card">
            <div className="chart-card-header">
              <h3 className="text-base font-semibold text-gray-800">User Status Distribution</h3>
              <p className="text-xs text-gray-400 mt-0.5">Active vs inactive users</p>
            </div>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={userStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value"
                    labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {userStatusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-card-header">
              <h3 className="text-base font-semibold text-gray-800">New Enrollments — Last 7 Days</h3>
              <p className="text-xs text-gray-400 mt-0.5">Daily enrollment trend</p>
            </div>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.recentEnrollments}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 5, fill: '#0ea5e9' }} activeDot={{ r: 7 }} name="Enrollments" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Row 4: Top 5 courses + Progress distribution ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="chart-card">
            <div className="chart-card-header">
              <h3 className="text-base font-semibold text-gray-800">Top 5 Most Popular Courses</h3>
              <p className="text-xs text-gray-400 mt-0.5">Ranked by enrollment count</p>
            </div>
            <div className="p-4">
              {data.top5Courses.length === 0
                ? <p className="text-gray-400 text-sm text-center py-10">No enrollment data yet</p>
                : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart layout="vertical" barSize={18}
                      data={data.top5Courses.map(c => ({ name: c.title.length > 22 ? c.title.slice(0, 22) + '…' : c.title, Enrollments: c.enrollmentCount }))}
                      margin={{ left: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                      <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                      <YAxis type="category" dataKey="name" width={148} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#374151' }} />
                      <Tooltip />
                      <Bar dataKey="Enrollments" fill="#8b5cf6" radius={[0, 6, 6, 0]}
                        background={{ fill: '#f5f3ff', radius: 6 }} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-card-header">
              <h3 className="text-base font-semibold text-gray-800">Progress Distribution</h3>
              <p className="text-xs text-gray-400 mt-0.5">Module progress buckets across all users</p>
            </div>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.progressDistribution} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Modules" fill="#10b981" radius={[6, 6, 0, 0]}
                    background={{ fill: '#f0fdf4', radius: 6 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Row 5: Top users + Engagement + Admin stats ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Top 5 active users */}
          <div className="chart-card">
            <div className="chart-card-header">
              <h3 className="text-base font-semibold text-gray-800">Top 5 Active Users</h3>
              <p className="text-xs text-gray-400 mt-0.5">Ranked by total time spent</p>
            </div>
            <div className="p-5">
              {data.topActiveUsers.length === 0
                ? <p className="text-gray-400 text-sm text-center py-8">No activity recorded yet</p>
                : (
                  <ol className="space-y-3">
                    {data.topActiveUsers.map((u, i) => (
                      <li key={u.id} className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-400' : 'bg-gray-200 text-gray-500'}`}>
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-800 truncate">{u.name}</p>
                          <p className="text-xs text-gray-400 truncate">{u.email}</p>
                        </div>
                        <span className="text-sm font-bold text-primary-600 whitespace-nowrap">{formatTime(u.timeSpent)}</span>
                      </li>
                    ))}
                  </ol>
                )}
            </div>
          </div>

          {/* Engagement metrics */}
          <div className="chart-card">
            <div className="chart-card-header">
              <h3 className="text-base font-semibold text-gray-800">Engagement</h3>
              <p className="text-xs text-gray-400 mt-0.5">Platform-wide metrics</p>
            </div>
            <div className="p-5 space-y-1">
              <MetricRow label="Average Progress" value={`${data.engagement.averageProgress}%`} />
              <MetricRow label="Avg Learning Time / User" value={formatTime(data.engagement.averageLearningTimePerUser)} />
              <MetricRow label="Avg Enrollments / Course" value={data.enrollments.averagePerCourse} />
              <div className="pt-3">
                <p className="text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">Most Popular Course</p>
                {data.mostPopularCourse ? (
                  <div className="bg-violet-50 rounded-xl p-3 border border-violet-100">
                    <p className="text-sm font-semibold text-gray-800 truncate">{data.mostPopularCourse.title}</p>
                    <p className="text-xs text-violet-600 mt-0.5 font-medium">{data.mostPopularCourse.enrollmentCount} enrollments</p>
                  </div>
                ) : <p className="text-sm text-gray-400">No data</p>}
              </div>
            </div>
          </div>

          {/* Admin stats */}
          <div className="chart-card">
            <div className="chart-card-header">
              <h3 className="text-base font-semibold text-gray-800">Admin Statistics</h3>
              <p className="text-xs text-gray-400 mt-0.5">Access and approvals</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">Total Admins</p>
                <p className="text-xl font-bold text-gray-900">{data.admins.total}</p>
              </div>
              <div className={`flex items-center justify-between p-3 rounded-xl ${data.admins.pendingApprovals > 0 ? 'bg-red-50 border border-red-100' : 'bg-gray-50'}`}>
                <div>
                  <p className="text-sm text-gray-600">Pending Approvals</p>
                  {data.admins.pendingApprovals > 0 && (
                    <button onClick={() => router.push('/dashboard/admin/manage')}
                      className="text-xs text-red-500 font-medium mt-0.5 hover:underline">
                      Review now →
                    </button>
                  )}
                </div>
                <p className={`text-xl font-bold ${data.admins.pendingApprovals > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {data.admins.pendingApprovals}
                </p>
              </div>
              {data.admins.pendingApprovals > 0 && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-xs text-amber-700 font-medium">
                    {data.admins.pendingApprovals} admin{data.admins.pendingApprovals > 1 ? 's' : ''} waiting for approval
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Row 6: AI Engagement Risk Analysis ── */}
        {(riskLoading || riskAnalysis) && (
          <div className="chart-card mt-6">
            <div className="chart-card-header flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-800">AI Engagement Risk Analysis</h3>
                <p className="text-xs text-gray-400 mt-0.5">AI-identified risks and recommended actions</p>
              </div>
              {riskAnalysis && (
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  riskAnalysis.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                  riskAnalysis.riskLevel === 'medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'}`}>
                  {riskAnalysis.riskLevel?.toUpperCase()} RISK
                </span>
              )}
            </div>
            <div className="p-5">
              {riskLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="rounded-xl border border-gray-100 p-4 space-y-2">
                      <div className="h-3 bg-gray-100 rounded-full shimmer w-1/3" />
                      <div className="h-2.5 bg-gray-100 rounded-full shimmer w-full" />
                      <div className="h-2.5 bg-gray-100 rounded-full shimmer w-4/5" />
                    </div>
                  ))}
                </div>
              ) : riskAnalysis && (
                <>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{riskAnalysis.summary}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(riskAnalysis.risks || []).map((risk, i) => (
                      <div key={i} className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                        <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">{risk.area}</p>
                        <p className="text-sm text-gray-700 mb-2">{risk.detail}</p>
                        <div className="flex items-start gap-1.5">
                          <svg className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <p className="text-xs text-emerald-700 font-medium">{risk.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Row 7: AI Content Gap Analysis ── */}
        {(gapLoading || contentGap) && (
          <div className="chart-card mt-6">
            <div className="chart-card-header">
              <h3 className="text-base font-semibold text-gray-800">AI Content Gap Analysis</h3>
              <p className="text-xs text-gray-400 mt-0.5">Suggested new course topics based on enrollment patterns</p>
            </div>
            <div className="p-5">
              {gapLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="rounded-xl border border-gray-100 p-4 space-y-2">
                      <div className="h-3 bg-gray-100 rounded-full shimmer w-1/4" />
                      <div className="h-2.5 bg-gray-100 rounded-full shimmer w-full" />
                      <div className="h-2.5 bg-gray-100 rounded-full shimmer w-3/5" />
                    </div>
                  ))}
                </div>
              ) : contentGap && (
                <>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{contentGap.insight}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(contentGap.gaps || []).map((gap, i) => {
                      const priorityStyle =
                        gap.priority === 'high'   ? 'border-red-100 bg-red-50 text-red-700 badge-bg-red-100' :
                        gap.priority === 'medium' ? 'border-amber-100 bg-amber-50 text-amber-700' :
                                                    'border-emerald-100 bg-emerald-50 text-emerald-700';
                      const badgeStyle =
                        gap.priority === 'high'   ? 'bg-red-100 text-red-700' :
                        gap.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-emerald-100 text-emerald-700';
                      return (
                        <div key={i} className={`rounded-xl border p-4 ${
                          gap.priority === 'high' ? 'border-red-100 bg-red-50' :
                          gap.priority === 'medium' ? 'border-amber-100 bg-amber-50' :
                          'border-emerald-100 bg-emerald-50'}`}>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-sm font-bold text-gray-800">{gap.topic}</p>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${badgeStyle}`}>
                              {gap.priority}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">{gap.rationale}</p>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </Layout>

    {/* ── Floating Admin AI Chat (outside Layout to avoid transform stacking context) ── */}
    <button
      onClick={() => setChatOpen(o => !o)}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-full shadow-large hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center"
      title="AI Admin Assistant">
      {chatOpen ? (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.32 2.798H4.118c-1.35 0-2.318-1.798-1.32-2.798L4 15.249" />
        </svg>
      )}
    </button>

    {chatOpen && (
      <div className="fixed bottom-24 right-6 z-40 w-[360px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.32 2.798H4.118c-1.35 0-2.318-1.798-1.32-2.798L4 15.249" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold">Admin AI Assistant</p>
            <p className="text-[10px] text-indigo-200">Platform-aware · Powered by AI</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {chatHistory.length === 0 && (
            <div className="text-center mt-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.32 2.798H4.118c-1.35 0-2.318-1.798-1.32-2.798L4 15.249" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-700">Admin AI Assistant</p>
              <p className="text-xs text-gray-400 mt-1">Ask about platform metrics, user engagement, course strategy, or anything admin-related.</p>
            </div>
          )}
          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-br-sm'
                  : 'bg-white text-gray-800 border border-gray-100 shadow-soft rounded-bl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {chatAsking && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 shadow-soft rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 border-t border-gray-100 p-3 bg-white flex gap-2">
          <input
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAdminChat()}
            placeholder="Ask about your platform…"
            className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
          />
          <button
            onClick={handleAdminChat}
            disabled={chatAsking || !chatInput.trim()}
            className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-xl flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-opacity flex-shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    )}
    </>
  );
}
