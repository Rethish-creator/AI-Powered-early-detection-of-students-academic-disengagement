import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { User, Mail, Building2, Shield, Lock, Bell, Check, Key } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [urgentSms, setUrgentSms] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('Security credentials updated successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          User Profile & Security Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your institutional access credentials and engagement notification rules
        </p>
      </div>

      {/* Profile Overview */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
              <span>{user?.email}</span>
              <span>•</span>
              <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                {user?.role}
              </span>
              {user?.department && (
                <>
                  <span>•</span>
                  <span>{user.department}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg space-y-1">
            <span className="text-slate-400 font-medium">Assigned Department</span>
            <div className="font-bold text-slate-800">{user?.department || 'General Academics'}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg space-y-1">
            <span className="text-slate-400 font-medium">Access Privileges</span>
            <div className="font-bold text-slate-800">{user?.role} Portal Authorization</div>
          </div>
        </div>
      </div>

      {/* Password Change */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Key className="w-4 h-4 text-indigo-600" />
          <span>Change Password</span>
        </h3>

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-3 max-w-md text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="At least 8 characters..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-colors"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* Notifications Preferences */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-600" />
          <span>Notification & Alert Channels</span>
        </h3>

        <div className="space-y-3 text-xs">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={e => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
            <div>
              <div className="font-semibold text-slate-800">High-Priority Engagement Alerts</div>
              <div className="text-slate-500 text-[11px]">Send instant notification when a student enters Priority Support</div>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={weeklyDigest}
              onChange={e => setWeeklyDigest(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
            <div>
              <div className="font-semibold text-slate-800">Weekly Department Cohort Digest</div>
              <div className="text-slate-500 text-[11px]">Summary of multi-week trend changes delivered every Monday morning</div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};
