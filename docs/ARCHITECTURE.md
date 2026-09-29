# System Architecture & Technical Specifications
**AI-Powered Early Detection of Student Academic Disengagement**

---

## 1. Architectural Overview

```
                      +---------------------------------------+
                      |          User Interface (React)       |
                      |  Tailwind CSS · Recharts · Lucide UI  |
                      +-------------------+-------------------+
                                          | REST / JWT (Bearer)
                                          v
                      +---------------------------------------+
                      |         Node / Express Server         |
                      |      Auth · Role Guards · Routing     |
                      +-------------------+-------------------+
                                          |
                     +--------------------+--------------------+
                     |                                         |
                     v                                         v
        +-------------------------+               +-------------------------+
        |   ML & SHAP AI Engine   |               |     Database Layer      |
        | Random Forest + Deltas  |               |  Students · Records     |
        | Proactive Recs Engine   |               |  Alerts · Interventions |
        +-------------------------+               +-------------------------+
```

---

## 2. Hybrid AI Engagement Engine

The platform operates on a three-tier hybrid architecture:

1. **Longitudinal Rolling Window Velocity**:
   - Compares the **current 2-week window** ($W_{t}, W_{t-1}$) against the **prior baseline window** ($W_{t-2}, W_{t-3}$).
   - Computes percentage change $\Delta = \frac{\bar{x}_{\text{current}} - \bar{x}_{\text{prev}}}{\bar{x}_{\text{prev}}} \times 100$.

2. **Random Forest Feature Attributions**:
   - Evaluates multidimensional features:
     - `attendance_percentage`
     - `assignment_completion_rate`
     - `assignment_delay_rate`
     - `assessment_average`
     - `quiz_average`
     - `lms_activity`
     - `material_access`
     - `participation_rate`

3. **SHAP Decomposition**:
   - Calculates additive contributions from the population baseline score (18) to the final pattern score (0-100).
   - Generates actionable explanations for faculty review.

---

## 3. Ethical Constitution & Privacy Boundary

- **No Defamatory Labeling**: Strict ban on labeling students as "weak", "lazy", "failing", or "disengaged".
- **Informational Risk Indicator**: All flags are titled "Engagement Risk Indicator — Faculty Review Required".
- **Zero Demographic Data**: No collection or modeling of race, gender, religion, medical, financial, or personal circumstances.
- **Privacy Partitioning**: Students can only view their own dashboard with constructive tips; peer data is completely inaccessible.
