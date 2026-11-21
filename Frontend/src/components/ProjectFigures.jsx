/**
 * Animated methodology figures for the projects that have no screenshot.
 * Each one shows the mechanism the project turns on and the numbers it
 * actually measured. Pure SVG and CSS keyframes, no images, no libraries;
 * every animation is switched off under prefers-reduced-motion.
 */

/** A labelled row with a meter underneath, used in the notes column. */
function Row({ label, value, pct, bad }) {
  return (
    <li>
      <span>{label}</span>
      <span className={bad ? 'pfig__num pfig__num--bad' : 'pfig__num'}>{value}</span>
      <span className="pfig__meter">
        <i style={{ width: `${Math.round(pct * 100)}%`, background: bad ? 'var(--red)' : 'var(--pink)' }} />
      </span>
    </li>
  )
}

function Figure({ title, sub, svg, children, caption }) {
  return (
    <figure className="figure" style={{ margin: 0 }}>
      <p className="figure__title">{title}</p>
      <p className="figure__sub">{sub}</p>
      <div className="pfig__grid">
        {svg}
        <ul className="pfig__rows">{children}</ul>
      </div>
      {caption && <figcaption className="figure__caption">{caption}</figcaption>}
    </figure>
  )
}

/* ------------------------------------------------ histopathology metastasis */

// Deterministic so the texture is the same on every render.
const hash = (n) => {
  const x = Math.sin(n * 12.9898) * 43758.5453
  return x - Math.floor(x)
}
const TUMOUR = new Set([2, 6, 9, 11, 14, 17])

function PatchGrid() {
  const cells = []
  for (let i = 0; i < 20; i += 1) {
    const col = i % 5
    const row = Math.floor(i / 5)
    const x = 10 + col * 40
    const y = 14 + row * 40
    const tumour = TUMOUR.has(i)
    const dots = []
    // Benign patches read as dense lymphocyte speckle, tumour as bulkier blobs.
    const n = tumour ? 9 : 18
    for (let d = 0; d < n; d += 1) {
      const s = tumour ? 3 + Math.floor(hash(i * 17 + d) * 3) : 2
      dots.push(
        <rect
          key={d}
          x={x + 3 + Math.floor(hash(i * 31 + d) * 30)}
          y={y + 3 + Math.floor(hash(i * 53 + d + 7) * 30)}
          width={s}
          height={s}
          fill={tumour ? 'rgba(245,184,74,0.7)' : 'rgba(159,179,209,0.55)'}
        />,
      )
    }
    cells.push(
      <g key={i}>
        <rect x={x} y={y} width="36" height="36" fill="rgba(45,212,191,0.06)" stroke="var(--line)" strokeWidth="1" />
        {dots}
        <g className="histo__mark" style={{ animationDelay: `${row * 1.5 - 0.9}s` }}>
          {tumour ? (
            <>
              <rect x={x} y={y} width="36" height="36" fill="none" stroke="var(--yellow)" strokeWidth="2" />
              <text x={x + 30} y={y + 33} className="pfig__tag" fill="var(--yellow)">
                +
              </text>
            </>
          ) : (
            <rect x={x + 29} y={y + 29} width="4" height="4" fill="var(--pink)" />
          )}
        </g>
      </g>,
    )
  }
  return (
    <svg
      className="pfig__svg"
      viewBox="0 0 220 180"
      role="img"
      aria-label="A grid of lymph node tissue patches being scanned, six of twenty marked as containing tumour"
    >
      {cells}
      <g className="histo__sweep">
        <rect x="10" y="12" width="200" height="2" fill="var(--pink)" />
        <rect x="10" y="14" width="200" height="36" fill="rgba(45,212,191,0.07)" />
      </g>
    </svg>
  )
}

