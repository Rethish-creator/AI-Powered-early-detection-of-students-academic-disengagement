import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { AppNotification, UserRole } from '../types/index.ts';
import { api } from '../services/api.ts';
import {
  GraduationCap,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Shield,
  Layers,
  BookOpen,
  Check,
  ExternalLink,
  Info
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, logout, quickDemoLogin } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Click outside to close menus
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setShowRoleMenu(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const roleBadgeStyle = {
    ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
    FACULTY: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    STUDENT: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  }[user?.role || 'FACULTY'];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate(user?.role === 'STUDENT' ? 'student-dashboard' : (user?.role === 'ADMIN' ? 'admin-dashboard' : 'faculty-dashboard'))}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:bg-indigo-700 transition-colors">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="font-black text-slate-900 text-base tracking-tight block leading-tight">
                  EduSignal<span className="text-indigo-600">.AI</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium hidden sm:block leading-none">
                  Early Academic Engagement Detection
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links for Authenticated Users */}
          {user && (
            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600">
              {user.role === 'STUDENT' ? (
                <>
                  <button
                    onClick={() => onNavigate('student-dashboard')}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      currentView === 'student-dashboard'
                        ? 'bg-slate-100 text-indigo-700'
                        : 'hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    My Engagement Dashboard
                  </button>
                  <button
                    onClick={() => onNavigate('interventions')}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      currentView === 'interventions'
                        ? 'bg-slate-100 text-indigo-700'
                        : 'hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    My Support Plans
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onNavigate(user.role === 'ADMIN' ? 'admin-dashboard' : 'faculty-dashboard')}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      currentView === 'faculty-dashboard' || currentView === 'admin-dashboard'
                        ? 'bg-slate-100 text-indigo-700'
                        : 'hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => onNavigate('student-list')}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      currentView === 'student-list'
                        ? 'bg-slate-100 text-indigo-700'
                        : 'hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Students
                  </button>
                  <button
                    onClick={() => onNavigate('class-analytics')}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      currentView === 'class-analytics'
                        ? 'bg-slate-100 text-indigo-700'
                        : 'hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Analytics
                  </button>
                  <button
                    onClick={() => onNavigate('ai-insights')}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      currentView === 'ai-insights'
                        ? 'bg-slate-100 text-indigo-700'
                        : 'hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    AI Engine
                  </button>
                  <button
                    onClick={() => onNavigate('alerts')}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      currentView === 'alerts'
                        ? 'bg-slate-100 text-indigo-700'
                        : 'hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Alerts
                  </button>
                  <button
                    onClick={() => onNavigate('interventions')}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      currentView === 'interventions'
                        ? 'bg-slate-100 text-indigo-700'
                        : 'hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Interventions
                  </button>
                  <button
                    onClick={() => onNavigate('reports')}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      currentView === 'reports'
                        ? 'bg-slate-100 text-indigo-700'
                        : 'hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Reports
                  </button>
                </>
              )}
            </nav>
          )}

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Quick Demo Switcher */}
            <div className="relative" ref={roleRef}>
              <button
                type="button"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors shadow-2xs"
                title="Switch demo role for evaluation"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Role:</span>
                <span className={`px-1.5 py-0.2 rounded font-bold uppercase text-[10px] border ${roleBadgeStyle}`}>
                  {user ? user.role : 'Guest'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white border border-slate-200 shadow-lg py-1.5 z-50 text-xs animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Quick Role Switcher
                  </div>
                  <button
                    onClick={() => {
                      quickDemoLogin('FACULTY');
                      setShowRoleMenu(false);
                      onNavigate('faculty-dashboard');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between text-slate-700"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Faculty / Mentor</div>
                      <div className="text-[11px] text-slate-500">faculty@example.com</div>
                    </div>
                    {user?.role === 'FACULTY' && <Check className="w-4 h-4 text-indigo-600" />}
                  </button>
                  <button
                    onClick={() => {
                      quickDemoLogin('ADMIN');
                      setShowRoleMenu(false);
                      onNavigate('admin-dashboard');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between text-slate-700"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Administrator</div>
                      <div className="text-[11px] text-slate-500">admin@example.com</div>
                    </div>
                    {user?.role === 'ADMIN' && <Check className="w-4 h-4 text-indigo-600" />}
                  </button>
                  <button
                    onClick={() => {
                      quickDemoLogin('STUDENT');
                      setShowRoleMenu(false);
                      onNavigate('student-dashboard');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between text-slate-700"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Student (Priya Patel, S023)</div>
                      <div className="text-[11px] text-slate-500">student@example.com</div>
                    </div>
                    {user?.role === 'STUDENT' && <Check className="w-4 h-4 text-indigo-600" />}
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <>
                {/* Notifications Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setShowNotifMenu(!showNotifMenu)}
                    className="relative p-2 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                    aria-label="View notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifMenu && (
                    <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 text-xs">
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                        <span className="font-bold text-slate-800">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[11px] text-indigo-600 hover:underline font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-slate-400">
                            No notifications at this time
                          </div>
                        ) : (
                          notifications.map(n => (
                            <div
                              key={n.id}
                              onClick={() => {
                                if (n.linkUrl) onNavigate(n.linkUrl.replace('/', ''));
                                setShowNotifMenu(false);
                              }}
                              className={`p-3 hover:bg-slate-50 cursor-pointer transition-colors ${
                                !n.read ? 'bg-indigo-50/40' : ''
                              }`}
                            >
                              <div className="font-semibold text-slate-800 flex items-center justify-between">
                                <span>{n.title}</span>
                                {!n.read && (
                                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                                )}
                              </div>
                              <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                                {n.message}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative" ref={userRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-700">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold text-slate-800 hidden lg:block">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white border border-slate-200 shadow-lg py-1.5 z-50 text-xs">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <div className="font-semibold text-slate-900 truncate">{user.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                      </div>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onNavigate('profile');
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Profile & Preferences</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onNavigate('settings');
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>Settings & Privacy</span>
                      </button>
                      <div className="border-t border-slate-100 my-1" />
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          quickDemoLogin('FACULTY');
                          onNavigate('faculty-dashboard');
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center gap-2 text-indigo-600 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Switch to Faculty View</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    quickDemoLogin('FACULTY');
                    onNavigate('faculty-dashboard');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors shadow-2xs"
                >
                  Open Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
