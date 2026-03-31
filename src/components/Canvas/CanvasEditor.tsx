import { useRef, useEffect, useCallback } from 'react'
import { useEditorStore } from '../../stores/editor-store'
import { useFileStore } from '../../stores/file-store'
import { useHistoryStore } from '../../stores/history-store'

import * as fabric from 'fabric'

export default function CanvasEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const fabricRef = useRef<fabric.Canvas | null>(null)

  const { activeTool, setActiveTool, zoom, setZoom, setSelectedObjects } = useEditorStore()
  const { activePageId, updatePageSvg, pages } = useFileStore()
  const { pushState } = useHistoryStore()

  const isDrawing = useRef(false)
  const startPoint = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const currentShape = useRef<fabric.FabricObject | null>(null)

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return

    const container = containerRef.current
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: container.clientWidth,
      height: container.clientHeight,
      backgroundColor: '#ffffff',
      selection: true,
      renderOnAddRemove: false,
      preserveObjectStacking: true
    })

    fabricRef.current = canvas

    // Selection events
    canvas.on('selection:created', () => updateSelection(canvas))
    canvas.on('selection:updated', () => updateSelection(canvas))
    canvas.on('selection:cleared', () => setSelectedObjects([]))

    // Object modified → save state
    canvas.on('object:modified', () => {
      saveCanvasState(canvas)
      updateSelection(canvas)
    })

    // Resize observer
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        canvas.setDimensions({ width, height })
        canvas.renderAll()
      }
    })
    observer.observe(container)

    // Zoom with mouse wheel
    canvas.on('mouse:wheel', (opt) => {
      const delta = opt.e.deltaY
      let newZoom = canvas.getZoom() * (0.999 ** delta)
      newZoom = Math.max(0.1, Math.min(5, newZoom))
      canvas.zoomToPoint(new fabric.Point(opt.e.offsetX, opt.e.offsetY), newZoom)
      setZoom(Math.round(newZoom * 100))
      opt.e.preventDefault()
      opt.e.stopPropagation()
    })

    // Initial state
    canvas.renderAll()
    pushState('Initial', canvas.toSVG())

    return () => {
      observer.disconnect()
      canvas.dispose()
      fabricRef.current = null
    }
  }, [])

  // Load page content when active page changes
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    const page = pages.find((p) => p.id === activePageId)
    if (page && page.svgContent) {
      fabric.loadSVGFromString(page.svgContent).then((result) => {
        canvas.clear()
        canvas.backgroundColor = '#ffffff'
        const objects = result.objects.filter(Boolean) as fabric.FabricObject[]
        objects.forEach((obj) => canvas.add(obj))
        canvas.renderAll()
      })
    } else {
      canvas.clear()
      canvas.backgroundColor = '#ffffff'
      canvas.renderAll()
    }
  }, [activePageId])

  // Handle tool changes
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    if (activeTool === 'select') {
      canvas.isDrawingMode = false
      canvas.selection = true
      canvas.defaultCursor = 'default'
      canvas.forEachObject((obj) => {
        obj.selectable = true
        obj.evented = true
      })
    } else if (activeTool === 'freehand') {
      canvas.isDrawingMode = true
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.width = 2
        canvas.freeDrawingBrush.color = '#1e1e2e'
      }
    } else {
      canvas.isDrawingMode = false
      canvas.selection = false
      canvas.defaultCursor = 'crosshair'
      canvas.forEachObject((obj) => {
        obj.selectable = false
        obj.evented = false
      })
    }
    canvas.renderAll()
  }, [activeTool])

  // Shape drawing handlers
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    const shapeTools = ['rect', 'circle', 'line', 'arrow', 'triangle', 'star', 'text']
    if (!shapeTools.includes(activeTool)) return

    const handleMouseDown = (opt: fabric.TPointerEventInfo) => {
      if (activeTool === 'select' || activeTool === 'freehand') return
      isDrawing.current = true
      const pointer = canvas.getScenePoint(opt.e)
      startPoint.current = { x: pointer.x, y: pointer.y }

      let shape: fabric.FabricObject | null = null

      if (activeTool === 'text') {
        const text = new fabric.IText('Text', {
          left: pointer.x,
          top: pointer.y,
          fontSize: 24,
          fontFamily: 'Inter, sans-serif',
          fill: '#1e1e2e'
        })
        canvas.add(text)
        canvas.setActiveObject(text)
        text.enterEditing()
        canvas.renderAll()
        saveCanvasState(canvas)
        setActiveTool('select')
        return
      }

      if (activeTool === 'rect') {
        shape = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: '#89b4fa',
          stroke: '#1e1e2e',
          strokeWidth: 2,
          strokeUniform: true
        })
      } else if (activeTool === 'circle') {
        shape = new fabric.Ellipse({
          left: pointer.x,
          top: pointer.y,
          rx: 0,
          ry: 0,
          fill: '#a6e3a1',
          stroke: '#1e1e2e',
          strokeWidth: 2,
          strokeUniform: true
        })
      } else if (activeTool === 'line') {
        shape = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          stroke: '#1e1e2e',
          strokeWidth: 2,
          strokeUniform: true
        })
      } else if (activeTool === 'arrow') {
        shape = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          stroke: '#1e1e2e',
          strokeWidth: 2,
          strokeUniform: true
        })
      } else if (activeTool === 'triangle') {
        shape = new fabric.Triangle({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: '#f9e2af',
          stroke: '#1e1e2e',
          strokeWidth: 2,
          strokeUniform: true
        })
      } else if (activeTool === 'star') {
        shape = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: '#f38ba8',
          stroke: '#1e1e2e',
          strokeWidth: 2,
          strokeUniform: true
        })
      }

      if (shape) {
        canvas.add(shape)
        currentShape.current = shape
        canvas.renderAll()
      }
    }

    const handleMouseMove = (opt: fabric.TPointerEventInfo) => {
      if (!isDrawing.current || !currentShape.current) return
      const pointer = canvas.getScenePoint(opt.e)
      const sx = startPoint.current.x
      const sy = startPoint.current.y
      const shape = currentShape.current

      if (activeTool === 'rect' || activeTool === 'triangle' || activeTool === 'star') {
        const w = Math.abs(pointer.x - sx)
        const h = Math.abs(pointer.y - sy)
        shape.set({
          left: Math.min(sx, pointer.x),
          top: Math.min(sy, pointer.y),
          width: w,
          height: h
        })
      } else if (activeTool === 'circle') {
        const rx = Math.abs(pointer.x - sx) / 2
        const ry = Math.abs(pointer.y - sy) / 2
        ;(shape as fabric.Ellipse).set({
          left: Math.min(sx, pointer.x),
          top: Math.min(sy, pointer.y),
          rx,
          ry
        })
      } else if (activeTool === 'line' || activeTool === 'arrow') {
        ;(shape as fabric.Line).set({ x2: pointer.x, y2: pointer.y })
      }

      canvas.renderAll()
    }

    const handleMouseUp = () => {
      if (!isDrawing.current) return
      isDrawing.current = false

      if (currentShape.current) {
        const shape = currentShape.current
        shape.setCoords()

        // If shape is too small, remove it
        const bounds = shape.getBoundingRect()
        if (bounds.width < 3 && bounds.height < 3) {
          canvas.remove(shape)
        }

        currentShape.current = null
        saveCanvasState(canvas)
      }

      // Switch back to select after drawing
      canvas.forEachObject((obj) => {
        obj.selectable = true
        obj.evented = true
      })
      canvas.selection = true
      canvas.defaultCursor = 'default'
      setActiveTool('select')
      canvas.renderAll()
    }

    canvas.on('mouse:down', handleMouseDown)
    canvas.on('mouse:move', handleMouseMove)
    canvas.on('mouse:up', handleMouseUp)

    return () => {
      canvas.off('mouse:down', handleMouseDown)
      canvas.off('mouse:move', handleMouseMove)
      canvas.off('mouse:up', handleMouseUp)
    }
  }, [activeTool, setActiveTool])

  function updateSelection(canvas: fabric.Canvas) {
    const active = canvas.getActiveObjects()
    const objs = active.map((obj) => ({
      id: (obj as any).id || String(canvas.getObjects().indexOf(obj)),
      type: obj.type || 'object',
      left: Math.round(obj.left || 0),
      top: Math.round(obj.top || 0),
      width: Math.round((obj.width || 0) * (obj.scaleX || 1)),
      height: Math.round((obj.height || 0) * (obj.scaleY || 1)),
      angle: Math.round(obj.angle || 0),
      fill: typeof obj.fill === 'string' ? obj.fill : '#000000',
      stroke: obj.stroke || 'none',
      strokeWidth: obj.strokeWidth || 0,
      opacity: obj.opacity ?? 1
    }))
    setSelectedObjects(objs)
  }

  function saveCanvasState(canvas: fabric.Canvas) {
    const svg = canvas.toSVG()
    updatePageSvg(activePageId, svg)
    pushState('Edit', svg)
  }

  // Expose canvas for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const canvas = fabricRef.current
      if (!canvas) return

      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return
        const active = canvas.getActiveObjects()
        active.forEach((obj) => canvas.remove(obj))
        canvas.discardActiveObject()
        canvas.renderAll()
        saveCanvasState(canvas)
      }

      // Tool shortcuts
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'v' || e.key === 'V') setActiveTool('select')
      if (e.key === 'r' || e.key === 'R') setActiveTool('rect')
      if (e.key === 'c' && !e.metaKey && !e.ctrlKey) setActiveTool('circle')
      if (e.key === 'l' || e.key === 'L') setActiveTool('line')
      if (e.key === 't' || e.key === 'T') setActiveTool('text')
      if (e.key === 'p' || e.key === 'P') setActiveTool('freehand')

      // Group
      if ((e.metaKey || e.ctrlKey) && e.key === 'g' && !e.shiftKey) {
        e.preventDefault()
        const active = canvas.getActiveObject()
        if (active && active.type === 'activeSelection') {
          const group = (active as fabric.ActiveSelection).toGroup()
          canvas.setActiveObject(group)
          canvas.renderAll()
          saveCanvasState(canvas)
        }
      }

      // Ungroup
      if ((e.metaKey || e.ctrlKey) && e.key === 'g' && e.shiftKey) {
        e.preventDefault()
        const active = canvas.getActiveObject()
        if (active && active.type === 'group') {
          const items = (active as fabric.Group).getObjects()
          ;(active as fabric.Group).destroy()
          canvas.remove(active)
          items.forEach((obj) => canvas.add(obj))
          canvas.renderAll()
          saveCanvasState(canvas)
        }
      }

      // Select All
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault()
        canvas.discardActiveObject()
        const sel = new fabric.ActiveSelection(canvas.getObjects(), { canvas })
        canvas.setActiveObject(sel)
        canvas.renderAll()
      }

      // Copy / Paste
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        const active = canvas.getActiveObject()
        if (active) {
          active.clone().then((cloned: fabric.FabricObject) => {
            ;(window as any).__svgClipboard = cloned
          })
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
        const cloned = (window as any).__svgClipboard
        if (cloned) {
          cloned.clone().then((pastedObj: fabric.FabricObject) => {
            pastedObj.set({
              left: (pastedObj.left || 0) + 20,
              top: (pastedObj.top || 0) + 20,
              evented: true
            })
            canvas.add(pastedObj)
            canvas.setActiveObject(pastedObj)
            canvas.renderAll()
            saveCanvasState(canvas)
          })
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTool, activePageId])

  // Listen for IPC menu events
  useEffect(() => {
    const api = window.electronAPI
    if (!api) return

    const unsubs = [
      api.on('menu:new-file', () => useFileStore.getState().resetFile()),
      api.on('menu:save', () => {
        const canvas = fabricRef.current
        if (!canvas) return
        const svg = canvas.toSVG()
        const { filePath } = useFileStore.getState()
        api.file.save({ content: svg, filePath: filePath || undefined }).then((res) => {
          if (res.success && res.filePath) {
            const name = res.filePath.split('/').pop() || 'Untitled'
            useFileStore.getState().setFilePath(res.filePath)
            useFileStore.getState().setFileName(name)
            useFileStore.getState().setModified(false)
          }
        })
      }),
      api.on('menu:save-as', () => {
        const canvas = fabricRef.current
        if (!canvas) return
        const svg = canvas.toSVG()
        api.file.saveAs({ content: svg }).then((res) => {
          if (res.success && res.filePath) {
            const name = res.filePath.split('/').pop() || 'Untitled'
            useFileStore.getState().setFilePath(res.filePath)
            useFileStore.getState().setFileName(name)
            useFileStore.getState().setModified(false)
          }
        })
      }),
      api.on('file:opened', (data: any) => {
        const canvas = fabricRef.current
        if (!canvas) return
        const { filePath, content } = data
        const name = filePath.split('/').pop() || 'Untitled'
        useFileStore.getState().setFilePath(filePath)
        useFileStore.getState().setFileName(name)
        useFileStore.getState().setModified(false)

        fabric.loadSVGFromString(content).then((result) => {
          canvas.clear()
          canvas.backgroundColor = '#ffffff'
          const objects = result.objects.filter(Boolean) as fabric.FabricObject[]
          objects.forEach((obj) => canvas.add(obj))
          canvas.renderAll()
          saveCanvasState(canvas)
        })
      }),
      api.on('menu:undo', () => {
        const entry = useHistoryStore.getState().undo()
        if (entry && fabricRef.current) {
          fabric.loadSVGFromString(entry.svgSnapshot).then((result) => {
            const canvas = fabricRef.current!
            canvas.clear()
            canvas.backgroundColor = '#ffffff'
            const objects = result.objects.filter(Boolean) as fabric.FabricObject[]
            objects.forEach((obj) => canvas.add(obj))
            canvas.renderAll()
          })
        }
      }),
      api.on('menu:redo', () => {
        const entry = useHistoryStore.getState().redo()
        if (entry && fabricRef.current) {
          fabric.loadSVGFromString(entry.svgSnapshot).then((result) => {
            const canvas = fabricRef.current!
            canvas.clear()
            canvas.backgroundColor = '#ffffff'
            const objects = result.objects.filter(Boolean) as fabric.FabricObject[]
            objects.forEach((obj) => canvas.add(obj))
            canvas.renderAll()
          })
        }
      }),
      api.on('menu:delete', () => {
        const canvas = fabricRef.current
        if (!canvas) return
        const active = canvas.getActiveObjects()
        active.forEach((obj) => canvas.remove(obj))
        canvas.discardActiveObject()
        canvas.renderAll()
        saveCanvasState(canvas)
      }),
      api.on('menu:zoom-in', () => {
        const canvas = fabricRef.current
        if (!canvas) return
        const newZoom = Math.min(canvas.getZoom() * 1.2, 5)
        canvas.setZoom(newZoom)
        setZoom(Math.round(newZoom * 100))
        canvas.renderAll()
      }),
      api.on('menu:zoom-out', () => {
        const canvas = fabricRef.current
        if (!canvas) return
        const newZoom = Math.max(canvas.getZoom() / 1.2, 0.1)
        canvas.setZoom(newZoom)
        setZoom(Math.round(newZoom * 100))
        canvas.renderAll()
      }),
      api.on('menu:zoom-fit', () => {
        const canvas = fabricRef.current
        if (!canvas) return
        canvas.setZoom(1)
        canvas.setViewportTransform([1, 0, 0, 1, 0, 0])
        setZoom(100)
        canvas.renderAll()
      }),
      api.on('menu:toggle-code', () => {
        useEditorStore.getState().toggleCodeEditor()
      }),
      api.on('menu:insert-shape', (shape: any) => {
        setActiveTool(shape)
      }),
      api.on('menu:group', () => {
        const canvas = fabricRef.current
        if (!canvas) return
        const active = canvas.getActiveObject()
        if (active && active.type === 'activeSelection') {
          const group = (active as fabric.ActiveSelection).toGroup()
          canvas.setActiveObject(group)
          canvas.renderAll()
          saveCanvasState(canvas)
        }
      }),
      api.on('menu:ungroup', () => {
        const canvas = fabricRef.current
        if (!canvas) return
        const active = canvas.getActiveObject()
        if (active && active.type === 'group') {
          const items = (active as fabric.Group).getObjects()
          ;(active as fabric.Group).destroy()
          canvas.remove(active)
          items.forEach((obj) => canvas.add(obj))
          canvas.renderAll()
          saveCanvasState(canvas)
        }
      }),
      api.on('menu:select-all', () => {
        const canvas = fabricRef.current
        if (!canvas) return
        canvas.discardActiveObject()
        const sel = new fabric.ActiveSelection(canvas.getObjects(), { canvas })
        canvas.setActiveObject(sel)
        canvas.renderAll()
      })
    ]

    return () => unsubs.forEach((fn) => fn?.())
  }, [])

  return (
    <div ref={containerRef} className="canvas-container">
      <canvas ref={canvasRef} />
    </div>
  )
}
