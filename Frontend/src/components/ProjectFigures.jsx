/**
 * Methodology figures for the projects that have no screenshot.
 *
 * Each one animates the mechanism the project turns on, the way the chemistry
 * figure shows a ligand docking rather than charting the result: a patch
 * passing through a network, a molecule stripped to its scaffold and sorted
 * into a bin, a note tokenised into a model, a nucleus measured and sent down
 * two competing paths, records landing on an infant's timeline. The measured
 * numbers sit beside the animation, not inside it.
 *
 * Pure SVG and CSS keyframes. Every animation stops under prefers-reduced-motion.
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

// Deterministic, so textures are identical on every render.
const hash = (n) => {
  const x = Math.sin(n * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

/* ------------------------------------------------ histopathology metastasis */

/** A 36x36 tissue patch: dense speckle for benign, bulkier blobs for tumour. */
function Patch({ x, y, size = 36, tumour, seed }) {
  const dots = []
  const n = tumour ? 10 : 20
  for (let d = 0; d < n; d += 1) {
    const s = tumour ? 3 + Math.floor(hash(seed * 17 + d) * 3) : 2
    dots.push(
      <rect
        key={d}
        x={x + 2 + Math.floor(hash(seed * 31 + d) * (size - 5))}
        y={y + 2 + Math.floor(hash(seed * 53 + d + 7) * (size - 5))}
        width={s}
        height={s}
        fill={tumour ? 'rgba(245,184,74,0.8)' : 'rgba(159,179,209,0.6)'}
      />,
    )
  }
  return (
    <g>
      <rect x={x} y={y} width={size} height={size} fill="rgba(45,212,191,0.07)" stroke="var(--line)" strokeWidth="1" />
      {dots}
    </g>
  )
}

/** One convolution stage: a stack of feature maps that lights up as data arrives. */
function Stage({ x, y, size, label, delay }) {
  return (
    <g className="cnn__stage" style={{ animationDelay: `${delay}s` }}>
      {[8, 4, 0].map((o, i) => (
        <rect
          key={o}
          x={x + o}
          y={y - o}
          width={size}
          height={size}
          fill={i === 2 ? 'rgba(45,212,191,0.16)' : 'rgba(45,212,191,0.07)'}
          stroke="var(--pink)"
          strokeWidth="1"
        />
      ))}
      <text x={x + size / 2 + 4} y={y + size + 14} className="pfig__tag" textAnchor="middle">
        {label}
      </text>
    </g>
  )
}

function CnnPipeline() {
  return (
    <svg
      className="pfig__svg"
      viewBox="0 0 240 180"
      role="img"
      aria-label="A lymph node patch passes through three convolution stages and comes out as a probability of metastasis"
    >
      <text x="8" y="14" className="pfig__tag">
        96×96 PATCH
      </text>
      <Stage x={66} y={30} size={28} label="conv 1" delay={0.35} />
      <Stage x={122} y={36} size={20} label="conv 2" delay={0.7} />
      <Stage x={170} y={40} size={14} label="conv 3" delay={1.05} />

      {/* the activation travelling through the stack */}
      <rect className="cnn__spark" x="48" y="42" width="5" height="5" fill="var(--pink)" />

      <path d="M46 44 H62 M58 41 L63 44 L58 47" fill="none" stroke="var(--line-hi)" strokeWidth="1" />
      <path d="M104 44 H118 M114 41 L119 44 L114 47" fill="none" stroke="var(--line-hi)" strokeWidth="1" />
      <path d="M152 48 H166 M162 45 L167 48 L162 51" fill="none" stroke="var(--line-hi)" strokeWidth="1" />

      <line x1="8" y1="104" x2="232" y2="104" stroke="var(--line)" strokeDasharray="2 3" />
      <text x="8" y="120" className="pfig__tag">
        P(METASTASIS)
      </text>
      <rect x="8" y="128" width="224" height="14" fill="rgba(159,179,209,0.08)" />
      <text x="8" y="162" className="pfig__lab">
        verdict
      </text>

      {/* Each pass classifies one patch. Everything belonging to a pass is
          grouped, so the phase gate is one opacity animation on the group and
          the timing inside it stays independent. */}
      <g className="cnn__phase cnn__phase--a">
        <Patch x={8} y={26} tumour seed={3} />
        <rect className="cnn__p" x="8" y="128" width={224 * 0.94} height="14" fill="var(--yellow)" />
        <text x="58" y="162" className="pfig__val cnn__v" fill="var(--yellow)">
          metastasis 0.94
        </text>
      </g>
      <g className="cnn__phase cnn__phase--b">
        <Patch x={8} y={26} seed={9} />
        <rect className="cnn__p" x="8" y="128" width={224 * 0.06} height="14" fill="var(--pink)" />
        <text x="58" y="162" className="pfig__val cnn__v">
          benign 0.06
        </text>
      </g>
    </svg>
  )
}

