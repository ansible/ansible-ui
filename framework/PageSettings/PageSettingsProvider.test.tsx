import { act, renderHook, render, screen } from '@testing-library/react';
import { ReactNode, useContext } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  PageSettingsContext,
  PageSettingsProvider,
  usePageSettings,
  IPageSettings,
} from './PageSettingsProvider';

afterEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('pf-v6-theme-dark');
});

function createWrapper(defaultRefreshInterval = 30) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <PageSettingsProvider defaultRefreshInterval={defaultRefreshInterval}>
        {children}
      </PageSettingsProvider>
    );
  }
  return Wrapper;
}

function usePageSettingsContext() {
  return useContext(PageSettingsContext);
}

describe('PageSettingsProvider', () => {
  test('should provide default settings', () => {
    const { result } = renderHook(() => usePageSettings(), {
      wrapper: createWrapper(),
    });

    expect(result.current.refreshInterval).toBe(30);
    expect(result.current.theme).toBe('system');
    expect(result.current.tableLayout).toBe('comfortable');
    expect(result.current.formColumns).toBe('multiple');
    expect(result.current.formLayout).toBe('vertical');
    expect(result.current.dateFormat).toBe('date-time');
    expect(result.current.dataEditorFormat).toBe('yaml');
  });

  test('should restore settings from localStorage', () => {
    localStorage.setItem(
      'user-preferences',
      JSON.stringify({ refreshInterval: 60, theme: 'dark' })
    );

    const { result } = renderHook(() => usePageSettings(), {
      wrapper: createWrapper(),
    });

    expect(result.current.refreshInterval).toBe(60);
    expect(result.current.theme).toBe('dark');
  });

  test('should handle invalid JSON in localStorage gracefully', () => {
    localStorage.setItem('user-preferences', 'not-valid-json');

    const { result } = renderHook(() => usePageSettings(), {
      wrapper: createWrapper(),
    });

    expect(result.current.refreshInterval).toBe(30);
  });

  test('should render children', () => {
    render(
      <PageSettingsProvider defaultRefreshInterval={30}>
        <div data-testid="child" />
      </PageSettingsProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  test('should apply light activeTheme when system prefers light', () => {
    vi.spyOn(globalThis, 'matchMedia').mockReturnValue({ matches: false } as MediaQueryList);

    const { result } = renderHook(() => usePageSettings(), {
      wrapper: createWrapper(),
    });

    expect(result.current.activeTheme).toBe('light');
    expect(document.documentElement.classList.contains('pf-v6-theme-dark')).toBe(false);
  });

  test('should apply dark activeTheme and CSS class when system prefers dark', () => {
    vi.spyOn(globalThis, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList);

    const { result } = renderHook(() => usePageSettings(), {
      wrapper: createWrapper(),
    });

    expect(result.current.activeTheme).toBe('dark');
    expect(document.documentElement.classList.contains('pf-v6-theme-dark')).toBe(true);
  });

  test('should use explicit light theme over system dark preference', () => {
    vi.spyOn(globalThis, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList);
    localStorage.setItem('user-preferences', JSON.stringify({ theme: 'light' }));

    const { result } = renderHook(() => usePageSettings(), {
      wrapper: createWrapper(),
    });

    expect(result.current.activeTheme).toBe('light');
  });

  test('should use explicit dark theme over system light preference', () => {
    vi.spyOn(globalThis, 'matchMedia').mockReturnValue({ matches: false } as MediaQueryList);
    localStorage.setItem('user-preferences', JSON.stringify({ theme: 'dark' }));

    const { result } = renderHook(() => usePageSettings(), {
      wrapper: createWrapper(),
    });

    expect(result.current.activeTheme).toBe('dark');
    expect(document.documentElement.classList.contains('pf-v6-theme-dark')).toBe(true);
  });

  test('should disable SWR refresh when refreshInterval is 0', () => {
    localStorage.setItem('user-preferences', JSON.stringify({ refreshInterval: 0 }));

    const { result } = renderHook(() => usePageSettings(), {
      wrapper: createWrapper(),
    });

    expect(result.current.refreshInterval).toBe(0);
  });

  test('should persist settings to localStorage when setSettings is called', () => {
    const { result } = renderHook(() => usePageSettingsContext(), {
      wrapper: createWrapper(),
    });

    const [currentSettings, setSettings] = result.current;

    act(() => {
      setSettings({ ...currentSettings, refreshInterval: 60 } as IPageSettings);
    });

    const stored = JSON.parse(localStorage.getItem('user-preferences') ?? '{}') as IPageSettings;
    expect(stored.refreshInterval).toBe(60);
    expect(result.current[0].refreshInterval).toBe(60);
  });
});
