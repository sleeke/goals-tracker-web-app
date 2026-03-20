import { render, type RenderOptions } from '@testing-library/react'
import { type ReactElement } from 'react'

/**
 * Custom render function for testing React components
 * Wraps component with any necessary providers (Redux, Context, etc.)
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  // TODO: Add Redux provider, Theme provider, etc. when initialized
  return render(ui, { ...options })
}

// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react'
export { renderWithProviders as render }
