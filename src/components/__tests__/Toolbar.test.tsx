import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Toolbar from '../../components/Toolbar/Toolbar'
import { useEditorStore } from '../../stores/editor-store'

describe('Toolbar', () => {
  it('should render all 9 tool buttons', () => {
    render(<Toolbar />)
    const btns = screen.getAllByRole('button')
    expect(btns.length).toBe(9)
  })

  it('should render Select tool button', () => {
    render(<Toolbar />)
    expect(screen.getByLabelText('Select (V)')).toBeInTheDocument()
  })

  it('should render Rectangle tool button', () => {
    render(<Toolbar />)
    expect(screen.getByLabelText('Rectangle (R)')).toBeInTheDocument()
  })

  it('should render Circle tool button', () => {
    render(<Toolbar />)
    expect(screen.getByLabelText('Circle (C)')).toBeInTheDocument()
  })

  it('should render Text tool button', () => {
    render(<Toolbar />)
    expect(screen.getByLabelText('Text (T)')).toBeInTheDocument()
  })

  it('should render Freehand tool button', () => {
    render(<Toolbar />)
    expect(screen.getByLabelText('Freehand (P)')).toBeInTheDocument()
  })

  it('should highlight active tool with active class', () => {
    useEditorStore.setState({ activeTool: 'rect' })
    render(<Toolbar />)
    const rectBtn = screen.getByLabelText('Rectangle (R)')
    expect(rectBtn.className).toContain('active')
  })

  it('should not highlight inactive tools', () => {
    useEditorStore.setState({ activeTool: 'rect' })
    render(<Toolbar />)
    const selectBtn = screen.getByLabelText('Select (V)')
    expect(selectBtn.className).not.toContain('active')
  })

  it('should change active tool on click', () => {
    useEditorStore.setState({ activeTool: 'select' })
    render(<Toolbar />)
    fireEvent.click(screen.getByLabelText('Circle (C)'))
    expect(useEditorStore.getState().activeTool).toBe('circle')
  })

  it('should switch tool back to select on click', () => {
    useEditorStore.setState({ activeTool: 'rect' })
    render(<Toolbar />)
    fireEvent.click(screen.getByLabelText('Select (V)'))
    expect(useEditorStore.getState().activeTool).toBe('select')
  })
})