export function HistoFigure() {
  return (
    <Figure
      title="One patch through the network"
      sub="Four models on the same 96 by 96 pixel patches, ranked by area under the curve"
      svg={<CnnPipeline />}
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

/** A molecule drawn as a ring core plus side chains that can be stripped off. */
function Molecule({ chains = true }) {
  return (
    <g>
      <polygon points="0,7 5,0 15,0 20,7 15,14 5,14" fill="none" stroke="var(--pink)" strokeWidth="1.6" />
      <polygon points="20,7 25,0 35,0 40,7 35,14 25,14" fill="none" stroke="var(--pink)" strokeWidth="1.6" />
      <g className={chains ? 'lig__chain' : undefined} opacity={chains ? 1 : 0}>
        <line x1="40" y1="7" x2="50" y2="7" stroke="var(--yellow)" strokeWidth="1.6" />
        <rect x="50" y="4" width="6" height="6" fill="var(--yellow)" />
        <line x1="10" y1="0" x2="10" y2="-7" stroke="var(--yellow)" strokeWidth="1.6" />
        <rect x="7" y="-13" width="6" height="6" fill="var(--yellow)" />
        <line x1="30" y1="14" x2="30" y2="21" stroke="var(--yellow)" strokeWidth="1.6" />
      </g>
    </g>
  )
}

function ScaffoldSplit() {
  return (
    <svg
      className="pfig__svg"
      viewBox="0 0 240 180"
      role="img"
      aria-label="A molecule is stripped to its Murcko scaffold and sorted into a training or test bin, leaking across the split when the split is random"
    >
      <text x="8" y="14" className="pfig__tag">
        STRIP TO THE MURCKO SCAFFOLD
      </text>

      {/* the molecule: drifts in, sheds its side chains, drops into a bin */}
      <g className="lig__mol">
        <Molecule />
      </g>
      <text x="120" y="62" className="pfig__lab lig__label" textAnchor="middle">
        scaffold
      </text>

      {/* the two bins */}
      <rect x="20" y="96" width="82" height="52" fill="rgba(45,212,191,0.07)" stroke="var(--pink)" strokeWidth="1" />
      <text x="61" y="110" className="pfig__tag" textAnchor="middle" fill="var(--ink-2)">
        TRAIN
      </text>
      <rect x="138" y="96" width="82" height="52" fill="rgba(245,184,74,0.07)" stroke="var(--yellow)" strokeWidth="1" />
      <text x="179" y="110" className="pfig__tag" textAnchor="middle" fill="var(--ink-2)">
        TEST
      </text>

      {/* the scaffold already sitting in TRAIN */}
      <g transform="translate(34,120) scale(0.7)">
        <polygon points="0,7 5,0 15,0 20,7 15,14 5,14" fill="none" stroke="var(--pink)" strokeWidth="2" />
        <polygon points="20,7 25,0 35,0 40,7 35,14 25,14" fill="none" stroke="var(--pink)" strokeWidth="2" />
      </g>

      {/* where the new scaffold lands: TEST under a random split, TRAIN under a scaffold split */}
      <g className="lig__drop lig__drop--rand" transform="translate(152,120) scale(0.7)">
        <polygon points="0,7 5,0 15,0 20,7 15,14 5,14" fill="none" stroke="var(--red)" strokeWidth="2" />
        <polygon points="20,7 25,0 35,0 40,7 35,14 25,14" fill="none" stroke="var(--red)" strokeWidth="2" />
      </g>
      <g className="lig__drop lig__drop--scaf" transform="translate(34,138) scale(0.7)">
        <polygon points="0,7 5,0 15,0 20,7 15,14 5,14" fill="none" stroke="var(--pink)" strokeWidth="2" />
        <polygon points="20,7 25,0 35,0 40,7 35,14 25,14" fill="none" stroke="var(--pink)" strokeWidth="2" />
      </g>

      {/* The leak: the same scaffold on both sides of the split. The link
          arcs over the bins because the gap between them is too narrow to
          hold the label without touching both boxes. */}
      <g className="lig__leak">
        <path
          d="M60 116 V88 H174 V116"
          fill="none"
          stroke="var(--red)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <text x="117" y="85" className="pfig__lab" textAnchor="middle" fill="var(--red)">
          same scaffold, both sides
        </text>
      </g>

      <text x="8" y="166" className="pfig__lab lig__cap lig__cap--rand" fill="var(--red)">
        random split — 62 to 73% of test compounds leak
      </text>
      <text x="8" y="166" className="pfig__lab lig__cap lig__cap--scaf">
        scaffold split — a scaffold lives on one side only
      </text>
    </svg>
  )
}

export function LigandFigure() {
  return (
    <Figure
      title="How a compound gets sorted, and what that costs"
      sub="32,540 compounds, five targets, four model families on three representations"
      svg={<ScaffoldSplit />}
      caption={
        <>
          Moving off a random split costs <b>0.08</b> in area under the curve for a scaffold split and <b>0.15</b> for a
          time split, and average R² falls from 0.67 to 0.46 to 0.23. Ridge regression turns outright negative on four
          of five targets once the split respects time.
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
      viewBox="0 0 240 180"
      role="img"
      aria-label="A discharge summary with its diagnosis line removed is tokenised into a small language model, which answers with a wrong code in a valid format"
    >
      <rect x="8" y="10" width="224" height="52" fill="rgba(159,179,209,0.05)" stroke="var(--line)" strokeWidth="1" />
      <text x="14" y="22" className="pfig__tag">
        DISCHARGE SUMMARY
      </text>
      <rect x="14" y="28" width="170" height="3" fill="rgba(159,179,209,0.35)" />
      <rect x="14" y="35" width="200" height="3" fill="rgba(159,179,209,0.35)" />
      <rect x="14" y="50" width="140" height="3" fill="rgba(159,179,209,0.35)" />
      <rect x="14" y="57" width="104" height="3" fill="rgba(159,179,209,0.35)" />
      {/* the line taken away, so the task can't be solved by copying */}
      <rect x="14" y="41" width="92" height="6" fill="var(--line-hi)" />
      <text x="112" y="47" className="pfig__lab" fill="var(--dim)">
        diagnosis removed
      </text>

      {/* tokens streaming from the note into the model */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect
          key={i}
          className="icd__tok"
          x="112"
          y="64"
          width="7"
          height="4"
          rx="1"
          fill="var(--pink)"
          style={{ animationDelay: `${i * 0.28}s` }}
        />
      ))}

      <rect x="58" y="86" width="124" height="20" fill="rgba(45,212,191,0.08)" stroke="var(--pink)" strokeWidth="1" />
      <rect className="icd__scan" x="58" y="86" width="22" height="20" fill="rgba(45,212,191,0.16)" />
      <text x="120" y="99" className="pfig__lab" textAnchor="middle" fill="var(--ink)">
        Qwen2.5-0.5B-Instruct
      </text>
      <path d="M120 106 V120 M116 116 L120 121 L116 116" fill="none" stroke="var(--line-hi)" strokeWidth="1" />

      <text x="8" y="136" className="pfig__lab">
        answer
      </text>
      {WRONG.map((code, i) => (
        <g key={code} className="icd__code" style={{ animationDelay: `${i * 2}s` }}>
          <text x="56" y="136" className="pfig__val pfig__bad">
            {code}
          </text>
        </g>
      ))}
      <text x="106" y="136" className="pfig__val pfig__bad">
        ✗
      </text>
      <text x="8" y="152" className="pfig__lab">
        true code
      </text>
      <text x="56" y="152" className="pfig__val" fill="var(--yellow)">
        J18.9
      </text>
      <text x="8" y="168" className="pfig__lab">
        format
      </text>
      <text x="56" y="168" className="pfig__val">
        valid ✓
      </text>
    </svg>
  )
}

export function IcdFigure() {
  return (
    <Figure
      title="A note goes in, a wrong code comes out"
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

/* ------------------------------------------------ ICD-10-AM coding, Claude */

const ESSAY = ['J18', 'J96', 'I50', 'Z87', 'N17', 'Y83']

/**
 * The same note goes into a model that knows the codes. Asked plainly, it
 * writes the right code first and then five more it considered; the extractor
 * takes the last one. Under a format contract there is only one code to take.
 */
function ParseGap() {
  const chipX = (i) => 82 + i * 26
  return (
    <svg
      className="pfig__svg"
      viewBox="0 0 240 180"
      role="img"
      aria-label="A discharge summary with its diagnosis removed goes into a Claude model. Asked plainly, the model writes the correct code first and five others after it, and the extractor reads the last one. Under a strict format the model writes one code and the extractor reads it"
    >
      <rect x="8" y="8" width="224" height="42" fill="rgba(159,179,209,0.05)" stroke="var(--line)" strokeWidth="1" />
      <text x="14" y="19" className="pfig__tag">
        DISCHARGE SUMMARY
      </text>
      <rect x="14" y="24" width="170" height="3" fill="rgba(159,179,209,0.35)" />
      <rect x="14" y="30" width="200" height="3" fill="rgba(159,179,209,0.35)" />
      <rect x="14" y="36" width="92" height="6" fill="var(--line-hi)" />
      <text x="112" y="42" className="pfig__lab" fill="var(--dim)">
        diagnosis removed
      </text>
      <rect x="14" y="44" width="140" height="3" fill="rgba(159,179,209,0.35)" />

      <rect x="58" y="58" width="124" height="18" fill="rgba(45,212,191,0.08)" stroke="var(--pink)" strokeWidth="1" />
      <rect className="icd__scan" x="58" y="58" width="22" height="18" fill="rgba(45,212,191,0.16)" />
      <text x="120" y="70" className="pfig__lab" textAnchor="middle" fill="var(--ink)">
        Haiku · Sonnet · Opus
      </text>

      {/* plain question: the model writes six codes, first one right */}
      <text x="8" y="101" className="pfig__lab">
        plain question
      </text>
      {ESSAY.map((code, i) => (
        <g key={code} className="cicd__chip" style={{ animationDelay: `${0.4 + i * 0.35}s` }}>
          <rect x={chipX(i)} y="90" width="22" height="14" fill="rgba(159,179,209,0.08)" stroke="var(--line)" strokeWidth="1" />
          <text x={chipX(i) + 11} y="100" className="pfig__lab" textAnchor="middle" fill={i === 0 ? 'var(--green)' : 'var(--ink-2)'}>
            {code}
          </text>
        </g>
      ))}
      <rect className="cicd__cursor" x="80" y="88" width="26" height="18" fill="none" stroke="var(--red)" strokeWidth="1.5" />
      <text x="82" y="118" className="pfig__lab" fill="var(--red)">
        extractor takes the last: Y83 ✗
      </text>

      {/* strict format: one code, nothing to misread */}
      <text x="8" y="143" className="pfig__lab">
        strict format
      </text>
      <rect x={chipX(0)} y="132" width="22" height="14" fill="rgba(110,231,168,0.1)" stroke="var(--line)" strokeWidth="1" />
      <text x={chipX(0) + 11} y="142" className="pfig__lab" textAnchor="middle" fill="var(--green)">
        J18
      </text>
      <rect x="80" y="130" width="26" height="18" fill="none" stroke="var(--green)" strokeWidth="1.5" />
      <text x="82" y="160" className="pfig__lab" fill="var(--green)">
        extractor takes J18 ✓
      </text>

      <text x="8" y="174" className="pfig__lab" fill="var(--dim)">
        label J18, written first both times
      </text>
    </svg>
  )
}

export function ClaudeIcdFigure() {
  return (
    <Figure
      title="The model knows the code; the prompt decides whether software can read it"
      sub="Exact-match accuracy against the keyword labels on 100 held-out notes, best prompt per model"
      svg={<ParseGap />}
      caption={
        <>
          The first code each model wrote was right <b>42 to 54%</b> of the time under every strategy, the plain
          question included; that answer just carried four to thirteen codes and the extractor took the wrong one. The
          three models gave the same code on 81 of 100 notes and the keyword label agreed with them on 47, so the score
          measures agreement with a keyword rule as much as coding skill.
        </>
      }
    >
      <Row label="Claude Haiku 5.5, strict format" value="0.51" pct={0.51} />
      <Row label="Claude Sonnet 5.5, JSON output" value="0.51" pct={0.51} />
      <Row label="Claude Opus 5.5, reason then code" value="0.52" pct={0.52} />
      <Row label="Plain question, best of the three" value="0.38" pct={0.38} />
      <Row label="Qwen2.5-0.5B, any prompt" value="0.00" pct={0} bad />
    </Figure>
  )
}

/* --------------------------------------------------- FNA network vs logistic */

function TwoPaths() {
  // A nucleus is measured, then the same features run down two competing models.
  const nucleus = '0,-16 11,-12 16,-2 13,9 4,16 -7,14 -15,5 -16,-7 -9,-14'
  return (
    <svg
      className="pfig__svg"
      viewBox="0 0 240 180"
      role="img"
      aria-label="A cell nucleus is measured, the features run through logistic regression and a neural network, and both return the same answer"
    >
      <text x="8" y="14" className="pfig__tag">
        FINE NEEDLE ASPIRATE
      </text>
      <g transform="translate(40,54)">
        <polygon points={nucleus} fill="rgba(159,179,209,0.12)" stroke="var(--lilac)" strokeWidth="1.5" />
        {/* the radius sweeping round the nucleus as it is measured */}
        <g className="fna__sweep">
          <line x1="0" y1="0" x2="0" y2="-16" stroke="var(--yellow)" strokeWidth="1.5" />
          <circle cx="0" cy="-16" r="2.4" fill="var(--yellow)" />
        </g>
        <circle cx="0" cy="0" r="1.6" fill="var(--lilac)" />
      </g>

      {/* the three measurements filling as the sweep passes */}
      {[
        ['radius', 0.78, 0],
        ['texture', 0.52, 0.5],
        ['concavity', 0.66, 1],
      ].map(([name, v, d], i) => {
        const y = 36 + i * 16
        return (
          <g key={name}>
            <text x="78" y={y + 7} className="pfig__lab">
              {name}
            </text>
            <rect x="134" y={y} width="56" height="8" fill="rgba(159,179,209,0.08)" />
            <rect
              className="fna__feat"
              x="134"
              y={y}
              width={56 * v}
              height="8"
              fill="var(--lilac)"
              style={{ animationDelay: `${0.4 + d * 0.4}s`, transformOrigin: '134px center' }}
            />
          </g>
        )
      })}

      <line x1="8" y1="96" x2="232" y2="96" stroke="var(--line)" strokeDasharray="2 3" />

      {/* path one: logistic regression, drawn as its own sigmoid */}
      <text x="56" y="112" className="pfig__tag" textAnchor="middle">
        LOGISTIC
      </text>
      <rect x="14" y="116" width="84" height="40" fill="rgba(45,212,191,0.06)" stroke="var(--pink)" strokeWidth="1" />
      <path
        className="fna__curve"
        d="M20 150 C 44 150, 46 122, 92 122"
        fill="none"
        stroke="var(--pink)"
        strokeWidth="2"
      />

      {/* path two: the network, drawn as a 3-2-1 graph that fires */}
      <text x="184" y="112" className="pfig__tag" textAnchor="middle">
        NETWORK
      </text>
      <rect x="142" y="116" width="84" height="40" fill="rgba(124,196,248,0.06)" stroke="var(--lilac)" strokeWidth="1" />
      {[0, 1, 2].map((i) =>
        [0, 1].map((j) => (
          <line
            key={`${i}-${j}`}
            className="fna__edge"
            x1="156"
            y1={126 + i * 10}
            x2="184"
            y2={131 + j * 10}
            stroke="var(--lilac)"
            strokeWidth="0.8"
            style={{ animationDelay: `${1.2 + (i + j) * 0.12}s` }}
          />
        )),
      )}
      {[0, 1].map((j) => (
        <line
          key={j}
          className="fna__edge"
          x1="184"
          y1={131 + j * 10}
          x2="212"
          y2="136"
          stroke="var(--lilac)"
          strokeWidth="0.8"
          style={{ animationDelay: `${1.5 + j * 0.12}s` }}
        />
      ))}
      {[0, 1, 2].map((i) => (
        <circle key={i} cx="156" cy={126 + i * 10} r="2.6" fill="var(--lilac)" />
      ))}
      {[0, 1].map((j) => (
        <circle key={j} cx="184" cy={131 + j * 10} r="2.6" fill="var(--lilac)" />
      ))}
      <circle cx="212" cy="136" r="3" fill="var(--lilac)" />

      <text x="8" y="174" className="pfig__lab fna__verdict">
        both say malignant · ΔAUC −0.0007
      </text>
    </svg>
  )
}

export function FnaFigure() {
  return (
    <Figure
      title="Two paths from the same measurements"
      sub="Breast cytology: a tuned feedforward network against regularised logistic regression"
      svg={<TwoPaths />}
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

/* -------------------------------------------------- infant wheeze prediction */

const SOURCES = [
  ['births', 'var(--lilac)', [0]],
  ['GP', 'var(--pink)', [1, 3, 5, 8]],
  ['ED', 'var(--yellow)', [4, 10]],
]

function InfantTimeline() {
  const x0 = 54
  const span = 170
  const at = (m) => x0 + (m / 11) * span
  return (
    <svg
      className="pfig__svg"
      viewBox="0 0 240 180"
      role="img"
      aria-label="Birth, general practice and emergency department events drop onto one infant's first year, which is then scored for risk"
    >
      <text x="8" y="14" className="pfig__tag">
        ONE INFANT, FIRST YEAR
      </text>
      {SOURCES.map(([name, colour, months], row) => {
        const y = 28 + row * 22
        return (
          <g key={name}>
            <text x="8" y={y + 4} className="pfig__lab">
              {name}
            </text>
            {/* Ghosts stay put so each source row still reads once its own
                events have dropped onto the timeline. */}
            {months.map((m) => (
              <rect key={`g${m}`} x={at(m) - 2} y={y - 4} width="4" height="8" fill={colour} opacity="0.22" />
            ))}
            {months.map((m, i) => (
              <rect
                key={m}
                className="bronch__tick"
                x={at(m) - 2}
                y={y - 4}
                width="4"
                height="8"
                fill={colour}
                style={{ '--drop': `${96 - y}px`, animationDelay: `${0.3 + row * 0.5 + i * 0.22}s` }}
              />
            ))}
          </g>
        )
      })}

      {/* the assembled timeline */}
      <line x1={x0} y1="96" x2={x0 + span} y2="96" stroke="var(--line-hi)" strokeWidth="1.5" />
      {Array.from({ length: 12 }, (_, m) => (
        <line key={m} x1={at(m)} y1="93" x2={at(m)} y2="99" stroke="var(--line)" strokeWidth="1" />
      ))}
      <text x={x0} y="112" className="pfig__lab">
        birth
      </text>
      <text x={x0 + span} y="112" className="pfig__lab" textAnchor="end">
        12 months
      </text>
      <text x="8" y="100" className="pfig__lab">
        linked
      </text>

      <line x1="8" y1="124" x2="232" y2="124" stroke="var(--line)" strokeDasharray="2 3" />
      <text x="8" y="138" className="pfig__tag">
        WHEEZE OR BRONCHIOLITIS RISK
      </text>
      <rect x="8" y="144" width="224" height="12" fill="rgba(159,179,209,0.08)" />
      <rect
        className="bronch__score"
        x="8"
        y="144"
        width={224 * 0.794}
        height="12"
        fill="rgba(45,212,191,0.3)"
        style={{ transformOrigin: '8px center' }}
      />
      <rect
        className="bronch__corrected"
        x="8"
        y="144"
        width={224 * 0.757}
        height="12"
        fill="var(--pink)"
        style={{ transformOrigin: '8px center' }}
      />
      <text x="8" y="172" className="pfig__lab">
        AUC 0.794 apparent
      </text>
      <text x="124" y="172" className="pfig__val" fill="var(--yellow)">
        0.757 corrected
      </text>
    </svg>
  )
}

export function BronchFigure() {
  return (
    <Figure
      title="Assembling one infant's first year from three record systems"
      sub="Thousands of children traced through birth, general practice and emergency records"
      svg={<InfantTimeline />}
      caption={
        <>
          A thousand cluster bootstrap resamples put the optimism at <b>0.037</b>, so the honest figure is 0.757 rather
          than the apparent 0.794. Held-out validation agrees. The linked repository re-implements the whole pipeline on
          a synthetic cohort, since the study data are confidential.
        </>
      }
    >
      <Row label="Data quality issues traced back to their source dataset" value="200+" pct={0.8} />
      <Row label="Clinical features engineered from the linked record" value="40" pct={0.5} />
      <Row label="Model families compared, penalised regression selected" value="4" pct={0.4} />
      <Row label="Held-out cluster-aware validation, 95% interval" value="0.745 (0.69–0.80)" pct={0.745} />
    </Figure>
  )
}

/* ------------------------------------------------ RSV Bayesian calibration */

// Synthetic monthly notifications over three years, scaled to the largest month,
// with the modelled series at the true parameters and at the posterior mean.
// The two model curves sit almost on top of each other: that is the finding.
const RSV_OBS = [0, 0.01, 0.02, 0.11, 0.34, 0.68, 0.69, 0.21, 0.09, 0.02, 0.01, 0.01, 0.01, 0.02, 0.09, 0.32, 1, 0.89, 0.38, 0.12, 0.03, 0.01, 0, 0, 0, 0, 0.02, 0.09, 0.42, 0.75, 0.58, 0.25, 0.09, 0.02, 0.01, 0.01]
const RSV_TRUTH = [0, 0.01, 0.02, 0.09, 0.37, 0.71, 0.61, 0.25, 0.08, 0.03, 0.01, 0.01, 0.01, 0.02, 0.08, 0.35, 0.93, 0.86, 0.38, 0.11, 0.03, 0.01, 0, 0, 0, 0.01, 0.02, 0.1, 0.36, 0.76, 0.61, 0.26, 0.08, 0.02, 0.01, 0.01]
const RSV_FIT = [0, 0.01, 0.02, 0.1, 0.39, 0.76, 0.66, 0.28, 0.09, 0.03, 0.01, 0.01, 0.01, 0.03, 0.09, 0.38, 1.01, 0.97, 0.44, 0.13, 0.04, 0.01, 0, 0, 0, 0.01, 0.02, 0.11, 0.39, 0.81, 0.66, 0.29, 0.09, 0.03, 0.01, 0.01]
// Twenty draws from the recovery posterior: (R0, immunity in days).
const RSV_DRAWS = [
  [1.522, 205.4], [1.486, 197.6], [1.447, 184.9], [1.551, 214.1], [1.525, 205.3], [1.476, 192.3], [1.511, 201.3],
  [1.492, 196.0], [1.49, 194.7], [1.568, 216.7], [1.477, 194.5], [1.519, 204.8], [1.529, 206.7], [1.535, 209.4],
  [1.47, 191.4], [1.522, 206.5], [1.455, 186.2], [1.471, 189.3], [1.576, 221.0], [1.482, 194.2],
]
const RSV_TRUE = [1.6, 230]

function RecoveryTest() {
  const bx = (m) => 12 + m * 6
  const by = (v) => 78 - v * 54
  const line = (vals) => vals.map((v, m) => `${bx(m) + 2.5},${by(v)}`).join(' ')
  // Parameter plane: R0 1.2 to 2.0 across, immunity 150 to 320 days up.
  const px = (r0) => 14 + ((r0 - 1.2) / 0.8) * 90
  const py = (imm) => 166 - ((imm - 150) / 170) * 62
  return (
    <svg
      className="pfig__svg"
      viewBox="0 0 240 180"
      role="img"
      aria-label="Particles spread over a plane of R0 against immunity duration contract onto a tight cloud that sits beside the true value, while the fitted curve lands on the synthetic counts anyway"
    >
      <text x="8" y="14" className="pfig__tag">
        SYNTHETIC COUNTS, 36 MONTHS
      </text>
      {RSV_OBS.map((v, m) => (
        <rect key={m} x={bx(m)} y={by(v)} width="5" height={Math.max(0.5, 78 - by(v))} fill="rgba(159,179,209,0.35)" />
      ))}
      <line x1="12" y1="78.5" x2="228" y2="78.5" stroke="var(--line-hi)" strokeWidth="1" />
      <polyline points={line(RSV_TRUTH)} fill="none" stroke="var(--yellow)" strokeWidth="1.5" strokeDasharray="3 2" />
      <polyline
        className="rsvfit__curve"
        points={line(RSV_FIT)}
        pathLength="100"
        fill="none"
        stroke="var(--pink)"
        strokeWidth="1.5"
      />

      <line x1="8" y1="90" x2="232" y2="90" stroke="var(--line)" strokeDasharray="2 3" />

      {/* parameter plane */}
      <rect x="12" y="102" width="94" height="66" fill="rgba(45,212,191,0.05)" stroke="var(--line)" strokeWidth="1" />
      <text x="12" y="100" className="pfig__tag">
        R0 × IMMUNITY
      </text>
      <text x="106" y="176" className="pfig__lab" textAnchor="end">
        R0 2.0
      </text>
      <text x="12" y="176" className="pfig__lab">
        1.2
      </text>
      {/* the ridge both points sit on */}
      <line x1={px(1.36)} y1={py(158)} x2={px(1.72)} y2={py(266)} stroke="var(--line-hi)" strokeWidth="1" strokeDasharray="1 2" />

      {RSV_DRAWS.map(([r0, imm], i) => {
        const sx = 16 + hash(i * 7 + 1) * 86
        const sy = 106 + hash(i * 13 + 5) * 58
        return (
          <rect
            key={i}
            className="rsvfit__p"
            x={sx}
            y={sy}
            width="3"
            height="3"
            fill="var(--pink)"
            style={{ '--dx': `${(px(r0) - sx).toFixed(1)}px`, '--dy': `${(py(imm) - sy).toFixed(1)}px` }}
          />
        )
      })}
      <g stroke="var(--yellow)" strokeWidth="1.5">
        <line x1={px(RSV_TRUE[0]) - 4} y1={py(RSV_TRUE[1])} x2={px(RSV_TRUE[0]) + 4} y2={py(RSV_TRUE[1])} />
        <line x1={px(RSV_TRUE[0])} y1={py(RSV_TRUE[1]) - 4} x2={px(RSV_TRUE[0])} y2={py(RSV_TRUE[1]) + 4} />
      </g>

      {/* stage readout */}
      <text x="118" y="112" className="pfig__tag rsvfit__stage rsvfit__stage--1">
        STAGE: PRIOR
      </text>
      <text x="118" y="112" className="pfig__tag rsvfit__stage rsvfit__stage--2">
        STAGE: TEMPERING
      </text>
      <text x="118" y="112" className="pfig__tag rsvfit__stage rsvfit__stage--3">
        STAGE: POSTERIOR
      </text>

      <line x1="118" y1="124" x2="126" y2="124" stroke="var(--yellow)" strokeWidth="1.5" strokeDasharray="3 2" />
      <text x="130" y="127" className="pfig__lab">
        truth R0 1.6, 230 days
      </text>
      <line className="rsvfit__key" x1="118" y1="138" x2="126" y2="138" stroke="var(--pink)" strokeWidth="1.5" />
      <text x="130" y="141" className="pfig__lab rsvfit__key">
        posterior 1.5, 200 days
      </text>
      <text x="118" y="158" className="pfig__val rsvfit__key" fill="var(--yellow)">
        same curve
      </text>
      <text x="118" y="170" className="pfig__lab rsvfit__key">
        truth outside 95% band
      </text>
    </svg>
  )
}

export function RsvFitFigure() {
  return (
    <Figure
      title="A fit must recover known parameters before it meets real data"
      sub="Sequential Monte Carlo over the SEIRS model, tested on counts the model generated itself"
      svg={<RecoveryTest />}
      caption={
        <>
          The sampler converged tightly, and tightly in the wrong place. A lower R0 with shorter immunity reproduces the
          synthetic series almost exactly, so three years of monthly counts cannot tell the two apart, and 200 particles
          never found the over-dispersion. At these parameters the model also runs a two-year cycle, so the burn-in state
          depends on whether the burn-in is an odd or even number of years. The NSW series stays untouched until the test
          passes.
        </>
      }
    >
      <Row label="NSW months fetched" value="50 × 8 ages" pct={1} />
      <Row label="Truth inside the 95% interval" value="8 of 14" pct={8 / 14} bad />
      <Row label="R0, immunity vs truth 1.6, 230 d" value="1.50 / 200 d" pct={0.87} bad />
      <Row label="Over-dispersion, truth 20" value="6.4" pct={0.32} bad />
    </Figure>
  )
}
