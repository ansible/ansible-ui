import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { PageDetails } from './PageDetails';
import { PageSettingsProvider } from '../PageSettings/PageSettingsProvider';

describe('PageDetails', () => {
  let resizeCallback: ResizeObserverCallback;

  beforeEach(() => {
    class MockResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        resizeCallback = callback;
      }
      observe = vi.fn();
      disconnect = vi.fn();
      unobserve = vi.fn();
    }
    vi.stubGlobal('ResizeObserver', MockResizeObserver);
  });

  afterEach(() => vi.unstubAllGlobals());

  const triggerResize = (width: number) => {
    const target = document.querySelector('.pf-v6-c-description-list')?.parentElement;
    if (!target) throw new Error('missing description list container');
    Object.defineProperty(target, 'clientWidth', { configurable: true, value: width });
    resizeCallback(
      [{ contentRect: { width } as DOMRectReadOnly } as ResizeObserverEntry],
      {} as ResizeObserver
    );
  };

  test('renders alert prompts and children', () => {
    render(
      <PageSettingsProvider>
        <PageDetails alertPrompts={['Warning one', 'Warning two']} disableScroll={false}>
          <div>Detail child</div>
        </PageDetails>
      </PageSettingsProvider>
    );
    expect(screen.getByTestId('Warning one')).toBeInTheDocument();
    expect(screen.getByText('Detail child')).toBeInTheDocument();
  });

  test('omits scroll wrapper when disableScroll is true', () => {
    const { container } = render(
      <PageSettingsProvider>
        <PageDetails disableScroll>
          <div>Static child</div>
        </PageDetails>
      </PageSettingsProvider>
    );
    expect(screen.getByText('Static child')).toBeInTheDocument();
    expect(container.querySelector('[class*="scrollable"]')).toBeNull();
  });

  test('handles resize for two-column layout', () => {
    render(
      <PageSettingsProvider>
        <PageDetails numberOfColumns="two">
          <div>Column child</div>
        </PageDetails>
      </PageSettingsProvider>
    );
    triggerResize(1200);
    triggerResize(400);
    expect(screen.getByText('Column child')).toBeInTheDocument();
  });

  test('forces one column for horizontal orientation', () => {
    render(
      <PageSettingsProvider>
        <PageDetails numberOfColumns="multiple" labelOrientation="horizontal">
          <div>Horizontal child</div>
        </PageDetails>
      </PageSettingsProvider>
    );
    triggerResize(2000);
    const list = document.querySelector('.pf-v6-c-description-list');
    expect(list).toHaveStyle({ gridTemplateColumns: '1fr' });
  });
});
