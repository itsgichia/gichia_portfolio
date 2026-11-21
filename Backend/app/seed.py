"""Initial site content. Everything here is confirmed from Gichia's resume material.

Run `python -m app.seed --reset` to wipe and reload this content.
"""

import sys

from .db import Base, SessionLocal, engine
from .models import Education, Experience, Profile, Project

PROFILE = dict(
    id=1,
    name="Gichia Muiruri",
    headline="Health Data Scientist and Full-Stack Developer",
    bio=(
        "I trained as a pharmaceutical chemist, then completed a Master of Science in Health Data Science "
        "at UNSW Sydney. I work across statistics, machine learning and software: predicting respiratory "
        "outcomes in infants from linked health records, modelling how RSV spreads, and building platforms "
        "that put data in front of clinicians and researchers."
    ),
    location="Sydney, NSW",
    email="gichiamuiruri@gmail.com",
    phone="",  # set in the admin area (Profile tab)
    github="https://github.com/itsgichia",
    linkedin="https://www.linkedin.com/in/gichia-muiruri",
    availability="Open to full-time roles in Australia",
    highlights=[],
    skills=[
        {
            "group": "Statistics and modelling",
            "items": [
                "Regression and GLMs",
                "Mixed and multilevel models",
                "Survival analysis",
                "Interrupted time series",
                "Propensity score methods",
                "Bayesian methods",
                "Simulation studies",
                "Compartmental (SEIRS) models",
            ],
        },
        {
            "group": "Machine learning",
            "items": ["scikit-learn", "XGBoost", "PyTorch", "TensorFlow", "SHAP", "Decision curve analysis", "LLM prompting"],
        },
        {"group": "Languages", "items": ["Python", "R", "SQL", "SAS", "JavaScript", "TypeScript"]},
        {
            "group": "Data and engineering",
            "items": ["PostgreSQL", "SQL Server", "Snowflake", "PySpark", "FastAPI", "React", "Docker", "Git", "AWS", "Azure", "REDCap"],
        },
        {"group": "Visualisation", "items": ["Power BI", "Tableau", "R Shiny", "Streamlit", "Plotly", "Matplotlib"]},
        {
            "group": "Health and laboratory",
            "items": ["Linked health records", "ICH Good Clinical Practice", "Ethics submissions", "GMP and GLP", "HPLC", "NMR", "Molecular docking"],
        },
    ],
    community=[
        {
            "role": "Research Volunteer",
            "org": "Refugee-Led Research Centre, Nairobi",
            "period": "2022 - 2023",
            "detail": "Analysed demographic and healthcare access data to identify systemic gaps for marginalised populations.",
        },
        {
            "role": "Volunteer Coordinator and English Instructor",
            "org": "Alliance of Chin Refugees, Kuala Lumpur",
            "period": "2020",
            "detail": "Grew the volunteer team from 10 to more than 30 and taught English to Burmese refugees.",
        },
        {
            "role": "Team Captain",
            "org": "UNSW Health Data Science Datathon",
            "period": "2025",
            "detail": "Placed 4th of 20 teams.",
        },
    ],
)

