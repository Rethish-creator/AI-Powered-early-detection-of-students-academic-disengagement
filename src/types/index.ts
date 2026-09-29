export type UserRole = 'ADMIN' | 'FACULTY' | 'STUDENT';

export type RiskLevel = 'Stable' | 'Monitor' | 'Attention' | 'Priority Support';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  avatar?: string;
  studentId?: string; // Linked student record if role is STUDENT
}

export interface Student {
  id: string; // e.g. S001, S023
  name: string;
  email: string;
  department: string; // 'Computer Science' | 'Information Technology' | 'Electronics & Comm'
  year: number; // 2, 3, 4
  section: string; // 'A' | 'B' | 'C' | 'D'
  semester: number; // 3 to 8
  mentorName: string;
  mentorEmail: string;
  currentRiskLevel: RiskLevel;
  currentRiskScore: number; // 0-100
  attendanceAverage: number;
  assignmentCompletionAverage: number;
  assessmentAverage: number;
  lmsActivityAverage: number;
  participationAverage: number;
  lastUpdated: string;
  patternType: 'stable' | 'declining_attendance' | 'declining_assignments' | 'declining_assessments' | 'multiple_declines' | 'improving';
}

export interface AcademicRecord {
  id: string;
  studentId: string;
  weekNumber: number; // 1 to 12
  attendance: number; // 0-100
  assignmentCompletion: number; // 0-100
  assignmentDelayRate: number; // 0-100
  assessmentScore: number; // 0-100
  quizScore: number; // 0-100
  lmsActivity: number; // 0-100 (minutes/activity indexed)
  materialAccess: number; // 0-100
  participation: number; // 0-100
  recordedAt: string;
}

export interface ExplanationFactor {
  factor: string;
  current: number;
  previous: number;
  change: number; // percentage change, e.g. -14.2
  impact: 'High' | 'Medium' | 'Low';
  shapValue: number; // Contribution to risk score
  category: 'Attendance' | 'Assignments' | 'Assessments' | 'LMS' | 'Participation';
  explanationText: string;
}

export interface RiskPrediction {
  studentId: string;
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  confidence: number; // e.g. 0.89
  calculatedAt: string;
  factors: ExplanationFactor[];
  baseScore: number; // baseline population risk
  shapWaterfall: {
    feature: string;
    contribution: number;
    runningTotal: number;
  }[];
  recommendations: string[];
  facultyReviewRequired: boolean;
  disclaimer: string;
}

export interface AlertItem {
  id: string;
  studentId: string;
  studentName: string;
  department: string;
  section: string;
  title: string;
  observedChanges: string[];
  priority: 'Monitor' | 'Attention' | 'Priority Support';
  recommendedAction: string;
  status: 'New' | 'Reviewed' | 'Dismissed';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface Intervention {
  id: string;
  studentId: string;
  studentName: string;
  interventionType: 
    | 'Mentor Meeting'
    | 'Assignment Support'
    | 'Study Planning'
    | 'Peer Tutoring'
    | 'Additional Learning Resources'
    | 'Remedial Support'
    | 'Follow-up Meeting';
  description: string;
  assignedMentor: string;
  assignedMentorEmail: string;
  scheduledDate: string;
  followUpDate: string;
  status: 'Pending' | 'Scheduled' | 'Completed' | 'Follow-up Required';
  outcome?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'intervention' | 'system' | 'report';
  read: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface SystemAnalytics {
  totalStudents: number;
  stableCount: number;
  monitorCount: number;
  attentionCount: number;
  prioritySupportCount: number;
  averageAttendance: number;
  averageAssignmentCompletion: number;
  averageAssessmentScore: number;
  averageLmsActivity: number;
  averageParticipation: number;
  activeAlertsCount: number;
  activeInterventionsCount: number;
  resolvedInterventionsCount: number;
  lastTrainedDate: string;
}

export interface ClassAnalyticsFilter {
  department?: string;
  year?: number;
  section?: string;
  semester?: number;
  riskLevel?: RiskLevel;
}

export interface AuditLog {
  id: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
}
