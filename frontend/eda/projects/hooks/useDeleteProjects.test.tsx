/* eslint-disable i18next/no-literal-string */
import { renderHook, act, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EdaProject } from '../../interfaces/EdaProject';
import { useDeleteProjects } from './useDeleteProjects';
import { PageDialogProvider } from '../../../../framework/PageDialogs/PageDialog';
import { FrameworkTranslationsProvider } from '../../../../framework/useFrameworkTranslations';
import { BrowserRouter } from 'react-router-dom';

vi.mock('./useProjectColumns', () => ({
  useProjectColumns: vi.fn(() => [
    {
      header: 'Name',
      type: 'text',
      value: (item: EdaProject) => item.name,
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

describe('useDeleteProjects', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <PageDialogProvider>
        <FrameworkTranslationsProvider>{children}</FrameworkTranslationsProvider>
      </PageDialogProvider>
    </BrowserRouter>
  );

  const createMockProject = (overrides: Partial<EdaProject> = {}): EdaProject =>
    ({
      id: 1,
      name: 'Test Project',
      description: 'A test project',
      url: 'https://github.com/test/repo',
      import_state: 'completed',
      update_revision_on_launch: false,
      scm_update_cache_timeout: 0,
      ...overrides,
    }) as EdaProject;

  it('should return a function', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteProjects(onComplete), { wrapper });

    expect(typeof result.current).toBe('function');
  });

  it('should open bulk action dialog', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteProjects(onComplete), { wrapper });

    const projects = [createMockProject({ id: 1, name: 'Project A' })];

    act(() => {
      result.current(projects);
    });

    expect(screen.getByText('Permanently delete projects')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete projects' })).toBeInTheDocument();
  });

  it('should display project names in the dialog', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteProjects(onComplete), { wrapper });

    const projects = [
      createMockProject({ id: 1, name: 'Project A' }),
      createMockProject({ id: 2, name: 'Project B' }),
    ];

    act(() => {
      result.current(projects);
    });

    expect(screen.getByText('Project A')).toBeInTheDocument();
    expect(screen.getByText('Project B')).toBeInTheDocument();
  });
});
