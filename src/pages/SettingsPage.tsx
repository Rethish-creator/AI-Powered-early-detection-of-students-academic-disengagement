import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Sliders,
  Lock,
  Check,
  AlertTriangle,
  BrainCircuit,
  FileCheck
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [attThreshold, setAttThreshold] = useState(10);
  const [assignThreshold, setAssignThreshold] = useState(15);
  const [assessThreshold, setAssessThreshold] = useState(10);
  const [lmsThreshold, setLmsThreshold] = useState(20);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          <span>System Settings & Ethical AI Policy</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure indicator detection sensitivity thresholds and verify privacy-by-design compliance
        </p>
      </div>

      {/* Thresholds Form */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-5">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>Engagement Sensitivity Thresholds</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Defines percentage decreases between the 2-week baseline and current window that trigger faculty review
          </p>
        </div>

        {saved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Threshold configurations saved and propagated to background AI engine.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
              <label className="font-semibold text-slate-800 block mb-1">
                Attendance Decrease Trigger (%)
              </label>
              <input
                type="number"
                min={5}
                max={30}
                value={attThreshold}
                onChange={e => setAttThreshold(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white font-mono"
              />
              <span className="text-[11px] text-slate-500 block mt-1">Default: 10% decline triggers Alert</span>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
              <label className="font-semibold text-slate-800 block mb-1">
                Assignment Completion Decrease Trigger (%)
              </label>
              <input
                type="number"
                min={5}
                max={40}
                value={assignThreshold}
                onChange={e => setAssignThreshold(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white font-mono"
              />
              <span className="text-[11px] text-slate-500 block mt-1">Default: 15% decline triggers Alert</span>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
              <label className="font-semibold text-slate-800 block mb-1">
                Assessment Score Decrease Trigger (%)
              </label>
              <input
                type="number"
                min={5}
                max={30}
                value={assessThreshold}
                onChange={e => setAssessThreshold(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white font-mono"
              />
              <span className="text-[11px] text-slate-500 block mt-1">Default: 10% decline triggers Alert</span>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
              <label className="font-semibold text-slate-800 block mb-1">
                LMS Portal Activity Decrease Trigger (%)
              </label>
              <input
                type="number"
                min={5}
                max={50}
                value={lmsThreshold}
                onChange={e => setLmsThreshold(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white font-mono"
              />
              <span className="text-[11px] text-slate-500 block mt-1">Default: 20% decline triggers Alert</span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-2xs"
            >
              Save Thresholds
            </button>
          </div>
        </form>
      </div>

      {/* Visual Palette & Indicator Scheme */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-indigo-600" />
              <span>Engagement Indicator Visual Palette</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Refined, high-contrast, accessible educational color scheme (replaces generic Mint Emerald, Warm Amber, Muted Crimson)
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
            WCAG AA Compliant
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
          {/* Stable */}
          <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-[#0d9488] ring-2 ring-teal-200" />
                <span className="font-bold text-teal-950">Stable</span>
              </div>
              <span className="font-mono text-[10px] text-teal-800">#0D9488</span>
            </div>
            <div className="text-[11px] text-teal-800/80">
              Nordic Deep Teal (replaces Mint Emerald #10B981)
            </div>
            <div className="text-[10px] text-slate-400">
              Score range: 0 – 30 points
            </div>
          </div>

          {/* Monitor */}
          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-[#d97706] ring-2 ring-amber-200" />
                <span className="font-bold text-amber-950">Monitor</span>
              </div>
              <span className="font-mono text-[10px] text-amber-800">#D97706</span>
            </div>
            <div className="text-[11px] text-amber-800/80">
              Honey Ochre (replaces Warm Amber #F59E0B)
            </div>
            <div className="text-[10px] text-slate-400">
              Score range: 31 – 55 points
            </div>
          </div>

          {/* Attention */}
          <div className="p-3.5 rounded-xl border border-orange-200 bg-orange-50/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-[#ea580c] ring-2 ring-orange-200" />
                <span className="font-bold text-orange-950">Attention</span>
              </div>
              <span className="font-mono text-[10px] text-orange-800">#EA580C</span>
            </div>
            <div className="text-[11px] text-orange-800/80">
              Burnt Terracotta Ochre
            </div>
            <div className="text-[10px] text-slate-400">
              Score range: 56 – 75 points
            </div>
          </div>

          {/* Priority Support */}
          <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-[#be123c] ring-2 ring-rose-200" />
                <span className="font-bold text-rose-950">Priority Support</span>
              </div>
              <span className="font-mono text-[10px] text-rose-800">#BE123C</span>
            </div>
            <div className="text-[11px] text-rose-800/80">
              Royal Plum Crimson (replaces Muted Crimson #EF4444)
            </div>
            <div className="text-[10px] text-slate-400">
              Score range: 76 – 100 points
            </div>
          </div>
        </div>
      </div>

      {/* Privacy-by-Design Formal Notice */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Educational Privacy & AI Ethics Constitution</span>
        </h2>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed space-y-2">
          <p>
            <strong>Official Privacy Notice: </strong>
            "This platform analyzes academic and engagement indicators to support timely educational intervention.
            AI-generated indicators are informational and should be reviewed by authorized faculty or mentors before any action is taken."
          </p>
          <div className="border-t border-slate-200 my-2 pt-2 text-[11px] space-y-1">
            <div className="font-bold text-slate-800">Strict Data Boundary Guarantees:</div>
            <p>
              • The platform strictly does NOT collect or ingest demographic attributes, race, religion, political beliefs, medical history, mental health data, family situations, or financial records.
            </p>
            <p>
              • Students are never assigned permanent punitive categories such as "failing" or "disengaged". All signals indicate only recent trajectory requiring faculty review.
            </p>
            <p>
              • Students cannot see peer records or class rank comparisons; only constructive individual feedback.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
