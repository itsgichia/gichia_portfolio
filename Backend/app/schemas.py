from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class Stat(BaseModel):
    value: str
    label: str


class SkillGroup(BaseModel):
    group: str
    items: list[str]


class CommunityItem(BaseModel):
    role: str
    org: str
    period: str = ""
    detail: str = ""


class ProfileIn(BaseModel):
    name: str
    headline: str
    bio: str = ""
    location: str = ""
    email: str = ""
    github: str | None = None
    linkedin: str | None = None
    availability: str = ""
    highlights: list[Stat] = []
    skills: list[SkillGroup] = []
    community: list[CommunityItem] = []


class ProfileOut(ProfileIn):
    model_config = ConfigDict(from_attributes=True)


class ProjectIn(BaseModel):
    slug: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=120)
    title: str
    tagline: str = ""
    category: str = ""
    role: str = ""
    year: str = ""
    status: str = "completed"
    situation: str = ""
    approach: str = ""
    outcome: str = ""
    tags: list[str] = []
    metrics: list[Stat] = []
    live_url: str | None = None
    repo_url: str | None = None
    image_url: str | None = None
    featured: bool = False
    published: bool = True
    order_index: int = 0


class ProjectOut(ProjectIn):
    model_config = ConfigDict(from_attributes=True)
    id: int
    updated_at: datetime | None = None


class ExperienceIn(BaseModel):
    title: str
    org: str
    location: str = ""
    period: str = ""
    kind: str = "professional"
    bullets: list[str] = []
    order_index: int = 0


class ExperienceOut(ExperienceIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class EducationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    institution: str
    period: str
    detail: str
    kind: str


class LoginIn(BaseModel):
    password: str


class MessageIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    organisation: str = Field(default="", max_length=200)
    body: str = Field(min_length=5, max_length=4000)
    website: str = ""  # honeypot: real visitors leave this empty


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: str
    organisation: str
    body: str
    read: bool
    created_at: datetime


class GuestbookIn(BaseModel):
    name: str = Field(min_length=1, max_length=60)
    message: str = Field(min_length=2, max_length=1000)
    site: str | None = Field(default=None, max_length=200, pattern=r"^(https?://\S+)?$")
    website: str = ""  # honeypot, as on the contact form

    @field_validator("name", "message")
    @classmethod
    def not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("must not be blank")
        return v.strip()


class GuestbookOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    message: str
    site: str | None
    created_at: datetime


class RsvIn(BaseModel):
    r0: float = Field(1.6, ge=1.1, le=3.0)
    seasonal_amplitude: float = Field(0.4, ge=0.0, le=0.8)
    immunity_days: float = Field(230, ge=60, le=730)
    maternal_coverage: float = Field(0.0, ge=0, le=1)
    maternal_efficacy: float = Field(0.8, ge=0, le=1)
    nirsevimab_coverage: float = Field(0.6, ge=0, le=1)
    nirsevimab_efficacy: float = Field(0.8, ge=0, le=1)
    nirsevimab_seasonal_only: bool = False
    years: int = Field(4, ge=1, le=8)
    mixing: Literal["homogeneous", "assortative"] = "homogeneous"


class RsvScenario(BaseModel):
    label: str = Field(min_length=1, max_length=60)
    params: RsvIn


class RsvCompareIn(BaseModel):
    scenarios: list[RsvScenario] = Field(min_length=1, max_length=6)
