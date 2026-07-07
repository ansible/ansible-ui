/* eslint-disable i18next/no-literal-string */
import { renderHook, act, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EdaOrganization } from '../../../interfaces/EdaOrganization';
import { useDeleteOrganizations } from './useDeleteOrganizations';
import { PageDialogProvider } from '../../../../../framework/PageDialogs/PageDialog';
import { FrameworkTranslationsProvider } from '../../../../../framework/useFrameworkTranslations';
import { BrowserRouter } from 'react-router-dom';

vi.mock('./useOrganizationColumns', () => ({
  useOrganizationColumns: vi.fn(() => [
    {
      header: 'Name',
      type: 'text',
      value: (item: EdaOrganization) => item.name,
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

describe('useDeleteOrganizations', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <PageDialogProvider>
        <FrameworkTranslationsProvider>{children}</FrameworkTranslationsProvider>
      </PageDialogProvider>
    </BrowserRouter>
  );

  const createMockOrganization = (overrides: Partial<EdaOrganization> = {}): EdaOrganization =>
    ({
      id: 1,
      name: 'Test Organization',
      description: 'A test organization',
      created: '2024-01-01T00:00:00Z',
      modified: '2024-01-01T00:00:00Z',
      ...overrides,
    }) as EdaOrganization;

  it('should return a function', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteOrganizations(onComplete), { wrapper });

    expect(typeof result.current).toBe('function');
  });

  it('should open bulk action dialog', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteOrganizations(onComplete), { wrapper });

    const orgs = [createMockOrganization({ id: 1, name: 'Org A' })];

    act(() => {
      result.current(orgs);
    });

    expect(screen.getByText('Permanently delete organizations')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete organizations' })).toBeInTheDocument();
  });

  it('should display organization names in the dialog', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteOrganizations(onComplete), { wrapper });

    const orgs = [
      createMockOrganization({ id: 1, name: 'Org A' }),
      createMockOrganization({ id: 2, name: 'Org B' }),
    ];

    act(() => {
      result.current(orgs);
    });

    expect(screen.getByText('Org A')).toBeInTheDocument();
    expect(screen.getByText('Org B')).toBeInTheDocument();
  });
});
