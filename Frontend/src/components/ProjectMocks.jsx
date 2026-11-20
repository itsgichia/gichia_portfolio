// Simplified interface sketches for project cards that have no screenshot yet.
// They show the real features of each app with placeholder shapes, not real data.

function Frame({ label, children }) {
  return (
    <figure className="mock" aria-label={`Illustration of ${label}`}>
      <div className="mock__bar" aria-hidden="true">
        <i />
        <i />
        <i />
        <span>{label}</span>
      </div>
      <div className="mock__body" aria-hidden="true">
        {children}
      </div>
    </figure>
  )
}

export function RhipMock() {
  return (
    <Frame label="Challenge Board">
      <div className="mock__post">
        <b className="sk sk--60" />
        <b className="sk sk--90 sk--thin" />
        <b className="sk sk--75 sk--thin" />
      </div>
      <p className="mock__label">Top 3 matches</p>
      {[82, 68, 55].map((w) => (
        <div className="mock__row" key={w}>
          <span className="mock__avatar" />
          <div>
            <b className="sk sk--45" />
            <b className="sk sk--70 sk--thin" />
          </div>
          <span className="mock__meter">
            <i style={{ width: `${w}%` }} />
          </span>
          <span className="mock__btn">Send intro</span>
        </div>
      ))}
    </Frame>
  )
}

export function AnzhfrMock() {
  const bars = [38, 62, 85, 70, 48, 30]
  return (
    <Frame label="Cohort dashboard">
      <div className="mock__chips">
        {['Age', 'Sex', 'Fracture type', 'ASA score', 'Hospital', '30-day mortality'].map((c) => (
          <span key={c}>{c}</span>
        ))}
        <span className="mock__toggle">AND / OR</span>
      </div>
      <div className="mock__grid">
        <div className="mock__panel">
          <b className="sk sk--45 sk--thin" />
          <div className="mock__bars">
            {bars.map((h, i) => (
              <i key={i} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="mock__panel">
          <b className="sk sk--60 sk--thin" />
          <div className="mock__donut" />
        </div>
      </div>
      <div className="mock__saved">
        <span>Saved cohort A</span>
        <span>Saved cohort B</span>
        <span className="mock__btn">Compare</span>
      </div>
    </Frame>
  )
}
