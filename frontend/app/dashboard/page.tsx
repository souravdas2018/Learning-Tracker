// Author: Sourav Kumar Das
'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardAPI, courseAPI, aiAPI } from '@/services/api';
import Layout from '@/components/Layout';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

interface ChatMessage { role: 'user' | 'assistant'; content: string; }

interface RecentActivity {
  moduleTitle: string;
  courseTitle: string;
  progress: number;
  updatedAt: string;
}

interface DashboardData {
  overallProgress: number;
  totalTimeSpent: number;
  enrolledCoursesCount: number;
  completedCoursesCount: number;
  coursesInProgress: number;
  lastActiveCourse: { id: string; title: string; lastActivity: string } | null;
  moduleStats: { total: number; completed: number };
  courseProgress: { title: string; progress: number }[];
  weeklyActivity: { day: string; minutes: number }[];
  recentActivity: RecentActivity[];
}

const PIE_COLORS = ['#10b981', '#0ea5e9', '#f59e0b'];

const formatTime = (minutes: number) => {
  const h = Math.floor(minutes / 60), m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const relativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

function ProgressRing({ percent }: { percent: number }) {
  const r = 54, circ = 2 * Math.PI * r;
  const color = percent >= 75 ? '#10b981' : percent >= 40 ? '#0ea5e9' : '#f59e0b';
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#e5e7eb" strokeWidth="12" />
      <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ - (percent / 100) * circ}
        className="progress-ring-circle" />
      <text x="70" y="66" textAnchor="middle" fill={color} fontSize="22" fontWeight="700">{percent}%</text>
      <text x="70" y="84" textAnchor="middle" fill="#9ca3af" fontSize="11">progress</text>
    </svg>
  );
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<{ title: string; reason: string }[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);

  // Dashboard chat
  const [chatOpen, setChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatAsking, setChatAsking] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!authLoading && !user) router.push('/login'); }, [user, authLoading, router]);
  useEffect(() => { if (user) fetchData(); }, [user]);
  useEffect(() => { chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await dashboardAPI.getUserDashboard();
      setData(res.data);
      fetchInsight(res.data);
      fetchRecommendations(res.data);
    } catch { /* handled */ } finally { setLoading(false); }
  };

  const handleChat = async () => {
    if (!chatInput.trim() || chatAsking) return;
    const q = chatInput.trim();
    setChatInput('');
    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: q }];
    setChatHistory(newHistory);
    setChatAsking(true);
    try {
      const res = await aiAPI.chat(q, newHistory.slice(0, -1), data
        ? { enrolledCoursesCount: data.enrolledCoursesCount, completedCoursesCount: data.completedCoursesCount, overallProgress: data.overallProgress }
        : undefined);
      setChatHistory(prev => [...prev, { role: 'assistant', content: res.data.answer }]);
    } catch {
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not answer that right now. Please try again.' }]);
    } finally {
      setChatAsking(false);
    }
  };

  const fetchRecommendations = async (dashboardData: DashboardData) => {
    const cacheKey = `ai_recs_${user?.email}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) { try { setRecommendations(JSON.parse(cached)); } catch {} return; }
    try {
      setRecsLoading(true);
      const allCoursesRes = await courseAPI.getAllCourses();
      const allCourses: { id: string; title: string }[] = allCoursesRes.data?.data || allCoursesRes.data || [];
      const enrolledTitles = dashboardData.courseProgress.map(c => c.title);
      const unenrolled = allCourses.filter(c => !enrolledTitles.some(t => t.startsWith(c.title.slice(0, 20))));
      if (unenrolled.length === 0) return;
      const res = await aiAPI.getRecommendations(enrolledTitles, unenrolled);
      const recs = res.data.recommendations || [];
      setRecommendations(recs);
      sessionStorage.setItem(cacheKey, JSON.stringify(recs));
    } catch { /* non-critical */ } finally { setRecsLoading(false); }
  };

  const fetchInsight = async (dashboardData: DashboardData) => {
    // Use cached insight for the session to avoid repeat API calls
    const cacheKey = `ai_insight_${user?.email}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) { setInsight(cached); return; }

    try {
      setInsightLoading(true);
      const res = await aiAPI.getInsight(dashboardData);
      const text: string = res.data.insight;
      setInsight(text);
      sessionStorage.setItem(cacheKey, text);
    } catch { /* non-critical — silently skip */ } finally { setInsightLoading(false); }
  };

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mx-auto" />
        <p className="mt-4 text-sm text-gray-500 font-medium">Loading your dashboard…</p>
      </div>
    </div>
  );

  if (!data) return (
    <Layout><div className="text-center py-20 text-gray-400">Failed to load dashboard data.</div></Layout>
  );

  const notStarted = Math.max(0, data.enrolledCoursesCount - data.completedCoursesCount - data.coursesInProgress);
  const courseStatusData = [
    { name: 'Completed',   value: data.completedCoursesCount },
    { name: 'In Progress', value: data.coursesInProgress },
    { name: 'Not Started', value: notStarted },
  ].filter(d => d.value > 0);

  const completionRate = data.moduleStats.total > 0
    ? Math.round((data.moduleStats.completed / data.moduleStats.total) * 100) : 0;

  return (
    <>
    <Layout>
      <div className="px-4 py-6 sm:px-0 animate-fade-in">

        {/* ── Title ── */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">My Dashboard</h2>
          <p className="text-gray-500 mt-1 text-sm">Track your learning progress at a glance.</p>
        </div>

        {/* ── AI Insight banner ── */}
        {(insightLoading || insight) && (
          <div className="mb-6 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 p-4 flex items-start gap-3 shadow-soft">
            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-soft">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-violet-600 uppercase tracking-wide mb-1">AI Coach Insight</p>
              {insightLoading ? (
                <div className="space-y-2">
                  <div className="h-3 bg-violet-200/60 rounded-full shimmer w-full" />
                  <div className="h-3 bg-violet-200/60 rounded-full shimmer w-4/5" />
                </div>
              ) : (
                <p className="text-sm text-gray-700 leading-relaxed">{insight}</p>
              )}
            </div>
          </div>
        )}

        {/* ── Row 1: KPI cards ── */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {[
            { label: 'Overall Progress', value: `${data.overallProgress}%`,
              bg: 'from-blue-50 to-blue-100', border: 'border-blue-200', text: 'text-blue-700', sub: 'text-blue-600', iconBg: 'bg-blue-200',
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
            { label: 'Time Spent', value: formatTime(data.totalTimeSpent),
              bg: 'from-emerald-50 to-emerald-100', border: 'border-emerald-200', text: 'text-emerald-700', sub: 'text-emerald-600', iconBg: 'bg-emerald-200',
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> },
            { label: 'Enrolled', value: data.enrolledCoursesCount,
              bg: 'from-indigo-50 to-indigo-100', border: 'border-indigo-200', text: 'text-indigo-700', sub: 'text-indigo-600', iconBg: 'bg-indigo-200',
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /> },
            { label: 'Completed', value: data.completedCoursesCount,
              bg: 'from-purple-50 to-purple-100', border: 'border-purple-200', text: 'text-purple-700', sub: 'text-purple-600', iconBg: 'bg-purple-200',
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
          ].map((c, i) => (
            <div key={i} className={`stat-card bg-gradient-to-br ${c.bg} border ${c.border}`} style={{ animationDelay: `${i * 0.07}s` }}>
              <div className="p-6 flex items-center justify-between">
                <div>
                  <p className={`text-xs font-semibold ${c.sub} uppercase tracking-wider mb-1`}>{c.label}</p>
                  <p className={`text-4xl font-bold ${c.text}`}>{c.value}</p>
                </div>
                <div className={`p-3 ${c.iconBg} rounded-xl`}>
                  <svg className={`w-7 h-7 ${c.sub}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">{c.icon}</svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Row 2: Module stats mini-strip ── */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Modules', value: data.moduleStats.total, color: 'text-sky-600', bg: 'bg-sky-50 border-sky-100' },
            { label: 'Modules Completed', value: data.moduleStats.completed, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
            { label: 'Module Completion Rate', value: `${completionRate}%`, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-100' },
          ].map((m, i) => (
            <div key={i} className={`rounded-2xl border p-4 text-center ${m.bg} shadow-soft`}>
              <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{m.label}</p>
            </div>
          ))}
        </div>

        {/* ── Row 3: Progress ring + Course status ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="chart-card">
            <div className="chart-card-header">
              <h3 className="text-base font-semibold text-gray-800">Overall Progress</h3>
              <p className="text-xs text-gray-400 mt-0.5">Across all enrolled modules</p>
            </div>
            <div className="p-6 flex flex-col items-center gap-4">
              <ProgressRing percent={data.overallProgress} />
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="h-2.5 rounded-full bg-gradient-to-r from-primary-500 to-indigo-500 transition-all duration-700" style={{ width: `${data.overallProgress}%` }} />
              </div>
              <p className="text-sm text-gray-500">
                {data.coursesInProgress} in progress · {data.completedCoursesCount} completed
              </p>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-card-header">
              <h3 className="text-base font-semibold text-gray-800">Course Status</h3>
              <p className="text-xs text-gray-400 mt-0.5">Breakdown of enrolled courses</p>
            </div>
            <div className="p-4">
              {courseStatusData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-52 text-gray-300 gap-2">
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13" /></svg>
                  <p className="text-sm">No enrolled courses yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={courseStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {courseStatusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip /><Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* ── Row 4: Weekly activity + Course-by-course progress ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Weekly activity */}
          <div className="chart-card">
            <div className="chart-card-header">
              <h3 className="text-base font-semibold text-gray-800">Weekly Learning Activity</h3>
              <p className="text-xs text-gray-400 mt-0.5">Time spent per day (last 7 days)</p>
            </div>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.weeklyActivity} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis tickFormatter={v => v === 0 ? '0' : `${Math.floor(v / 60)}h`} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip formatter={(v: number) => [formatTime(v), 'Time spent']} />
                  <Bar dataKey="minutes" name="Time" fill="#0ea5e9" radius={[6, 6, 0, 0]}
                    background={{ fill: '#f9fafb', radius: 6 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Per-course progress */}
          <div className="chart-card">
            <div className="chart-card-header">
              <h3 className="text-base font-semibold text-gray-800">Progress by Course</h3>
              <p className="text-xs text-gray-400 mt-0.5">How far you are in each course</p>
            </div>
            <div className="p-5">
              {data.courseProgress.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-10">No course data yet</p>
              ) : (
                <div className="space-y-3">
                  {data.courseProgress.slice(0, 6).map((c, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-700 truncate max-w-[220px]">{c.title}</span>
                        <span className={`text-xs font-bold ml-2 ${c.progress === 100 ? 'text-emerald-600' : c.progress > 0 ? 'text-primary-600' : 'text-gray-400'}`}>
                          {c.progress}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${c.progress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-primary-500 to-indigo-500'}`}
                          style={{ width: `${c.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Row 5: Recent activity + Last active course ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Recent activity feed */}
          <div className="chart-card">
            <div className="chart-card-header">
              <h3 className="text-base font-semibold text-gray-800">Recent Activity</h3>
              <p className="text-xs text-gray-400 mt-0.5">Your last 5 module updates</p>
            </div>
            <div className="p-5">
              {data.recentActivity.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No activity yet</p>
              ) : (
                <ol className="relative border-l-2 border-gray-100 space-y-4 ml-2">
                  {data.recentActivity.map((a, i) => (
                    <li key={i} className="ml-5">
                      <span className={`absolute -left-[9px] flex items-center justify-center w-4 h-4 rounded-full ring-2 ring-white ${a.progress === 100 ? 'bg-emerald-500' : 'bg-primary-400'}`} />
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{a.moduleTitle}</p>
                          <p className="text-xs text-gray-400 truncate">{a.courseTitle}</p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${a.progress === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-primary-50 text-primary-600'}`}>
                            {a.progress}%
                          </span>
                          <p className="text-xs text-gray-400 mt-0.5">{relativeTime(a.updatedAt)}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>

          {/* Last active course / empty state */}
          <div className="flex flex-col gap-4">
            {data.lastActiveCourse ? (
              <div className="rounded-2xl overflow-hidden shadow-soft border border-primary-100 bg-gradient-to-r from-primary-50 via-indigo-50 to-purple-50 flex-1">
                <div className="p-6 h-full flex flex-col justify-between">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-medium flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-primary-500 uppercase tracking-wide">Continue where you left off</p>
                      <p className="text-lg font-bold text-gray-900 mt-0.5">{data.lastActiveCourse.title}</p>
                      <p className="text-xs text-gray-400">{new Date(data.lastActiveCourse.lastActivity).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => router.push(`/courses/${data.lastActiveCourse!.id}/modules`)}
                      className="flex-1 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white text-sm font-semibold rounded-xl shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all text-center">
                      Continue
                    </button>
                    <button onClick={() => router.push('/courses/my-courses')} className="btn-secondary">
                      My Courses
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mb-3">
                  <svg className="w-7 h-7 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-700 mb-1">Start learning</h3>
                <p className="text-sm text-gray-400 mb-4">Enroll in a course to begin tracking progress.</p>
                <button onClick={() => router.push('/courses')}
                  className="px-5 py-2 bg-gradient-to-r from-primary-600 to-indigo-600 text-white text-sm font-semibold rounded-xl shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all">
                  Browse Courses
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Row 6: AI Course Recommendations ── */}
        {(recsLoading || recommendations.length > 0) && (
          <div className="chart-card mb-6">
            <div className="chart-card-header flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-800">AI Course Recommendations</h3>
                <p className="text-xs text-gray-400 mt-0.5">Personalised suggestions based on your learning journey</p>
              </div>
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
            <div className="p-5">
              {recsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="rounded-xl border border-gray-100 p-4 space-y-2">
                      <div className="h-3 bg-gray-100 rounded-full shimmer w-3/4" />
                      <div className="h-2.5 bg-gray-100 rounded-full shimmer w-full" />
                      <div className="h-2.5 bg-gray-100 rounded-full shimmer w-5/6" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {recommendations.map((rec, i) => (
                    <div key={i} className="rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-4 flex flex-col gap-2">
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13" />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-gray-800">{rec.title}</p>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{rec.reason}</p>
                      <button onClick={() => router.push('/courses')}
                        className="mt-auto text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors text-left">
                        Browse courses →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </Layout>

    {/* ── Floating AI Chat button — outside Layout so CSS transform doesn't break fixed positioning ── */}
      <button
        onClick={() => setChatOpen(o => !o)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-primary-600 to-indigo-600 text-white rounded-full shadow-large hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center"
        title="AI Learning Assistant">
        {chatOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* ── AI Chat panel ── */}
      {chatOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-[360px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-slide-up">

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-primary-600 to-indigo-600 flex-shrink-0">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">AI Learning Assistant</p>
              <p className="text-white/60 text-xs">Ask anything about your learning</p>
            </div>
            <button onClick={() => setChatHistory([])} title="Clear chat" className="text-white/50 hover:text-white transition-colors mr-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {chatHistory.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-gray-400 py-6">
                <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Hi! I'm your learning assistant.</p>
                  <p className="text-xs mt-1 text-gray-400">Ask about study tips, courses, or your progress.</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-1">
                  {['How can I study better?', 'What should I learn next?', 'Help me stay motivated'].map(s => (
                    <button key={s} onClick={() => { setChatInput(s); }}
                      className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full text-gray-600 hover:border-primary-300 hover:text-primary-600 transition-colors shadow-soft">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1" />
                    </svg>
                  </div>
                )}
                <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm shadow-soft
                  ${msg.role === 'user'
                    ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
                  }`}>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {chatAsking && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1" />
                  </svg>
                </div>
                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-soft border border-gray-100 flex items-center gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 p-3 bg-white border-t border-gray-100">
            <div className="flex items-end gap-2">
              <textarea
                rows={1}
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChat(); } }}
                placeholder="Ask anything… (Enter to send)"
                className="flex-1 resize-none text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all max-h-28"
              />
              <button
                onClick={handleChat}
                disabled={!chatInput.trim() || chatAsking}
                className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl flex items-center justify-center shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
