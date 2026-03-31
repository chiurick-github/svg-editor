import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBar from '../../components/StatusBar/StatusBar'
import { useEditorStore } from '../../stores/editor-store'
import { useFileStore } from '../../stores/file-store'

describe('StatusBar', () => {
  it('should show Ready status', () => {
    render(<StatusBar />)
    expect(screen.getByText('Ready')).toBeInTheDocument()
  })

  it('should show page count', () => {
    useFileStore.getState().resetFile()
    render(<StatusBar />)
    expect(screen.getByText('Page 1/1')).toBeInTheDocument()
  })

  it('should update page count when pages added', () => {
    useFileStore.getState().resetFile()
    useFileStore.getState().addPage()
    render(<StatusBar />)
    expect(screen.getByText(/Page \d\/2/)).toBeInTheDocument()
  })

  it('should show "No selection" when nothing selected', () => {
    useEditorStore.setState({ selectedObjects: [] })
    render(<StatusBar />)
    expect(screen.getByText('No selection')).toBeInTheDocument()
  })

  it('should show selection count', () => {
    useEditorStore.setState({
      selectedObjects: [
        { id: '1', type: 'rect', left: 0, top: 0, width: 10, height: 10, angle: 0, fill: '#f00', stroke: '#000', strokeWidth: 1, opacity: 1 },
        { id: '2', type: 'circle', left: 0, top: 0, width: 10, height: 10, angle: 0, fill: '#0f0', stroke: '#000', strokeWidth: 1, opacity: 1 }
      ]
    })
    render(<StatusBar />)
    expect(screen.getByText('2 objects selected')).toBeInTheDocument()
  })

  it('should show zoom level', () => {
    useEditorStore.setState({ zoom: 150 })
    render(<StatusBar />)
    expect(screen.getByText('150%')).toBeInTheDocument()
  })
})
