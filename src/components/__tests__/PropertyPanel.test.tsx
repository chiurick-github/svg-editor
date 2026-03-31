import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PropertyPanel from '../../components/PropertyPanel/PropertyPanel'
import { useEditorStore } from '../../stores/editor-store'

describe('PropertyPanel', () => {
  it('should show "No object selected" when nothing is selected', () => {
    useEditorStore.setState({ selectedObjects: [] })
    render(<PropertyPanel />)
    expect(screen.getByText('No object selected')).toBeInTheDocument()
  })

  it('should show guidance text when nothing selected', () => {
    useEditorStore.setState({ selectedObjects: [] })
    render(<PropertyPanel />)
    expect(screen.getByText(/Select an object/)).toBeInTheDocument()
  })

  it('should show count when multiple objects selected', () => {
    useEditorStore.setState({
      selectedObjects: [
        { id: '1', type: 'rect', left: 0, top: 0, width: 10, height: 10, angle: 0, fill: '#f00', stroke: '#000', strokeWidth: 1, opacity: 1 },
        { id: '2', type: 'circle', left: 0, top: 0, width: 20, height: 20, angle: 0, fill: '#0f0', stroke: '#000', strokeWidth: 1, opacity: 1 }
      ]
    })
    render(<PropertyPanel />)
    expect(screen.getByText('2 objects selected')).toBeInTheDocument()
  })

  it('should show object type when single object selected', () => {
    useEditorStore.setState({
      selectedObjects: [{
        id: '1', type: 'rect', left: 50, top: 100,
        width: 200, height: 150, angle: 45,
        fill: '#ff0000', stroke: '#000000', strokeWidth: 2, opacity: 0.8
      }]
    })
    render(<PropertyPanel />)
    expect(screen.getByText('rect')).toBeInTheDocument()
  })

  it('should show PROPERTIES header', () => {
    useEditorStore.setState({ selectedObjects: [] })
    render(<PropertyPanel />)
    expect(screen.getByText('Properties')).toBeInTheDocument()
  })

  it('should show transform values for single selection', () => {
    useEditorStore.setState({
      selectedObjects: [{
        id: '1', type: 'rect', left: 50, top: 100,
        width: 200, height: 150, angle: 45,
        fill: '#ff0000', stroke: '#000000', strokeWidth: 2, opacity: 0.8
      }]
    })
    render(<PropertyPanel />)
    // Check position values exist as inputs
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs.length).toBeGreaterThan(0)
  })
})
