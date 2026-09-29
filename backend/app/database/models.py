from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON, Text, Enum
from sqlalchemy.orm import relationship, declarative_base
import datetime
import enum

Base = declarative_base()

class RiskLevelEnum(str, enum.Enum):
    STABLE = "Stable"
    MONITOR = "Monitor"
    ATTENTION = "Attention"
    PRIORITY_SUPPORT = "Priority Support"

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # ADMIN, FACULTY, STUDENT
    department = Column(String, nullable=True)
    student_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Student(Base):
    __tablename__ = "students"
    id = Column(String, primary_key=True)  # e.g. S001, S023
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    department = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    section = Column(String, nullable=False)
    semester = Column(Integer, nullable=False)
    mentor_name = Column(String, nullable=False)
    mentor_email = Column(String, nullable=False)
    current_risk_level = Column(String, default="Stable")
    current_risk_score = Column(Integer, default=15)
    last_updated = Column(DateTime, default=datetime.datetime.utcnow)

    records = relationship("AcademicRecord", back_populates="student", cascade="all, delete-orphan")
    interventions = relationship("Intervention", back_populates="student", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="student", cascade="all, delete-orphan")

class AcademicRecord(Base):
    __tablename__ = "academic_records"
    id = Column(String, primary_key=True)
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    week_number = Column(Integer, nullable=False)
    attendance = Column(Float, nullable=False)
    assignment_completion = Column(Float, nullable=False)
    assignment_delay_rate = Column(Float, default=0.0)
    assessment_score = Column(Float, default=0.0)
    quiz_score = Column(Float, default=0.0)
    lms_activity = Column(Float, default=0.0)
    material_access = Column(Float, default=0.0)
    participation = Column(Float, default=0.0)
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow)

    student = relationship("Student", back_populates="records")

class RiskPredictionRecord(Base):
    __tablename__ = "risk_predictions"
    id = Column(String, primary_key=True)
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    risk_score = Column(Integer, nullable=False)
    risk_level = Column(String, nullable=False)
    confidence = Column(Float, default=0.91)
    explanation_data = Column(JSON, nullable=False)
    calculated_at = Column(DateTime, default=datetime.datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(String, primary_key=True)
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    student_name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    section = Column(String, nullable=False)
    title = Column(String, nullable=False)
    observed_changes = Column(JSON, nullable=False)
    priority = Column(String, nullable=False)
    recommended_action = Column(String, nullable=False)
    status = Column(String, default="New")  # New, Reviewed, Dismissed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    reviewed_by = Column(String, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)

    student = relationship("Student", back_populates="alerts")

class Intervention(Base):
    __tablename__ = "interventions"
    id = Column(String, primary_key=True)
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    student_name = Column(String, nullable=False)
    intervention_type = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    assigned_mentor = Column(String, nullable=False)
    assigned_mentor_email = Column(String, nullable=False)
    scheduled_date = Column(String, nullable=False)
    follow_up_date = Column(String, nullable=False)
    status = Column(String, default="Scheduled")  # Pending, Scheduled, Completed, Follow-up Required
    outcome = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

    student = relationship("Student", back_populates="interventions")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(String, primary_key=True)
    actor_email = Column(String, nullable=False)
    actor_role = Column(String, nullable=False)
    action = Column(String, nullable=False)
    details = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
