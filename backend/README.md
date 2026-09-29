# EduSignal AI - Backend Architecture & Reference

This directory contains backend specifications, ML algorithms, and the Python reference implementation for the **AI-Powered Early Detection of Student Academic Disengagement** platform.

---

## 1. Directory Structure

```
backend/
├── app/
│   ├── database/
│   │   └── models.py      # SQLAlchemy relational models (Students, Records, Interventions, Alerts)
│   ├── ml/
│   │   └── engine.py      # Random Forest + SHAP waterfall calculation engine
│   └── main.py            # FastAPI service endpoints (alternative Python backend)
├── requirements.txt       # Python dependencies (scikit-learn, shap, fastapi, uvicorn, sqlalchemy)
└── README.md              # This documentation
```

---

## 2. Machine Learning Pipeline & Algorithm

The engagement prediction model combines **longitudinal velocity comparison** with **ensemble Random Forest feature weighting**:

1. **Velocity Delta (Current 2-Week vs Baseline)**:
   - Evaluates short-term rate of change across attendance, assignment submissions, quiz scores, and LMS access.
   - Detects acute drops before cumulative semester GPA is irreversibly damaged.

2. **Feature Weights**:
   - `Attendance Velocity Delta`: 30%
   - `Assignment Delay & Completion Rate`: 30%
   - `Formative Assessment Trend`: 25%
   - `LMS Resource Activity & Login Cadence`: 15%

3. **Explainability via SHAP (Shapley Additive exPlanations)**:
   - For every flagged student, the model computes exact feature attribution deltas.
   - Generates human-understandable explanations:
     - *"Attendance dropped 13% over past 2 weeks (SHAP: +14.2 risk contribution)"*
     - *"Assignment completion rate fell by 22% (SHAP: +18.5 risk contribution)"*

---

## 3. Running the Python / FastAPI Backend (Optional Alternative)

If you prefer running the Python FastAPI microservice alongside or instead of the TypeScript Node.js server:

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run FastAPI server
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive OpenAPI docs will be available at `http://localhost:8000/docs`.

---

## 4. Production TypeScript Server (Default)

The project ships with an integrated TypeScript backend (`server.ts` + `server/db.ts` + `server/ml/engine.ts`) that executes synchronously with Vite, eliminating cross-service latency and simplifying Docker and cloud deployments.