PROJECTS = [
    dict(
        slug="rhip-connect",
        title="RHIP Connect",
        tagline="A digital operating system for the Randwick Health and Innovation Precinct, with AI challenge matching",
        category="Digital health platform",
        role="Junior Consultant, Lead Solutions Analyst (UNSW CDEV6000)",
        year="2026",
        status="live",
        situation=(
            "Needs and expertise sat in silos across the precinct's eight partner organisations. A clinician with a "
            "problem had no simple way to find the researcher, industry partner or investor who could help."
        ),
        approach=(
            "Built a public landing page with precinct KPIs and a signed-in area for precinct members. On the Challenge "
            "Board a member posts a need and AI matching returns the top three people to talk to, with short reasons, "
            "then opens a message thread. A rule-based scorer remains the source of truth for rankings. The directory "
            "is seeded from real precinct researchers, identified by ORCID, with publications from PubMed. A Knowledge "
            "Map links researchers who share papers, and there is an innovation pipeline, an event passport and "
            "community, government and investor portals."
        ),
        outcome=(
            "Deployed as a React app on Vercel with a FastAPI service in Docker and PostgreSQL on Railway. The tagging "
            "pipeline covered 3,000+ publications, and 25 clinicians and researchers took part in user acceptance "
            "testing before release."
        ),
        tags=["React", "Vite", "Tailwind CSS", "FastAPI", "PostgreSQL", "Firebase Auth", "Claude Haiku", "PubMed and ORCID"],
        metrics=[],
        live_url="https://rhip-connect.vercel.app",
        repo_url=None,
        featured=True,
        order_index=1,
    ),
    dict(
        slug="anzhfr-cohort-builder",
        title="ANZHFR Cohort Builder",
        tagline="A web tool for building, saving and comparing hip fracture patient cohorts",
        category="Clinical data tool",
        role="Team Captain, UNSW Health Data Science Datathon (4th of 20)",
        year="2025",
        status="completed",
        situation=(
            "Clinicians and researchers using the Australian and New Zealand Hip Fracture Registry had no self-serve "
            "way to define a patient cohort, apply filters and compare outcomes."
        ),
        approach=(
            "Built a filtering system with AND/OR logic across demographics, fracture type and ASA score, hospital, "
            "30-day mortality and time period. A dashboard shows live charts and statistics computed in the database, "
            "cohorts can be saved and compared side by side, and a patient browser sits behind a secure login. "
            "Missing values are handled explicitly in the queries, as real clinical data is never complete."
        ),
        outcome=(
            "Presented to a panel of clinician researchers and data scientists and placed 4th of 20 teams. "
            "The public demo runs on synthetic records, not registry data."
        ),
        tags=["React", "Material UI", "Recharts", "Flask", "SQLAlchemy", "SQLite", "JWT"],
        metrics=[],
        live_url=None,
        repo_url=None,
        featured=True,
        order_index=2,
    ),
    dict(
        slug="rsv-transmission-lab",
        title="RSV Transmission Lab",
        tagline="An age-structured model comparing maternal vaccination and nirsevimab for protecting infants from RSV",
        category="Infectious disease modelling",
        role="Personal project",
        year="2026",
        status="live",
        situation=(
            "Respiratory syncytial virus is the main cause of bronchiolitis, the outcome my research year focused on. "
            "I wanted to understand what infant immunisation does at the population level."
        ),
        approach=(
            "Built a seasonally forced SEIRS model in Python with 30 age classes, waning immunity and protected "
            "compartments for immunised infants. Parameters follow the published Western Australian RSV models, with "
            "nirsevimab efficacy from the HARMONIE trial. The model runs live through this site's FastAPI backend."
        ),
        outcome=(
            "The model compares four immunisation strategies and reproduces the switch between annual and biennial "
            "epidemics. It is not fitted to Australian surveillance data, so its numbers are illustrative."
        ),
        tags=["Python", "SciPy", "SEIRS model", "FastAPI", "React"],
        metrics=[],
        live_url="/lab/rsv",
        repo_url="https://github.com/itsgichia/rsv-transmission-model",
        featured=True,
        order_index=3,
    ),
    dict(
        slug="infant-bronchiolitis-prediction",
        title="Predicting wheeze and bronchiolitis in infants",
        tagline="Machine learning on linked health records from the Breathing for Life cohort",
        category="Clinical prediction",
        role="Research Data Scientist, Hunter Medical Research Institute",
        year="2026",
        status="completed",
        situation=(
            "A predictive study asking whether infants born to mothers with asthma are more likely to develop wheeze or "
            "bronchiolitis, tracing thousands of children through general practice, emergency department and birth "
            "registration records across their first year of life."
        ),
        approach=(
            "Built R and SQL pipelines with linkage validation and plausibility checks, tracing more than 200 data "
            "quality issues back to their source datasets. Engineered 40 clinical features and benchmarked four model "
            "families with bootstrap validation and decision curve analysis."
        ),
        outcome="The selected model reached an AUC of 0.82. A manuscript is in preparation.",
        tags=["R", "SQL", "XGBoost", "SHAP", "Power BI"],
        metrics=[],
        featured=False,
        order_index=4,
    ),
    dict(
        slug="antidiabetic-drug-discovery",
        title="Computer-aided discovery of an antidiabetic compound",
        tagline="Synthesis, docking and QSAR modelling of a sulfonamide targeting the SUR1 receptor",
        category="Computational chemistry",
        role="Honours project, International Medical University",
        year="2022",
        status="completed",
        situation="Honours research on whether a new sulfonamide compound could act like existing antidiabetic drugs at the sulfonylurea receptor.",
        approach=(
            "Synthesised the compound, then ran 200 molecular docking runs and built QSAR and machine learning models "
            "to predict activity, comparing binding with glibenclamide."
        ),
        outcome="Shortlisted 5 high-affinity candidates.",
        tags=["AutoDock Vina", "RDKit", "PyMOL", "QSAR"],
        metrics=[],
        featured=False,
        order_index=5,
    ),
]

