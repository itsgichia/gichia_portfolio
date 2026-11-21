"""Small, dependency-free bioinformatics routines for the Sequence Lab.

Everything here runs on sequences a visitor pastes in, with hard size limits
so a request stays well under a second. Nothing is fetched from the network.
"""

from __future__ import annotations

import random
import re
from collections import Counter
from dataclasses import dataclass

import numpy as np

MAX_SEQ = 5000  # residues per sequence
MAX_TREE_SEQS = 12
MAX_TREE_LEN = 1500

CODON_TABLE = {
    "TTT": "F", "TTC": "F", "TTA": "L", "TTG": "L", "CTT": "L", "CTC": "L", "CTA": "L", "CTG": "L",
    "ATT": "I", "ATC": "I", "ATA": "I", "ATG": "M", "GTT": "V", "GTC": "V", "GTA": "V", "GTG": "V",
    "TCT": "S", "TCC": "S", "TCA": "S", "TCG": "S", "CCT": "P", "CCC": "P", "CCA": "P", "CCG": "P",
    "ACT": "T", "ACC": "T", "ACA": "T", "ACG": "T", "GCT": "A", "GCC": "A", "GCA": "A", "GCG": "A",
    "TAT": "Y", "TAC": "Y", "TAA": "*", "TAG": "*", "CAT": "H", "CAC": "H", "CAA": "Q", "CAG": "Q",
    "AAT": "N", "AAC": "N", "AAA": "K", "AAG": "K", "GAT": "D", "GAC": "D", "GAA": "E", "GAG": "E",
    "TGT": "C", "TGC": "C", "TGA": "*", "TGG": "W", "CGT": "R", "CGC": "R", "CGA": "R", "CGG": "R",
    "AGT": "S", "AGC": "S", "AGA": "R", "AGG": "R", "GGT": "G", "GGC": "G", "GGA": "G", "GGG": "G",
}
COMPLEMENT = str.maketrans("ACGTN", "TGCAN")
DNA_LETTERS = set("ACGTN")
PROTEIN_LETTERS = set("ACDEFGHIKLMNPQRSTVWY*X")

# Average residue masses (Da), water added once per chain.
AA_MASS = {
    "A": 71.08, "R": 156.19, "N": 114.10, "D": 115.09, "C": 103.14, "E": 129.12, "Q": 128.13, "G": 57.05,
    "H": 137.14, "I": 113.16, "L": 113.16, "K": 128.17, "M": 131.19, "F": 147.18, "P": 97.12, "S": 87.08,
    "T": 101.10, "W": 186.21, "Y": 163.18, "V": 99.13,
}


class BioError(ValueError):
    pass


# ---------------------------------------------------------------- parsing
@dataclass
class Record:
    name: str
    seq: str


def clean(raw: str) -> str:
    """Strip whitespace, digits and a leading FASTA header; upper-case; U -> T."""
    lines = [ln for ln in raw.strip().splitlines() if not ln.startswith(">")]
    seq = re.sub(r"[\s\d]", "", "".join(lines)).upper().replace("U", "T")
    if not seq:
        raise BioError("No sequence found.")
    if len(seq) > MAX_SEQ:
        raise BioError(f"Sequence is longer than {MAX_SEQ:,} residues.")
    return seq


def parse_fasta(raw: str) -> list[Record]:
    records: list[Record] = []
    name, chunks = None, []
    for ln in raw.strip().splitlines():
        if ln.startswith(">"):
            if name is not None:
                records.append(Record(name, "".join(chunks)))
            name, chunks = ln[1:].strip() or f"seq{len(records) + 1}", []
        else:
            chunks.append(ln)
    if name is not None:
        records.append(Record(name, "".join(chunks)))
    if not records:
        raise BioError("No FASTA records found. Each sequence needs a '>' header line.")
    out = []
    for r in records:
        seq = re.sub(r"[\s\d]", "", r.seq).upper().replace("U", "T")
        if not seq:
            raise BioError(f"'{r.name}' has no sequence.")
        out.append(Record(r.name[:40], seq))
    return out


def kind_of(seq: str) -> str:
    letters = set(seq)
    if letters <= DNA_LETTERS:
        return "dna"
    if letters <= PROTEIN_LETTERS:
        return "protein"
    bad = sorted(letters - PROTEIN_LETTERS)
    raise BioError(f"Unexpected characters: {''.join(bad)[:10]}")


