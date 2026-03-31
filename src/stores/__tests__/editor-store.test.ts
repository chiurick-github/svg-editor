import { describe, it, expect, beforeEach } from 'vitest'
import { useEditorStore } from '../editor-store'

describe('EditorStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useEditorStore.setState({
      activeTool: 'select',
      selectedObjects: [],
      zoom: 100,
      showCodeEditor: false,
      showPropertyPanel: true,
      canvasWidth: 1920,
      canvasHeight: 1080
    })
  })

  describe('initial state', () => {
    it('should have select as the default tool', () => {
      const { activeTool } = useEditorStore.getState()
      expect(activeTool).toBe('select')
    })

    it('should have no selected objects', () => {
      const { selectedObjects } = useEditorStore.getState()
      expect(selectedObjects).toEqual([])
    })

    it('should have zoom at 100%', () => {
      const { zoom } = useEditorStore.getState()
      expect(zoom).toBe(100)
    })

    it('should have code editor hidden', () => {
      const { showCodeEditor } = useEditorStore.getState()
      expect(showCodeEditor).toBe(false)
    })

    it('should have property panel visible', () => {
      const { showPropertyPanel } = useEditorStore.getState()
      expect(showPropertyPanel).toBe(true)
    })

    it('should have default canvas size 1920x1080', () => {
      const { canvasWidth, canvasHeight } = useEditorStore.getState()
      expect(canvasWidth).toBe(1920)
      expect(canvasHeight).toBe(1080)
    })
  })

  describe('setActiveTool', () => {
    it('should switch to rect tool', () => {
      useEditorStore.getState().setActiveTool('rect')
      expect(useEditorStore.getState().activeTool).toBe('rect')
    })

    it('should switch to circle tool', () => {
      useEditorStore.getState().setActiveTool('circle')
      expect(useEditorStore.getState().activeTool).toBe('circle')
    })

    it('should switch to freehand tool', () => {
      useEditorStore.getState().setActiveTool('freehand')
      expect(useEditorStore.getState().activeTool).toBe('freehand')
    })

    it('should switch to text tool', () => {
      useEditorStore.getState().setActiveTool('text')
      expect(useEditorStore.getState().activeTool).toBe('text')
    })

    it('should switch back to select', () => {
      useEditorStore.getState().setActiveTool('rect')
      useEditorStore.getState().setActiveTool('select')
      expect(useEditorStore.getState().activeTool).toBe('select')
    })
  })

  describe('setZoom', () => {
    it('should set zoom level', () => {
      useEditorStore.getState().setZoom(150)
      expect(useEditorStore.getState().zoom).toBe(150)
    })

    it('should clamp zoom to minimum 10', () => {
      useEditorStore.getState().setZoom(5)
      expect(useEditorStore.getState().zoom).toBe(10)
    })

    it('should clamp zoom to maximum 500', () => {
      useEditorStore.getState().setZoom(600)
      expect(useEditorStore.getState().zoom).toBe(500)
    })

    it('should handle boundary value 10', () => {
      useEditorStore.getState().setZoom(10)
      expect(useEditorStore.getState().zoom).toBe(10)
    })

    it('should handle boundary value 500', () => {
      useEditorStore.getState().setZoom(500)
      expect(useEditorStore.getState().zoom).toBe(500)
    })
  })

  describe('toggleCodeEditor', () => {
    it('should toggle code editor on', () => {
      useEditorStore.getState().toggleCodeEditor()
      expect(useEditorStore.getState().showCodeEditor).toBe(true)
    })

    it('should toggle code editor off', () => {
      useEditorStore.getState().toggleCodeEditor()
      useEditorStore.getState().toggleCodeEditor()
      expect(useEditorStore.getState().showCodeEditor).toBe(false)
    })
  })

  describe('togglePropertyPanel', () => {
    it('should toggle property panel off', () => {
      useEditorStore.getState().togglePropertyPanel()
      expect(useEditorStore.getState().showPropertyPanel).toBe(false)
    })

    it('should toggle property panel on', () => {
      useEditorStore.getState().togglePropertyPanel()
      useEditorStore.getState().togglePropertyPanel()
      expect(useEditorStore.getState().showPropertyPanel).toBe(true)
    })
  })

  describe('setSelectedObjects', () => {
    it('should set selected objects', () => {
      const objs = [{
        id: '1', type: 'rect', left: 10, top: 20,
        width: 100, height: 50, angle: 0,
        fill: '#ff0000', stroke: '#000', strokeWidth: 2, opacity: 1
      }]
      useEditorStore.getState().setSelectedObjects(objs)
      expect(useEditorStore.getState().selectedObjects).toHaveLength(1)
      expect(useEditorStore.getState().selectedObjects[0].type).toBe('rect')
    })

    it('should clear selected objects', () => {
      useEditorStore.getState().setSelectedObjects([{
        id: '1', type: 'rect', left: 0, top: 0,
        width: 10, height: 10, angle: 0,
        fill: '#fff', stroke: 'none', strokeWidth: 0, opacity: 1
      }])
      useEditorStore.getState().setSelectedObjects([])
      expect(useEditorStore.getState().selectedObjects).toEqual([])
    })
  })

  describe('setCanvasSize', () => {
    it('should update canvas dimensions', () => {
      useEditorStore.getState().setCanvasSize(800, 600)
      const { canvasWidth, canvasHeight } = useEditorStore.getState()
      expect(canvasWidth).toBe(800)
      expect(canvasHeight).toBe(600)
    })
  })
})
