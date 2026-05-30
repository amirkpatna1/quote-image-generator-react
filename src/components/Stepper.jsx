const STEPS_OLD = [
  { label: 'Upload CSV',        desc: 'Import your quotes'    },
  { label: 'Configure Style',   desc: 'Choose look & feel'    },
  { label: 'Generate & Export', desc: 'Download your images'  },
];

const STEPS_NEW = [
  { label: '📥 Media Input',       desc: 'Add quotes, videos, audio'  },
  { label: '⏱️ Composition',       desc: 'Arrange & sync timing'       },
  { label: '🎨 Design & Effects',  desc: 'Style & transitions'         },
  { label: '📦 Export',            desc: 'Review & download'           },
];

export default function Stepper({ current, useNewWorkflow = false }) {
  const STEPS = useNewWorkflow ? STEPS_NEW : STEPS_OLD;

  return (
    <div className="stepper">
      {STEPS.map((s, i) => {
        const num   = i + 1;
        const done  = current > num;
        const active = current === num;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div className={`step-item ${active ? 'active' : ''} ${done ? 'done' : ''}`}>
              <span className="step-num">
                {done ? '✓' : num}
              </span>
              <div>
                <div style={{ lineHeight: 1.2 }}>{s.label}</div>
                <div style={{ fontSize: '0.68rem', color: active ? 'var(--accent-light)' : 'var(--text-muted)', marginTop: 1 }}>
                  {s.desc}
                </div>
              </div>
            </div>
            {i < STEPS.length - 1 && <div className="step-sep" />}
          </div>
        );
      })}
    </div>
  );
}