export function HistoFigure() {
  return (
    <Figure
      title="Scoring lymph node patches for metastasis"
      sub="Four models on the same 96 by 96 pixel patches, ranked by area under the curve"
      svg={<PatchGrid />}
      caption={
        <>
          The anomaly detector, trained only on healthy tissue, scores <b>below chance</b>. Dense lymphocyte texture is
          harder to reconstruct than bulky tumour, so 15 of its 16 highest-error patches are benign.
        </>
      }
    >
      <Row label="Convolutional network, trained from scratch" value="0.92" pct={0.92} />
      <Row label="Frozen autoencoder encoder, 8,321 trainable parameters" value="0.83" pct={0.83} />
      <Row label="Same encoder, fine-tuned for one epoch" value="0.92" pct={0.92} />
      <Row label="Anomaly detector, never shown a tumour" value="0.43" pct={0.43} bad />
    </Figure>
  )
}

/* ------------------------------------------------------- ligand activity ML */

const SPLITS = [
  ['random', 0.67],
  ['scaffold', 0.46],
  ['time', 0.23],
]

function SplitChart() {
  const x0 = 56
  const full = 134
  return (
    <svg
      className="pfig__svg"
      viewBox="0 0 220 180"
      role="img"
      aria-label="R squared falls from 0.67 under a random split to 0.46 under a scaffold split and 0.23 under a time split"
    >
      <text x="10" y="16" className="pfig__tag">
        R² BY SPLIT
      </text>
      {SPLITS.map(([name, r2], i) => {
        const y = 28 + i * 22
        return (
          <g key={name}>
            <text x="10" y={y + 9} className="pfig__lab">
              {name}
            </text>
            <rect x={x0} y={y} width={full} height="12" fill="rgba(159,179,209,0.08)" />
            <rect
              x={x0}
              y={y}
              width={full * r2}
              height="12"
              fill={i === 0 ? 'var(--pink)' : i === 1 ? 'var(--yellow)' : 'var(--red)'}
              className="pfig__bar"
              style={{ animationDelay: `${0.2 + i * 0.25}s`, transformOrigin: `${x0}px center` }}
            />
            <text x={x0 + full * r2 + 5} y={y + 9} className="pfig__lab">
              {r2.toFixed(2)}
            </text>
          </g>
        )
      })}
      <line x1="10" y1="104" x2="210" y2="104" stroke="var(--line)" strokeDasharray="2 3" />
      <text x="10" y="118" className="pfig__tag">
        TEST COMPOUNDS WITH A
      </text>
      <text x="10" y="128" className="pfig__tag">
        TRAINING SCAFFOLD
      </text>
      {Array.from({ length: 20 }, (_, i) => (
        <g key={i}>
          <rect x={10 + i * 10} y={136} width="8" height="8" fill="none" stroke="var(--line)" strokeWidth="1" />
          {i < 13 && <rect className="ligand__shared" x={11 + i * 10} y={137} width="6" height="6" fill="var(--yellow)" />}
        </g>
      ))}
      <text x="10" y="162" className="pfig__lab ligand__cap ligand__cap--a">
        random split — 62 to 73% share a scaffold
      </text>
      <text x="10" y="162" className="pfig__lab ligand__cap ligand__cap--b">
        scaffold split — none do, by construction
      </text>
    </svg>
  )
}

export function LigandFigure() {
  return (
    <Figure
      title="How much the evaluation flatters the model"
      sub="32,540 compounds, five targets, four model families on three representations"
      svg={<SplitChart />}
      caption={
        <>
          Moving off a random split costs <b>0.08</b> in area under the curve for a scaffold split and <b>0.15</b> for a
          time split. Ridge regression turns outright negative on four of five targets once the split respects time.
        </>
      }
    >
      <Row label="Random split, close analogues allowed into the test set" value="baseline" pct={1} />
      <Row label="Bemis-Murcko scaffold split" value="−0.08 AUC" pct={0.53} />
      <Row label="Split by year of first publication" value="−0.15 AUC" pct={0.2} bad />
      <Row label="Choice of molecular representation" value="half as much" pct={0.45} />
    </Figure>
  )
}

