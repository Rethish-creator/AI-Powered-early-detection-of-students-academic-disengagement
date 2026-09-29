import React from 'react';
import { ExplanationFactor, RiskPrediction } from '../types/index.ts';
import { RiskBadge } from './RiskBadge.tsx';
import { ArrowDownRight, ArrowUpRight, ArrowRight, ShieldCheck, Sparkles, AlertTriangle, Lightbulb } from 'lucide-react';

interface ExplainableAIPanelProps {
  prediction: RiskPrediction;
  studentName?: string;
}

export const ExplainableAIPanel: React.FC<ExplainableAIPanelProps> = ({
  prediction,
  studentName = 'Student'
}) => {
  const { factors, riskLevel, riskScore, shapWaterfall, recommendations, facultyReviewRequired, disclaimer } = prediction;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-indigo-50/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Engagement Risk Indicator
              </span>
              <RiskBadge level={riskLevel} score={riskScore} showScore size="sm" />
              {facultyReviewRequired && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-200">
                  <AlertTriangle className="w-3 h-3" />
                  Faculty Review Required
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-1">
              Pattern & Risk Factor Analysis
            </h3>
            <p className="text-sm text-slate-600 mt-0.5">
              Recent academic engagement indicators show a negative trend that may require faculty review.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-100/80 px-4 py-2 rounded-lg border border-slate-200">
            <div className="text-right">
              <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
                Pattern Score
              </div>
              <div className="text-2xl font-black text-slate-900 leading-none">
                {riskScore}
                <span className="text-xs font-normal text-slate-400">/100</span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-300" />
            <div className="text-left text-xs text-slate-500 leading-snug">
              <div>Confidence: 91%</div>
              <div className="text-[10px] text-slate-400">Ensemble RF + Trend</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Section: Why was this indicator generated? */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Why was this indicator generated?
            </h4>
            <span className="text-xs text-slate-500">
              Comparing Weeks 9-10 (Baseline) vs Weeks 11-12 (Current)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {factors.map((factor, idx) => {
              const isNegative = factor.change < 0;
              const isPositive = factor.change > 0;
              const absChange = Math.abs(factor.change);

              const impactStyles = {
                High: 'bg-rose-50 text-rose-800 border-rose-200',
                Medium: 'bg-amber-50 text-amber-800 border-amber-200',
                Low: 'bg-slate-50 text-slate-700 border-slate-200'
              }[factor.impact];

              return (
                <div
                  key={idx}
                  className="p-4 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-shadow hover:shadow-xs flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {factor.factor}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {factor.previous}% <span className="text-slate-300">→</span>{' '}
                        <span className="font-semibold text-slate-800">{factor.current}%</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded ${
                          isNegative
                            ? 'text-rose-800 bg-rose-50'
                            : isPositive
                            ? 'text-teal-800 bg-teal-50'
                            : 'text-slate-600 bg-slate-100'
                        }`}
                      >
                        {isNegative ? (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        ) : isPositive ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5" />
                        )}
                        {absChange}%
                      </span>

                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${impactStyles}`}
                      >
                        Impact: {factor.impact}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-2.5 pt-2 border-t border-slate-100 leading-relaxed">
                    {factor.explanationText}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section: SHAP-Style Feature Contribution (Waterfall) */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                SHAP Feature Attribution (Waterfall Contributions)
              </h4>
              <p className="text-xs text-slate-500">
                Shows how each observed metric shifts the engagement risk score from the baseline population average (18 pts).
              </p>
            </div>
          </div>

          <div className="bg-slate-50/80 rounded-lg p-4 border border-slate-200/80 space-y-2.5">
            {shapWaterfall.map((step, idx) => {
              const isBase = idx === 0;
              const isPositiveContrib = step.contribution > 0;
              return (
                <div key={idx} className="flex items-center text-xs">
                  <div className="w-48 font-medium text-slate-700 truncate pr-2">
                    {step.feature}
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    {/* Visual contribution bar */}
                    <div className="h-3.5 bg-slate-200/70 rounded-full flex-1 overflow-hidden relative">
                      <div
                        className={`h-full rounded-full ${
                          isBase
                            ? 'bg-slate-500'
                            : isPositiveContrib
                            ? 'bg-rose-600'
                            : 'bg-teal-600'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(8, (step.runningTotal / 100) * 100))}%`
                        }}
                      />
                    </div>
                    <div className="w-20 text-right font-mono text-[11px]">
                      {!isBase && (
                        <span
                          className={`font-semibold mr-1.5 ${
                            isPositiveContrib ? 'text-rose-700' : 'text-teal-700'
                          }`}
                        >
                          {isPositiveContrib ? `+${step.contribution}` : step.contribution}
                        </span>
                      )}
                      <span className="text-slate-500 font-bold">{step.runningTotal}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section: Proactive Support Recommendations */}
        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Suggested Faculty/Mentor Support Recommendations
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-950 font-medium"
              >
                <div className="w-5 h-5 rounded-full bg-indigo-200/70 text-indigo-700 flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ethics & Privacy Disclaimer */}
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-start gap-2.5 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
          <p className="leading-relaxed">
            <strong className="font-semibold text-slate-800">Privacy & Ethics Notice: </strong>
            {disclaimer} The AI engine monitors pattern indicators only and never predicts student intelligence, motivation, or mental health.
          </p>
        </div>
      </div>
    </div>
  );
};
