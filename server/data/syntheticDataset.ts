import { Student, AcademicRecord, AlertItem, Intervention, AuditLog, RiskLevel } from '../../src/types/index.ts';

const FIRST_NAMES = [
  'Aarav', 'Ananya', 'Rohan', 'Priya', 'Kabir', 'Sneha', 'Dev', 'Aditi', 'Vikram', 'Neha',
  'Arjun', 'Isha', 'Rahul', 'Tanvi', 'Siddharth', 'Meera', 'Aditya', 'Riya', 'Karan', 'Pooja',
  'Varun', 'Shreya', 'Amit', 'Divya', 'Gaurav', 'Nidhi', 'Harsh', 'Kavya', 'Manish', 'Bhavna',
  'Nikhil', 'Simran', 'Pranav', 'Payal', 'Rajesh', 'Ankita', 'Suresh', 'Deepika', 'Akash', 'Swati',
  'Sameer', 'Rashmi', 'Manoj', 'Komal', 'Abhishek', 'Pallavi', 'Kunal', 'Jyoti', 'Tarun', 'Suman'
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Patel', 'Reddy', 'Gupta', 'Iyer', 'Mehta', 'Nair', 'Singh', 'Chopra',
  'Deshmukh', 'Joshi', 'Bhat', 'Rao', 'Kumar', 'Kapoor', 'Saxena', 'Bansal', 'Agarwal', 'Malhotra',
  'Pillai', 'Menon', 'Ghosh', 'Mukherjee', 'Bose', 'Chatterjee', 'Pandey', 'Mishra', 'Trivedi', 'Shah'
];

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication'
];

const SECTIONS = ['A', 'B', 'C', 'D'];
const YEARS = [2, 3, 4];

