import React, { useState } from 'react';
import { RiskBadge } from '../components/RiskBadge.tsx';
import { RiskLevel } from '../types/index.ts';
import { AttractiveBackground } from '../components/AttractiveBackground.tsx';
import {
  BrainCircuit,
  Sparkles,
  Sliders,
  Layers,
  ShieldCheck,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  Info,
  Lightbulb
} from 'lucide-react';

export const AIInsightsPage: React.FC = () => {
  // Interactive Simulator State
  const [simPrevAtt, setSimPrevAtt] = useState(92);
  const [simCurrAtt, setSimCurrAtt] = useState(79);

  const [simPrevAssign, setSimPrevAssign] = useState(94);
  const [simCurrAssign, setSimCurrAssign] = useState(72);

  const [simPrevAssess, setSimPrevAssess] = useState(82);
  const [simCurrAssess, setSimCurrAssess] = useState(76);

  const [simPrevLms, setSimPrevLms] = useState(88);
  const [simCurrLms, setSimCurrLms] = useState(65);

  // Compute simulation on the fly
  const calcDelta = (curr: number, prev: number) => {
    if (prev <= 0) return 0;
    return Math.round(((curr - prev) / prev) * 1000) / 10;
  };

  const attDelta = calcDelta(simCurrAtt, simPrevAtt);
  const assignDelta = calcDelta(simCurrAssign, simPrevAssign);
  const assessDelta = calcDelta(simCurrAssess, simPrevAssess);
  const lmsDelta = calcDelta(simCurrLms, simPrevLms);

  let penalty = 0;
  // Attendance weight
  if (attDelta < -15 || simCurrAtt < 70) penalty += 20;
  else if (attDelta < -10 || simCurrAtt < 78) penalty += 13;
  else if (attDelta < -5) penalty += 6;

  // Assignments weight
  if (assignDelta < -20 || simCurrAssign < 65) penalty += 22;
  else if (assignDelta < -12 || simCurrAssign < 75) penalty += 15;
  else if (assignDelta < -6) penalty += 7;

  // Assessments weight
  if (assessDelta < -15 || simCurrAssess < 65) penalty += 16;
  else if (assessDelta < -10 || simCurrAssess < 72) penalty += 10;
  else if (assessDelta < -4) penalty += 5;

  // LMS weight
  if (lmsDelta < -20 || simCurrLms < 60) penalty += 18;
  else if (lmsDelta < -12 || simCurrLms < 72) penalty += 11;
  else if (lmsDelta < -5) penalty += 5;

  const baseScore = 18;
  const simScore = Math.min(100, Math.max(5, Math.round(baseScore + penalty)));

  let simLevel: RiskLevel = 'Stable';
  if (simScore >= 76) simLevel = 'Priority Support';
  else if (simScore >= 56) simLevel = 'Attention';
  else if (simScore >= 31) simLevel = 'Monitor';
  else simLevel = 'Stable';

  const recommendations: string[] = [];
  if (assignDelta < -10 || simCurrAssign < 75) {
    recommendations.push('Review recent assignment workload and offer deadline management guidance');
  }
  if (attDelta < -10 || simCurrAtt < 78) {
    recommendations.push('Schedule a low-pressure mentor check-in to explore potential timetable clashes');
  }
  if (assessDelta < -8 || simCurrAssess < 72) {
    recommendations.push('Provide targeted revision resources and connect with peer tutoring office hours');
  }
  if (lmsDelta < -15 || simCurrLms < 70) {
    recommendations.push('Verify learning portal accessibility and suggest relevant supplemental video modules');
  }
  if (recommendations.length === 0) {
    recommendations.push('Continue encouraging current academic consistency and positive learning habits');
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Page Header with High-Tech AI Backdrop & bg-slate-900/70 Overlay */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl">
        <AttractiveBackground variant="data-network" overlayStyle="bg-slate-900/70" imageOpacity={0.85} />
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold uppercase tracking-wider mb-2 backdrop-blur-md">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Core AI Engine Architecture & Explainability</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
            How EduSignal AI Detects Early Engagement Patterns
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Our model avoids black-box predictions and punitive classifications. It utilizes a hybrid framework
            combining <strong>Random Forest feature weights</strong>, <strong>multi-week velocity comparison</strong>,
            and <strong>SHAP attribution</strong> to produce explainable indicators requiring faculty review.
          </p>
        </div>
      </div>

      {/* 3 Pillars of the Hybrid Engine */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
            01
          </div>
          <h3 className="font-bold text-slate-900 text-sm">ML Ensemble Model</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Random Forest algorithm evaluates an ensemble of decision boundaries trained on historical student cohorts,
            assessing normalized vectors of submission delays, quiz variances, and material access.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
            02
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Trend Velocity Detection</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Compares the current 2-week rolling window (e.g. Weeks 11-12) against prior reference windows (Weeks 9-10).
            This detects negative slope trajectories long before term grades are finalized.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
            03
          </div>
          <h3 className="font-bold text-slate-900 text-sm">SHAP Explainability Layer</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Shapley additive explanations decompose the final 0-100 engagement score into tangible, accountable feature contributions
            presented clearly to educators.
          </p>
        </div>
      </div>

      {/* Interactive What-If Risk Simulator */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 uppercase tracking-wider">
                <Sliders className="w-3.5 h-3.5" />
                <span>Interactive What-If Simulation Sandbox</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                Test Engagement Scenarios & Live Indicator Output
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Adjust baseline vs current values to see how the model generates scores and recommendations in real time
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Computed Score</div>
                <div className="text-2xl font-black text-slate-900">{simScore}/100</div>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <RiskBadge level={simLevel} size="md" />
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sliders Area */}
          <div className="space-y-5 text-xs">
            <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Adjust Longitudinal Parameters
            </div>

            {/* Attendance */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">Attendance Percentage</span>
                <span className="font-mono text-slate-600">
                  {simPrevAtt}% → <strong className="text-indigo-600">{simCurrAtt}%</strong> ({attDelta}%)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500">Baseline (Wks 9-10)</label>
                  <input
                    type="range"
                    min={40}
                    max={100}
                    value={simPrevAtt}
                    onChange={e => setSimPrevAtt(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500">Current (Wks 11-12)</label>
                  <input
                    type="range"
                    min={40}
                    max={100}
                    value={simCurrAtt}
                    onChange={e => setSimCurrAtt(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>
            </div>

            {/* Assignments */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">Assignment Completion Rate</span>
                <span className="font-mono text-slate-600">
                  {simPrevAssign}% → <strong className="text-indigo-600">{simCurrAssign}%</strong> ({assignDelta}%)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500">Baseline (Wks 9-10)</label>
                  <input
                    type="range"
                    min={40}
                    max={100}
                    value={simPrevAssign}
                    onChange={e => setSimPrevAssign(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500">Current (Wks 11-12)</label>
                  <input
                    type="range"
                    min={40}
                    max={100}
                    value={simCurrAssign}
                    onChange={e => setSimCurrAssign(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>
            </div>

            {/* Assessments */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">Assessment Average</span>
                <span className="font-mono text-slate-600">
                  {simPrevAssess}% → <strong className="text-indigo-600">{simCurrAssess}%</strong> ({assessDelta}%)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500">Baseline (Wks 9-10)</label>
                  <input
                    type="range"
                    min={40}
                    max={100}
                    value={simPrevAssess}
                    onChange={e => setSimPrevAssess(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500">Current (Wks 11-12)</label>
                  <input
                    type="range"
                    min={40}
                    max={100}
                    value={simCurrAssess}
                    onChange={e => setSimCurrAssess(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>
            </div>

            {/* LMS */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">LMS Portal Activity</span>
                <span className="font-mono text-slate-600">
                  {simPrevLms}% → <strong className="text-indigo-600">{simCurrLms}%</strong> ({lmsDelta}%)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500">Baseline (Wks 9-10)</label>
                  <input
                    type="range"
                    min={40}
                    max={100}
                    value={simPrevLms}
                    onChange={e => setSimPrevLms(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500">Current (Wks 11-12)</label>
                  <input
                    type="range"
                    min={40}
                    max={100}
                    value={simCurrLms}
                    onChange={e => setSimCurrLms(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Explainability Result Preview */}
          <div className="space-y-4">
            <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Model Evaluation Output
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Generated Risk Indicator</span>
                <RiskBadge level={simLevel} score={simScore} showScore />
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <strong>Standard Educational Framing: </strong>
                "Recent academic engagement indicators show a {simLevel === 'Stable' ? 'steady consistency' : 'negative trend that may require faculty review'}."
              </div>

              <div className="space-y-2 text-xs pt-2">
                <div className="font-semibold text-slate-700">Recommended Mentorship Steps:</div>
                {recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 bg-indigo-50/60 p-2 rounded text-indigo-900 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Faculty Review Discretion:</strong> All AI outputs are pattern observations. Faculty members assess situational context before deciding on meetings.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
