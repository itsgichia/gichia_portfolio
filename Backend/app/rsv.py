"""API wrapper around the RSV transmission model (rsvmodel package)."""

from rsvmodel import Params, maternal_vaccine, nirsevimab, simulate
from rsvmodel.model import HOSP_GROUPS, MIXING_MODES

from .schemas import RsvIn

SOURCES = [
    {"label": "Hogan et al., RSV transmission models for Western Australia", "url": "https://core.ac.uk/download/327069014.pdf"},
    {"label": "HARMONIE trial, nirsevimab efficacy to 180 days", "url": "https://archive.lstmed.ac.uk/26858/"},
    {"label": "Model source code and tests", "url": "https://github.com/itsgichia/rsv-transmission-model"},
]


def defaults() -> dict:
    p = Params()
    return {
        "r0": p.r0,
        "seasonal_amplitude": p.seasonal_amplitude,
        "immunity_days": p.immunity_days,
        "latent_days": p.latent_days,
        "infectious_days": p.infectious_days,
        "hosp_prop": p.hosp_prop,
        "population": p.population,
        "mixing_modes": list(MIXING_MODES),
        "groups": list(HOSP_GROUPS),
        "sources": SOURCES,
    }


def _products(body: RsvIn):
    maternal = maternal_vaccine(body.maternal_coverage, body.maternal_efficacy) if body.maternal_coverage > 0 else None
    mono = (
        nirsevimab(body.nirsevimab_coverage, body.nirsevimab_efficacy, body.nirsevimab_seasonal_only)
        if body.nirsevimab_coverage > 0
        else None
    )
    return maternal, mono


def _params(body: RsvIn) -> Params:
    return Params(r0=body.r0, seasonal_amplitude=body.seasonal_amplitude, immunity_days=body.immunity_days, mixing=body.mixing)


def _summary_rows(r: dict) -> list[dict]:
    births = r["births_per_year"]
    return [
        {
            **row,
            "baseline_per_1000_births": 1000 * row["baseline_per_year"] / births,
            "scenario_per_1000_births": 1000 * row["scenario_per_year"] / births,
        }
        for row in r["summary"]
    ]


def run(body: RsvIn) -> dict:
    params = _params(body)
    maternal, mono = _products(body)
    r = simulate(params, maternal=maternal, monoclonal=mono, years=body.years)
    h = r["hospitalisations"]

    def under6(run_name: str) -> list[float]:
        return [round(a + b, 2) for a, b in zip(h[run_name]["0-2 months"], h[run_name]["3-5 months"])]

    return {
        "weeks": [round(w, 2) for w in r["weeks"]],
        "under6_baseline": under6("baseline"),
        "under6_scenario": under6("scenario"),
        "groups": {
            g: {"baseline": [round(v, 2) for v in h["baseline"][g]], "scenario": [round(v, 2) for v in h["scenario"][g]]}
            for g in HOSP_GROUPS
        },
        "prevalence_all_ages": [round(v, 1) for v in r["prevalence_all_ages"]],
        "summary": _summary_rows(r),
        "doses": r["doses"],
        "peak_under6": r["peak_under6"],
        "births_per_year": r["births_per_year"],
        "population": params.population,
        "mixing": params.mixing,
    }


def compare(scenarios: list[tuple[str, RsvIn]]) -> list[dict]:
    """Headline numbers for several programmes, for a side-by-side table."""
    out = []
    for label, body in scenarios:
        maternal, mono = _products(body)
        r = simulate(_params(body), maternal=maternal, monoclonal=mono, years=body.years)
        total = next(row for row in _summary_rows(r) if row["group"] == "Under 2 years")
        out.append(
            {
                "label": label,
                "percent_averted": total["percent_averted"],
                "averted_per_year": total["averted_per_year"],
                "scenario_per_1000_births": total["scenario_per_1000_births"],
                "baseline_per_1000_births": total["baseline_per_1000_births"],
                "doses_per_year": r["doses"]["total"],
                "doses_per_admission_averted": r["doses"]["per_admission_averted"],
                "peak_under6": r["peak_under6"]["scenario"],
            }
        )
    return out
