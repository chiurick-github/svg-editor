import { Plus, X } from 'lucide-react'
import { useFileStore } from '../../stores/file-store'

export default function PageTabs() {
  const { pages, activePageId, setActivePageId, addPage, removePage } = useFileStore()

  return (
    <div className="page-tabs">
      {pages.map((page) => (
        <button
          key={page.id}
          className={`page-tab ${page.id === activePageId ? 'active' : ''}`}
          onClick={() => setActivePageId(page.id)}
        >
          <span>{page.name}</span>
          {pages.length > 1 && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                opacity: 0.5,
                marginLeft: 4
              }}
              onClick={(e) => {
                e.stopPropagation()
                removePage(page.id)
              }}
            >
              <X size={10} />
            </span>
          )}
        </button>
      ))}
      <button className="page-tab-add" onClick={addPage} aria-label="Add page">
        <Plus size={14} />
      </button>
    </div>
  )
}
