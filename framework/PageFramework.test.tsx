/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { PageFramework } from './PageFramework';

Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('PageFramework', () => {
  test('should render children', () => {
    render(
      <PageFramework>
        <div data-testid="child">Hello</div>
      </PageFramework>
    );
    expect(screen.getByTestId('child')).toHaveTextContent('Hello');
  });

  test('should pass disableThemeManagement to PageSettingsProvider', () => {
    render(
      <PageFramework disableThemeManagement>
        <div data-testid="child">Hello</div>
      </PageFramework>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(document.documentElement.classList.contains('pf-v6-theme-dark')).toBe(false);
  });
});