/* ------------------------------------------------------ ICD-10-AM coding LLM */

const WRONG = ['A09', 'A41.9', 'B99.9', 'A00']

function CodingFlow() {
  return (
    <svg
      className="pfig__svg"
      viewBox="0 0 220 180"
      role="img"
      aria-label="A discharge summary with its diagnosis line removed is fed to a small language model, which answers with a wrong code in a valid format"
    >
      {/* the note */}
      <rect x="10" y="12" width="200" height="60" fill="rgba(159,179,209,0.05)" stroke="var(--line)" strokeWidth="1" />
      <text x="16" y="24" className="pfig__tag">
        DISCHARGE SUMMARY
      </text>
      <rect x="16" y="30" width="150" height="3" fill="rgba(159,179,209,0.35)" />
      <rect x="16" y="37" width="178" height="3" fill="rgba(159,179,209,0.35)" />
      <rect x="16" y="52" width="120" height="3" fill="rgba(159,179,209,0.35)" />
      <rect x="16" y="59" width="96" height="3" fill="rgba(159,179,209,0.35)" />
      {/* the line that is taken away, so the task can't be solved by copying */}
      <rect x="16" y="43" width="92" height="6" fill="var(--line-hi)" />
      <text x="112" y="49" className="pfig__lab" fill="var(--dim)">
        diagnosis removed
      </text>

      <path d="M110 72 V86 M106 82 L110 87 L114 82" fill="none" stroke="var(--line-hi)" strokeWidth="1.5" />
      <rect x="52" y="88" width="116" height="18" fill="rgba(45,212,191,0.08)" stroke="var(--pink)" strokeWidth="1" />
      <text x="110" y="100" className="pfig__lab" textAnchor="middle" fill="var(--ink)">
        Qwen2.5-0.5B-Instruct
      </text>
      <path d="M110 106 V120 M106 116 L110 121 L114 116" fill="none" stroke="var(--line-hi)" strokeWidth="1.5" />

      <text x="10" y="134" className="pfig__lab">
        answer
      </text>
      {WRONG.map((code, i) => (
        <g key={code} className="icd__code" style={{ animationDelay: `${i * 2}s` }}>
          <text x="56" y="134" className="pfig__val pfig__bad">
            {code}
          </text>
        </g>
      ))}
      <text x="104" y="134" className="pfig__val pfig__bad">
        ✗
      </text>
      <text x="10" y="150" className="pfig__lab">
        true code
      </text>
      <text x="56" y="150" className="pfig__val" fill="var(--yellow)">
        J18.9
      </text>
      <text x="10" y="166" className="pfig__lab">
        format
      </text>
      <text x="56" y="166" className="pfig__val">
        valid ✓
      </text>
    </svg>
  )
}

export function IcdFigure() {
  return (
    <Figure
      title="Nine prompts, zero correct codes"
      sub="Format validity by prompt strategy on the held-out split; every strategy scored 0.000 accuracy"
      svg={<CodingFlow />}
      caption={
        <>
          Prompting controlled the <b>shape</b> of the answer completely and its <b>content</b> not at all. Every
          strategy carrying six examples answered only with codes from its own examples, and the one briefed on how the
          classification is organised answered every case from the chapter the briefing named first.
        </>
      }
    >
      <Row label="Strict output format" value="1.00 valid" pct={1} />
      <Row label="Six worked examples" value="1.00 valid" pct={1} />
      <Row label="Coder persona plus structure" value="1.00 valid" pct={1} />
      <Row label="Briefed on the classification" value="0.50 valid" pct={0.5} />
      <Row label="Bare instruction" value="0.30 valid" pct={0.3} />
    </Figure>
  )
}

/* -------------------------------------------------- FNA network vs logistic */

