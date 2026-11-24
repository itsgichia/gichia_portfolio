import { useEffect, useState } from 'react'
import { api } from '../api'
import { Win } from '../components/Retro'
import useApi from '../components/useApi'

const MIN = 40
const MAX = 6000

function Run({ run }) {
  const hedged = run.candidates.length > 1
  return (
    <section className="icdlab__run" aria-label={run.strategy}>
      <p className="figure__title">{run.strategy}</p>
      <p className="figure__sub">
        {run.template} · {run.output_tokens ?? '?'} output tokens
      </p>
      <pre className="icdlab__pre">{run.response || '(empty response)'}</pre>
      <p className="icdlab__read">
        <span>extractor read</span>
        <b className={`icdlab__code${run.valid ? '' : ' icdlab__code--bad'}`}>{run.code || 'nothing'}</b>
        <span className="muted">
          {run.valid ? `by the ${run.method} layer` : 'no category-shaped token'}
          {hedged && `, ${run.candidates.length} codes offered: ${run.candidates.join(' ')}`}
        </span>
      </p>
    </section>
  )
}

export default function IcdLab() {
  const status = useApi(api.icdStatus)
  const examples = useApi(api.icdExamples)
  const [note, setNote] = useState('')
  const [picked, setPicked] = useState(null)
  const [state, setState] = useState({ data: null, error: null, busy: false })

  useEffect(() => {
    document.title = 'ICD coding lab | Gichia Muiruri'
    return () => {
      document.title = 'Gichia Muiruri | Health data scientist'
    }
  }, [])

  const available = status.data?.available
  const ready = note.trim().length >= MIN && note.length <= MAX && available && !state.busy

  const pick = (ex) => {
    setPicked(ex)
    setNote(ex.note)
    setState({ data: null, error: null, busy: false })
  }

  const run = async () => {
    setState({ data: null, error: null, busy: true })
    try {
      setState({ data: await api.icdCode({ note }), error: null, busy: false })
    } catch (e) {
      setState({ data: null, error: e.message, busy: false })
    }
  }

  return (
    <div className="page">
      <Win title="icd_lab" icon="⌘">
        <h1 className="article__title">ICD coding lab</h1>
        <p className="article__lede">
          Paste a hospital course and the same note goes to Claude Haiku twice: once as a plain question, once under
          the strict-format contract from the prompt study. Both answers come back raw, and the study's own extractor
          shows which code it would have scored. Nothing you paste is stored. Source:{' '}
          <a href="https://github.com/itsgichia/icd10am-claude-coding" target="_blank" rel="noreferrer">
            github.com/itsgichia/icd10am-claude-coding
          </a>
          .
        </p>

        {status.data && !available && (
          <p className="notice notice--error" role="status">
            The lab is not switched on for this server, so notes cannot be sent. The study's results are still on the{' '}
            <a href="/projects/icd10am-claude-coding">project page</a>.
          </p>
        )}

        <div className="filters" role="group" aria-label="Example notes">
          {(examples.data || []).map((ex) => (
            <button
              key={ex.id}
              type="button"
              className={`chip${picked?.id === ex.id ? ' chip--on' : ''}`}
              aria-pressed={picked?.id === ex.id}
              onClick={() => pick(ex)}
            >
              {ex.title}
            </button>
          ))}
        </div>

        <div className="field" style={{ marginTop: '0.75rem' }}>
          <label htmlFor="icd-note">Hospital course, diagnosis lines removed</label>
          <textarea
            id="icd-note"
            rows={9}
            value={note}
            maxLength={MAX}
            placeholder="Paste a de-identified hospital course, or pick an example above."
            onChange={(e) => {
              setNote(e.target.value)
              setPicked(null)
            }}
          />
          <span className="hint">
            {note.length} of {MAX} characters. Please do not paste anything that could identify a patient.
          </span>
        </div>

        <div className="filters" style={{ marginTop: '0.75rem' }}>
          <button type="button" className="btn" disabled={!ready} onClick={run}>
            {state.busy ? 'Asking Haiku…' : 'Ask Haiku both ways'}
          </button>
          {picked && (
            <span className="muted">
              keyword label for this note: <b>{picked.label_code}</b> {picked.label_title}
            </span>
          )}
        </div>

        {state.error && (
          <p className="notice notice--error" role="alert">
            {state.error}
          </p>
        )}

        {state.data && (
          <div className="icdlab__runs">
            {state.data.runs.map((r) => (
              <Run key={r.template} run={r} />
            ))}
          </div>
        )}
      </Win>

      <Win title="method" icon="✎" className="method">
        <ul className="plain">
          <li>
            <b>Two prompts, one model.</b> The plain question is the study's baseline. The strict-format prompt adds a
            system message and an output contract. Both run on {status.data?.model || 'claude-haiku-5-5'} at low effort,
            the same settings as the study.
          </li>
          <li>
            <b>The extractor</b> is the study's: a bare code first, then JSON, then an answer cue, then a regex scan that
            keeps the first category-shaped token. When the model writes several codes, the extractor's pick is what the
            study scored, right or wrong.
          </li>
          <li>
            <b>The keyword label</b> shown for the example notes is the study's weak label, taken from the diagnosis line
            that was removed from the note. It is a keyword match, not a coder's judgement, and the study found it
            disagreed with the models on about half the notes.
          </li>
          <li>
            Ten notes an hour per visitor and a daily budget for the whole site. The examples are synthetic clinical notes
            from a public dataset; the lab is a demonstration, not a coding tool.
          </li>
        </ul>
      </Win>
    </div>
  )
}
