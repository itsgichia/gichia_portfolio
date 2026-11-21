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
          The core algorithms of a first bioinformatics course, written from scratch and running on this server: sequence
          statistics and open reading frames, pairwise alignment by dynamic programming, and a neighbour-joining tree.
          Nothing you paste is stored.
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
            This is a teaching tool with simple scoring. For real work use BLAST, MAFFT or IQ-TREE, which handle
            substitution matrices, affine gaps and model selection.
          </li>
        </ul>
      </Win>
    </div>
  )
}
