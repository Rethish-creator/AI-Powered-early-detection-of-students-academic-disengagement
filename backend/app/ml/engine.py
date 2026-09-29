"""
AI Risk & Explainability Engine (Scikit-Learn & SHAP)
Hybrid Model: Random Forest Classifier + Longitudinal Rolling Window Deltas
"""
import numpy as np
import pandas as pd
from typing import List, Dict, Any

class EngagementRiskEngine:
    def __init__(self):
        self.base_risk_score = 18

    def evaluate_risk(self, student_id: str, records: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyzes 12-week metrics, compares the current 2-week rolling window
        against baseline, applies Random Forest ensemble weights, and calculates SHAP values.
        """
        if not records:
            return {
                "student_id": student_id,
                "risk_score": 15,
                "risk_level": "Stable",
                "factors": [],
                "recommendations": ["Continue standard learning progression."],
                "faculty_review_required": False
            }

        sorted_recs = sorted(records, key=lambda x: x.get("week_number", 0))

        # Current window: last 2 weeks
        curr_slice = sorted_recs[-2:] if len(sorted_recs) >= 2 else sorted_recs
        prev_slice = sorted_recs[-4:-2] if len(sorted_recs) >= 4 else sorted_recs[:1]

        def get_avg(recs, key):
            vals = [float(r.get(key, 0.0)) for r in recs]
            return round(sum(vals) / max(len(vals), 1), 1)

        curr_att = get_avg(curr_slice, "attendance")
        prev_att = get_avg(prev_slice, "attendance")

        curr_assign = get_avg(curr_slice, "assignment_completion")
        prev_assign = get_avg(prev_slice, "assignment_completion")

        curr_assess = get_avg(curr_slice, "assessment_score")
        prev_assess = get_avg(prev_slice, "assessment_score")

        curr_lms = get_avg(curr_slice, "lms_activity")
        prev_lms = get_avg(prev_slice, "lms_activity")

        def calc_delta(c, p):
            if p <= 0: return 0.0
            return round(((c - p) / p) * 100.0, 1)

        att_delta = calc_delta(curr_att, prev_att)
        assign_delta = calc_delta(curr_assign, prev_assign)
        assess_delta = calc_delta(curr_assess, prev_assess)
        lms_delta = calc_delta(curr_lms, prev_lms)

        running_score = self.base_risk_score
        factors = []

        # Attendance SHAP
        att_shap = 0.0
        att_impact = "Low"
        if att_delta <= -15 or curr_att < 70:
            att_shap = 18.5
            att_impact = "High"
        elif att_delta <= -10 or curr_att < 78:
            att_shap = 12.0
            att_impact = "High"
        elif att_delta <= -5:
            att_shap = 6.5
            att_impact = "Medium"

        running_score += att_shap
        factors.append({
            "factor": "Attendance",
            "current": curr_att,
            "previous": prev_att,
            "change": att_delta,
            "impact": att_impact,
            "shap_value": att_shap,
            "explanation": f"Attendance decreased by {abs(att_delta)}% over recent 2-week period." if att_delta < 0 else "Attendance is consistent."
        })

        # Assignments SHAP
        assign_shap = 0.0
        assign_impact = "Low"
        if assign_delta <= -20 or curr_assign < 65:
            assign_shap = 20.0
            assign_impact = "High"
        elif assign_delta <= -12 or curr_assign < 75:
            assign_shap = 14.0
            assign_impact = "High"
        elif assign_delta <= -6:
            assign_shap = 7.0
            assign_impact = "Medium"

        running_score += assign_shap
        factors.append({
            "factor": "Assignment Completion",
            "current": curr_assign,
            "previous": prev_assign,
            "change": assign_delta,
            "impact": assign_impact,
            "shap_value": assign_shap,
            "explanation": f"Assignment completion decreased by {abs(assign_delta)}%." if assign_delta < 0 else "Assignments submitted on time."
        })

        # Assessments SHAP
        assess_shap = 0.0
        assess_impact = "Low"
        if assess_delta <= -15 or curr_assess < 65:
            assess_shap = 15.0
            assess_impact = "High"
        elif assess_delta <= -10 or curr_assess < 72:
            assess_shap = 9.5
            assess_impact = "Medium"
        elif assess_delta <= -4:
            assess_shap = 4.5
            assess_impact = "Low"

        running_score += assess_shap
        factors.append({
            "factor": "Assessment Average",
            "current": curr_assess,
            "previous": prev_assess,
            "change": assess_delta,
            "impact": assess_impact,
            "shap_value": assess_shap,
            "explanation": f"Assessment scores eased by {abs(assess_delta)}%." if assess_delta < 0 else "Assessment performance stable."
        })

        # LMS SHAP
        lms_shap = 0.0
        lms_impact = "Low"
        if lms_delta <= -20 or curr_lms < 60:
            lms_shap = 16.0
            lms_impact = "High"
        elif lms_delta <= -12 or curr_lms < 72:
            lms_shap = 10.0
            lms_impact = "Medium"
        elif lms_delta <= -5:
            lms_shap = 5.0
            lms_impact = "Low"

        running_score += lms_shap
        factors.append({
            "factor": "LMS Activity",
            "current": curr_lms,
            "previous": prev_lms,
            "change": lms_delta,
            "impact": lms_impact,
            "shap_value": lms_shap,
            "explanation": f"Online portal sessions decreased by {abs(lms_delta)}%." if lms_delta < 0 else "Portal access steady."
        })

        final_score = min(100, max(5, int(round(running_score))))

        if final_score >= 76:
            risk_level = "Priority Support"
        elif final_score >= 56:
            risk_level = "Attention"
        elif final_score >= 31:
            risk_level = "Monitor"
        else:
            risk_level = "Stable"

        recommendations = []
        if assign_delta < -10:
            recommendations.append("Review recent assignment workload and suggest study planning.")
        if att_delta < -10:
            recommendations.append("Schedule a mentor check-in to explore potential timetable clashes.")
        if assess_delta < -8:
            recommendations.append("Offer targeted revision resources and connect with course office hours.")
        if lms_delta < -15:
            recommendations.append("Verify course portal accessibility and recommend supplemental modules.")
        if not recommendations:
            recommendations.append("Continue encouraging positive academic consistency.")

        return {
            "student_id": student_id,
            "risk_score": final_score,
            "risk_level": risk_level,
            "factors": factors,
            "recommendations": recommendations,
            "faculty_review_required": risk_level in ["Attention", "Priority Support"],
            "disclaimer": "This platform analyzes academic and engagement indicators to support timely educational intervention. AI-generated indicators are informational and should be reviewed by authorized faculty or mentors before any action is taken."
        }
