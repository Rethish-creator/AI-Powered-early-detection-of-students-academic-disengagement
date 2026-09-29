import { Student, AcademicRecord, RiskPrediction, AlertItem, Intervention, AppNotification, SystemAnalytics, AuditLog, User } from '../types/index.ts';

const TOKEN_KEY = 'academic_ai_token';
const USER_KEY = 'academic_ai_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredAuth(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): User | null {
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Request failed: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { email: string; password: string; name: string; role: string; department?: string; studentId?: string }) =>
    request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    request<{ message: string }>('/api/auth/logout', { method: 'POST' }),

  getMe: () =>
    request<{ user: User }>('/api/auth/me'),

  // Students
  getStudents: (params?: { search?: string; department?: string; section?: string; year?: number; riskLevel?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.department && params.department !== 'All') query.append('department', params.department);
    if (params?.section && params.section !== 'All') query.append('section', params.section);
    if (params?.year) query.append('year', String(params.year));
    if (params?.riskLevel && params.riskLevel !== 'All') query.append('riskLevel', params.riskLevel);
    return request<{ students: Student[]; total: number }>(`/api/students?${query.toString()}`);
  },

  getStudentById: (id: string) =>
    request<{ student: Student }>(`/api/students/${id}`),

  getStudentRecords: (studentId: string) =>
    request<{ records: AcademicRecord[] }>(`/api/students/${studentId}/academic-records`),

  bulkImportRecords: (rows: any[]) =>
    request<{
      totalDetected: number;
      validCount: number;
      invalidCount: number;
      errors: { row: number; reason: string }[];
    }>('/api/academic-records/bulk', {
      method: 'POST',
      body: JSON.stringify({ rows }),
    }),

  // AI & Explanations
  getStudentRiskPrediction: (studentId: string) =>
    request<{ prediction: RiskPrediction }>(`/api/ai/student/${studentId}`),

  getStudentExplanation: (studentId: string) =>
    request<any>(`/api/ai/explanation/${studentId}`),

  predictSimulation: (records: Partial<AcademicRecord>[]) =>
    request<{ prediction: RiskPrediction }>('/api/ai/predict', {
      method: 'POST',
      body: JSON.stringify({ records }),
    }),

  // Analytics
  getAnalyticsOverview: (department?: string, section?: string) => {
    const query = new URLSearchParams();
    if (department && department !== 'All') query.append('department', department);
    if (section && section !== 'All') query.append('section', section);
    return request<{ analytics: SystemAnalytics }>(`/api/analytics/overview?${query.toString()}`);
  },

  getClassAnalytics: (department?: string, section?: string) => {
    const query = new URLSearchParams();
    if (department && department !== 'All') query.append('department', department);
    if (section && section !== 'All') query.append('section', section);
    return request<{
      weeklyTrends: {
        week: string;
        attendance: number;
        assignments: number;
        assessments: number;
        lms: number;
        participation: number;
      }[];
      sectionComparison: {
        section: string;
        studentCount: number;
        attendance: number;
        assignments: number;
        assessments: number;
        lms: number;
        flaggedCount: number;
      }[];
    }>(`/api/analytics/class?${query.toString()}`);
  },

  // Alerts
  getAlerts: () =>
    request<{ alerts: AlertItem[] }>('/api/alerts'),

  reviewAlert: (id: string) =>
    request<{ message: string }>(`/api/alerts/${id}/review`, { method: 'POST' }),

  dismissAlert: (id: string) =>
    request<{ message: string }>(`/api/alerts/${id}/dismiss`, { method: 'POST' }),

  // Interventions
  getInterventions: () =>
    request<{ interventions: Intervention[] }>('/api/interventions'),

  createIntervention: (data: Partial<Intervention>) =>
    request<{ intervention: Intervention }>('/api/interventions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateIntervention: (id: string, updates: Partial<Intervention>) =>
    request<{ intervention: Intervention }>(`/api/interventions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // Notifications
  getNotifications: () =>
    request<{ notifications: AppNotification[]; unreadCount: number }>('/api/notifications'),

  markNotificationRead: (id: string) =>
    request<{ message: string }>(`/api/notifications/${id}/read`, { method: 'POST' }),

  markAllNotificationsRead: () =>
    request<{ message: string }>('/api/notifications/read-all', { method: 'POST' }),

  // Reports
  getClassReport: (department?: string, section?: string) => {
    const query = new URLSearchParams();
    if (department && department !== 'All') query.append('department', department);
    if (section && section !== 'All') query.append('section', section);
    return request<any>(`/api/reports/class?${query.toString()}`);
  },

  getStudentReport: (studentId: string) =>
    request<any>(`/api/reports/student/${studentId}`),

  // Audit Logs
  getAuditLogs: () =>
    request<{ auditLogs: AuditLog[] }>('/api/audit-logs'),

  // Voice Assistant
  askVoiceAssistant: (query: string, studentId?: string) =>
    request<{ reply: string; source: string }>('/api/ai/voice-assistant', {
      method: 'POST',
      body: JSON.stringify({ query, studentId }),
    }),

  // AI Image Studio (Create & Edit Images)
  createImage: (prompt: string, aspectRatio: string = '16:9') =>
    request<{ imageUrl: string; model: string; prompt: string }>('/api/ai/create-image', {
      method: 'POST',
      body: JSON.stringify({ prompt, aspectRatio }),
    }),

  editImage: (prompt: string, sourceImageBase64?: string) =>
    request<{ imageUrl: string; model: string; prompt: string }>('/api/ai/edit-image', {
      method: 'POST',
      body: JSON.stringify({ prompt, sourceImageBase64 }),
    }),
};