EXPERIENCE = [
    dict(
        title="Research Data Scientist",
        org="Hunter Medical Research Institute",
        location="Newcastle, NSW",
        period="2026 - Present",
        kind="research",
        bullets=[
            "Building machine learning models with the Breathing for Life cohort to establish whether infants born to mothers with asthma are more likely to develop wheeze or bronchiolitis, using linked general practice, emergency department and birth records.",
            "Traced more than 200 data quality issues to their source datasets through linkage validation and plausibility checks, working under data custodian and ethics approvals.",
            "Benchmarked four model families with bootstrap validation and decision curve analysis (AUC 0.82), and built Power BI dashboards for 15 clinician researchers.",
        ],
        order_index=1,
    ),
    dict(
        title="Junior Consultant, Lead Solutions Analyst",
        org="Randwick Health Innovation Precinct",
        location="Sydney, NSW",
        period="2026",
        kind="professional",
        bullets=[
            "Built RHIP Connect, one system of record for eight partner organisations, after consulting each on their data needs.",
            "Led 20 stakeholder sessions with directors and staff, and ran user acceptance testing with 25 clinicians and researchers, actioning 15 requirement changes before release.",
            "Led monitoring and evaluation for the precinct through a public KPI page, supporting initiatives projected to deliver $1.5M in value.",
        ],
        order_index=2,
    ),
    dict(
        title="Data Engineer",
        org="CloudFactory",
        location="Nairobi, Kenya (remote)",
        period="2023 - 2024",
        kind="professional",
        bullets=[
            "Rebuilt reporting pipelines with advanced SQL, including CTEs and window functions, cutting report refresh from 45 to 13 minutes (70% faster).",
            "Engineered 12 data pipelines with PySpark and Snowflake for reliable ingestion as data volumes grew.",
            "Built REST APIs backed by SQL Server serving more than 50,000 daily requests for financial systems reporting.",
        ],
        order_index=3,
    ),
    dict(
        title="Graduate Scientist",
        org="Laboratory and Allied",
        location="Kenya",
        period="2022 - 2023",
        kind="professional",
        bullets=[
            "Developed and optimised formulations across tablets, ointments, syrups and creams, and developed and validated analytical test methods under GMP and GLP.",
            "Monitored production and product-quality trends, investigating deviations and recommending corrective actions.",
            "Ran stability and quality control testing, including HPLC assay, dissolution and LC-MS.",
        ],
        order_index=4,
    ),
    dict(
        title="Research Assistant",
        org="Sunway University and International Medical University",
        location="Kuala Lumpur, Malaysia",
        period="2021 - 2022",
        kind="research",
        bullets=[
            "Synthesised diorganotin dithiocarbamate complexes with potential anticancer activity and characterised them by NMR spectroscopy.",
            "Built QSAR and machine learning models to predict activity and prioritise candidates, and ran pharmacokinetic simulations.",
        ],
        order_index=5,
    ),
]

EDUCATION = [
    dict(
        title="Master of Science, Health Data Science",
        institution="University of New South Wales",
        period="2025 - 2026",
        detail="WAM 86.2 (High Distinction), Dean's List. Thesis: machine learning prediction of wheeze and bronchiolitis in infants born to mothers with asthma, with the Hunter Medical Research Institute.",
        kind="degree",
        order_index=1,
    ),
    dict(
        title="Bachelor of Science (Honours), Pharmaceutical Chemistry",
        institution="International Medical University, Malaysia",
        period="2019 - 2022",
        detail="Second Class Honours (Upper Division). Honours thesis on the synthesis and computational evaluation of an antidiabetic drug-like compound.",
        kind="degree",
        order_index=2,
    ),
    dict(title="ICH Good Clinical Practice E6(R3)", institution="The Global Health Network", period="2026", detail="", kind="certificate", order_index=3),
    dict(title="Software Engineering", institution="Moringa School", period="2024", detail="", kind="certificate", order_index=4),
    dict(title="Software Engineering Programme, Front End", institution="ALX", period="2023", detail="", kind="certificate", order_index=5),
]


def seed(db, reset: bool = False) -> None:
    if reset:
        for model in (Project, Experience, Education, Profile):
            db.query(model).delete()
        db.commit()
    if db.get(Profile, 1):
        return
    db.add(Profile(**PROFILE))
    db.add_all(Project(**p) for p in PROJECTS)
    db.add_all(Experience(**e) for e in EXPERIENCE)
    db.add_all(Education(**e) for e in EDUCATION)
    db.commit()


if __name__ == "__main__":
    Base.metadata.create_all(engine)
    with SessionLocal() as session:
        seed(session, reset="--reset" in sys.argv)
    print("Seeded.")