# ------------------------------------------------------------- sequence
def reverse_complement(seq: str) -> str:
    return seq.translate(COMPLEMENT)[::-1]


def translate(seq: str) -> str:
    return "".join(CODON_TABLE.get(seq[i : i + 3], "X") for i in range(0, len(seq) - 2, 3))


def find_orfs(seq: str, min_aa: int = 30) -> list[dict]:
    """ATG-to-stop open reading frames on both strands, longest first."""
    orfs = []
    n = len(seq)
    for strand, s in (("+", seq), ("-", reverse_complement(seq))):
        for frame in range(3):
            i = frame
            while i + 3 <= n:
                if s[i : i + 3] == "ATG":
                    j = i
                    while j + 3 <= n and CODON_TABLE.get(s[j : j + 3], "X") != "*":
                        j += 3
                    aa = (j - i) // 3
                    if aa >= min_aa:
                        start, end = (i, j + 3) if strand == "+" else (n - (j + 3), n - i)
                        orfs.append(
                            {
                                "strand": strand,
                                "frame": frame + 1,
                                "start": start + 1,  # 1-based, inclusive
                                "end": min(end, n),
                                "length_aa": aa,
                                "protein": translate(s[i : j + 3]).rstrip("*"),
                            }
                        )
                    i = j + 3
                else:
                    i += 3
    orfs.sort(key=lambda o: -o["length_aa"])
    return orfs[:20]


