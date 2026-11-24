/**
 * Figure for the Claude ICD-10-AM prompt study: a note goes in, an essay of
 * codes comes out, and the extractor takes the last one. The strict-format
 * prompt makes the same model write one code, which the extractor reads.
 */
import { Figure, Row } from './ProjectFigures'

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
