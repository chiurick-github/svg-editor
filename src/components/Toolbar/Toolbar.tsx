import {
  MousePointer2,
  Square,
  Circle,
  Minus,
  MoveRight,
  Triangle,
  Star,
  Type,
  Pencil
} from 'lucide-react'
import { useEditorStore, Tool } from '../../stores/editor-store'

interface ToolDef {
  id: Tool
  icon: React.ReactNode
  label: string
  group: number
}

const tools: ToolDef[] = [
  { id: 'select', icon: <MousePointer2 size={18} />, label: 'Select (V)', group: 0 },
  { id: 'rect', icon: <Square size={18} />, label: 'Rectangle (R)', group: 1 },
  { id: 'circle', icon: <Circle size={18} />, label: 'Circle (C)', group: 1 },
  { id: 'triangle', icon: <Triangle size={18} />, label: 'Triangle', group: 1 },
  { id: 'star', icon: <Star size={18} />, label: 'Star', group: 1 },
  { id: 'line', icon: <Minus size={18} />, label: 'Line (L)', group: 2 },
  { id: 'arrow', icon: <MoveRight size={18} />, label: 'Arrow', group: 2 },
  { id: 'text', icon: <Type size={18} />, label: 'Text (T)', group: 3 },
  { id: 'freehand', icon: <Pencil size={18} />, label: 'Freehand (P)', group: 3 }
]

export default function Toolbar() {
  const { activeTool, setActiveTool } = useEditorStore()

  let lastGroup = -1

  return (
    <div className="toolbar">
      {tools.map((tool) => {
        const showSep = lastGroup !== -1 && tool.group !== lastGroup
        lastGroup = tool.group
        return (
          <div key={tool.id}>
            {showSep && <div className="toolbar-separator" />}
            <button
              className={`tool-btn ${activeTool === tool.id ? 'active' : ''}`}
              onClick={() => setActiveTool(tool.id)}
              aria-label={tool.label}
            >
              {tool.icon}
              <span className="tooltip">{tool.label}</span>
            </button>
          </div>
        )
      })}
    </div>
  )
}
