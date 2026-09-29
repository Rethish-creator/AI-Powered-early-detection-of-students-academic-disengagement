import React from 'react';
import { RiskLevel } from '../types/index.ts';
import { CheckCircle2, AlertTriangle, AlertCircle, ShieldAlert } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  score,
  showScore = false,
  size = 'md'
}) => {
  const config = {
    'Stable': {
      bg: 'bg-teal-50 text-teal-900 border-teal-300 ring-teal-600/20',
      dot: 'bg-teal-600',
      icon: CheckCircle2,
      ariaLabel: 'Risk Level: Stable (Positive academic consistency)',
      label: 'Stable'
    },
    'Monitor': {
      bg: 'bg-amber-50 text-amber-950 border-amber-300 ring-amber-700/20',
      dot: 'bg-amber-600',
      icon: AlertTriangle,
      ariaLabel: 'Risk Level: Monitor (Mild deviation detected, review suggested)',
      label: 'Monitor'
    },
    'Attention': {
      bg: 'bg-orange-50 text-orange-950 border-orange-300 ring-orange-700/20',
      dot: 'bg-orange-600',
      icon: AlertCircle,
      ariaLabel: 'Risk Level: Attention (Significant negative indicator trend detected)',
      label: 'Attention'
    },
    'Priority Support': {
      bg: 'bg-rose-50 text-rose-950 border-rose-300 ring-rose-700/20',
      dot: 'bg-rose-700',
      icon: ShieldAlert,
      ariaLabel: 'Risk Level: Priority Support (Multiple critical engagement indicators declining)',
      label: 'Priority Support'
    }
  }[level] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-300 ring-slate-400/20',
    dot: 'bg-slate-400',
    icon: CheckCircle2,
    ariaLabel: 'Risk Level: Unknown',
    label: level
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2'
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  }[size];

  return (
    <span
      role="status"
      aria-label={config.ariaLabel}
      className={`inline-flex items-center rounded-md border ring-1 ring-inset ${config.bg} ${sizeClasses} select-none transition-colors`}
    >
      <Icon className={`${iconSizes} flex-shrink-0`} aria-hidden="true" />
      <span>{config.label}</span>
      {showScore && score !== undefined && (
        <span className="opacity-75 font-mono text-[10px] ml-0.5">
          ({score}/100)
        </span>
      )}
    </span>
  );
};
