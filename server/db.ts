import { Student, AcademicRecord, AlertItem, Intervention, AuditLog, AppNotification, User, SystemAnalytics, RiskLevel } from '../src/types/index.ts';
import { generateSyntheticDataset } from './data/syntheticDataset.ts';
import { evaluateStudentRisk } from './ml/engine.ts';
import { hashPassword } from './auth.ts';

export interface UserRecord extends User {
  passwordHash: string;
}

class Database {
  users: Map<string, UserRecord> = new Map();
  students: Map<string, Student> = new Map();
  records: AcademicRecord[] = [];
  alerts: Map<string, AlertItem> = new Map();
  interventions: Map<string, Intervention> = new Map();
  notifications: AppNotification[] = [];
  auditLogs: AuditLog[] = [];

  constructor() {
    this.init();
  }

  init() {
    // 1. Seed demo users
    const defaultPassword = 'Password@123';
    const adminHash = hashPassword('AdminPass@2025');
    const facultyHash = hashPassword('FacultyPass@2025');
    const studentHash = hashPassword('StudentPass@2025');

    this.users.set('admin@example.com', {
      id: 'USR-001',
      email: 'admin@example.com',
      name: 'Dr. Arthur Pendelton',
      role: 'ADMIN',
      department: 'Academic Dean Office',
      passwordHash: adminHash
    });

    this.users.set('faculty@example.com', {
      id: 'USR-002',
      email: 'faculty@example.com',
      name: 'Dr. Elena Rostova',
      role: 'FACULTY',
      department: 'Computer Science & Engineering',
      passwordHash: facultyHash
    });

    this.users.set('student@example.com', {
      id: 'USR-003',
      email: 'student@example.com',
      name: 'Priya Patel',
      role: 'STUDENT',
      department: 'Computer Science & Engineering',
      studentId: 'S023', // Linked to demo student S023!
      passwordHash: studentHash
    });

    // 2. Generate 100+ synthetic students and historical records
    const seedData = generateSyntheticDataset();

    for (const student of seedData.students) {
      this.students.set(student.id, student);
    }

    this.records = seedData.academicRecords;

    for (const alert of seedData.alerts) {
      this.alerts.set(alert.id, alert);
    }

    for (const intervention of seedData.interventions) {
      this.interventions.set(intervention.id, intervention);
    }

    this.auditLogs = seedData.auditLogs;

    // Seed in-app notifications
    this.notifications = [
      {
        id: 'NOTIF-01',
        title: 'Engagement Indicators Detected',
        message: '3 students in CSE Section A show indicators requiring faculty check-in.',
        type: 'alert',
        read: false,
        linkUrl: '/alerts',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'NOTIF-02',
        title: 'Intervention Scheduled',
        message: 'Mentor meeting scheduled with student S023 for tomorrow at 2:00 PM.',
        type: 'intervention',
        read: false,
        linkUrl: '/interventions',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: 'NOTIF-03',
        title: 'Model Evaluation Completed',
        message: 'Weekly hybrid AI risk scan completed across 108 enrolled students.',
        type: 'system',
        read: true,
        linkUrl: '/analytics',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    // Re-verify and sync all student risk levels using ML engine
    this.recomputeAllRisks();
  }

  recomputeAllRisks() {
    for (const [id, student] of this.students.entries()) {
      const studentRecs = this.records.filter(r => r.studentId === id);
      if (studentRecs.length > 0) {
        const pred = evaluateStudentRisk(id, studentRecs);
        student.currentRiskLevel = pred.riskLevel;
        student.currentRiskScore = pred.riskScore;
      }
    }
  }

  // User queries
  getUserByEmail(email: string): UserRecord | undefined {
    return this.users.get(email.toLowerCase().trim());
  }

  getUserById(id: string): UserRecord | undefined {
    for (const user of this.users.values()) {
      if (user.id === id) return user;
    }
    return undefined;
  }

  createUser(user: UserRecord): void {
    this.users.set(user.email.toLowerCase().trim(), user);
    this.logAudit(user.email, user.role, 'USER_CREATED', `Created user account for ${user.email}`);
  }

  // Student queries
  getAllStudents(filters?: {
    search?: string;
    department?: string;
    section?: string;
    year?: number;
    riskLevel?: RiskLevel;
  }): Student[] {
    let list = Array.from(this.students.values());

    if (filters?.department && filters.department !== 'All') {
      list = list.filter(s => s.department === filters.department);
    }
    if (filters?.section && filters.section !== 'All') {
      list = list.filter(s => s.section === filters.section);
    }
    if (filters?.year && !isNaN(Number(filters.year))) {
      list = list.filter(s => s.year === Number(filters.year));
    }
    if (filters?.riskLevel && filters.riskLevel !== ('All' as any)) {
      list = list.filter(s => s.currentRiskLevel === filters.riskLevel);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(s =>
        s.id.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
      );
    }

    return list;
  }

  getStudentById(id: string): Student | undefined {
    return this.students.get(id);
  }

  getAcademicRecords(studentId: string): AcademicRecord[] {
    return this.records
      .filter(r => r.studentId === studentId)
      .sort((a, b) => a.weekNumber - b.weekNumber);
  }

  addAcademicRecord(rec: AcademicRecord): void {
    this.records.push(rec);
    // Recalculate student stats
    const student = this.students.get(rec.studentId);
    if (student) {
      const studentRecs = this.getAcademicRecords(rec.studentId);
      const pred = evaluateStudentRisk(rec.studentId, studentRecs);
      student.currentRiskLevel = pred.riskLevel;
      student.currentRiskScore = pred.riskScore;
      student.lastUpdated = new Date().toISOString();
    }
  }

  bulkImportRecords(rows: any[], userEmail: string): {
    totalDetected: number;
    validCount: number;
    invalidCount: number;
    errors: { row: number; reason: string }[];
  } {
    const errors: { row: number; reason: string }[] = [];
    let validCount = 0;

    rows.forEach((row, idx) => {
      const rowNum = idx + 1;
      const studentId = row.student_id || row.studentId || row.id;

      if (!studentId) {
        errors.push({ row: rowNum, reason: 'Missing student_id' });
        return;
      }

      const weekNumber = Number(row.week || row.weekNumber || row.week_number);
      if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 52) {
        errors.push({ row: rowNum, reason: `Invalid week number: ${row.week}` });
        return;
      }

      const attendance = Number(row.attendance);
      const assignmentCompletion = Number(row.assignment_completion || row.assignmentCompletion);
      const assessmentScore = Number(row.assessment_score || row.assessmentScore);
      const lmsActivity = Number(row.lms_activity || row.lmsActivity);

      if (isNaN(attendance) || attendance < 0 || attendance > 100) {
        errors.push({ row: rowNum, reason: `Attendance value must be 0-100: ${row.attendance}` });
        return;
      }
      if (isNaN(assignmentCompletion) || assignmentCompletion < 0 || assignmentCompletion > 100) {
        errors.push({ row: rowNum, reason: `Assignment completion must be 0-100: ${row.assignment_completion}` });
        return;
      }

      // Check if student exists or create
      if (!this.students.has(studentId)) {
        const studentName = row.student_name || row.name || `Student ${studentId}`;
        const department = row.department || 'Computer Science & Engineering';
        const year = Number(row.year) || 2;
        const section = row.section || 'A';

        const newStudent: Student = {
          id: studentId,
          name: studentName,
          email: `${studentId.toLowerCase()}@edu.example.org`,
          department,
          year,
          section,
          semester: year * 2,
          mentorName: 'Dr. Elena Rostova',
          mentorEmail: 'elena.rostova@edu.example.org',
          currentRiskLevel: 'Stable',
          currentRiskScore: 20,
          attendanceAverage: attendance,
          assignmentCompletionAverage: assignmentCompletion,
          assessmentAverage: isNaN(assessmentScore) ? 75 : assessmentScore,
          lmsActivityAverage: isNaN(lmsActivity) ? 75 : lmsActivity,
          participationAverage: 75,
          lastUpdated: new Date().toISOString(),
          patternType: 'stable'
        };
        this.students.set(studentId, newStudent);
      }

      const newRec: AcademicRecord = {
        id: `REC-${studentId}-W${weekNumber}-${Date.now()}`,
        studentId,
        weekNumber,
        attendance,
        assignmentCompletion,
        assignmentDelayRate: Number(row.assignment_delay || row.assignmentDelayRate || 5),
        assessmentScore: isNaN(assessmentScore) ? 80 : assessmentScore,
        quizScore: Number(row.quiz_score || row.quizScore || assessmentScore || 80),
        lmsActivity: isNaN(lmsActivity) ? 80 : lmsActivity,
        materialAccess: Number(row.material_access || row.materialAccess || 80),
        participation: Number(row.participation || 80),
        recordedAt: new Date().toISOString()
      };

      this.records.push(newRec);
      validCount++;
    });

    // Recompute risks
    this.recomputeAllRisks();
    this.logAudit(
      userEmail,
      'ADMIN',
      'BULK_CSV_IMPORT',
      `Imported ${validCount} records successfully (${errors.length} rejected rows)`
    );

    return {
      totalDetected: rows.length,
      validCount,
      invalidCount: errors.length,
      errors
    };
  }

  // Alerts
  getAllAlerts(): AlertItem[] {
    return Array.from(this.alerts.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  reviewAlert(id: string, reviewerEmail: string): boolean {
    const alert = this.alerts.get(id);
    if (!alert) return false;
    alert.status = 'Reviewed';
    alert.reviewedBy = reviewerEmail;
    alert.reviewedAt = new Date().toISOString();
    return true;
  }

  dismissAlert(id: string): boolean {
    const alert = this.alerts.get(id);
    if (!alert) return false;
    alert.status = 'Dismissed';
    return true;
  }

  // Interventions
  getAllInterventions(): Intervention[] {
    return Array.from(this.interventions.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  createIntervention(intervention: Omit<Intervention, 'id' | 'createdAt' | 'updatedAt'>): Intervention {
    const id = `INT-${Date.now().toString().slice(-6)}`;
    const newInt: Intervention = {
      ...intervention,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.interventions.set(id, newInt);
    this.logAudit(
      intervention.assignedMentorEmail,
      'FACULTY',
      'INTERVENTION_CREATED',
      `Created ${intervention.interventionType} for student ${intervention.studentId} (${intervention.studentName})`
    );
    return newInt;
  }

  updateIntervention(id: string, updates: Partial<Intervention>): Intervention | null {
    const existing = this.interventions.get(id);
    if (!existing) return null;
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.interventions.set(id, updated);
    return updated;
  }

  // Notifications
  getNotifications(): AppNotification[] {
    return [...this.notifications];
  }

  markNotificationAsRead(id: string): void {
    const n = this.notifications.find(item => item.id === id);
    if (n) n.read = true;
  }

  markAllNotificationsRead(): void {
    this.notifications.forEach(n => (n.read = true));
  }

  // System Analytics
  getSystemAnalytics(departmentFilter?: string, sectionFilter?: string): SystemAnalytics {
    let list = Array.from(this.students.values());
    if (departmentFilter && departmentFilter !== 'All') {
      list = list.filter(s => s.department === departmentFilter);
    }
    if (sectionFilter && sectionFilter !== 'All') {
      list = list.filter(s => s.section === sectionFilter);
    }

    const totalStudents = list.length;
    let stableCount = 0;
    let monitorCount = 0;
    let attentionCount = 0;
    let prioritySupportCount = 0;

    let sumAtt = 0;
    let sumAssign = 0;
    let sumAssess = 0;
    let sumLms = 0;
    let sumPart = 0;

    for (const s of list) {
      if (s.currentRiskLevel === 'Stable') stableCount++;
      else if (s.currentRiskLevel === 'Monitor') monitorCount++;
      else if (s.currentRiskLevel === 'Attention') attentionCount++;
      else if (s.currentRiskLevel === 'Priority Support') prioritySupportCount++;

      sumAtt += s.attendanceAverage;
      sumAssign += s.assignmentCompletionAverage;
      sumAssess += s.assessmentAverage;
      sumLms += s.lmsActivityAverage;
      sumPart += s.participationAverage;
    }

    const avg = (val: number) => totalStudents > 0 ? Math.round((val / totalStudents) * 10) / 10 : 0;

    const activeAlerts = Array.from(this.alerts.values()).filter(a => a.status === 'New').length;
    const activeInterventions = Array.from(this.interventions.values()).filter(
      i => i.status === 'Pending' || i.status === 'Scheduled' || i.status === 'Follow-up Required'
    ).length;
    const resolvedInterventions = Array.from(this.interventions.values()).filter(
      i => i.status === 'Completed'
    ).length;

    return {
      totalStudents,
      stableCount,
      monitorCount,
      attentionCount,
      prioritySupportCount,
      averageAttendance: avg(sumAtt),
      averageAssignmentCompletion: avg(sumAssign),
      averageAssessmentScore: avg(sumAssess),
      averageLmsActivity: avg(sumLms),
      averageParticipation: avg(sumPart),
      activeAlertsCount: activeAlerts,
      activeInterventionsCount: activeInterventions,
      resolvedInterventionsCount: resolvedInterventions,
      lastTrainedDate: new Date().toISOString()
    };
  }

  // Audit Logging
  logAudit(actorEmail: string, actorRole: any, action: string, details: string) {
    this.auditLogs.unshift({
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      actorEmail,
      actorRole,
      action,
      details,
      timestamp: new Date().toISOString()
    });
    // Keep last 100 logs
    if (this.auditLogs.length > 100) {
      this.auditLogs = this.auditLogs.slice(0, 100);
    }
  }

  getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }
}

export const db = new Database();
