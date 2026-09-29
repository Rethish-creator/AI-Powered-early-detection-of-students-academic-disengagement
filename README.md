# AI-Powered Early Detection of Student Academic Disengagement

> An explainable AI-powered academic engagement monitoring platform that identifies early negative trends in student academic indicators (attendance, assignment completion, assessment performance, and LMS activity) for timely faculty mentorship and review.

---

## 1. Project Overview

Early intervention in higher education is crucial to student success, but traditional warning systems often flag students only after irreversible grade drops or attendance defaults have occurred.

**EduSignal AI** addresses this challenge with a **hybrid, explainable AI platform**:
- Longitudinal rolling-window velocity detection (comparing current 2-week trends against baseline)
- Ensemble Random Forest feature importance
- SHAP (Shapley Additive exPlanations) factor attribution
- Proactive educational support recommendations
- Human-in-the-loop: Never makes automated punitive or disciplinary decisions

---

## 2. Key Features

- **Longitudinal Engagement Tracking**: 12-week historical curves across lecture attendance, assignment completion, delay rates, and LMS activity.
- **Explainable AI (XAI)**: Generates explicit factor deltas (e.g. Attendance ↓ 13%, Assignments ↓ 22%) and SHAP waterfall contributions.
- **Role-Based Portals**:
  - **Faculty / Mentor**: Class analytics, student roster, active alerts, intervention planning.
  - **Administrator**: CSV dataset batch ingestion, audit logging, department oversight.
  - **Student**: Private self-service dashboard with positive reinforcement, personal trends, and scheduled check-in dates.
- **Support Intervention Workflow**: Create and track academic support plans (Mentor Meetings, Tutoring, Study Planning) with status milestones.
- **Bulk CSV Data Import**: Drag-and-drop file ingestion with row-by-row validation, column inspection, and immediate AI re-scoring.
- **Reports & Exporting**: Printable dossier layouts and instant CSV exports for departmental reviews.

---

## 3. Technology Stack

### Frontend:
- **Framework**: React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts (Longitudinal line curves, grouped section bars, risk distributions)
- **Icons**: Lucide React
- **Animation**: Motion

### Backend & API:
- **Server**: Node.js / Express with TypeScript
- **Authentication**: JWT (JSON Web Tokens) with cryptographic password hashing
- **Python / FastAPI Reference**: Available in `/backend` with SQLAlchemy and Pydantic models

### AI / Machine Learning:
- **Algorithm**: Hybrid Random Forest + Multi-week Rolling Delta Engine
- **Explainability**: SHAP (Shapley Additive exPlanations) waterfall attributions
- **Proactive Recommendations**: Heuristic mapping based on observed factor combinations

---

## 4. Demo Login Credentials

For quick evaluation, one-click demo credentials are provided directly on the Login page and in the top navigation role switcher:

| Role | Email | Password | Features Accessible |
|---|---|---|---|
| **Faculty / Mentor** | `faculty@example.com` | `FacultyPass@2025` | Full analytics, S023 explainability, alerts, interventions |
| **Administrator** | `admin@example.com` | `AdminPass@2025` | CSV import, audit logs, system configuration |
| **Student** | `student@example.com` | `StudentPass@2025` | Private view for student Priya Patel (S023) |

---

## 5. Local Setup & Installation

### Option A: Standard Full-Stack (Node.js & Vite)
1. Clone the repository:
   ```bash
   git clone https://github.com/example/student-disengagement-ai.git
   cd student-disengagement-ai
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server (runs full-stack Express API with Vite on port 3000):
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option B: Docker Compose
```bash
docker-compose up --build
```

---

## 6. Ethical AI & Privacy Constitution

- **No Punitive Labels**: The system never refers to a student as "disengaged", "lazy", "weak", or "failing". All flags are formally termed **"Engagement Risk Indicator — Faculty Review Required"**.
- **No Sensitive Demographics**: The model strictly excludes race, religion, gender, financial circumstances, medical history, and mental health data.
- **Student Privacy Boundary**: Students can only access their own supportive growth data; peer rankings and peer indicators are never visible.
