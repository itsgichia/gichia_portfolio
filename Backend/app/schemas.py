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
    phone: str = ""
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


class IcdIn(BaseModel):
    note: str = Field(min_length=40, max_length=6000)


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


class BioSeqIn(BaseModel):
    sequence: str = Field(min_length=1, max_length=20000)
    min_orf_aa: int = Field(30, ge=10, le=500)


class BioAlignIn(BaseModel):
    a: str = Field(min_length=1, max_length=20000)
    b: str = Field(min_length=1, max_length=20000)
    mode: Literal["global", "local"] = "global"
    match: int = Field(2, ge=0, le=10)
    mismatch: int = Field(-1, ge=-10, le=0)
    gap: int = Field(-2, ge=-10, le=0)


class BioTreeIn(BaseModel):
    fasta: str = Field(min_length=1, max_length=60000)
    distance: Literal["jc", "p"] = "jc"


class BioVariantsIn(BaseModel):
    reference: str = Field(min_length=3, max_length=20000)
    sample: str = Field(min_length=1, max_length=20000)


class PgxGenotype(BaseModel):
    gene: str = Field(min_length=2, max_length=20)
    allele_1: str = Field(min_length=1, max_length=10)
    allele_2: str = Field(min_length=1, max_length=10)


class PgxPanelIn(BaseModel):
    genotypes: list[PgxGenotype] = Field(min_length=1, max_length=8)

