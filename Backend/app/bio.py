"""API wrapper around the seqlab package (github.com/itsgichia/sequence-lab).

The algorithms live in the package; this module only adapts them to the
request bodies and adds the source links shown on the lab page.
"""

from __future__ import annotations

from seqlab import BioError, align, call_variants, catalogue, examples as _examples, report, stats, tree

SOURCES = [
    {"label": "seqlab source code and tests", "url": "https://github.com/itsgichia/sequence-lab"},
    {"label": "CPIC pharmacogenomics guidelines", "url": "https://cpicpgx.org/guidelines/"},
    {"label": "HGVS variant nomenclature", "url": "https://hgvs-nomenclature.org/"},
]


def examples() -> dict:
    return {**_examples(), "sources": SOURCES}


def pgx_catalogue() -> list[dict]:
    return catalogue()


def pgx_panel(genotypes: list[tuple[str, str, str]]) -> list[dict]:
    return [report(gene, a1, a2) for gene, a1, a2 in genotypes]


__all__ = ["BioError", "align", "call_variants", "examples", "pgx_catalogue", "pgx_panel", "stats", "tree"]
