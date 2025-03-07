from pydantic import BaseModel, Field
from typing import List, Optional

class CareerProfile(BaseModel):
    skills: List[str] = Field(..., description="List of technical and soft skills")
    experience_level: str = Field(..., description="Years of experience or level (entry/mid/senior)")
    interests: List[str] = Field(..., description="Areas of professional interest")
    education: str = Field(..., description="Highest level of education completed")
    preferred_work_style: str = Field(..., description="Remote/Hybrid/Office preference")

class CareerAdvice(BaseModel):
    recommended_roles: List[str] = Field(..., description="List of recommended job roles")
    career_path: str = Field(..., description="Suggested career progression path")
    skill_gaps: List[str] = Field(..., description="Skills to develop")
    action_items: List[str] = Field(..., description="Specific next steps")
    rationale: str = Field(..., description="Explanation for the recommendations")