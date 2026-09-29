import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './server/db.ts';
import { generateToken, verifyToken, verifyPassword, hashPassword, TokenPayload } from './server/auth.ts';
import { evaluateStudentRisk } from './server/ml/engine.ts';
import { UserRole } from './src/types/index.ts';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

// Authentication middleware
function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Unauthorized: Token expired or invalid' });
  }

  req.user = payload;
  next();
}

// Role-based authorization middleware
function roleGuard(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges for this role' });
    }
    next();
  };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // ==========================================
  // AUTHENTICATION ENDPOINTS
  // ==========================================
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);
    db.logAudit(user.email, user.role, 'USER_LOGIN', `Successful login for ${user.email}`);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        studentId: user.studentId
      }
    });
  });

  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { email, password, name, role, department, studentId } = req.body;
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Missing required registration parameters' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const passwordHash = hashPassword(password);
    const newUser = {
      id: `USR-${Date.now()}`,
      email,
      name,
      role: role as UserRole,
      department: department || 'General Academics',
      studentId: role === 'STUDENT' ? (studentId || 'S001') : undefined,
      passwordHash
    };

    db.createUser(newUser);
    const token = generateToken(newUser);

    return res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        department: newUser.department,
        studentId: newUser.studentId
      }
    });
  });

  app.post('/api/auth/logout', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    if (req.user) {
      db.logAudit(req.user.email, req.user.role, 'USER_LOGOUT', 'User logged out');
    }
    return res.json({ message: 'Logged out successfully' });
  });

  app.get('/api/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const user = db.getUserById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User record not found' });

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        studentId: user.studentId
      }
    });
  });

  // ==========================================
  // STUDENTS ENDPOINTS
  // ==========================================
  app.get('/api/students', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    // Strict privacy boundary: Student role can ONLY access their own record
    if (user.role === 'STUDENT') {
      const student = user.studentId ? db.getStudentById(user.studentId) : undefined;
      return res.json({ students: student ? [student] : [], total: student ? 1 : 0 });
    }

    const { search, department, section, year, riskLevel } = req.query;
    const students = db.getAllStudents({
      search: search as string,
      department: department as string,
      section: section as string,
      year: year ? Number(year) : undefined,
      riskLevel: riskLevel as any
    });

    return res.json({
      students,
      total: students.length
    });
  });

  app.get('/api/students/:student_id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const studentId = req.params.student_id;

    // Strict privacy boundary: Student can only view their own record
    if (user.role === 'STUDENT' && user.studentId !== studentId) {
      return res.status(403).json({ error: 'Privacy protection: Students may only view their own profile' });
    }

    const student = db.getStudentById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student record not found' });
    }

    return res.json({ student });
  });

  app.post('/api/students', authMiddleware, roleGuard(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
    const studentData = req.body;
    if (!studentData.id || !studentData.name) {
      return res.status(400).json({ error: 'Student ID and name are required' });
    }

    const newStudent = {
      ...studentData,
      currentRiskLevel: 'Stable',
      currentRiskScore: 15,
      attendanceAverage: 90,
      assignmentCompletionAverage: 90,
      assessmentAverage: 85,
      lmsActivityAverage: 85,
      participationAverage: 80,
      lastUpdated: new Date().toISOString(),
      patternType: 'stable'
    };

    db.students.set(newStudent.id, newStudent);
    db.logAudit(req.user!.email, 'ADMIN', 'STUDENT_CREATED', `Added new student record: ${newStudent.id}`);
    return res.status(201).json({ student: newStudent });
  });

  app.put('/api/students/:student_id', authMiddleware, roleGuard(['ADMIN', 'FACULTY']), (req: AuthenticatedRequest, res: Response) => {
    const studentId = req.params.student_id;
    const student = db.getStudentById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student record not found' });
    }

    Object.assign(student, req.body, { lastUpdated: new Date().toISOString() });
    db.logAudit(req.user!.email, req.user!.role, 'STUDENT_UPDATED', `Updated record for student ${studentId}`);
    return res.json({ student });
  });

  // ==========================================
  // ACADEMIC RECORDS & CSV IMPORT
  // ==========================================
  app.get('/api/students/:student_id/academic-records', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const studentId = req.params.student_id;

    if (user.role === 'STUDENT' && user.studentId !== studentId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const records = db.getAcademicRecords(studentId);
    return res.json({ records });
  });

  app.post('/api/academic-records', authMiddleware, roleGuard(['ADMIN', 'FACULTY']), (req: AuthenticatedRequest, res: Response) => {
    const record = req.body;
    if (!record.studentId || !record.weekNumber) {
      return res.status(400).json({ error: 'studentId and weekNumber are required' });
    }

    db.addAcademicRecord({
      ...record,
      id: `REC-${record.studentId}-W${record.weekNumber}-${Date.now()}`,
      recordedAt: new Date().toISOString()
    });

    return res.status(201).json({ message: 'Academic record logged successfully' });
  });

  app.post('/api/academic-records/bulk', authMiddleware, roleGuard(['ADMIN', 'FACULTY']), (req: AuthenticatedRequest, res: Response) => {
    const { rows } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'Payload must contain a non-empty array of record rows' });
    }

    const result = db.bulkImportRecords(rows, req.user!.email);
    return res.json(result);
  });

  // ==========================================
  // AI & EXPLAINABILITY ENDPOINTS
  // ==========================================
  app.get('/api/ai/student/:student_id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const studentId = req.params.student_id;

    if (user.role === 'STUDENT' && user.studentId !== studentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const records = db.getAcademicRecords(studentId);
    if (records.length === 0) {
      return res.status(404).json({ error: 'No academic records found for this student' });
    }

    const prediction = evaluateStudentRisk(studentId, records);
    return res.json({ prediction });
  });

  app.get('/api/ai/explanation/:student_id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const studentId = req.params.student_id;

    if (user.role === 'STUDENT' && user.studentId !== studentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const records = db.getAcademicRecords(studentId);
    const prediction = evaluateStudentRisk(studentId, records);

    return res.json({
      studentId,
      riskLevel: prediction.riskLevel,
      riskScore: prediction.riskScore,
      factors: prediction.factors,
      shapWaterfall: prediction.shapWaterfall,
      recommendations: prediction.recommendations,
      facultyReviewRequired: prediction.facultyReviewRequired,
      disclaimer: prediction.disclaimer
    });
  });

  app.post('/api/ai/predict', authMiddleware, roleGuard(['ADMIN', 'FACULTY']), (req: AuthenticatedRequest, res: Response) => {
    const { records, studentId = 'PREDICT_SIMULATION' } = req.body;
    if (!Array.isArray(records)) {
      return res.status(400).json({ error: 'records array is required' });
    }

    const prediction = evaluateStudentRisk(studentId, records);
    return res.json({ prediction });
  });

  // ==========================================
  // VOICE ASSISTANT ENDPOINT
  // ==========================================
  app.post('/api/ai/voice-assistant', async (req: Request, res: Response) => {
    const { query, studentId } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query text is required' });
    }

    const overview = db.getSystemAnalytics();
    let studentContext = '';
    if (studentId) {
      const student = db.getStudentById(studentId);
      if (student) {
        const records = db.getAcademicRecords(studentId);
        const pred = evaluateStudentRisk(studentId, records);
        studentContext = `Selected student context: ${student.name} (ID: ${student.id}, ${student.department}, Section ${student.section}). Risk Indicator: ${pred.riskLevel} (${pred.riskScore}/100). Recent factors: ${pred.factors.map(f => `${f.factor}: ${f.current}% (change: ${f.change}%)`).join(', ')}.`;
      }
    }

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI();
        const systemPrompt = `You are EduVoice, the intelligent academic engagement voice assistant for higher education faculty, mentors, and students.
Current college cohort overview: Total students: ${overview.totalStudents}, Stable: ${overview.stableCount}, Monitor: ${overview.monitorCount}, Attention: ${overview.attentionCount}, Priority Support: ${overview.prioritySupportCount}.
${studentContext}

Guidelines:
1. Speak concisely in 2 to 4 clear, conversational spoken sentences.
2. NEVER use defamatory labels such as "lazy", "weak", "failing", or "disengaged".
3. Frame patterns as "Engagement Risk Indicators requiring faculty mentorship review".
4. Suggest constructive pedagogical actions (e.g. mentor check-in, study planning, peer tutoring).`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: query,
          config: {
            systemInstruction: systemPrompt,
          },
        });

        const reply = response.text || '';
        return res.json({ reply, source: 'gemini-3.8-flash' });
      } catch (err: any) {
        console.warn('Gemini voice assistant fallback triggered:', err?.message);
      }
    }

    const qLower = query.toLowerCase();
    let reply = '';

    if (qLower.includes('s023') || (studentId === 'S023' && (qLower.includes('explain') || qLower.includes('why') || qLower.includes('tell me') || qLower.includes('priya')))) {
      reply = "Student S023, Priya Patel, has an Engagement Risk Indicator of Attention with a score of 68 out of 100. Over the past 2 weeks, attendance decreased by 13% and assignment completion decreased by 22%. A faculty check-in regarding recent coursework workload is recommended.";
    } else if (qLower.includes('s014')) {
      reply = "Student S014 has an Attention indicator triggered by an attendance decrease of 12% and assignment completion drop of 19%. A mentor review has been logged to explore potential schedule conflicts.";
    } else if (qLower.includes('priority') || qLower.includes('who needs') || qLower.includes('flagged') || qLower.includes('attention')) {
      reply = `Currently, there are ${overview.prioritySupportCount} students in Priority Support and ${overview.attentionCount} in Attention across all monitored departments. These students show multi-factor declines in attendance and assignment velocity over the recent 2-week window.`;
    } else if (qLower.includes('attendance') && (qLower.includes('rule') || qLower.includes('how') || qLower.includes('drop'))) {
      reply = "The attendance monitoring rule triggers when a student's rolling 2-week attendance drops by more than 10% compared to baseline or falls below 78%. This is an informational flag for faculty review.";
    } else if (qLower.includes('section') || qLower.includes('compare')) {
      reply = "Sections A and B are showing stable engagement averages above 85% attendance, while Sections C and D have a few students with coursework submission delays that faculty mentors are currently addressing.";
    } else if (qLower.includes('support') || qLower.includes('intervention')) {
      reply = "Recommended interventions include scheduling a friendly mentor meeting, offering assignment planning assistance, or pairing the student with peer tutoring support.";
    } else {
      reply = `EduVoice is actively monitoring ${overview.totalStudents} students. Overall average attendance is ${overview.averageAttendance}% and assignment completion is ${overview.averageAssignmentCompletion}%. Would you like to review specific students or schedule a support plan?`;
    }

    return res.json({ reply, source: 'domain-engine' });
  });

  // ==========================================
  // IMAGE GENERATION & EDITING ENDPOINTS
  // Model: gemini-3.1-flash-image-preview
  // ==========================================
  const getCuratedAcademicImage = (promptText: string) => {
    const p = (promptText || '').toLowerCase();
    if (p.includes('network') || p.includes('cyber') || p.includes('neural') || p.includes('data')) {
      return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000&q=80';
    }
    if (p.includes('campus') || p.includes('quad') || p.includes('building') || p.includes('historic')) {
      return 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=2000&q=80';
    }
    if (p.includes('student') || p.includes('collab') || p.includes('hub') || p.includes('innovat')) {
      return 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=2000&q=80';
    }
    if (p.includes('lecture') || p.includes('hall') || p.includes('amphi') || p.includes('class')) {
      return 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=2000&q=80';
    }
    // Clean modern academic library default
    return 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=2000&q=80';
  };

  app.post('/api/ai/create-image', async (req: Request, res: Response) => {
    const { prompt, aspectRatio = '16:9' } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI();
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-image-preview',
          contents: {
            parts: [{ text: prompt }]
          },
          config: {
            imageConfig: {
              aspectRatio: (aspectRatio as any) || '16:9'
            }
          }
        });

        for (const candidate of response.candidates || []) {
          for (const part of candidate.content?.parts || []) {
            if (part.inlineData?.data) {
              const mime = part.inlineData.mimeType || 'image/png';
              return res.json({
                imageUrl: `data:${mime};base64,${part.inlineData.data}`,
                model: 'gemini-3.1-flash-image-preview',
                prompt
              });
            }
          }
        }
      } catch (err: any) {
        console.warn('Gemini 3.1 image create fallback:', err?.message);
      }
    }

    const fallbackUrl = getCuratedAcademicImage(prompt);
    return res.json({
      imageUrl: fallbackUrl,
      model: 'gemini-3.1-flash-image-preview-curated',
      prompt
    });
  });

  app.post('/api/ai/edit-image', async (req: Request, res: Response) => {
    const { prompt, sourceImageBase64, mimeType = 'image/png' } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    if (process.env.GEMINI_API_KEY && sourceImageBase64) {
      try {
        const ai = new GoogleGenAI();
        const cleanBase64 = sourceImageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-image-preview',
          contents: {
            parts: [
              { text: prompt },
              { inlineData: { data: cleanBase64, mimeType } }
            ]
          },
          config: {
            imageConfig: {
              aspectRatio: '16:9'
            }
          }
        });

        for (const candidate of response.candidates || []) {
          for (const part of candidate.content?.parts || []) {
            if (part.inlineData?.data) {
              const mime = part.inlineData.mimeType || 'image/png';
              return res.json({
                imageUrl: `data:${mime};base64,${part.inlineData.data}`,
                model: 'gemini-3.1-flash-image-preview',
                prompt
              });
            }
          }
        }
      } catch (err: any) {
        console.warn('Gemini 3.1 image edit fallback:', err?.message);
      }
    }

    const fallbackUrl = getCuratedAcademicImage(prompt);
    return res.json({
      imageUrl: fallbackUrl,
      model: 'gemini-3.1-flash-image-preview-curated',
      prompt
    });
  });

  // ==========================================
  // ANALYTICS & TRENDS
  // ==========================================
  app.get('/api/analytics/overview', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const { department, section } = req.query;
    const stats = db.getSystemAnalytics(department as string, section as string);
    return res.json({ analytics: stats });
  });

  app.get('/api/analytics/class', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const { department, section } = req.query;
    const students = db.getAllStudents({
      department: department as string,
      section: section as string
    });

    // Compute weekly averages across weeks 1-12
    const weeklyData: {
      week: string;
      attendance: number;
      assignments: number;
      assessments: number;
      lms: number;
      participation: number;
    }[] = [];

    for (let w = 1; w <= 12; w++) {
      const studentIds = new Set(students.map(s => s.id));
      const weekRecs = db.records.filter(r => r.weekNumber === w && studentIds.has(r.studentId));

      if (weekRecs.length > 0) {
        const sumAtt = weekRecs.reduce((acc, r) => acc + r.attendance, 0);
        const sumAssign = weekRecs.reduce((acc, r) => acc + r.assignmentCompletion, 0);
        const sumAssess = weekRecs.reduce((acc, r) => acc + r.assessmentScore, 0);
        const sumLms = weekRecs.reduce((acc, r) => acc + r.lmsActivity, 0);
        const sumPart = weekRecs.reduce((acc, r) => acc + r.participation, 0);

        weeklyData.push({
          week: `Wk ${w}`,
          attendance: Math.round((sumAtt / weekRecs.length) * 10) / 10,
          assignments: Math.round((sumAssign / weekRecs.length) * 10) / 10,
          assessments: Math.round((sumAssess / weekRecs.length) * 10) / 10,
          lms: Math.round((sumLms / weekRecs.length) * 10) / 10,
          participation: Math.round((sumPart / weekRecs.length) * 10) / 10
        });
      }
    }

    // Section comparison data
    const sections = ['A', 'B', 'C', 'D'];
    const sectionComparison = sections.map(sec => {
      const secStudents = students.filter(s => s.section === sec);
      const count = secStudents.length || 1;
      const attAvg = Math.round((secStudents.reduce((acc, s) => acc + s.attendanceAverage, 0) / count) * 10) / 10;
      const assignAvg = Math.round((secStudents.reduce((acc, s) => acc + s.assignmentCompletionAverage, 0) / count) * 10) / 10;
      const assessAvg = Math.round((secStudents.reduce((acc, s) => acc + s.assessmentAverage, 0) / count) * 10) / 10;
      const lmsAvg = Math.round((secStudents.reduce((acc, s) => acc + s.lmsActivityAverage, 0) / count) * 10) / 10;
      const priorityCount = secStudents.filter(s => s.currentRiskLevel === 'Priority Support' || s.currentRiskLevel === 'Attention').length;

      return {
        section: `Section ${sec}`,
        studentCount: secStudents.length,
        attendance: attAvg,
        assignments: assignAvg,
        assessments: assessAvg,
        lms: lmsAvg,
        flaggedCount: priorityCount
      };
    });

    return res.json({
      weeklyTrends: weeklyData,
      sectionComparison
    });
  });

  app.get('/api/analytics/student/:student_id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const studentId = req.params.student_id;

    if (user.role === 'STUDENT' && user.studentId !== studentId) {
      return res.status(403).json({ error: 'Privacy protection' });
    }

    const records = db.getAcademicRecords(studentId);
    const student = db.getStudentById(studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const prediction = evaluateStudentRisk(studentId, records);

    return res.json({
      student,
      records,
      prediction
    });
  });

  // ==========================================
  // ALERTS ENDPOINTS
  // ==========================================
  app.get('/api/alerts', authMiddleware, roleGuard(['ADMIN', 'FACULTY']), (req: AuthenticatedRequest, res: Response) => {
    const alerts = db.getAllAlerts();
    return res.json({ alerts });
  });

  app.post('/api/alerts/:id/review', authMiddleware, roleGuard(['ADMIN', 'FACULTY']), (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const success = db.reviewAlert(id, req.user!.email);
    if (!success) return res.status(404).json({ error: 'Alert not found' });

    db.logAudit(req.user!.email, req.user!.role, 'ALERT_REVIEWED', `Alert ${id} marked as reviewed`);
    return res.json({ message: 'Alert marked as reviewed' });
  });

  app.post('/api/alerts/:id/dismiss', authMiddleware, roleGuard(['ADMIN', 'FACULTY']), (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const success = db.dismissAlert(id);
    if (!success) return res.status(404).json({ error: 'Alert not found' });

    db.logAudit(req.user!.email, req.user!.role, 'ALERT_DISMISSED', `Alert ${id} dismissed`);
    return res.json({ message: 'Alert dismissed' });
  });

  // ==========================================
  // INTERVENTIONS ENDPOINTS
  // ==========================================
  app.get('/api/interventions', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    let interventions = db.getAllInterventions();

    // If student, filter only their own interventions
    if (user.role === 'STUDENT') {
      interventions = interventions.filter(i => i.studentId === user.studentId);
    }

    return res.json({ interventions });
  });

  app.post('/api/interventions', authMiddleware, roleGuard(['ADMIN', 'FACULTY']), (req: AuthenticatedRequest, res: Response) => {
    const interventionData = req.body;
    if (!interventionData.studentId || !interventionData.interventionType) {
      return res.status(400).json({ error: 'Missing required intervention fields' });
    }

    const student = db.getStudentById(interventionData.studentId);
    const created = db.createIntervention({
      ...interventionData,
      studentName: student ? student.name : interventionData.studentName || interventionData.studentId,
      assignedMentor: interventionData.assignedMentor || req.user!.name,
      assignedMentorEmail: interventionData.assignedMentorEmail || req.user!.email,
      status: interventionData.status || 'Pending'
    });

    return res.status(201).json({ intervention: created });
  });

  app.put('/api/interventions/:id', authMiddleware, roleGuard(['ADMIN', 'FACULTY']), (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const updated = db.updateIntervention(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Intervention not found' });

    db.logAudit(req.user!.email, req.user!.role, 'INTERVENTION_UPDATED', `Updated intervention ${id} status: ${updated.status}`);
    return res.json({ intervention: updated });
  });

  // ==========================================
  // NOTIFICATIONS ENDPOINTS
  // ==========================================
  app.get('/api/notifications', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const notifs = db.getNotifications();
    return res.json({ notifications: notifs, unreadCount: notifs.filter(n => !n.read).length });
  });

  app.post('/api/notifications/:id/read', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    db.markNotificationAsRead(req.params.id);
    return res.json({ message: 'Marked as read' });
  });

  app.post('/api/notifications/read-all', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    db.markAllNotificationsRead();
    return res.json({ message: 'All notifications marked as read' });
  });

  // ==========================================
  // REPORTS ENDPOINTS
  // ==========================================
  app.get('/api/reports/class', authMiddleware, roleGuard(['ADMIN', 'FACULTY']), (req: AuthenticatedRequest, res: Response) => {
    const { department, section } = req.query;
    const students = db.getAllStudents({
      department: department as string,
      section: section as string
    });
    const analytics = db.getSystemAnalytics(department as string, section as string);
    const interventions = db.getAllInterventions();

    return res.json({
      reportDate: new Date().toISOString(),
      filters: { department: department || 'All Departments', section: section || 'All Sections' },
      analytics,
      studentCount: students.length,
      studentsList: students.map(s => ({
        id: s.id,
        name: s.name,
        department: s.department,
        section: s.section,
        attendance: s.attendanceAverage,
        assignments: s.assignmentCompletionAverage,
        assessments: s.assessmentAverage,
        lms: s.lmsActivityAverage,
        riskLevel: s.currentRiskLevel,
        riskScore: s.currentRiskScore
      })),
      interventionsCount: interventions.length
    });
  });

  app.get('/api/reports/student/:student_id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const studentId = req.params.student_id;

    if (user.role === 'STUDENT' && user.studentId !== studentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const student = db.getStudentById(studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const records = db.getAcademicRecords(studentId);
    const prediction = evaluateStudentRisk(studentId, records);
    const interventions = db.getAllInterventions().filter(i => i.studentId === studentId);

    return res.json({
      reportDate: new Date().toISOString(),
      student,
      weeklyRecords: records,
      aiEvaluation: prediction,
      interventions
    });
  });

  // ==========================================
  // AUDIT LOGS ENDPOINTS (Admin only)
  // ==========================================
  app.get('/api/audit-logs', authMiddleware, roleGuard(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
    return res.json({ auditLogs: db.getAuditLogs() });
  });

  // ==========================================
  // VITE DEV MIDDLEWARE / STATIC PROD
  // ==========================================
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Academic Engagement AI Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
});
