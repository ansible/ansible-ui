/* eslint-disable i18next/no-literal-string */
import { renderHook, act, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { useDeleteCredentials } from './useDeleteCredentials';
import { PageDialogProvider } from '../../../../../framework/PageDialogs/PageDialog';
import { FrameworkTranslationsProvider } from '../../../../../framework/useFrameworkTranslations';
import { BrowserRouter } from 'react-router-dom';

vi.mock('./useCredentialColumns', () => ({
  useCredentialColumns: vi.fn(() => [
    {
      header: 'Name',
      type: 'text',
      value: (item: EdaCredential) => item.name,
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

const server = setupServer(
  http.get('*/eda-credentials/*', () => HttpResponse.json({ id: 1, name: 'Cred', references: [] }))
);

describe('useDeleteCredentials', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <PageDialogProvider>
        <FrameworkTranslationsProvider>{children}</FrameworkTranslationsProvider>
      </PageDialogProvider>
    </BrowserRouter>
  );

  const createMockCredential = (overrides: Partial<EdaCredential> = {}): EdaCredential =>
    ({
      id: 1,
      name: 'Test Credential',
      description: 'A test credential',
      credential_type: { id: 1, name: 'Source Control', managed: true },
      managed: false,
      created_at: '2024-01-01T00:00:00Z',
      modified_at: '2024-01-01T00:00:00Z',
      ...overrides,
    }) as EdaCredential;

  it('should return a function', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteCredentials(onComplete), { wrapper });

    expect(typeof result.current).toBe('function');
  });

  it('should open bulk action dialog', async () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteCredentials(onComplete), { wrapper });

    const credentials = [createMockCredential({ id: 1, name: 'Cred A' })];

    await act(async () => {
      await result.current(credentials);
    });

    await waitFor(() => {
      expect(screen.getByText('Permanently delete credentials')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Delete credentials' })).toBeInTheDocument();
  });

  it('should work without onComplete callback', () => {
    const { result } = renderHook(() => useDeleteCredentials(), { wrapper });

    expect(typeof result.current).toBe('function');
  });
});
