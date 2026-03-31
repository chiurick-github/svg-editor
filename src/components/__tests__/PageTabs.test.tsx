import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PageTabs from '../../components/PageTabs/PageTabs'
import { useFileStore } from '../../stores/file-store'

describe('PageTabs', () => {
  beforeEach(() => {
    useFileStore.getState().resetFile()
  })

  it('should render Page 1 tab', () => {
    render(<PageTabs />)
    expect(screen.getByText('Page 1')).toBeInTheDocument()
  })

  it('should render add page button', () => {
    render(<PageTabs />)
    expect(screen.getByLabelText('Add page')).toBeInTheDocument()
  })

  it('should add a new page when + is clicked', () => {
    render(<PageTabs />)
    fireEvent.click(screen.getByLabelText('Add page'))
    expect(useFileStore.getState().pages).toHaveLength(2)
  })

  it('should show active class on current page', () => {
    render(<PageTabs />)
    const tab = screen.getByText('Page 1').closest('button')
    expect(tab?.className).toContain('active')
  })

  it('should switch active page on tab click', () => {
    useFileStore.getState().addPage()
    render(<PageTabs />)
    const pages = useFileStore.getState().pages
    const firstPageTab = screen.getByText(pages[0].name)
    fireEvent.click(firstPageTab)
    expect(useFileStore.getState().activePageId).toBe(pages[0].id)
  })

  it('should not show close button when only 1 page', () => {
    const { container } = render(<PageTabs />)
    // With only 1 page, no X buttons should be rendered
    const closeIcons = container.querySelectorAll('[data-testid="remove-page"]')
    expect(closeIcons.length).toBe(0)
  })
})
