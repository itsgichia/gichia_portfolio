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
                "Penalised regression (LASSO, elastic net)",
                "Mixed and multilevel models",
                "Survival analysis",
                "Interrupted time series",
                "Propensity score methods",
                "Bayesian methods",
                "Multiple imputation (MICE)",
                "Simulation studies",
                "Compartmental (SEIRS) models",
            ],
        },
        {
            "group": "Machine learning",
            "items": [
                "scikit-learn",
                "XGBoost",
                "PyTorch",
                "TensorFlow",
                "Hugging Face Transformers",
                "Convolutional networks",
                "Autoencoders and transfer learning",
                "Anomaly detection",
                "SHAP",
                "LLM prompting and evaluation",
            ],
        },
        {
            "group": "Model validation",
            "items": [
                "Bootstrap optimism correction",
                "Cluster-aware cross-validation",
                "Calibration and recalibration",
                "Decision curve analysis",
                "DeLong and bootstrap comparisons",
                "Scaffold and temporal splits",
                "Applicability domain",
                "Permutation null models",
            ],
        },
        {"group": "Languages", "items": ["Python", "R", "SQL", "SAS", "JavaScript", "TypeScript", "HTML and CSS", "Bash"]},
        {
            "group": "Data and engineering",
            "items": [
                "PostgreSQL",
                "SQL Server",
                "SQLite",
                "Snowflake",
                "PySpark",
                "Record linkage and data quality",
                "FastAPI",
                "React",
                "Docker",
                "Git",
                "GitHub Actions",
                "pytest",
                "AWS",
                "Azure",
                "REDCap",
            ],
        },
        {
            "group": "Visualisation",
            "items": ["Power BI", "Tableau", "R Shiny", "Streamlit", "Plotly", "Matplotlib", "ggplot2", "SVG and Canvas"],
        },
        {
            "group": "Bioinformatics and cheminformatics",
            "items": [
                "Sequence alignment",
                "Phylogenetics",
                "Variant annotation (HGVS)",
                "Pharmacogenomics (CPIC)",
                "RDKit",
                "Molecular docking (AutoDock Vina)",
                "ChEMBL and virtual screening",
                "QSAR",
            ],
        },
        {
            "group": "Health and laboratory",
            "items": [
                "Linked health records",
                "ICD-10-AM clinical coding",
                "Histopathology imaging",
                "ICH Good Clinical Practice",
                "Ethics submissions",
                "Data custodian approvals",
                "GMP and GLP",
                "HPLC",
                "NMR",
            ],
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
        repo_url="https://github.com/itsgichia/RHIP_Connect",
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
        repo_url="https://github.com/itsgichia/anzhfr-cohort-builder",
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
        slug="rsv-bayesian-calibration",
        title="Can the RSV model be calibrated to NSW surveillance?",
        tagline="Bayesian fitting of the age-structured model to NSW notifications, gated by a parameter-recovery test it has not yet passed",
        category="Infectious disease modelling",
        role="Personal project",
        year="2026",
        status="in-progress",
        situation=(
            "The RSV lab above is not fitted to Australian data, so every number it produces is illustrative. RSV became "
            "notifiable in New South Wales in September 2022 and the state's infectious diseases dashboard serves monthly "
            "counts by age through an undocumented REST API. Fitting the model to that series would let the immunisation "
            "scenarios carry credible intervals instead of point estimates."
        ),
        approach=(
            "Wrote a fetcher for the NSW API that assembles 50 months of notifications in eight age bands and cross-checks "
            "the under-five total against a second report. Wrapped the ODE as a black-box operation inside PyMC with a "
            "negative-binomial likelihood on monthly counts by age, priors written down before fitting, and sequential "
            "Monte Carlo sampling because the model has no gradient. Before pointing it at the real data, ran the check "
            "that has to pass first: simulate three years of counts from known parameters, fit them, and see whether the "
            "truth lands inside the 95% intervals."
        ),
        outcome=(
            "It did not, and the failure was informative. Eight of fourteen parameters were recovered. The posterior put "
            "R0 at 1.50 with 200 days of immunity against a truth of 1.6 and 230, and over-dispersion at 6 against 20, each "
            "with narrow intervals that excluded the truth. A local optimiser started from the posterior reached a "
            "likelihood within two units of the truth without leaving that region, so the two parameter sets are a ridge "
            "three years of monthly counts cannot resolve, and the sampler's 200 particles explored neither the ridge "
            "nor the over-dispersion. The model also runs a two-year cycle at these parameters, which makes the "
            "endemic starting state depend on whether the burn-in is an odd or even number of years. Next: a prior on "
            "immunity duration from cohort studies, initial conditions fitted rather than burned in, and a longer or "
            "different sampler. The NSW series stays unfitted until the recovery test passes."
        ),
        tags=["Python", "PyMC", "Sequential Monte Carlo", "ODE", "NSW surveillance data"],
        metrics=[],
        repo_url="https://github.com/itsgichia/rsv-transmission-model",
        featured=True,
        order_index=4,
    ),
    dict(
        slug="sequence-lab",
        title="Sequence Lab",
        tagline="From a raw sequence to a prescribing decision: alignment, trees, variant effects and pharmacogenomics",
        category="Bioinformatics",
        role="Personal project",
        year="2026",
        status="live",
        situation=(
            "Bioinformatics toolkits hide the algorithms behind a command line, and the step from a sequence to a "
            "clinical decision is rarely shown end to end. I wanted the core methods in one readable package, with "
            "a path all the way to personalised medicine."
        ),
        approach=(
            "Wrote the seqlab package from scratch in Python and NumPy: composition and GC content, six-frame ORF "
            "finding and translation, Needleman-Wunsch and Smith-Waterman alignment with a vectorised row recurrence, "
            "Jukes-Cantor distances and Saitou-Nei neighbour joining with Newick export. Then the personalised "
            "medicine layer: variant calling between a reference coding sequence and a sample with HGVS names and "
            "coding consequences (synonymous, missense, nonsense, in-frame indel, frameshift), and a pharmacogenomics "
            "module that maps CYP2C19, CYP2D6, TPMT and SLCO1B1 diplotypes to metaboliser phenotypes and CPIC-based "
            "recommendations for clopidogrel, codeine, azathioprine, simvastatin and others."
        ),
        outcome=(
            "Published as an installable package with a CLI, tests and CI; the portfolio backend installs it from "
            "GitHub and serves it live with size limits so every request returns in about a second. Synthetic "
            "examples with known answers are bundled so each method can be checked. It is a teaching tool with "
            "simple scoring, and the pharmacogenomics tables are paraphrased and educational, not clinical advice."
        ),
        tags=["Python", "NumPy", "Dynamic programming", "Phylogenetics", "HGVS variants", "Pharmacogenomics", "FastAPI", "React"],
        metrics=[],
        live_url="/lab/seq",
        repo_url="https://github.com/itsgichia/sequence-lab",
        featured=True,
        order_index=5,
    ),
    dict(
        slug="histopath-metastasis-cnn",
        title="Finding metastasis in lymph node tissue",
        tagline="Four deep learning approaches on histopathology image patches, including one that only ever sees healthy tissue",
        category="Medical imaging",
        role="Personal project, from coursework at UNSW",
        year="2025",
        status="completed",
        situation=(
            "Checking sentinel lymph nodes for metastatic breast cancer means a pathologist scanning large tissue "
            "sections for small deposits, which is slow and easy to miss. I wanted to compare the usual deep learning "
            "approaches on this task and test one that needs no tumour labels at all."
        ),
        approach=(
            "Trained four models on PatchCamelyon, a public set of 96 by 96 pixel lymph node patches: a convolutional "
            "network from scratch, a convolutional autoencoder trained without labels, two transfer learning "
            "classifiers reusing that encoder frozen and fine-tuned, and an anomaly detector trained only on benign "
            "patches that scores tissue by how badly it reconstructs. Thresholds were chosen on validation data and "
            "the whole run is deterministic and reproduces to four decimal places."
        ),
        outcome=(
            "The supervised network won with an area under the curve of 0.92. Unsupervised pretraining did capture "
            "real structure: a frozen encoder with only 8,321 trainable parameters still reached 0.83, and fine-tuning "
            "matched the baseline in one epoch instead of six. The anomaly detector failed, scoring 0.43, below chance "
            "in both validation and test. Dense lymphocyte texture is harder to reconstruct than bulkier tumour, so "
            "the error tracks spatial detail rather than disease. That negative result is reported as it stands."
        ),
        tags=["Python", "PyTorch", "CNN", "Autoencoder", "Transfer learning", "Anomaly detection"],
        metrics=[],
        repo_url="https://github.com/itsgichia/histopath-metastasis-cnn",
        featured=True,
        order_index=6,
    ),
    dict(
        slug="ligand-activity-ml",
        title="Predicting which molecules will work, and how much to believe it",
        tagline="Activity models across five drug targets, built mainly to measure how badly the usual evaluation flatters them",
        category="Drug discovery",
        role="Personal project",
        year="2026",
        status="completed",
        situation=(
            "Screening a compound library costs money and time, so machine learning is used to rank candidates before "
            "anyone runs an assay. Those models are usually reported on a random train and test split, which lets "
            "close analogues of the training compounds sit in the test set. I wanted to measure how much that single "
            "choice inflates the headline number."
        ),
        approach=(
            "Pulled 32,540 compounds across five targets from ChEMBL, including the cardiac safety channel hERG and "
            "the antidiabetic enzyme DPP-4, keeping only exact potency measurements and deduplicating by median. "
            "Trained four model families on three molecular representations, then evaluated every combination three "
            "ways: a random split, a Bemis-Murcko scaffold split, and a split by year of first publication. Added an "
            "applicability domain based on similarity to the training set, label permutation as a null model, and "
            "screening metrics that reflect how a ranked list is actually used."
        ),
        outcome=(
            "Random splits overstate performance substantially. Averaged across every target and model, a scaffold "
            "split costs 0.08 in area under the curve and a time split 0.15, and for the regression task the fall is "
            "steeper still: average R squared drops from 0.59 to 0.34 and then below zero, to −0.03, which is worse "
            "than predicting the training mean. Ridge regression turns outright "
            "negative under a time split on four of five targets. The cause is visible directly: under a random split "
            "between 62 and 73 percent of test compounds share a scaffold with something in training, against none "
            "under a scaffold split. Choosing the representation matters half as much as choosing the split."
        ),
        tags=["Python", "RDKit", "scikit-learn", "ChEMBL", "Scaffold splits", "Virtual screening"],
        metrics=[],
        repo_url="https://github.com/itsgichia/ligand-activity-ml",
        featured=True,
        order_index=7,
    ),
    dict(
        slug="icd10am-llm-coding",
        title="Can prompt engineering teach a small model to code diagnoses?",
        tagline="Nine prompt strategies against a 0.5 billion parameter language model, assigning ICD-10-AM diagnosis codes to hospital summaries",
        category="Clinical NLP",
        role="Personal project, from coursework at UNSW",
        year="2025",
        status="completed",
        situation=(
            "Clinical coding turns a hospital record into the ICD-10-AM codes that drive reporting and funding, and it "
            "is skilled, expensive work. Small language models are often proposed for it. I wanted to find out what a "
            "model you can run on a laptop actually does when asked to code a discharge summary."
        ),
        approach=(
            "Built nine prompt strategies for Qwen2.5-0.5B-Instruct, from a bare instruction through strict output "
            "formats, a clinical coder persona, few-shot examples, chain of thought, a briefing on how the "
            "classification is structured, and JSON output. Ran them over synthetic clinical notes with weak labels "
            "derived from each note's own stated diagnosis, with that section removed from the model's input so the "
            "task could not be solved by copying. Measured accuracy, format validity, chapter agreement, how many "
            "distinct codes each strategy produced, and how often an answer was simply a code the prompt had shown it."
        ),
        outcome=(
            "Accuracy was exactly zero across all nine strategies on both splits, 140 predictions without a single "
            "correct code. Format validity meanwhile spanned the full range from zero to one, so prompting controlled "
            "the shape of the answer completely and its content not at all. Every strategy carrying six examples "
            "answered only with codes from its own examples, and the briefing on classification structure made the "
            "model answer every case with an infectious disease code, because that was the chapter the briefing named "
            "first. A negative result, reported as one, and the reason the companion study below re-runs the same "
            "nine strategies on models that do know the codes."
        ),
        tags=["Python", "PyTorch", "Hugging Face", "Prompt engineering", "Qwen2.5", "Clinical coding"],
        metrics=[],
        repo_url="https://github.com/itsgichia/icd10am-llm-coding",
        featured=True,
        order_index=8,
    ),
    dict(
        slug="icd10am-claude-coding",
        title="What does prompt engineering change when the model already knows the codes?",
        tagline="The same nine prompt strategies re-run on Claude Haiku, Sonnet and Opus against the same keyword labels",
        category="Clinical NLP",
        role="Personal project",
        year="2026",
        status="completed",
        situation=(
            "The companion study on a 0.5 billion parameter model scored zero under every prompt, which left one question "
            "open: with a model that has not memorised the code table, you cannot tell how much of the failure is "
            "formatting and how much is knowledge. I re-ran the study on models that know the codes, to see what "
            "prompting changes when knowledge is no longer the constraint."
        ),
        approach=(
            "Kept the nine strategies, the record selection rule, the keyword labelling rule, the extractor and the "
            "metrics identical to the Qwen study, and ran them over 100 development and 100 held-out notes on Claude "
            "Haiku 5.5, Sonnet 5.5 and Opus 5.5 through the Message Batches API: 4,200 requests for about US$12, every "
            "raw response cached. Scored against the same keyword labels as before, then asked two label-free "
            "questions of every response: how many codes did the model write, and was the first one right?"
        ),
        outcome=(
            "Every well-parsed strategy scored 0.45 to 0.54 on every model, and the three tiers were indistinguishable "
            "on the held-out split: Haiku 0.51, Sonnet 0.51, Opus 0.52, against Qwen's zero. Prompt strategy changed "
            "what the extractor could read, not what the model thought. The first code each model wrote was right 42 "
            "to 54 percent of the time under every strategy, but a plain question got an essay with four to thirteen "
            "codes in it and the extractor took the wrong one. Few-shot examples helped no model. The ceiling was the "
            "labels: the three models gave the same code on 81 of 100 notes and the keyword rule agreed with them on "
            "only 47, with checkable errors such as cholecystitis with stones labelled K81 where the classification "
            "puts it at K80. The labels were kept as provided so the two studies stay comparable, which makes the "
            "score a measure of agreement with a keyword rule rather than with a clinical coder."
        ),
        tags=["Python", "Claude API", "Message Batches", "Prompt engineering", "Clinical coding"],
        metrics=[],
        repo_url="https://github.com/itsgichia/icd10am-claude-coding",
        featured=True,
        order_index=9,
    ),
    dict(
        slug="fna-ann-vs-logistic",
        title="Does a neural network earn its complexity?",
        tagline="Neural network against regularised logistic regression on breast cytology, judged on calibration and clinical usefulness, not accuracy alone",
        category="Machine learning",
        role="Personal project, from coursework at UNSW",
        year="2025",
        status="completed",
        situation=(
            "Neural networks are reported as beating simpler models on small clinical datasets all the time, usually on "
            "accuracy alone and often without testing whether the gap is real. I wanted to run that comparison properly "
            "on a problem where a missed cancer costs far more than a false alarm."
        ),
        approach=(
            "Classified breast tumours as malignant or benign from fine needle aspiration cytology features, comparing "
            "four logistic regression variants, a tuned feedforward network, the same network on principal components, "
            "and two tree ensembles. Everything was selected by repeated stratified cross-validation with scaling inside "
            "the folds, the test set was touched once, and the difference in area under the curve was tested with both "
            "DeLong and a paired bootstrap. Calibration, decision curves and sensitivity-constrained operating points "
            "were reported alongside discrimination."
        ),
        outcome=(
            "The network did not beat logistic regression: the difference in area under the curve was −0.0007, with a "
            "confidence interval straddling zero. The honest finding is that 114 test cases cannot resolve differences "
            "this small, and adding any penalty to the logistic model moved accuracy thirty times more than the network "
            "did, still without reaching significance. Where the models did separate was the operating point: holding "
            "99% sensitivity, logistic regression kept 88% specificity while the tree ensembles fell to 53%."
        ),
        tags=["Python", "PyTorch", "scikit-learn", "Calibration", "Decision curve analysis", "DeLong test"],
        metrics=[],
        repo_url="https://github.com/itsgichia/fna-ann-vs-logistic",
        featured=False,
        order_index=10,
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
        outcome=(
            "Penalised regression was selected. Its apparent AUC of 0.794 corrects to 0.757 once a thousand cluster "
            "bootstrap resamples are used to take optimism off it, and held-out cluster-aware validation agrees at "
            "0.745, with a 95% interval from 0.690 to 0.798. A manuscript is in preparation. The linked repository "
            "re-implements the full pipeline on a synthetic cohort, since the study data are confidential."
        ),
        tags=["R", "SQL", "XGBoost", "SHAP", "Power BI"],
        metrics=[],
        repo_url="https://github.com/itsgichia/infant-bronchiolitis-prediction",
        featured=False,
        order_index=11,
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
        outcome=(
            "Shortlisted 5 high-affinity candidates. The linked repository rebuilds the computational workflow on "
            "open ChEMBL bioactivity data with a placeholder scaffold, as the thesis compound is not disclosed."
        ),
        tags=["AutoDock Vina", "RDKit", "PyMOL", "QSAR"],
        metrics=[],
        repo_url="https://github.com/itsgichia/sur1-antidiabetic-discovery",
        featured=False,
        order_index=12,
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
            "Benchmarked four model families with bootstrap validation and decision curve analysis (optimism-corrected AUC 0.757), and built Power BI dashboards for 15 clinician researchers.",
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
