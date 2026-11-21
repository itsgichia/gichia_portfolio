import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { Win } from '../components/Retro'
import { Tree } from '../components/SeqFigure'
import useApi from '../components/useApi'

const TOOLS = [
  ['stats', 'Sequence'],
  ['align', 'Align'],
  ['tree', 'Tree'],
  ['variants', 'Variants'],
  ['pgx', 'Medicine'],
]

function useRun(fn) {
  const [state, setState] = useState({ data: null, error: null, busy: false })
  const run = async (body) => {
    setState((s) => ({ ...s, busy: true, error: null }))
    try {
      setState({ data: await fn(body), error: null, busy: false })
    } catch (e) {
      setState({ data: null, error: e.message, busy: false })
    }
  }
  return [state, run]
}

/* --------------------------------------------------------------- stats */
function Composition({ rows }) {
  const max = Math.max(...rows.map((r) => r.count))
  return (
    <ul className="bars" aria-label="Composition">
      {rows.map((r) => (
        <li key={r.residue}>
          <code>{r.residue}</code>
          <span className="bars__track">
            <span className="bars__fill" style={{ width: `${(100 * r.count) / max}%` }} />
          </span>
          <span className="muted">{r.percent}%</span>
        </li>
      ))}
    </ul>
  )
}

function GcTrack({ track, window }) {
  if (!track?.length) return null
  const w = 520
  const h = 90
  const xs = track.map((t) => t.pos)
  const maxX = Math.max(...xs)
  const pts = track.map((t, i) => `${(i / (track.length - 1 || 1)) * w},${h - (t.gc / 100) * h}`).join(' ')
  return (
    <figure className="figure" style={{ margin: '1rem 0 0' }}>
      <p className="figure__title">GC content along the sequence</p>
      <p className="figure__sub">{window} bp sliding window; sequence runs left to right to position {maxX}</p>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" className="chart" role="img" aria-label="GC content track">
        <line x1="0" y1={h / 2} x2={w} y2={h / 2} stroke="var(--line)" strokeDasharray="3 3" />
        <polyline points={pts} fill="none" stroke="var(--pink)" strokeWidth="2" />
      </svg>
    </figure>
  )
}

