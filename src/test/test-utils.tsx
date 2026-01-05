import { render, RenderOptions } from '@testing-library/react'
import React, { ReactElement } from 'react'

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

export * from '@testing-library/react'
export { renderWithProviders as render }
