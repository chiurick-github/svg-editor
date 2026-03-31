import { useEditorStore } from '../../stores/editor-store'

export default function PropertyPanel() {
  const { selectedObjects } = useEditorStore()
  const obj = selectedObjects.length === 1 ? selectedObjects[0] : null

  if (selectedObjects.length === 0) {
    return (
      <div className="panel">
        <div className="panel-header">Properties</div>
        <div className="panel-section" style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: 40 }}>
          <p style={{ fontSize: 'var(--text-sm)' }}>No object selected</p>
          <p style={{ fontSize: 'var(--text-xs)', marginTop: 8 }}>
            Select an object on the canvas to view its properties
          </p>
        </div>
      </div>
    )
  }

  if (selectedObjects.length > 1) {
    return (
      <div className="panel">
        <div className="panel-header">Properties</div>
        <div className="panel-section" style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: 40 }}>
          <p style={{ fontSize: 'var(--text-sm)' }}>{selectedObjects.length} objects selected</p>
        </div>
      </div>
    )
  }

  return (
    <div className="panel">
      <div className="panel-header">Properties</div>

      {/* Object Type */}
      <div className="panel-section">
        <div className="panel-section-title">Object</div>
        <div className="prop-row">
          <span className="prop-label">Type</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
            {obj?.type}
          </span>
        </div>
      </div>

      {/* Transform */}
      <div className="panel-section">
        <div className="panel-section-title">Transform</div>
        <div className="prop-row">
          <span className="prop-label">X</span>
          <input className="prop-input" type="number" value={obj?.left ?? 0} readOnly />
          <span className="prop-label">Y</span>
          <input className="prop-input" type="number" value={obj?.top ?? 0} readOnly />
        </div>
        <div className="prop-row">
          <span className="prop-label">W</span>
          <input className="prop-input" type="number" value={obj?.width ?? 0} readOnly />
          <span className="prop-label">H</span>
          <input className="prop-input" type="number" value={obj?.height ?? 0} readOnly />
        </div>
        <div className="prop-row">
          <span className="prop-label">R</span>
          <input className="prop-input" type="number" value={obj?.angle ?? 0} readOnly />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>deg</span>
        </div>
      </div>

      {/* Appearance */}
      <div className="panel-section">
        <div className="panel-section-title">Appearance</div>
        <div className="prop-row">
          <span className="prop-label">Fill</span>
          <div className="color-swatch">
            <div className="color-swatch-color" style={{ background: obj?.fill || 'transparent' }} />
          </div>
          <input
            className="prop-input"
            type="text"
            value={obj?.fill ?? 'none'}
            readOnly
            style={{ fontFamily: 'var(--font-mono)' }}
          />
        </div>
        <div className="prop-row">
          <span className="prop-label">Strk</span>
          <div className="color-swatch">
            <div className="color-swatch-color" style={{ background: obj?.stroke || 'transparent' }} />
          </div>
          <input
            className="prop-input"
            type="text"
            value={obj?.stroke ?? 'none'}
            readOnly
            style={{ fontFamily: 'var(--font-mono)' }}
          />
        </div>
        <div className="prop-row">
          <span className="prop-label">SW</span>
          <input className="prop-input" type="number" value={obj?.strokeWidth ?? 0} readOnly />
        </div>
        <div className="prop-row">
          <span className="prop-label">Op</span>
          <input
            className="prop-input"
            type="number"
            value={Math.round((obj?.opacity ?? 1) * 100)}
            readOnly
          />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>%</span>
        </div>
      </div>
    </div>
  )
}
