/* eslint-disable i18next/no-literal-string */
import { renderHook, act, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EdaTeam } from '../../../interfaces/EdaTeam';
import { useDeleteTeams } from './useDeleteTeams';
import { PageDialogProvider } from '../../../../../framework/PageDialogs/PageDialog';
import { FrameworkTranslationsProvider } from '../../../../../framework/useFrameworkTranslations';
import { BrowserRouter } from 'react-router-dom';

vi.mock('./useTeamColumns', () => ({
  useTeamColumns: vi.fn(() => [
    {
      header: 'Name',
      type: 'text',
      value: (item: EdaTeam) => item.name,
      modal: 'visible',
    },
  ]),
}));

vi.mock('@patternfly/react-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@patternfly/react-core')>();
  return {
    ...actual,
    Modal: ({ children, title }: { children: React.ReactNode; title: string }) => (
      <div data-testid="modal">
        <h1>{title}</h1>
        {children}
      </div>
    ),
  };
});

describe('useDeleteTeams', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <PageDialogProvider>
        <FrameworkTranslationsProvider>{children}</FrameworkTranslationsProvider>
      </PageDialogProvider>
    </BrowserRouter>
  );

  const createMockTeam = (overrides: Partial<EdaTeam> = {}): EdaTeam =>
    ({
      id: 1,
      name: 'Test Team',
      description: 'A test team',
      created: '2024-01-01T00:00:00Z',
      modified: '2024-01-01T00:00:00Z',
      ...overrides,
    }) as EdaTeam;

  it('should return a function', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteTeams(onComplete), { wrapper });

    expect(typeof result.current).toBe('function');
  });

  it('should open bulk action dialog', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteTeams(onComplete), { wrapper });

    const teams = [createMockTeam({ id: 1, name: 'Team A' })];

    act(() => {
      result.current(teams);
    });

    expect(screen.getByText('Permanently delete teams')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete teams' })).toBeInTheDocument();
  });

  it('should display team names in the dialog', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteTeams(onComplete), { wrapper });

    const teams = [
      createMockTeam({ id: 1, name: 'Team A' }),
      createMockTeam({ id: 2, name: 'Team B' }),
    ];

    act(() => {
      result.current(teams);
    });

    expect(screen.getByText('Team A')).toBeInTheDocument();
    expect(screen.getByText('Team B')).toBeInTheDocument();
  });
});