def stats(raw: str, min_orf_aa: int = 30) -> dict:
    seq = clean(raw)
    kind = kind_of(seq)
    counts = Counter(seq)
    n = len(seq)
    out = {"kind": kind, "length": n, "composition": [{"residue": k, "count": v, "percent": round(100 * v / n, 1)} for k, v in sorted(counts.items())]}
    if kind == "dna":
        gc = counts["G"] + counts["C"]
        at = counts["A"] + counts["T"]
        out["gc_percent"] = round(100 * gc / max(1, gc + at), 1)
        window = max(20, min(200, n // 20))
        out["gc_window"] = window
        out["gc_track"] = [
            {"pos": i + window // 2, "gc": round(100 * sum(1 for c in seq[i : i + window] if c in "GC") / window, 1)}
            for i in range(0, max(1, n - window + 1), max(1, window // 4))
        ]
        out["reverse_complement"] = reverse_complement(seq) if n <= 400 else None
        out["orfs"] = find_orfs(seq, min_orf_aa)
        out["frames"] = [{"frame": f + 1, "protein": translate(seq[f:])} for f in range(3)] if n <= 1200 else []
    else:
        mass = sum(AA_MASS.get(c, 110.0) for c in seq if c != "*") + 18.02
        out["mass_kda"] = round(mass / 1000, 2)
        hydrophobic = sum(counts[c] for c in "AVILMFWY")
        out["hydrophobic_percent"] = round(100 * hydrophobic / n, 1)
        out["charged_percent"] = round(100 * sum(counts[c] for c in "DEKRH") / n, 1)
    return out


# ------------------------------------------------------------- alignment
def align(a_raw: str, b_raw: str, mode: str = "global", match: int = 2, mismatch: int = -1, gap: int = -2) -> dict:
    """Needleman-Wunsch (global) or Smith-Waterman (local) with linear gaps."""
    a, b = clean(a_raw), clean(b_raw)
    kind_a, kind_b = kind_of(a), kind_of(b)
    if kind_a != kind_b:
        raise BioError("Both sequences must be the same type (both DNA or both protein).")
    if len(a) * len(b) > 4_000_000:
        raise BioError("These sequences are too long to align here (product of lengths over 4 million).")
    local = mode == "local"
    n, m = len(a), len(b)
    A = np.frombuffer(a.encode(), dtype=np.uint8)
    B = np.frombuffer(b.encode(), dtype=np.uint8)
    sub = np.where(A[:, None] == B[None, :], match, mismatch).astype(np.int32)

    H = np.zeros((n + 1, m + 1), dtype=np.int32)
    cols = np.arange(m + 1, dtype=np.int32)
    if not local:
        H[:, 0] = gap * np.arange(n + 1)
        H[0, :] = gap * cols
    # Each row: best[j] = max(diag, up) is known from the previous row; the "left" move
    # (a gap running along the row) is max_k<=j best[k] + gap*(j-k), which is a cumulative
    # max once gap*j is factored out. That keeps the whole row vectorised.
    for i in range(1, n + 1):
        best = np.empty(m + 1, dtype=np.int32)
        best[0] = H[i, 0]
        best[1:] = np.maximum(H[i - 1, :-1] + sub[i - 1], H[i - 1, 1:] + gap)
        if local:
            np.maximum(best, 0, out=best)
        H[i] = np.maximum.accumulate(best - gap * cols) + gap * cols

    if local:
        i, j = np.unravel_index(int(H.argmax()), H.shape)
        score = int(H[i, j])
    else:
        i, j, score = n, m, int(H[n, m])
    end_a, end_b = int(i), int(j)
    out_a, out_b = [], []
    while i > 0 or j > 0:
        h = H[i, j]
        if local and h == 0:
            break
        if i > 0 and j > 0 and h == H[i - 1, j - 1] + sub[i - 1, j - 1]:
            out_a.append(a[i - 1]); out_b.append(b[j - 1]); i -= 1; j -= 1
        elif i > 0 and h == H[i - 1, j] + gap:
            out_a.append(a[i - 1]); out_b.append("-"); i -= 1
        else:
            out_a.append("-"); out_b.append(b[j - 1]); j -= 1
    al_a, al_b = "".join(reversed(out_a)), "".join(reversed(out_b))
    matches = sum(1 for x, y in zip(al_a, al_b) if x == y)
    cols = len(al_a)
    midline = "".join("|" if x == y else " " if "-" in (x, y) else "." for x, y in zip(al_a, al_b))
    return {
        "mode": mode,
        "kind": kind_a,
        "score": score,
        "length": cols,
        "identity_percent": round(100 * matches / max(1, cols), 1),
        "gaps": al_a.count("-") + al_b.count("-"),
        "span_a": [int(i) + 1, end_a],
        "span_b": [int(j) + 1, end_b],
        "a": al_a,
        "b": al_b,
        "midline": midline,
    }


# ------------------------------------------------------------------ tree
def _p_distance(a: str, b: str) -> float:
    al = align(a, b, "global")
    pairs = [(x, y) for x, y in zip(al["a"], al["b"]) if x != "-" and y != "-"]
    if not pairs:
        return 1.0
    return sum(1 for x, y in pairs if x != y) / len(pairs)


def _jukes_cantor(p: float) -> float:
    p = min(p, 0.7499)
    return -0.75 * float(np.log(1 - 4 * p / 3))


def neighbour_joining(names: list[str], D: np.ndarray) -> dict:
    """Saitou & Nei neighbour joining. Returns a nested {name, length, children} tree."""
    nodes = [{"name": nm, "children": []} for nm in names]
    D = D.astype(float).copy()
    active = list(range(len(names)))
    while len(active) > 2:
        k = len(active)
        sub = D[np.ix_(active, active)]
        r = sub.sum(axis=1)
        Q = (k - 2) * sub - r[:, None] - r[None, :]
        np.fill_diagonal(Q, np.inf)
        i, j = np.unravel_index(int(Q.argmin()), Q.shape)
        d_ij = sub[i, j]
        li = 0.5 * d_ij + (r[i] - r[j]) / (2 * (k - 2))
        lj = d_ij - li
        a, b = active[i], active[j]
        nodes[a]["length"], nodes[b]["length"] = max(li, 0.0), max(lj, 0.0)
        new = {"name": "", "children": [nodes[a], nodes[b]]}
        nodes.append(new)
        u = len(nodes) - 1
        D = np.pad(D, ((0, 1), (0, 1)))
        for x in active:
            if x in (a, b):
                continue
            D[u, x] = D[x, u] = 0.5 * (D[a, x] + D[b, x] - d_ij)
        active = [x for x in active if x not in (a, b)] + [u]
    a, b = active
    d = max(D[a, b], 0.0)
    nodes[a]["length"], nodes[b]["length"] = d / 2, d / 2
    return {"name": "", "children": [nodes[a], nodes[b]], "length": 0.0}


def newick(node: dict) -> str:
    def rec(n):
        if n["children"]:
            inner = ",".join(rec(c) for c in n["children"])
            return f"({inner}):{n.get('length', 0):.4f}" if n.get("length") is not None else f"({inner})"
        return f"{n['name'].replace(' ', '_')}:{n.get('length', 0):.4f}"

    return rec(node).rsplit(":", 1)[0] + ";"


def layout(node: dict) -> list[dict]:
    """Flatten the tree into rows with x (distance from root) and y (leaf order) for drawing."""
    rows, y = [], [0]

    def rec(n, x, parent):
        idx = len(rows)
        rows.append({"id": idx, "parent": parent, "name": n["name"], "x": x, "y": None, "leaf": not n["children"]})
        if n["children"]:
            ys = [rec(c, x + c.get("length", 0.0), idx) for c in n["children"]]
            rows[idx]["y"] = sum(ys) / len(ys)
        else:
            rows[idx]["y"] = y[0]
            y[0] += 1
        return rows[idx]["y"]

    rec(node, 0.0, None)
    return rows


def tree(fasta: str, distance: str = "jc") -> dict:
    records = parse_fasta(fasta)
    if len(records) < 3:
        raise BioError("A tree needs at least three sequences.")
    if len(records) > MAX_TREE_SEQS:
        raise BioError(f"At most {MAX_TREE_SEQS} sequences, please.")
    for r in records:
        if len(r.seq) > MAX_TREE_LEN:
            raise BioError(f"'{r.name}' is longer than {MAX_TREE_LEN:,} residues.")
    kinds = {kind_of(r.seq) for r in records}
    if len(kinds) > 1:
        raise BioError("Mix of DNA and protein sequences.")
    kind = kinds.pop()
    n = len(records)
    D = np.zeros((n, n))
    for i in range(n):
        for j in range(i + 1, n):
            p = _p_distance(records[i].seq, records[j].seq)
            D[i, j] = D[j, i] = _jukes_cantor(p) if (distance == "jc" and kind == "dna") else p
    root = neighbour_joining([r.name for r in records], D)
    return {
        "kind": kind,
        "n": n,
        "distance": "Jukes-Cantor" if (distance == "jc" and kind == "dna") else "p-distance",
        "names": [r.name for r in records],
        "matrix": [[round(float(v), 4) for v in row] for row in D],
        "newick": newick(root),
        "nodes": layout(root),
    }


# --------------------------------------------------------------- examples
def example_family(seed: int = 7) -> str:
    """A synthetic gene family: one ancestor, two clades, point mutations and one deletion.

    Synthetic so the "true" tree is known: (A1, A2, A3) and (B1, B2, B3) are the two clades,
    with C an outgroup. Useful for seeing what neighbour joining recovers.
    """
    rng = random.Random(seed)
    ancestor = "ATG" + "".join(rng.choice("ACGT") for _ in range(297))

    def mutate(seq: str, k: int) -> str:
        s = list(seq)
        for pos in rng.sample(range(3, len(s)), k):
            s[pos] = rng.choice([c for c in "ACGT" if c != s[pos]])
        return "".join(s)

    clade_a, clade_b = mutate(ancestor, 18), mutate(ancestor, 18)
    seqs = {
        "A1 demo": mutate(clade_a, 4),
        "A2 demo": mutate(clade_a, 5),
        "A3 demo": mutate(clade_a, 9),
        "B1 demo": mutate(clade_b, 4),
        "B2 demo": mutate(clade_b, 6),
        "B3 demo": mutate(clade_b, 6)[:150] + mutate(clade_b, 6)[162:],  # a 12 bp deletion
        "C outgroup": mutate(ancestor, 45),
    }
    return "\n".join(f">{k}\n{v}" for k, v in seqs.items())


def examples() -> dict:
    fam = example_family()
    first = parse_fasta(fam)[0].seq
    return {
        "sequence": f">A1 demo (synthetic 300 bp gene)\n{first}",
        "align_a": f">A1 demo\n{first}",
        "align_b": f">B3 demo\n{parse_fasta(fam)[5].seq}",
        "fasta": fam,
        "limits": {"max_seq": MAX_SEQ, "max_tree_seqs": MAX_TREE_SEQS, "max_tree_len": MAX_TREE_LEN},
    }
