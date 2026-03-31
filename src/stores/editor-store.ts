import { create } from 'zustand'

export type Tool =
  | 'select'
  | 'rect'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'triangle'
  | 'polygon'
  | 'star'
  | 'text'
  | 'freehand'

export interface SelectedObject {
  id: string
  type: string
  left: number
  top: number
  width: number
  height: number
  angle: number
  fill: string
  stroke: string
  strokeWidth: number
  opacity: number
  rx?: number
  ry?: number
}

export interface EditorState {
  activeTool: Tool
  selectedObjects: SelectedObject[]
  zoom: number
  showCodeEditor: boolean
  showPropertyPanel: boolean
  canvasWidth: number
  canvasHeight: number

  setActiveTool: (tool: Tool) => void
  setSelectedObjects: (objects: SelectedObject[]) => void
  setZoom: (zoom: number) => void
  toggleCodeEditor: () => void
  togglePropertyPanel: () => void
  setCanvasSize: (width: number, height: number) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  activeTool: 'select',
  selectedObjects: [],
  zoom: 100,
  showCodeEditor: false,
  showPropertyPanel: true,
  canvasWidth: 1920,
  canvasHeight: 1080,

  setActiveTool: (tool) => set({ activeTool: tool }),
  setSelectedObjects: (objects) => set({ selectedObjects: objects }),
  setZoom: (zoom) => set({ zoom: Math.max(10, Math.min(500, zoom)) }),
  toggleCodeEditor: () => set((s) => ({ showCodeEditor: !s.showCodeEditor })),
  togglePropertyPanel: () => set((s) => ({ showPropertyPanel: !s.showPropertyPanel })),
  setCanvasSize: (width, height) => set({ canvasWidth: width, canvasHeight: height })
}))