function Stats({ examples }) {
  const [seq, setSeq] = useState('')
  const [minOrf, setMinOrf] = useState(30)
  const [state, run] = useRun(api.bioStats)
  const d = state.data
  return (
    <div className="lab">
      <form
        className="controls"
        onSubmit={(e) => {
          e.preventDefault()
          run({ sequence: seq, min_orf_aa: minOrf })
        }}
      >
        <fieldset>
          <legend>Sequence</legend>
          <label className="sr-only" htmlFor="seq">
            DNA or protein sequence
          </label>
          <textarea id="seq" className="seqbox" value={seq} onChange={(e) => setSeq(e.target.value)} placeholder=">optional header&#10;ATGGCC…" spellCheck={false} />
          <p className="hint">DNA, RNA or protein, with or without a FASTA header. Up to {examples?.limits?.max_seq?.toLocaleString() || '5,000'} residues.</p>
          <button type="button" className="chip chip--small" onClick={() => setSeq(examples?.sequence || '')}>
            Load example
          </button>
        </fieldset>
        <fieldset>
          <legend>Open reading frames</legend>
          <label className="control">
            <span>
              Minimum length <b>{minOrf} aa</b>
            </span>
            <input type="range" min="10" max="200" value={minOrf} onChange={(e) => setMinOrf(+e.target.value)} />
          </label>
        </fieldset>
        <button className="btn" type="submit" disabled={state.busy || !seq.trim()}>
          {state.busy ? 'Working…' : 'Analyse'}
        </button>
        {state.error && <p className="notice notice--error" role="alert">{state.error}</p>}
      </form>

      <div>
        {!d && <p className="muted">Paste a sequence, or load the example, and press Analyse.</p>}
        {d && (
          <>
            <div className="stats">
              <div className="stat">
                <span className="stat__label">Type</span>
                <span className="stat__value">{d.kind === 'dna' ? 'DNA' : 'Protein'}</span>
              </div>
              <div className="stat">
                <span className="stat__label">Length</span>
                <span className="stat__value">{d.length.toLocaleString()}</span>
                <span className="stat__sub">{d.kind === 'dna' ? 'bp' : 'residues'}</span>
              </div>
              {d.kind === 'dna' ? (
                <>
                  <div className="stat">
                    <span className="stat__label">GC content</span>
                    <span className="stat__value">{d.gc_percent}%</span>
                  </div>
                  <div className="stat">
                    <span className="stat__label">ORFs found</span>
                    <span className="stat__value">{d.orfs.length}</span>
                    <span className="stat__sub">both strands, ≥ {minOrf} aa</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="stat">
                    <span className="stat__label">Mass</span>
                    <span className="stat__value">{d.mass_kda} kDa</span>
                    <span className="stat__sub">average residue masses</span>
                  </div>
                  <div className="stat">
                    <span className="stat__label">Hydrophobic</span>
                    <span className="stat__value">{d.hydrophobic_percent}%</span>
                    <span className="stat__sub">{d.charged_percent}% charged</span>
                  </div>
                </>
              )}
            </div>
            <h3 className="subhead">☾ composition</h3>
            <Composition rows={d.composition} />
            {d.kind === 'dna' && <GcTrack track={d.gc_track} window={d.gc_window} />}
            {d.kind === 'dna' && (
              <>
                <h3 className="subhead">☾ open reading frames</h3>
                {d.orfs.length === 0 && <p className="muted">No ATG-to-stop frames of at least {minOrf} amino acids.</p>}
                {d.orfs.length > 0 && (
                  <div className="table-wrap">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Strand</th>
                          <th>Frame</th>
                          <th>Start</th>
                          <th>End</th>
                          <th>Length</th>
                          <th>Protein</th>
                        </tr>
                      </thead>
                      <tbody>
                        {d.orfs.map((o, i) => (
                          <tr key={i}>
                            <td>{o.strand}</td>
                            <td>{o.frame}</td>
                            <td>{o.start}</td>
                            <td>{o.end}</td>
                            <td>{o.length_aa} aa</td>
                            <td>
                              <code className="seq">{o.protein}</code>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {d.frames.length > 0 && (
                  <details className="frames">
                    <summary>Three-frame translation (forward strand)</summary>
                    {d.frames.map((f) => (
                      <p key={f.frame}>
                        <b className="muted">frame {f.frame}</b> <code className="seq">{f.protein}</code>
                      </p>
                    ))}
                  </details>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- align */
function AlignmentView({ al }) {
  const width = 60
  const blocks = []
  for (let i = 0; i < al.a.length; i += width) {
    blocks.push([al.a.slice(i, i + width), al.midline.slice(i, i + width), al.b.slice(i, i + width), i])
  }
  return (
    <pre className="alignment" aria-label="Alignment">
      {blocks.map(([a, m, b, i]) => (
        <span key={i} className="alignment__block">
          {`${String(i + 1).padStart(5)}  ${a}\n       ${m}\n       ${b}\n\n`}
        </span>
      ))}
    </pre>
  )
}

function Align({ examples }) {
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [mode, setMode] = useState('global')
  const [scores, setScores] = useState({ match: 2, mismatch: -1, gap: -2 })
  const [state, run] = useRun(api.bioAlign)
  const d = state.data
  const set = (k) => (e) => setScores({ ...scores, [k]: +e.target.value })
  return (
    <div className="lab">
      <form
        className="controls"
        onSubmit={(e) => {
          e.preventDefault()
          run({ a, b, mode, ...scores })
        }}
      >
        <fieldset>
          <legend>Sequences</legend>
          <label className="sr-only" htmlFor="seq-a">
            First sequence
          </label>
          <textarea id="seq-a" className="seqbox seqbox--short" value={a} onChange={(e) => setA(e.target.value)} placeholder="first sequence" spellCheck={false} />
          <label className="sr-only" htmlFor="seq-b">
            Second sequence
          </label>
          <textarea id="seq-b" className="seqbox seqbox--short" value={b} onChange={(e) => setB(e.target.value)} placeholder="second sequence" spellCheck={false} />
          <button
            type="button"
            className="chip chip--small"
            onClick={() => {
              setA(examples?.align_a || '')
              setB(examples?.align_b || '')
            }}
          >
            Load example pair
          </button>
        </fieldset>
        <fieldset>
          <legend>Method</legend>
          <label className="check">
            <input type="radio" name="mode" checked={mode === 'global'} onChange={() => setMode('global')} />
            <span>Global (Needleman-Wunsch): align end to end</span>
          </label>
          <label className="check">
            <input type="radio" name="mode" checked={mode === 'local'} onChange={() => setMode('local')} />
            <span>Local (Smith-Waterman): find the best-matching region</span>
          </label>
        </fieldset>
        <fieldset>
          <legend>Scores</legend>
          {[
            ['match', 'Match', 0, 10],
            ['mismatch', 'Mismatch', -10, 0],
            ['gap', 'Gap', -10, 0],
          ].map(([k, label, min, max]) => (
            <label key={k} className="control">
              <span>
                {label} <b>{scores[k] > 0 ? `+${scores[k]}` : scores[k]}</b>
              </span>
              <input type="range" min={min} max={max} value={scores[k]} onChange={set(k)} />
            </label>
          ))}
          <p className="hint">Linear gap penalty per gap column. No substitution matrix, so protein alignments are identity-based.</p>
        </fieldset>
        <button className="btn" type="submit" disabled={state.busy || !a.trim() || !b.trim()}>
          {state.busy ? 'Aligning…' : 'Align'}
        </button>
        {state.error && <p className="notice notice--error" role="alert">{state.error}</p>}
      </form>

      <div>
        {!d && <p className="muted">Paste two sequences of the same type (both DNA or both protein) and press Align.</p>}
        {d && (
          <>
            <div className="stats">
              <div className="stat">
                <span className="stat__label">Score</span>
                <span className="stat__value">{d.score}</span>
                <span className="stat__sub">{d.mode}</span>
              </div>
              <div className="stat">
                <span className="stat__label">Identity</span>
                <span className="stat__value">{d.identity_percent}%</span>
                <span className="stat__sub">over {d.length} columns</span>
              </div>
              <div className="stat">
                <span className="stat__label">Gaps</span>
                <span className="stat__value">{d.gaps}</span>
              </div>
              <div className="stat">
                <span className="stat__label">Aligned region</span>
                <span className="stat__value">
                  {d.span_a[0]}–{d.span_a[1]}
                </span>
                <span className="stat__sub">
                  vs {d.span_b[0]}–{d.span_b[1]}
                </span>
              </div>
            </div>
            <AlignmentView al={d} />
          </>
        )}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- tree */
function TreeTool({ examples }) {
  const [fasta, setFasta] = useState('')
  const [distance, setDistance] = useState('jc')
  const [state, run] = useRun(api.bioTree)
  const d = state.data
  return (
    <div className="lab">
      <form
        className="controls"
        onSubmit={(e) => {
          e.preventDefault()
          run({ fasta, distance })
        }}
      >
        <fieldset>
          <legend>Sequences (FASTA)</legend>
          <label className="sr-only" htmlFor="fasta">
            FASTA sequences
          </label>
          <textarea id="fasta" className="seqbox seqbox--tall" value={fasta} onChange={(e) => setFasta(e.target.value)} placeholder={'>seq1\nATG…\n>seq2\nATG…'} spellCheck={false} />
          <p className="hint">
            3 to {examples?.limits?.max_tree_seqs || 12} sequences, up to {examples?.limits?.max_tree_len?.toLocaleString() || '1,500'} residues each. Each one is aligned to every other.
          </p>
          <button type="button" className="chip chip--small" onClick={() => setFasta(examples?.fasta || '')}>
            Load example family
          </button>
        </fieldset>
        <fieldset>
          <legend>Distance</legend>
          <label className="check">
            <input type="radio" name="dist" checked={distance === 'jc'} onChange={() => setDistance('jc')} />
            <span>Jukes-Cantor (corrects for multiple hits; DNA only)</span>
          </label>
          <label className="check">
            <input type="radio" name="dist" checked={distance === 'p'} onChange={() => setDistance('p')} />
            <span>p-distance (fraction of mismatched sites)</span>
          </label>
        </fieldset>
        <button className="btn" type="submit" disabled={state.busy || !fasta.trim()}>
          {state.busy ? 'Building…' : 'Build tree'}
        </button>
        {state.error && <p className="notice notice--error" role="alert">{state.error}</p>}
      </form>

      <div>
        {!d && (
          <p className="muted">
            Paste a few related sequences in FASTA format and press Build tree. The example is a synthetic family with two
            clades (A and B) and an outgroup (C), so you can check what the method recovers.
          </p>
        )}
        {d && (
          <>
            <figure className="figure" style={{ margin: 0 }}>
              <p className="figure__title">Neighbour-joining tree, {d.n} sequences</p>
              <p className="figure__sub">{d.distance} distances; branch lengths in substitutions per site. The tree is unrooted and drawn from an arbitrary root.</p>
              <Tree nodes={d.nodes} />
            </figure>
            <h3 className="subhead">☾ newick</h3>
            <pre className="alignment">{d.newick}</pre>
            <h3 className="subhead">☾ distance matrix</h3>
            <div className="table-wrap">
              <table className="table table--matrix">
                <thead>
                  <tr>
                    <th />
                    {d.names.map((n) => (
                      <th key={n}>{n}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {d.matrix.map((row, i) => (
                    <tr key={d.names[i]}>
                      <th>{d.names[i]}</th>
                      {row.map((v, j) => (
                        <td key={j} className={i === j ? 'muted' : undefined}>
                          {v.toFixed(3)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ variants */
const CONSEQUENCE_TONE = {
  synonymous: 'ok',
  missense: 'warn',
  nonsense: 'bad',
  frameshift: 'bad',
  'stop lost': 'bad',
  'start lost': 'bad',
}

function Variants({ examples }) {
  const [ref, setRef] = useState('')
  const [sample, setSample] = useState('')
  const [state, run] = useRun(api.bioVariants)
  const d = state.data
  return (
    <div className="lab">
      <form
        className="controls"
        onSubmit={(e) => {
          e.preventDefault()
          run({ reference: ref, sample })
        }}
      >
        <fieldset>
          <legend>Reference coding sequence</legend>
          <label className="sr-only" htmlFor="ref-cds">
            Reference coding sequence
          </label>
          <textarea id="ref-cds" className="seqbox seqbox--short" value={ref} onChange={(e) => setRef(e.target.value)} placeholder={'>gene\nATG… (from the start codon)'} spellCheck={false} />
          <p className="hint">Position 1 is the A of ATG, so variants are named in HGVS coding coordinates (c.) and protein coordinates (p.).</p>
        </fieldset>
        <fieldset>
          <legend>Sample</legend>
          <label className="sr-only" htmlFor="sample-cds">
            Sample sequence
          </label>
          <textarea id="sample-cds" className="seqbox seqbox--short" value={sample} onChange={(e) => setSample(e.target.value)} placeholder="the same gene from a sample" spellCheck={false} />
          <button
            type="button"
            className="chip chip--small"
            onClick={() => {
              setRef(examples?.variant_reference || '')
              setSample(examples?.variant_sample || '')
            }}
          >
            Load example pair
          </button>
        </fieldset>
        <button className="btn" type="submit" disabled={state.busy || !ref.trim() || !sample.trim()}>
          {state.busy ? 'Calling…' : 'Call variants'}
        </button>
        {state.error && <p className="notice notice--error" role="alert">{state.error}</p>}
      </form>

      <div>
        {!d && (
          <p className="muted">
            Paste a reference coding sequence and the same gene from a sample. The example carries one variant of each
            class: synonymous, missense, in-frame deletion, nonsense and frameshift.
          </p>
        )}
        {d && (
          <>
            <div className="stats">
              <div className="stat">
                <span className="stat__label">Variants</span>
                <span className="stat__value">{d.n_variants}</span>
                <span className="stat__sub">{d.identity_percent}% identity</span>
              </div>
              <div className="stat">
                <span className="stat__label">Substitutions</span>
                <span className="stat__value">{d.substitutions}</span>
                <span className="stat__sub">Ti/Tv {d.ti_tv ?? '—'}</span>
              </div>
              <div className="stat">
                <span className="stat__label">Indels</span>
                <span className="stat__value">{d.indels}</span>
              </div>
              <div className="stat">
                <span className="stat__label">Protein</span>
                <span className="stat__value">{d.protein_truncated ? 'truncated' : 'full length'}</span>
                <span className="stat__sub">
                  {d.sample_protein.replace(/\*.*$/, '').length} of {d.reference_protein.replace(/\*.*$/, '').length} aa
                </span>
              </div>
            </div>
            <h3 className="subhead">☾ variant calls</h3>
            {d.n_variants === 0 && <p className="muted">The sample is identical to the reference.</p>}
            {d.n_variants > 0 && (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>cDNA</th>
                      <th>Protein</th>
                      <th>Consequence</th>
                      <th>Codon</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.variants.map((v) => (
                      <tr key={v.cdna}>
                        <td>
                          <code>{v.cdna}</code>
                        </td>
                        <td>
                          <code>{v.protein}</code>
                        </td>
                        <td>
                          <span className={`tone tone--${CONSEQUENCE_TONE[v.consequence] || 'warn'}`}>{v.consequence}</span>
                          {v.transition != null && <span className="muted"> · {v.transition ? 'transition' : 'transversion'}</span>}
                        </td>
                        <td>{v.codon}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <details className="frames">
              <summary>Translated proteins</summary>
              <p>
                <b className="muted">reference</b> <code className="seq">{d.reference_protein}</code>
              </p>
              <p>
                <b className="muted">sample</b> <code className="seq">{d.sample_protein}</code>
              </p>
            </details>
          </>
        )}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- pgx */
const PHENO_TONE = (p) => {
  if (/poor/i.test(p)) return 'bad'
  if (/intermediate|decreased|rapid/i.test(p)) return 'warn'
  return 'ok'
}

function Pgx({ examples }) {
  const catalogue = useApi(api.bioPgxCatalogue)
  const [picks, setPicks] = useState(null)
  const [state, run] = useRun(api.bioPgx)
  const genes = catalogue.data || []
  useEffect(() => {
    if (!picks && genes.length && examples?.pgx) {
      setPicks(Object.fromEntries(genes.map((g) => [g.gene, examples.pgx[g.gene] || [g.alleles[0].allele, g.alleles[0].allele]])))
    }
  }, [genes, examples, picks])
  const d = state.data
  const set = (gene, i) => (e) => setPicks({ ...picks, [gene]: picks[gene].map((a, k) => (k === i ? e.target.value : a)) })
  return (
    <div className="lab">
      <form
        className="controls"
        onSubmit={(e) => {
          e.preventDefault()
          run({ genotypes: genes.map((g) => ({ gene: g.gene, allele_1: picks[g.gene][0], allele_2: picks[g.gene][1] })) })
        }}
      >
        {catalogue.error && <p className="notice notice--error">{catalogue.error}</p>}
        {genes.map((g) => (
          <fieldset key={g.gene}>
            <legend>
              {g.gene} <span className="muted">· {g.name}</span>
            </legend>
            <div className="diplotype">
              {[0, 1].map((i) => (
                <label key={i}>
                  <span className="sr-only">
                    {g.gene} allele {i + 1}
                  </span>
                  <select value={picks?.[g.gene]?.[i] || ''} onChange={set(g.gene, i)}>
                    {g.alleles.map((a) => (
                      <option key={a.allele} value={a.allele}>
                        {a.allele} · {a.function}
                        {a.activity != null ? ` (${a.activity})` : ''}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <p className="hint">
              {g.input === 'snp' ? `Genotype at ${g.variant.rsid} (${g.variant.cdna}, ${g.variant.protein}). ` : ''}
              {g.drugs.map((x) => x.drug).join(', ')}
            </p>
          </fieldset>
        ))}
        <button className="btn" type="submit" disabled={state.busy || !picks}>
          {state.busy ? 'Working…' : 'Build report'}
        </button>
        {state.error && <p className="notice notice--error" role="alert">{state.error}</p>}
      </form>

      <div>
        {!d && (
          <p className="muted">
            Choose a diplotype for each pharmacogene and press Build report. The defaults are a patient who carries one
            reduced-function allele at every gene, which is common.
          </p>
        )}
        {d && (
          <>
            <p className="notice">
              Educational summary paraphrased from CPIC guidelines. A real pharmacogenomic report tests many more alleles and
              is interpreted by a clinician. This is not medical advice.
            </p>
            {d.map((r) => (
              <article key={r.gene} className="pgx">
                <header className="pgx__head">
                  <div>
                    <h3 className="subhead">
                      ☾ {r.gene} {r.diplotype}
                    </h3>
                    <p className="muted">{r.gene_role}</p>
                  </div>
                  <p className={`pgx__pheno tone tone--${PHENO_TONE(r.phenotype)}`}>
                    {r.phenotype}
                    {r.activity_score != null && <small> · activity score {r.activity_score}</small>}
                  </p>
                </header>
                <dl className="pgx__drugs">
                  {r.recommendations.map((x) => (
                    <div key={x.drug}>
                      <dt>{x.drug}</dt>
                      <dd>
                        {x.recommendation}{' '}
                        <a href={x.url} target="_blank" rel="noreferrer" className="muted">
                          {x.guideline}
                        </a>
                      </dd>
                    </div>
                  ))}
                </dl>
                <details className="frames">
                  <summary>About the alleles</summary>
                  <p>{r.notes}</p>
                </details>
              </article>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- page */
export default function SeqLab() {
  const [search, setSearch] = useSearchParams()
  const tool = TOOLS.some(([k]) => k === search.get('tool')) ? search.get('tool') : 'stats'
  const examples = useApi(api.bioExamples)
  useEffect(() => {
    document.title = 'Sequence Lab | Gichia Muiruri'
    return () => {
      document.title = 'Gichia Muiruri | Health data scientist'
    }
  }, [])

  return (
    <div className="page">
      <Win title="sequence_lab" icon="⌘">
        <h1 className="article__title">Sequence Lab</h1>
        <p className="article__lede">
          From a raw sequence to a prescribing decision, written from scratch and running on this server: sequence
          statistics and open reading frames, pairwise alignment, a neighbour-joining tree, variant calls with their
          effect on the protein, and a pharmacogenomics report that turns a genotype into a dosing recommendation.
          Nothing you paste is stored. Source:{' '}
          <a href="https://github.com/itsgichia/sequence-lab" target="_blank" rel="noreferrer">
            github.com/itsgichia/sequence-lab
          </a>
          .
        </p>
        <div className="filters" role="tablist" aria-label="Tool">
          {TOOLS.map(([k, label]) => (
            <button key={k} role="tab" aria-selected={tool === k} className={`chip${tool === k ? ' chip--on' : ''}`} onClick={() => setSearch({ tool: k }, { replace: true })}>
              {label}
            </button>
          ))}
        </div>
        {tool === 'stats' && <Stats examples={examples.data} />}
        {tool === 'align' && <Align examples={examples.data} />}
        {tool === 'tree' && <TreeTool examples={examples.data} />}
        {tool === 'variants' && <Variants examples={examples.data} />}
        {tool === 'pgx' && <Pgx examples={examples.data} />}
      </Win>

      <Win title="method" icon="✎" className="method">
        <ul className="plain">
          <li>
            <b>Open reading frames</b> are ATG-to-stop runs in all six frames, translated with the standard codon table.
          </li>
          <li>
            <b>Alignment</b> is Needleman-Wunsch (global) or Smith-Waterman (local) with linear gap penalties, filled row by
            row with NumPy and traced back from the best cell.
          </li>
          <li>
            <b>Trees</b> use pairwise global alignments to get p-distances, optionally Jukes-Cantor corrected, then Saitou
            and Nei's neighbour-joining algorithm. Output is also given in Newick format for other tools.
          </li>
          <li>
            <b>Variants</b> come from a global alignment of sample to reference. Each run of differing columns becomes one
            variant in HGVS coding notation; applying it alone to the reference and translating both tells whether it is
            synonymous, missense, nonsense, an in-frame indel or a frameshift.
          </li>
          <li>
            <b>Medicine</b> encodes the CPIC function tables for CYP2C19, CYP2D6 (activity score), TPMT and SLCO1B1, maps a
            diplotype to a metaboliser phenotype and shows the paraphrased recommendation for six drugs, each linked to its
            guideline.
          </li>
          <li>
            This is a teaching tool with simple scoring. For real work use BLAST, MAFFT or IQ-TREE, which handle
            substitution matrices, affine gaps and model selection, and a clinical pharmacogenomics service for prescribing.
          </li>
        </ul>
      </Win>
    </div>
  )
}
