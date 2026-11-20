"""API wrapper around the RSV transmission model (rsvmodel package)."""

from rsvmodel import Params, maternal_vaccine, nirsevimab, simulate

from .schemas import RsvIn


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
        "sources": [
            {"label": "Hogan et al., RSV models for Western Australia", "url": "https://core.ac.uk/download/327069014.pdf"},
            {"label": "HARMONIE trial, nirsevimab 180-day efficacy", "url": "https://archive.lstmed.ac.uk/26858/"},
        ],
    }


def run(body: RsvIn) -> dict:
    params = Params(r0=body.r0, seasonal_amplitude=body.seasonal_amplitude, immunity_days=body.immunity_days)
    maternal = maternal_vaccine(body.maternal_coverage, body.maternal_efficacy) if body.maternal_coverage > 0 else None
    mono = (
        nirsevimab(body.nirsevimab_coverage, body.nirsevimab_efficacy, body.nirsevimab_seasonal_only)
        if body.nirsevimab_coverage > 0
        else None
    )
    r = simulate(params, maternal=maternal, monoclonal=mono, years=body.years)

    def under6(run_name: str) -> list[float]:
        h = r["hospitalisations"][run_name]
        return [round(a + b, 2) for a, b in zip(h["0-2 months"], h["3-5 months"])]

    births = r["births_per_year"]
    return {
        "weeks": [round(w, 2) for w in r["weeks"]],
        "under6_baseline": under6("baseline"),
        "under6_scenario": under6("scenario"),
        "summary": [
            {**row, "baseline_per_1000_births": 1000 * row["baseline_per_year"] / births,
             "scenario_per_1000_births": 1000 * row["scenario_per_year"] / births}
            for row in r["summary"]
        ],
        "births_per_year": births,
        "population": params.population,
    }
