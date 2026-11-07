/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { PageFramework } from '../PageFramework';
import { PageMastheadToggle } from '../PageMasthead/PageMasthead';
import { PageApp } from './PageApp';

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

// Page decides isMobile from the page element's clientWidth, which happy-dom
// always reports as 0. Stub it so the breakpoint is actually exercised rather
// than every viewport looking like a phone.
const originalClientWidth = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  'clientWidth'
) as PropertyDescriptor;
let viewportWidth = 1440;

Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
  configurable: true,
  get: () => viewportWidth,
});

function setViewportWidth(width: number) {
  viewportWidth = width;
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
  window.dispatchEvent(new Event('resize'));
}

function renderApp(initialEntry = '/') {
  const { container } = render(
    <PageFramework>
      <MemoryRouter initialEntries={[initialEntry]}>
        <PageApp
          masthead={<PageMastheadToggle />}
          navigation={[{ id: 'dashboard', label: 'Dashboard', path: '', element: <div /> }]}
        />
      </MemoryRouter>
    </PageFramework>
  );
  return () => container.querySelector('#page-sidebar');
}

describe('PageApp navigation sidebar', () => {
  afterEach(() => setViewportWidth(1440));
  afterAll(() => Object.defineProperty(HTMLElement.prototype, 'clientWidth', originalClientWidth));

  it('should expand the sidebar when toggled below the xl breakpoint', async () => {
    setViewportWidth(390);
    const user = userEvent.setup();
    const sidebar = renderApp();

    expect(sidebar()).toHaveClass('pf-m-collapsed');

    await user.click(screen.getByRole('button', { name: 'Global navigation' }));

    await waitFor(() => expect(sidebar()).toHaveClass('pf-m-expanded'));
    expect(sidebar()).not.toHaveClass('pf-m-collapsed');
  });

  it('should expand the sidebar at the 980px width used by mobile desktop-site mode', async () => {
    setViewportWidth(980);
    const user = userEvent.setup();
    const sidebar = renderApp();

    await user.click(screen.getByRole('button', { name: 'Global navigation' }));

    await waitFor(() => expect(sidebar()).toHaveClass('pf-m-expanded'));
  });

  it('should leave the sidebar unmodified on a desktop viewport', async () => {
    setViewportWidth(1440);
    const sidebar = renderApp();

    await waitFor(() => {
      expect(sidebar()).not.toHaveClass('pf-m-collapsed');
      expect(sidebar()).not.toHaveClass('pf-m-expanded');
    });
  });

  it('should collapse the sidebar when toggled closed on a desktop viewport', async () => {
    setViewportWidth(1440);
    const user = userEvent.setup();
    const sidebar = renderApp();

    await user.click(screen.getByRole('button', { name: 'Global navigation' }));

    await waitFor(() => expect(sidebar()).toHaveClass('pf-m-collapsed'));
  });
});

describe('PageApp unknown routes', () => {
  const backgroundToken = '--pf-t--global--background--color--primary--default';

  afterEach(() => document.documentElement.style.removeProperty(backgroundToken));

  it('should render PageNotFound on the theme background', async () => {
    // happy-dom only resolves the token when it is defined.
    document.documentElement.style.setProperty(backgroundToken, 'rgb(1, 2, 3)');
    renderApp('/does-not-exist');

    const background = await screen.findByTestId('page-not-found-background');

    expect(within(background).getByRole('heading', { name: 'Page not found' })).toBeVisible();
    expect(background).toHaveStyle({ backgroundColor: 'rgb(1, 2, 3)', overflow: 'auto' });
  });
});
