import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { FacultyDashboard } from './pages/FacultyDashboard.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';
import { StudentDashboard } from './pages/StudentDashboard.tsx';
import { StudentListPage } from './pages/StudentListPage.tsx';
import { StudentDetailPage } from './pages/StudentDetailPage.tsx';
import { ClassAnalyticsPage } from './pages/ClassAnalyticsPage.tsx';
import { AIInsightsPage } from './pages/AIInsightsPage.tsx';
import { AlertsPage } from './pages/AlertsPage.tsx';
import { InterventionPage } from './pages/InterventionPage.tsx';
import { ReportsPage } from './pages/ReportsPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { VoiceAssistant } from './components/VoiceAssistant.tsx';
import { api } from './services/api.ts';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<string>('landing');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('S023');
  const [alertCount, setAlertCount] = useState<number>(0);

  useEffect(() => {
    if (!loading && user) {
      if (currentView === 'landing' || currentView === 'login') {
        if (user.role === 'STUDENT') {
          setCurrentView('student-dashboard');
        } else if (user.role === 'ADMIN') {
          setCurrentView('admin-dashboard');
        } else {
          setCurrentView('faculty-dashboard');
        }
      }
      fetchAlertCount();
    }
  }, [user, loading]);

  const fetchAlertCount = async () => {
    try {
      const res = await api.getAlerts();
      const active = res.alerts.filter(a => a.status === 'New').length;
      setAlertCount(active);
    } catch {}
  };

  const handleNavigate = (view: string, data?: any) => {
    if (view === 'student-detail' && data) {
      setSelectedStudentId(data);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">
            Initializing EduSignal AI Academic Engine...
          </span>
        </div>
      </div>
    );
  }

  // Standalone pages without the sidebar
  if (currentView === 'landing') {
    return (
      <div className="min-h-screen flex flex-col font-sans">
        <Navbar currentView={currentView} onNavigate={handleNavigate} />
        <LandingPage onNavigate={handleNavigate} />
      </div>
    );
  }

  if (currentView === 'login' || !user) {
    return (
      <div className="min-h-screen flex flex-col font-sans">
        <Navbar currentView={currentView} onNavigate={handleNavigate} />
        <LoginPage onNavigate={handleNavigate} />
      </div>
    );
  }

  // Student portal layout (clean full-width layout without faculty sidebar)
  if (user.role === 'STUDENT') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar currentView={currentView} onNavigate={handleNavigate} />
        <main className="flex-1">
          {currentView === 'student-dashboard' && <StudentDashboard />}
          {currentView === 'interventions' && (
            <InterventionPage onNavigate={handleNavigate} />
          )}
          {currentView === 'profile' && <ProfilePage />}
          {currentView === 'settings' && <SettingsPage />}
        </main>
        <VoiceAssistant currentStudentId={selectedStudentId} onNavigate={handleNavigate} />
      </div>
    );
  }

  // Faculty and Admin application layout with collapsible sidebar
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar currentView={currentView} onNavigate={handleNavigate} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          alertCount={alertCount}
        />
        <main className="flex-1 overflow-y-auto pb-12">
          {currentView === 'faculty-dashboard' && (
            <FacultyDashboard onNavigate={handleNavigate} />
          )}
          {currentView === 'admin-dashboard' && (
            <AdminDashboard onNavigate={handleNavigate} />
          )}
          {currentView === 'student-list' && (
            <StudentListPage onNavigate={handleNavigate} />
          )}
          {currentView === 'student-detail' && (
            <StudentDetailPage
              studentId={selectedStudentId}
              onNavigate={handleNavigate}
            />
          )}
          {currentView === 'class-analytics' && <ClassAnalyticsPage />}
          {currentView === 'ai-insights' && <AIInsightsPage />}
          {currentView === 'alerts' && (
            <AlertsPage onNavigate={handleNavigate} />
          )}
          {currentView === 'interventions' && (
            <InterventionPage onNavigate={handleNavigate} />
          )}
          {currentView === 'reports' && <ReportsPage />}
          {currentView === 'profile' && <ProfilePage />}
          {currentView === 'settings' && <SettingsPage />}
        </main>
      </div>
      <VoiceAssistant currentStudentId={selectedStudentId} onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
