import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { PageSettingsContext } from '../PageSettings/PageSettingsProvider';
import { PageThemeSwitcher } from './PageThemeSwitcher';

describe('PageThemeSwitcher', () => {
  test('should render the moon icon button when in dark mode', () => {
    render(
      <PageSettingsContext.Provider value={[{ activeTheme: 'dark' }, vi.fn()]}>
        <PageThemeSwitcher />
      </PageSettingsContext.Provider>
    );

    expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('theme-icon')).toBeNull();
  });

  test('should render the sun icon button when in light mode', () => {
    render(
      <PageSettingsContext.Provider value={[{ activeTheme: 'light' }, vi.fn()]}>
        <PageThemeSwitcher />
      </PageSettingsContext.Provider>
    );

    expect(screen.getByTestId('theme-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('settings-icon')).toBeNull();
  });

  test('should call setSettings with light theme when clicked in dark mode', async () => {
    const user = userEvent.setup();
    const mockSetSettings = vi.fn();

    render(
      <PageSettingsContext.Provider
        value={[{ activeTheme: 'dark', theme: 'dark' }, mockSetSettings]}
      >
        <PageThemeSwitcher />
      </PageSettingsContext.Provider>
    );

    await user.click(screen.getByTestId('settings-icon'));
    expect(mockSetSettings).toHaveBeenCalledWith(expect.objectContaining({ theme: 'light' }));
  });

  test('should call setSettings with dark theme when clicked in light mode', async () => {
    const user = userEvent.setup();
    const mockSetSettings = vi.fn();

    render(
      <PageSettingsContext.Provider
        value={[{ activeTheme: 'light', theme: 'light' }, mockSetSettings]}
      >
        <PageThemeSwitcher />
      </PageSettingsContext.Provider>
    );

    await user.click(screen.getByTestId('theme-icon'));
    expect(mockSetSettings).toHaveBeenCalledWith(expect.objectContaining({ theme: 'dark' }));
  });

  test('should preserve existing settings when switching theme', async () => {
    const user = userEvent.setup();
    const mockSetSettings = vi.fn();
    const settings = {
      activeTheme: 'light' as const,
      theme: 'light' as const,
      tableLayout: 'compact' as const,
      dateFormat: 'date-time' as const,
    };

    render(
      <PageSettingsContext.Provider value={[settings, mockSetSettings]}>
        <PageThemeSwitcher />
      </PageSettingsContext.Provider>
    );

    await user.click(screen.getByTestId('theme-icon'));
    expect(mockSetSettings).toHaveBeenCalledWith(
      expect.objectContaining({ tableLayout: 'compact', dateFormat: 'date-time', theme: 'dark' })
    );
  });
});
