// Author: Sourav Kumar Das
'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { courseAPI, aiAPI } from '@/services/api';
import Layout from '@/components/Layout';
import ProgressBar from '@/components/ProgressBar';
import { toast } from 'react-hot-toast';

interface Module {
  id: string;
  title: string;
  created_at: string;
  progress?: number;
  time_spent?: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

// ── Simple markdown renderer (bold, code blocks, inline code, lists) ─────────
function RenderMarkdown({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith('```')) return null;
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return <li key={i} className="ml-4 list-disc">{renderInline(line.slice(2))}</li>;
        }
        if (/^\d+\. /.test(line)) {
          return <li key={i} className="ml-4 list-decimal">{renderInline(line.replace(/^\d+\. /, ''))}</li>;
        }
        if (line.trim() === '') return <div key={i} className="h-1" />;
        return <p key={i}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="bg-gray-100 text-violet-700 px-1 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function ModulesClient({ courseId }: { courseId: string }) {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingProgress, setUpdatingProgress] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState('');

  // AI Study Assistant state
  const [chatOpen, setChatOpen] = useState(false);
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // AI Quiz state
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizModule, setQuizModule] = useState<Module | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => { if (!authLoading && !user) router.push('/login'); }, [user, authLoading, router]);
  useEffect(() => { if (user && courseId) fetchModules(); }, [user, courseId]);
  useEffect(() => { chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getModulesByCourse(courseId);
      const modulesData = response.data?.data || response.data || [];
      const list: Module[] = Array.isArray(modulesData) ? modulesData : [];
      setModules(list);
      if (list.length > 0) setActiveModule(list[0]);
      // Try to get course title from response meta
      setCourseTitle(response.data?.courseTitle || '');
    } catch (error: any) {
      console.error('Error fetching modules:', error);
      toast.error(error.response?.data?.error || 'Failed to fetch modules');
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async (moduleId: string) => {
    try {
      setUpdatingProgress(moduleId);
      await courseAPI.updateModuleProgress(moduleId);
      toast.success('Progress updated!');
      await fetchModules();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update progress');
    } finally {
      setUpdatingProgress(null);
    }
  };

  const openChat = (mod: Module) => {
    setActiveModule(mod);
    setChatHistory([]);
    setChatOpen(true);
  };

  const openQuiz = async (mod: Module) => {
    setQuizModule(mod);
    setQuizQuestions([]);
    setSelectedAnswers([]);
    setQuizSubmitted(false);
    setQuizOpen(true);
    setQuizLoading(true);
    try {
      const res = await aiAPI.getQuiz(mod.title, courseTitle || 'Unknown Course');
      const qs: QuizQuestion[] = res.data.questions || [];
      setQuizQuestions(qs);
      setSelectedAnswers(new Array(qs.length).fill(null));
    } catch {
      toast.error('Failed to generate quiz. Try again.');
      setQuizOpen(false);
    } finally {
      setQuizLoading(false);
    }
  };

  const submitQuiz = () => setQuizSubmitted(true);

  const quizScore = quizSubmitted
    ? quizQuestions.filter((q, i) => selectedAnswers[i] === q.correct).length
    : 0;

  const handleAsk = async () => {
    if (!question.trim() || asking) return;
    const q = question.trim();
    setQuestion('');
    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: q }];
    setChatHistory(newHistory);
    setAsking(true);
    try {
      const res = await aiAPI.askAssistant({
        moduleTitle: activeModule?.title || 'Unknown Module',
        courseTitle: courseTitle || 'Unknown Course',
        question: q,
        history: newHistory.slice(0, -1), // exclude the current question (already sent as `question`)
      });
      setChatHistory(prev => [...prev, { role: 'assistant', content: res.data.answer }]);
    } catch {
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not get an answer right now. Please try again.' }]);
    } finally {
      setAsking(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mx-auto" />
          <p className="mt-4 text-sm text-gray-500 font-medium">Loading modules…</p>
        </div>
      </div>
    );
  }

  const overallProgress = modules.length > 0
    ? modules.reduce((s, m) => s + (m.progress || 0), 0) / modules.length
    : 0;

  return (
    <Layout isAdmin={isAdmin}>
      <div className="px-4 py-6 sm:px-0 animate-fade-in">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Course Modules</h2>
            {!isAdmin && modules.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {modules.filter(m => (m.progress ?? 0) === 100).length} of {modules.length} completed
              </p>
            )}
          </div>
          <button onClick={() => router.back()}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        {/* Overall progress */}
        {modules.length > 0 && !isAdmin && (
          <div className="chart-card mb-6">
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-700">Overall Course Progress</p>
                <span className="text-sm font-bold text-primary-600">{Math.round(overallProgress)}%</span>
              </div>
              <ProgressBar value={overallProgress} />
            </div>
          </div>
        )}

        {/* Module list */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="text-base font-semibold text-gray-800">Modules</h3>
            <p className="text-xs text-gray-400 mt-0.5">{modules.length} module{modules.length !== 1 ? 's' : ''} in this course</p>
          </div>

          {modules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300 gap-3">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm">No modules available for this course</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {modules.map((module, idx) => {
                const prog = module.progress ?? 0;
                const done = prog === 100;
                return (
                  <li key={module.id} className="px-6 py-5 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Index badge */}
                      <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shadow-soft
                        ${done ? 'bg-emerald-500 text-white' : 'bg-primary-100 text-primary-600'}`}>
                        {done
                          ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                          : idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-base font-semibold text-gray-900 truncate">{module.title}</h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Added {new Date(module.created_at).toLocaleDateString()}
                            </p>
                          </div>

                          {!isAdmin && (
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {/* AI Ask button */}
                              <button
                                onClick={() => openChat(module)}
                                title="Ask AI about this module"
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-200 rounded-xl hover:bg-violet-100 transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                Ask AI
                              </button>

                              {/* AI Quiz button */}
                              <button
                                onClick={() => openQuiz(module)}
                                title="Take an AI quiz on this module"
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                                Quiz
                              </button>

                              {/* Update progress button */}
                              <button
                                onClick={() => handleUpdateProgress(module.id)}
                                disabled={updatingProgress === module.id || done}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all
                                  ${done
                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default'
                                    : 'bg-primary-600 text-white hover:bg-primary-700 shadow-soft hover:shadow-medium hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
                                  }`}>
                                {updatingProgress === module.id ? (
                                  <><div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />Updating…</>
                                ) : done ? (
                                  <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>Completed</>
                                ) : (
                                  'Mark Progress'
                                )}
                              </button>
                            </div>
                          )}
                        </div>

                        {!isAdmin && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Progress</span>
                              <span className={`font-bold ${done ? 'text-emerald-600' : prog > 0 ? 'text-primary-600' : 'text-gray-400'}`}>{prog}%</span>
                            </div>
                            <ProgressBar value={prog} height="h-1.5" showLabel={false} />
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ── AI Quiz modal ── */}
      {quizOpen && !isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !quizLoading && setQuizOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up max-h-[90vh]">

            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 flex-shrink-0">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">AI Quiz</p>
                <p className="text-white/70 text-xs truncate">{quizModule?.title}</p>
              </div>
              {!quizLoading && (
                <button onClick={() => setQuizOpen(false)} className="text-white/70 hover:text-white">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {quizLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-200 border-t-emerald-600" />
                  <p className="text-sm text-gray-500 font-medium">Generating your quiz…</p>
                </div>
              ) : quizSubmitted ? (
                <div className="text-center py-6">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold
                    ${quizScore >= 4 ? 'bg-emerald-100 text-emerald-600' : quizScore >= 3 ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-500'}`}>
                    {quizScore}/{quizQuestions.length}
                  </div>
                  <p className="text-lg font-bold text-gray-900 mb-1">
                    {quizScore === quizQuestions.length ? 'Perfect score!' : quizScore >= 3 ? 'Good job!' : 'Keep practicing!'}
                  </p>
                  <p className="text-sm text-gray-500 mb-6">You got {quizScore} out of {quizQuestions.length} correct</p>

                  <div className="space-y-4 text-left">
                    {quizQuestions.map((q, qi) => (
                      <div key={qi} className={`rounded-xl p-4 border ${selectedAnswers[qi] === q.correct ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                        <p className="text-sm font-semibold text-gray-800 mb-2">{qi + 1}. {q.question}</p>
                        {q.options.map((opt, oi) => (
                          <p key={oi} className={`text-xs py-1 px-2 rounded-lg mb-1
                            ${oi === q.correct ? 'bg-emerald-200 text-emerald-800 font-semibold' :
                              oi === selectedAnswers[qi] && oi !== q.correct ? 'bg-red-200 text-red-800' : 'text-gray-500'}`}>
                            {String.fromCharCode(65 + oi)}. {opt}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button onClick={() => openQuiz(quizModule!)} className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold rounded-xl hover:-translate-y-0.5 transition-all shadow-soft">
                      Retake Quiz
                    </button>
                    <button onClick={() => setQuizOpen(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors">
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {quizQuestions.map((q, qi) => (
                    <div key={qi}>
                      <p className="text-sm font-semibold text-gray-800 mb-2">{qi + 1}. {q.question}</p>
                      <div className="space-y-2">
                        {q.options.map((opt, oi) => (
                          <button
                            key={oi}
                            onClick={() => {
                              const updated = [...selectedAnswers];
                              updated[qi] = oi;
                              setSelectedAnswers(updated);
                            }}
                            className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all
                              ${selectedAnswers[qi] === oi
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-semibold'
                                : 'border-gray-200 text-gray-700 hover:border-emerald-300 hover:bg-emerald-50/50'}`}>
                            <span className="font-bold mr-2">{String.fromCharCode(65 + oi)}.</span>{opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={submitQuiz}
                    disabled={selectedAnswers.some(a => a === null)}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold rounded-xl shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed mt-2">
                    Submit Quiz
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── AI Study Assistant panel ── */}
      {chatOpen && !isAdmin && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:p-6 sm:pr-6">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setChatOpen(false)} />

          {/* Panel */}
          <div className="relative w-full sm:w-[420px] h-[560px] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">

            {/* Panel header */}
            <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 flex-shrink-0">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">AI Study Assistant</p>
                <p className="text-white/70 text-xs truncate">{activeModule?.title}</p>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-white/70 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {chatHistory.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-gray-400 py-8">
                  <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600 text-sm">Ask me anything</p>
                    <p className="text-xs mt-1">about <span className="font-medium text-violet-600">{activeModule?.title}</span></p>
                  </div>
                </div>
              )}

              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3" />
                      </svg>
                    </div>
                  )}
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm shadow-soft
                    ${msg.role === 'user'
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
                    }`}>
                    {msg.role === 'assistant'
                      ? <RenderMarkdown text={msg.content} />
                      : <p>{msg.content}</p>
                    }
                  </div>
                </div>
              ))}

              {asking && (
                <div className="flex justify-start">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1" />
                    </svg>
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-soft border border-gray-100 flex items-center gap-1.5">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
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
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk(); } }}
                  placeholder="Ask a question… (Enter to send)"
                  className="flex-1 resize-none text-sm px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all max-h-32"
                />
                <button
                  onClick={handleAsk}
                  disabled={!question.trim() || asking}
                  className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl flex items-center justify-center shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