function DeltaChart() {
  // Number line over ±0.004 in AUC, zero in the middle.
  const zero = 112
  const perUnit = 88 / 0.004
  const at = (v) => zero + v * perUnit
  const lo = at(-0.00225)
  const hi = at(0.00092)
  const est = at(-0.00066)
  return (
    <svg
      className="pfig__svg"
      viewBox="0 0 220 180"
      role="img"
      aria-label="The difference in area under the curve is minus 0.00066 with a confidence interval from minus 0.00225 to plus 0.00092, straddling zero"
    >
      <text x="10" y="16" className="pfig__tag">
        NETWORK − LOGISTIC, ΔAUC
      </text>
      <line x1="24" y1="48" x2="200" y2="48" stroke="var(--line)" strokeWidth="1" />
      <line x1={zero} y1="26" x2={zero} y2="54" stroke="var(--line-hi)" strokeDasharray="2 2" />
      <text x={zero} y="64" className="pfig__lab" textAnchor="middle">
        0
      </text>
      <text x="24" y="64" className="pfig__lab" textAnchor="middle">
        −0.004
      </text>
      <text x="200" y="64" className="pfig__lab" textAnchor="middle">
        +0.004
      </text>
      <g className="fna__ci" style={{ transformOrigin: `${est}px center` }}>
        <rect x={lo} y="36" width={hi - lo} height="8" fill="rgba(245,184,74,0.3)" stroke="var(--yellow)" strokeWidth="1" />
        <line x1={lo} y1="32" x2={lo} y2="48" stroke="var(--yellow)" strokeWidth="1.5" />
        <line x1={hi} y1="32" x2={hi} y2="48" stroke="var(--yellow)" strokeWidth="1.5" />
      </g>
      <rect className="fna__point" x={est - 3} y="37" width="6" height="6" fill="var(--ink)" />
      <text x="10" y="88" className="pfig__lab">
        DeLong p = 0.413 · 114 test cases
      </text>

      <line x1="10" y1="100" x2="210" y2="100" stroke="var(--line)" strokeDasharray="2 3" />
      <text x="10" y="114" className="pfig__tag">
        SPECIFICITY AT 99% SENSITIVITY
      </text>
      {[
        ['logistic', 0.875, 'var(--pink)'],
        ['trees', 0.528, 'var(--red)'],
      ].map(([name, v, fill], i) => {
        const y = 124 + i * 24
        return (
          <g key={name}>
            <text x="10" y={y + 10} className="pfig__lab">
              {name}
            </text>
            <rect x="60" y={y} width="120" height="14" fill="rgba(159,179,209,0.08)" />
            <rect
              className="pfig__bar"
              x="60"
              y={y}
              width={120 * v}
              height="14"
              fill={fill}
              style={{ animationDelay: `${0.5 + i * 0.25}s`, transformOrigin: '60px center' }}
            />
            <text x={60 + 120 * v + 5} y={y + 10} className="pfig__lab">
              {v.toFixed(3)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function FnaFigure() {
  return (
    <Figure
      title="Does the network earn its complexity?"
      sub="Breast cytology: a tuned feedforward network against regularised logistic regression"
      svg={<DeltaChart />}
      caption={
        <>
          The difference in discrimination is <b>−0.0007</b>, with an interval straddling zero. 114 test cases cannot
          resolve a difference this small, and adding any penalty to the logistic model moved accuracy thirty times more
          than the network did. Where the models separate is the operating point a clinic would actually choose.
        </>
      }
    >
      <Row label="Difference in area under the curve" value="−0.00066" pct={0.08} bad />
      <Row label="95% interval, lower to upper" value="−0.0023 to +0.0009" pct={0.3} />
      <Row label="Logistic regression, specificity at 99% sensitivity" value="0.875" pct={0.875} />
      <Row label="Gradient boosting, same operating point" value="0.528" pct={0.528} bad />
    </Figure>
  )
}

/* ------------------------------------------------ infant wheeze prediction */

const SOURCES = [
  ['general practice', 0, 34],
  ['emergency dept', 1, 0],
  ['birth records', 2, -34],
]

function LinkageFlow() {
  return (
    <svg
      className="pfig__svg"
      viewBox="0 0 220 180"
      role="img"
      aria-label="General practice, emergency department and birth records are linked into one infant record, then scored by a model reaching an area under the curve of 0.82"
    >
      {SOURCES.map(([name, i, dy]) => {
        const y = 14 + i * 34
        return (
          <g key={name}>
            <rect x="8" y={y} width="60" height="26" fill="rgba(159,179,209,0.06)" stroke="var(--line)" strokeWidth="1" />
            <text x="38" y={y + 12} className="pfig__lab" textAnchor="middle">
              {name.split(' ')[0]}
            </text>
            <text x="38" y={y + 21} className="pfig__lab" textAnchor="middle">
              {name.split(' ').slice(1).join(' ')}
            </text>
            <path
              d={`M68 ${y + 13} C 80 ${y + 13}, 82 ${y + 13 + dy}, 92 ${y + 13 + dy}`}
              fill="none"
              stroke="var(--line-hi)"
              strokeWidth="1"
            />
            <rect
              className="bronch__dot"
              x="66"
              y={y + 11}
              width="4"
              height="4"
              fill="var(--pink)"
              style={{ '--dy': `${dy}px`, animationDelay: `${i * 0.5}s` }}
            />
          </g>
        )
      })}
      <rect x="92" y="40" width="52" height="42" fill="rgba(45,212,191,0.08)" stroke="var(--pink)" strokeWidth="1" />
      <text x="118" y="55" className="pfig__lab" textAnchor="middle" fill="var(--ink)">
        linked
      </text>
      <text x="118" y="65" className="pfig__lab" textAnchor="middle" fill="var(--ink)">
        infant
      </text>
      <text x="118" y="75" className="pfig__lab" textAnchor="middle" fill="var(--ink)">
        record
      </text>
      <path d="M144 61 H164 M160 57 L165 61 L160 65" fill="none" stroke="var(--line-hi)" strokeWidth="1" />
      <rect x="166" y="47" width="46" height="28" fill="rgba(245,184,74,0.1)" stroke="var(--yellow)" strokeWidth="1" />
      <text x="189" y="59" className="pfig__lab" textAnchor="middle">
        40 feats
      </text>
      <text x="189" y="69" className="pfig__lab" textAnchor="middle">
        4 models
      </text>

      <line x1="10" y1="110" x2="210" y2="110" stroke="var(--line)" strokeDasharray="2 3" />
      <text x="10" y="126" className="pfig__tag">
        WHEEZE OR BRONCHIOLITIS IN YEAR ONE
      </text>
      <rect x="10" y="134" width="200" height="14" fill="rgba(159,179,209,0.08)" />
      <rect
        className="pfig__bar"
        x="10"
        y="134"
        width={200 * 0.82}
        height="14"
        fill="var(--pink)"
        style={{ animationDelay: '1.4s', transformOrigin: '10px center' }}
      />
      <text x="10" y="166" className="pfig__lab">
        area under the curve
      </text>
      <text x="118" y="166" className="pfig__val" fill="var(--yellow)">
        0.82
      </text>
    </svg>
  )
}

export function BronchFigure() {
  return (
    <Figure
      title="Linking three record systems into one infant history"
      sub="Thousands of children traced through their first year of life"
      svg={<LinkageFlow />}
      caption={
        <>
          More than <b>200 data quality issues</b> were traced back to their source datasets before any model was fitted.
          The linked repository re-implements the whole pipeline on a synthetic cohort, since the study data are
          confidential.
        </>
      }
    >
      <Row label="Linkage validation and plausibility checks across three systems" value="3 sources" pct={0.6} />
      <Row label="Data quality issues traced to source" value="200+" pct={0.8} />
      <Row label="Clinical features engineered" value="40" pct={0.5} />
      <Row label="Model families benchmarked with bootstrap validation" value="4" pct={0.4} />
    </Figure>
  )
}
