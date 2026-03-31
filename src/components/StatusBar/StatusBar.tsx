import { useEditorStore } from '../../stores/editor-store'
import { useFileStore } from '../../stores/file-store'
import { useHistoryStore } from '../../stores/history-store'

export default function StatusBar() {
  const { zoom, selectedObjects } = useEditorStore()
  const { pages, activePageId } = useFileStore()
  const { canUndo, canRedo } = useHistoryStore()

  const activePage = pages.find((p) => p.id === activePageId)
  const pageIndex = pages.findIndex((p) => p.id === activePageId) + 1

  return (
    <div className="statusbar">
      <div className="statusbar-item">
        <span style={{ color: 'var(--success)' }}>●</span>
        Ready
      </div>
      <div className="statusbar-separator" />
      <div className="statusbar-item">
        Page {pageIndex}/{pages.length}
      </div>
      <div className="statusbar-separator" />
      <div className="statusbar-item">
        {selectedObjects.length > 0
          ? `${selectedObjects.length} object${selectedObjects.length > 1 ? 's' : ''} selected`
          : 'No selection'}
      </div>
      <div className="statusbar-separator" />
      <div className="statusbar-item" style={{ fontFamily: 'var(--font-mono)' }}>
        {canUndo() ? '↩' : ''} {canRedo() ? '↪' : ''}
      </div>
      <div className="statusbar-spacer" />
      <div className="statusbar-item" style={{ fontFamily: 'var(--font-mono)' }}>
        {zoom}%
      </div>
    </div>
  )
}
