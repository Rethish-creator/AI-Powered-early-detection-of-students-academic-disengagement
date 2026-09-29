# REST API Documentation
**AI-Powered Early Detection of Student Academic Disengagement**

Base URL: `/api`

All protected endpoints require an `Authorization` header formatted as:
`Authorization: Bearer <JWT_TOKEN>`

---

## 1. Authentication

### `POST /api/auth/login`
Authenticates a user and issues a signed JSON Web Token (JWT).
- **Body**:
  ```json
  {
    "email": "faculty@example.com",
    "password": "FacultyPass@2025"
  }
  ```
- **Response**:
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "USR-002",
      "email": "faculty@example.com",
      "name": "Dr. Elena Rostova",
      "role": "FACULTY",
      "department": "Computer Science & Engineering"
    }
  }
  ```

### `POST /api/auth/register`
Creates an account with salted password hash.
- **Roles**: `ADMIN`, `FACULTY`, `STUDENT`

### `GET /api/auth/me`
Returns details of the currently authenticated user.

---

## 2. Students & Academic Records

### `GET /api/students`
Returns student roster with optional filtering.
- **Query Parameters**:
  - `search`: string (ID, name, email)
  - `department`: string
  - `section`: string
  - `year`: number
  - `riskLevel`: `Stable` | `Monitor` | `Attention` | `Priority Support`
- **Privacy Boundary**: If accessed by a student, only returns that student's own record.

### `GET /api/students/:id`
Retrieves a student by ID.

### `GET /api/students/:id/academic-records`
Returns the 12-week longitudinal metric records for the specified student.

### `POST /api/academic-records/bulk`
Ingests batch records from CSV data with column and range validation.

---

## 3. Explainable AI & Predictions

### `GET /api/ai/student/:student_id`
Calculates hybrid engagement risk indicators, SHAP contributions, and faculty support suggestions.

### `GET /api/ai/explanation/:student_id`
Returns explicit factor delta comparisons:
- Current 2-week average vs Previous 2-week average
- Percentage delta
- Impact level (`High` | `Medium` | `Low`)
- SHAP waterfall attribution

---

## 4. Alerts & Interventions

### `GET /api/alerts`
Returns active engagement pattern alerts requiring faculty review.

### `POST /api/alerts/:id/review`
Marks an alert as reviewed.

### `POST /api/interventions`
Creates an academic support plan (e.g. Mentor Meeting, Tutoring, Study Planning).

### `PUT /api/interventions/:id`
Updates intervention status (`Pending`, `Scheduled`, `Completed`, `Follow-up Required`) and outcome notes.

---

## 5. Reports & Analytics

### `GET /api/analytics/overview`
Returns high-level statistics across all cohorts.

### `GET /api/analytics/class`
Returns section benchmark comparisons (Section A vs B vs C vs D) and 12-week cohort averages.

### `GET /api/reports/class` & `GET /api/reports/student/:id`
Generates comprehensive printable and exportable reports.
