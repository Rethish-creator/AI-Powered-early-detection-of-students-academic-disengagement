import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { AttractiveBackground, BackgroundVariant, PHOTO_PRESETS } from '../components/AttractiveBackground.tsx';
import { ImageStudioModal } from '../components/ImageStudioModal.tsx';
import {
  GraduationCap,
  Sparkles,
  ShieldCheck,
  TrendingDown,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
  BrainCircuit,
  Lock,
  FileSpreadsheet,
  AlertTriangle,
  Users,
  Compass,
  ArrowUpRight,
  Image as ImageIcon
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { quickDemoLogin } = useAuth();
  const [selectedBg, setSelectedBg] = useState<BackgroundVariant>('clean-library');
  const [customBgUrl, setCustomBgUrl] = useState<string | undefined>(undefined);
  const [imageStudioOpen, setImageStudioOpen] = useState(false);

  const handleLaunchRole = async (role: 'FACULTY' | 'ADMIN' | 'STUDENT') => {
    await quickDemoLogin(role);
    if (role === 'STUDENT') onNavigate('student-dashboard');
    else if (role === 'ADMIN') onNavigate('admin-dashboard');
    else onNavigate('faculty-dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Hero Section with Academic-Themed Background & CSS Overlay (bg-slate-900/70) */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32 text-white border-b border-slate-800">
        <AttractiveBackground
          variant={selectedBg}
          customImageUrl={customBgUrl}
          overlayStyle="bg-slate-900/70"
          imageOpacity={0.85}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          
          {/* Subtle Background Theme Switcher Pill */}
          <div className="inline-flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-2xl sm:rounded-full bg-slate-900/85 backdrop-blur-md border border-white/20 text-xs mb-6 shadow-xl">
            <span className="text-[11px] font-bold text-indigo-300 px-2.5 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Academic Theme:</span>
            </span>
            <button
              onClick={() => {
                setCustomBgUrl(undefined);
                setSelectedBg('clean-library');
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                !customBgUrl && (selectedBg === 'clean-library' || selectedBg === 'library-hall')
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Clean Library
            </button>
            <button
              onClick={() => {
                setCustomBgUrl(undefined);
                setSelectedBg('data-network');
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                !customBgUrl && (selectedBg === 'data-network' || selectedBg === 'cyber-academic')
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Digital Data Network
            </button>
            <button
              onClick={() => {
                setCustomBgUrl(undefined);
                setSelectedBg('campus-quad');
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                !customBgUrl && (selectedBg === 'campus-quad' || selectedBg === 'campus-hero')
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Campus Quad
            </button>
            <button
              onClick={() => {
                setCustomBgUrl(undefined);
                setSelectedBg('learning-hub');
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                !customBgUrl && (selectedBg === 'learning-hub' || selectedBg === 'student-portal')
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Learning Hub
            </button>

            {/* AI Image Studio Trigger */}
            <button
              onClick={() => setImageStudioOpen(true)}
              className="px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-500/30 hover:bg-indigo-500/50 text-indigo-200 border border-indigo-400/40 transition-all flex items-center gap-1 shadow-xs"
              title="Create & Edit Background Images with Gemini"
            >
              <Sparkles className="w-3 h-3 text-indigo-300" />
              <span>AI Studio</span>
            </button>
          </div>

          <div className="block">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 backdrop-blur-md border border-indigo-400/40 text-indigo-200 text-xs font-semibold mb-6 shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Explainable AI for Student Academic Success</span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight drop-shadow-md">
            Detect Early. Support Better.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-cyan-300 to-indigo-200">
              Improve Learning.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            An explainable AI-powered platform that helps educators identify early changes in student academic engagement and provide timely support.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => handleLaunchRole('FACULTY')}
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-xl hover:shadow-indigo-500/25 transition-all text-sm flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <span>Explore Faculty Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleLaunchRole('ADMIN')}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 backdrop-blur-md shadow-lg transition-all text-sm hover:scale-105 active:scale-95"
            >
              <span>Administrator Console</span>
            </button>
          </div>

          {/* Quick Demo Access Bar */}
          <div className="mt-12 p-4 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/15 max-w-3xl mx-auto shadow-2xl">
            <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-3">
              One-Click Role Demonstration
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleLaunchRole('FACULTY')}
                className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-400 rounded-xl text-left transition-all group"
              >
                <div className="font-bold text-xs text-indigo-300 group-hover:text-indigo-200 flex items-center justify-between">
                  <span>Faculty / Mentor</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-300" />
                </div>
                <div className="text-[11px] text-slate-300 mt-1">
                  Assess class trends, view S023 explainability & trigger interventions
                </div>
              </button>

              <button
                onClick={() => handleLaunchRole('ADMIN')}
                className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400 rounded-xl text-left transition-all group"
              >
                <div className="font-bold text-xs text-purple-300 group-hover:text-purple-200 flex items-center justify-between">
                  <span>Administrator</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-300" />
                </div>
                <div className="text-[11px] text-slate-300 mt-1">
                  Import CSV datasets, view college audits & oversee departments
                </div>
              </button>

              <button
                onClick={() => handleLaunchRole('STUDENT')}
                className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-400 rounded-xl text-left transition-all group"
              >
                <div className="font-bold text-xs text-emerald-300 group-hover:text-emerald-200 flex items-center justify-between">
                  <span>Student (Priya)</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-300" />
                </div>
                <div className="text-[11px] text-slate-300 mt-1">
                  View personal progress, positive feedback & scheduled meetings
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - With Subtle Academic Lecture Hall Backdrop */}
      <section className="relative overflow-hidden py-20 bg-slate-50 border-b border-slate-200">
        <AttractiveBackground variant="lecture-hall" overlayStyle="light-subtle" opacity={0.45} />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100/80 text-indigo-800 text-xs font-bold mb-3 border border-indigo-200/80">
              <span>Systematic Pedagogical Workflow</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              How the Platform Works
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              A four-stage ethical pipeline turning academic telemetry into proactive faculty check-ins
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Data Ingestion',
                desc: 'Consolidates weekly attendance, assignment submissions, LMS access, and quizzes without storing sensitive personal data.'
              },
              {
                step: '02',
                title: 'Trend Comparison',
                desc: 'Compares the current 2-week window against prior baselines to catch early negative velocity before grades drop.'
              },
              {
                step: '03',
                title: 'Explainable AI',
                desc: 'Hybrid Random Forest generates SHAP factor contributions explaining exactly why an indicator flagged.'
              },
              {
                step: '04',
                title: 'Mentor Action',
                desc: 'Faculty reviews context and schedules tutoring, workload planning, or check-ins with full human discretion.'
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-md hover:shadow-lg transition-all relative">
                <span className="text-3xl font-black text-indigo-200 block mb-2">{item.step}</span>
                <h3 className="font-bold text-slate-900 text-base mb-2">{item.title}</h3>
                <p className="text-slate-600 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ethical AI Highlight Section - With Immersive Library Atrium Backdrop */}
      <section className="relative overflow-hidden py-20 bg-slate-950 text-white border-b border-slate-800">
        <AttractiveBackground variant="library-hall" overlayStyle="dark-immersive" opacity={0.9} />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-400/30 mb-4 backdrop-blur-md">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Ethical AI Constitution</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white leading-tight drop-shadow-md">
                Designed to Support, Never to Stigmatize or Disqualify
              </h2>
              <p className="mt-4 text-slate-300 text-sm leading-relaxed">
                Traditional educational models assign damaging labels like "lazy" or "high risk of failure". 
                Our platform strictly computes <strong>Engagement Risk Indicators</strong> requiring faculty review.
              </p>

              <div className="mt-6 space-y-3.5 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Zero black-box opacity:</strong> Every indicator is accompanied by explicit % deltas (e.g. Attendance ↓ 13%, Assignments ↓ 22%).</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                  <span><strong>No disciplinary automation:</strong> The system cannot automatically impose penalties, demotions, or disciplinary flags.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Strict Privacy Boundary:</strong> Students only see their own constructive growth view; never peer rankings.</span>
                </div>
              </div>
            </div>

            {/* Visual Example Card */}
            <div className="bg-slate-900/90 backdrop-blur-xl text-white p-6 rounded-2xl shadow-2xl border border-white/15 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse" />
                  <span className="text-xs font-bold text-orange-300">Engagement Risk Indicator: ATTENTION</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">Student S023</span>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-lg text-xs text-slate-300 border border-white/5">
                "Recent academic engagement indicators show a negative trend that may require faculty review."
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center bg-slate-800/60 p-2 rounded">
                  <span className="text-slate-400">Attendance</span>
                  <span className="font-mono text-slate-300">92% → 79%</span>
                  <span className="text-rose-400 font-bold">↓ 13% (High Impact)</span>
                </div>
                <div className="flex justify-between items-center bg-slate-800/60 p-2 rounded">
                  <span className="text-slate-400">Assignment Completion</span>
                  <span className="font-mono text-slate-300">94% → 72%</span>
                  <span className="text-rose-400 font-bold">↓ 22% (High Impact)</span>
                </div>
                <div className="flex justify-between items-center bg-slate-800/60 p-2 rounded">
                  <span className="text-slate-400">LMS Activity</span>
                  <span className="font-mono text-slate-300">88% → 65%</span>
                  <span className="text-amber-400 font-bold">↓ 23% (Medium Impact)</span>
                </div>
              </div>

              <div className="p-3 bg-indigo-950/80 border border-indigo-500/40 rounded-lg text-xs text-indigo-200">
                <strong>Recommended Support:</strong> Review recent assignment workload and schedule mentor check-in.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Grid - With Subtle AI Laboratory Backdrop */}
      <section className="relative overflow-hidden py-20 bg-slate-50 border-b border-slate-200">
        <AttractiveBackground variant="cyber-academic" overlayStyle="light-subtle" opacity={0.4} />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Enterprise Academic Toolkit
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Equipping departments with early insight, intervention tracking, and comprehensive reporting
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-md">
              <TrendingDown className="w-6 h-6 text-indigo-600 mb-3" />
              <h3 className="font-bold text-slate-900 text-base mb-2">Longitudinal Trend Analysis</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Tracks 12-week trends across attendance, homework submission velocity, delay rates, and LMS material engagement.
              </p>
            </div>

            <div className="p-6 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-md">
              <HeartHandshake className="w-6 h-6 text-indigo-600 mb-3" />
              <h3 className="font-bold text-slate-900 text-base mb-2">Intervention Management</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Assign mentors, schedule tutoring or study planning, track milestone progress, and record supportive outcomes.
              </p>
            </div>

            <div className="p-6 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-md">
              <FileSpreadsheet className="w-6 h-6 text-indigo-600 mb-3" />
              <h3 className="font-bold text-slate-900 text-base mb-2">Bulk CSV Ingestion & Reports</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Drag-and-drop CSV validation with row error inspection, automated scoring, and instant PDF/CSV export for academic meetings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner - With Student Innovation Lounge Backdrop */}
      <section className="relative overflow-hidden py-16 text-white border-b border-slate-800">
        <AttractiveBackground variant="student-portal" overlayStyle="indigo-glass" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-md">
            Empower Every Student's Academic Journey Today
          </h2>
          <p className="text-indigo-200 text-sm mt-3 max-w-xl mx-auto leading-relaxed">
            Experience our ethical early-intervention system in action. Launch a demo role with zero setup required.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={() => handleLaunchRole('FACULTY')}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all text-sm hover:scale-105 active:scale-95"
            >
              Launch Faculty Demo
            </button>
            <button
              onClick={() => handleLaunchRole('STUDENT')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 backdrop-blur-md shadow-md transition-all text-sm hover:scale-105 active:scale-95"
            >
              Launch Student Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-white border-t border-slate-200 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-800">AI-Powered Early Detection of Student Academic Disengagement</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Compliant with educational privacy standards · Faculty Review Required
          </div>
        </div>
      </footer>

      {/* AI Image Studio Modal for creating and editing background images */}
      <ImageStudioModal
        isOpen={imageStudioOpen}
        onClose={() => setImageStudioOpen(false)}
        onApplyImage={(url) => {
          setCustomBgUrl(url);
        }}
        currentImageUrl={customBgUrl}
      />
    </div>
  );
};
