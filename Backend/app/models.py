from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


def _now():
    return datetime.now(timezone.utc)


class Profile(Base):
    __tablename__ = "profile"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    headline: Mapped[str] = mapped_column(String(200))
    bio: Mapped[str] = mapped_column(Text, default="")
    location: Mapped[str] = mapped_column(String(120), default="")
    email: Mapped[str] = mapped_column(String(200), default="")
    phone: Mapped[str] = mapped_column(String(60), default="")
    github: Mapped[str | None] = mapped_column(String(300), nullable=True)
    linkedin: Mapped[str | None] = mapped_column(String(300), nullable=True)
    availability: Mapped[str] = mapped_column(String(200), default="")
    highlights: Mapped[list] = mapped_column(JSON, default=list)  # [{value, label}]
    skills: Mapped[list] = mapped_column(JSON, default=list)  # [{group, items: []}]
    community: Mapped[list] = mapped_column(JSON, default=list)  # [{role, org, period, detail}]


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(200))
    tagline: Mapped[str] = mapped_column(String(300), default="")
    category: Mapped[str] = mapped_column(String(80), default="")
    role: Mapped[str] = mapped_column(String(200), default="")
    year: Mapped[str] = mapped_column(String(20), default="")
    status: Mapped[str] = mapped_column(String(20), default="completed")  # live | completed | in-progress
    situation: Mapped[str] = mapped_column(Text, default="")
    approach: Mapped[str] = mapped_column(Text, default="")
    outcome: Mapped[str] = mapped_column(Text, default="")
    tags: Mapped[list] = mapped_column(JSON, default=list)
    metrics: Mapped[list] = mapped_column(JSON, default=list)  # [{value, label}]
    live_url: Mapped[str | None] = mapped_column(String(300), nullable=True)
    repo_url: Mapped[str | None] = mapped_column(String(300), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(300), nullable=True)
    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    published: Mapped[bool] = mapped_column(Boolean, default=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)


class Experience(Base):
    __tablename__ = "experience"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    org: Mapped[str] = mapped_column(String(200))
    location: Mapped[str] = mapped_column(String(120), default="")
    period: Mapped[str] = mapped_column(String(60), default="")
    kind: Mapped[str] = mapped_column(String(30), default="professional")  # research | professional
    bullets: Mapped[list] = mapped_column(JSON, default=list)
    order_index: Mapped[int] = mapped_column(Integer, default=0)


class Education(Base):
    __tablename__ = "education"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    institution: Mapped[str] = mapped_column(String(200))
    period: Mapped[str] = mapped_column(String(60), default="")
    detail: Mapped[str] = mapped_column(Text, default="")
    kind: Mapped[str] = mapped_column(String(30), default="degree")  # degree | certificate
    order_index: Mapped[int] = mapped_column(Integer, default=0)


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(200))
    organisation: Mapped[str] = mapped_column(String(200), default="")
    body: Mapped[str] = mapped_column(Text)
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