export function generateSyntheticDataset(): {
  students: Student[];
  academicRecords: AcademicRecord[];
  alerts: AlertItem[];
  interventions: Intervention[];
  auditLogs: AuditLog[];
} {
  const students: Student[] = [];
  const academicRecords: AcademicRecord[] = [];
  const alerts: AlertItem[] = [];
  const interventions: Intervention[] = [];
  const auditLogs: AuditLog[] = [];

  const totalStudents = 108; // 108 students cleanly divides across 3 departments * 3 years * 4 sections (3 per class)

  for (let i = 1; i <= totalStudents; i++) {
    const paddedId = `S${i.toString().padStart(3, '0')}`;
    const firstName = FIRST_NAMES[(i - 1) % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(Math.floor(i / 2)) % LAST_NAMES.length];
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@edu.example.org`;

    const department = DEPARTMENTS[(i - 1) % DEPARTMENTS.length];
    const year = YEARS[Math.floor((i - 1) / (totalStudents / 3)) % YEARS.length];
    const section = SECTIONS[(i - 1) % SECTIONS.length];
    const semester = year * 2 - ((i % 2 === 0) ? 0 : 1);

    // Determine student engagement pattern
    let patternType: Student['patternType'] = 'stable';
    if (paddedId === 'S023') {
      patternType = 'multiple_declines';
    } else if (paddedId === 'S014') {
      patternType = 'declining_attendance';
    } else if (i % 9 === 0) {
      patternType = 'multiple_declines'; // Priority Support / Attention
    } else if (i % 6 === 0) {
      patternType = 'declining_attendance'; // Attention / Monitor
    } else if (i % 7 === 0) {
      patternType = 'declining_assignments'; // Attention / Monitor
    } else if (i % 8 === 0) {
      patternType = 'declining_assessments'; // Monitor
    } else if (i % 5 === 0) {
      patternType = 'improving'; // Improving
    } else {
      patternType = 'stable'; // Stable
    }

    // Generate 12 weeks of records
    const studentRecords: AcademicRecord[] = [];
    for (let w = 1; w <= 12; w++) {
      let att = 88 + (Math.sin(w) * 4);
      let assign = 90 + (Math.cos(w) * 5);
      let delay = 5 + (Math.sin(w) * 3);
      let assess = 84 + (Math.cos(w) * 4);
      let quiz = 82 + (Math.sin(w * 2) * 5);
      let lms = 86 + (Math.sin(w) * 5);
      let mat = 85 + (Math.cos(w) * 4);
      let part = 80 + (Math.sin(w) * 6);

      if (paddedId === 'S023') {
        // Special case for S023 matching prompt example
        // Previous (weeks 9-10): attendance 92, assignments 94, assess 81, lms 88
        // Current (weeks 11-12): attendance 79 (-13%), assignments 72 (-22%), assess 76 (-5%), lms 65 (-23%)
        if (w <= 8) {
          att = 92; assign = 95; assess = 83; lms = 90; part = 85; delay = 5;
        } else if (w <= 10) {
          att = 92; assign = 94; assess = 81; lms = 88; part = 82; delay = 8;
        } else {
          att = 79; assign = 72; assess = 76; lms = 65; part = 70; delay = 24;
        }
      } else if (paddedId === 'S014') {
        // Special case for S014: Attendance -12%, Assignments -19%, LMS -24%
        if (w <= 8) {
          att = 90; assign = 92; assess = 80; lms = 88; part = 84; delay = 5;
        } else if (w <= 10) {
          att = 88; assign = 90; assess = 78; lms = 85; part = 80; delay = 8;
        } else {
          att = 76; assign = 71; assess = 74; lms = 61; part = 65; delay = 22;
        }
      } else {
        switch (patternType) {
          case 'stable':
            att = Math.min(98, Math.max(82, att + ((i % 5) - 2)));
            assign = Math.min(98, Math.max(80, assign + ((i % 4) - 2)));
            assess = Math.min(96, Math.max(78, assess + ((i % 6) - 3)));
            lms = Math.min(98, Math.max(76, lms + ((i % 5) - 2)));
            delay = Math.max(2, Math.min(15, delay));
            break;

          case 'declining_attendance':
            if (w >= 7) {
              const drop = (w - 6) * 4.5;
              att = Math.max(58, 92 - drop);
              part = Math.max(55, 84 - drop * 0.8);
            }
            break;

          case 'declining_assignments':
            if (w >= 7) {
              const drop = (w - 6) * 5.5;
              assign = Math.max(52, 94 - drop);
              delay = Math.min(48, 8 + drop * 2.5);
              lms = Math.max(62, 88 - drop * 0.7);
            }
            break;

          case 'declining_assessments':
            if (w >= 6) {
              const drop = (w - 5) * 4;
              assess = Math.max(52, 86 - drop);
              quiz = Math.max(50, 84 - drop * 1.2);
            }
            break;

          case 'multiple_declines':
            if (w >= 7) {
              const drop = (w - 6) * 5.2;
              att = Math.max(50, 91 - drop * 1.1);
              assign = Math.max(48, 93 - drop * 1.3);
              assess = Math.max(55, 85 - drop * 0.9);
              lms = Math.max(45, 89 - drop * 1.4);
              part = Math.max(45, 82 - drop * 1.1);
              delay = Math.min(55, 6 + drop * 3);
            }
            break;

          case 'improving':
            if (w <= 6) {
              att = 66 + w;
              assign = 62 + w * 1.5;
              assess = 64 + w;
              lms = 65 + w;
            } else {
              att = Math.min(92, 72 + (w - 6) * 3);
              assign = Math.min(90, 71 + (w - 6) * 3.5);
              assess = Math.min(88, 70 + (w - 6) * 3);
              lms = Math.min(91, 71 + (w - 6) * 3.2);
            }
            break;
        }
      }

      const rec: AcademicRecord = {
        id: `REC-${paddedId}-W${w}`,
        studentId: paddedId,
        weekNumber: w,
        attendance: Math.round(att * 10) / 10,
        assignmentCompletion: Math.round(assign * 10) / 10,
        assignmentDelayRate: Math.round(delay * 10) / 10,
        assessmentScore: Math.round(assess * 10) / 10,
        quizScore: Math.round(quiz * 10) / 10,
        lmsActivity: Math.round(lms * 10) / 10,
        materialAccess: Math.round(mat * 10) / 10,
        participation: Math.round(part * 10) / 10,
        recordedAt: new Date(2025, 0, 6 + (w * 7)).toISOString()
      };

      studentRecords.push(rec);
      academicRecords.push(rec);
    }

    // Averages across 12 weeks
    const attAvg = Math.round(studentRecords.reduce((acc, r) => acc + r.attendance, 0) / 12 * 10) / 10;
    const assignAvg = Math.round(studentRecords.reduce((acc, r) => acc + r.assignmentCompletion, 0) / 12 * 10) / 10;
    const assessAvg = Math.round(studentRecords.reduce((acc, r) => acc + r.assessmentScore, 0) / 12 * 10) / 10;
    const lmsAvg = Math.round(studentRecords.reduce((acc, r) => acc + r.lmsActivity, 0) / 12 * 10) / 10;
    const partAvg = Math.round(studentRecords.reduce((acc, r) => acc + r.participation, 0) / 12 * 10) / 10;

    // Preliminary risk level mapping (will also be dynamically verified by ML engine)
    let currentRiskScore = 20;
    let currentRiskLevel: RiskLevel = 'Stable';

    if (paddedId === 'S023') {
      currentRiskScore = 68;
      currentRiskLevel = 'Attention';
    } else if (paddedId === 'S014') {
      currentRiskScore = 72;
      currentRiskLevel = 'Attention';
    } else if (patternType === 'multiple_declines') {
      currentRiskScore = 78 + (i % 16);
      currentRiskLevel = currentRiskScore > 75 ? 'Priority Support' : 'Attention';
    } else if (patternType === 'declining_attendance') {
      currentRiskScore = 60 + (i % 12);
      currentRiskLevel = 'Attention';
    } else if (patternType === 'declining_assignments') {
      currentRiskScore = 58 + (i % 10);
      currentRiskLevel = 'Attention';
    } else if (patternType === 'declining_assessments') {
      currentRiskScore = 44 + (i % 10);
      currentRiskLevel = 'Monitor';
    } else if (patternType === 'improving') {
      currentRiskScore = 22 + (i % 6);
      currentRiskLevel = 'Stable';
    } else {
      currentRiskScore = 12 + (i % 14);
      currentRiskLevel = 'Stable';
    }

    const mentorName = department.includes('Computer') 
      ? 'Dr. Elena Rostova' 
      : department.includes('Information') 
        ? 'Prof. Marcus Vance' 
        : 'Dr. Aris Thorne';
    const mentorEmail = department.includes('Computer')
      ? 'elena.rostova@edu.example.org'
      : department.includes('Information')
        ? 'marcus.vance@edu.example.org'
        : 'aris.thorne@edu.example.org';

    const student: Student = {
      id: paddedId,
      name,
      email,
      department,
      year,
      section,
      semester,
      mentorName,
      mentorEmail,
      currentRiskLevel,
      currentRiskScore,
      attendanceAverage: attAvg,
      assignmentCompletionAverage: assignAvg,
      assessmentAverage: assessAvg,
      lmsActivityAverage: lmsAvg,
      participationAverage: partAvg,
      lastUpdated: new Date().toISOString(),
      patternType
    };

    students.push(student);

    // Generate alerts for Attention & Priority Support students
    if (currentRiskLevel === 'Attention' || currentRiskLevel === 'Priority Support') {
      const isPriority = currentRiskLevel === 'Priority Support';
      const observed: string[] = [];
      if (patternType === 'multiple_declines' || paddedId === 'S023' || paddedId === 'S014') {
        observed.push('Attendance ↓ 12-14% over past 2 weeks');
        observed.push('Assignment completion ↓ 19-22%');
        observed.push('LMS engagement activity ↓ 23-28%');
      } else if (patternType === 'declining_attendance') {
        observed.push('Attendance ↓ 15% across morning lecture blocks');
        observed.push('Class participation ↓ 10%');
      } else if (patternType === 'declining_assignments') {
        observed.push('Assignment completion ↓ 25%');
        observed.push('Late submission rate increased to 35%');
      }

      alerts.push({
        id: `ALT-${paddedId}-${i}`,
        studentId: paddedId,
        studentName: name,
        department,
        section,
        title: `Early Engagement Pattern Detected (${paddedId})`,
        observedChanges: observed.length > 0 ? observed : ['Multiple academic metrics dropped > 12% in weeks 11-12'],
        priority: isPriority ? 'Priority Support' : 'Attention',
        recommendedAction: 'Review the recent academic pattern and consider a mentor check-in.',
        status: i % 3 === 0 ? 'Reviewed' : 'New',
        createdAt: new Date(Date.now() - (i * 3600000 * 4)).toISOString(),
        reviewedBy: i % 3 === 0 ? mentorName : undefined,
        reviewedAt: i % 3 === 0 ? new Date().toISOString() : undefined
      });
    }

    // Seed interventions for a subset of flagged students
    if (paddedId === 'S023' || (currentRiskLevel !== 'Stable' && i % 4 === 0)) {
      interventions.push({
        id: `INT-${paddedId}`,
        studentId: paddedId,
        studentName: name,
        interventionType: paddedId === 'S023' ? 'Mentor Meeting' : 'Assignment Support',
        description: paddedId === 'S023'
          ? 'Exploratory mentor check-in to discuss recent workload management and assignment deadlines.'
          : 'Study planning and remedial review sessions arranged with course TA.',
        assignedMentor: mentorName,
        assignedMentorEmail: mentorEmail,
        scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        followUpDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
        status: paddedId === 'S023' ? 'Scheduled' : (i % 2 === 0 ? 'Pending' : 'Follow-up Required'),
        outcome: paddedId === 'S023' ? 'Awaiting session feedback' : 'Student attended first session, agreed on 2-week task plan',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
      });
    }
  }

  // Initial audit logs
  auditLogs.push(
    {
      id: 'AUD-001',
      actorEmail: 'admin@example.com',
      actorRole: 'ADMIN',
      action: 'DATASET_INITIALIZED',
      details: 'Populated 108 synthetic student records spanning 12 academic weeks with 6 behavioral archetypes',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'AUD-002',
      actorEmail: 'faculty@example.com',
      actorRole: 'FACULTY',
      action: 'ENGAGEMENT_RUN_EVALUATED',
      details: 'Executed hybrid Random Forest + 2-week trend analysis model for Semester 1 classes',
      timestamp: new Date(Date.now() - 86400000 * 1).toISOString()
    }
  );

  return {
    students,
    academicRecords,
    alerts,
    interventions,
    auditLogs
  };
}
