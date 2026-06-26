/* eslint-disable i18next/no-literal-string */
import { renderHook, act, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { useDeleteCredentialTypes } from './useDeleteCredentialTypes';
import { EdaCredentialType } from '../../../interfaces/EdaCredentialType';
import { PageDialogProvider } from '../../../../../framework/PageDialogs/PageDialog';
import { FrameworkTranslationsProvider } from '../../../../../framework/useFrameworkTranslations';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { edaAPI } from '../../../common/eda-utils';
import { BrowserRouter } from 'react-router-dom';

vi.mock('./useCredentialTypesColumns', () => ({
  useCredentialTypesColumns: vi.fn(() => [
    {
      header: 'Name',
      type: 'text',
      value: (item: EdaCredentialType) => item.name,
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

const server = setupServer();

describe('useDeleteCredentialTypes', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const onComplete = vi.fn();
  const credentialTypes: EdaCredentialType[] = [
    {
      id: 1,
      name: 'Custom Type',
      managed: false,
    } as unknown as EdaCredentialType,
  ];

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <PageDialogProvider>
        <FrameworkTranslationsProvider>{children}</FrameworkTranslationsProvider>
      </PageDialogProvider>
    </BrowserRouter>
  );

  it('should open bulk action dialog', () => {
    const { result } = renderHook(() => useDeleteCredentialTypes(onComplete), { wrapper });
    act(() => {
      result.current(credentialTypes);
    });

    expect(screen.getByText('Permanently delete credential types')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete credential types' })).toBeInTheDocument();
  });

  it('should call actionFn on confirm', async () => {
    server.use(
      http.delete(edaAPI`/credential-types/1/`, () => {
        return HttpResponse.json({});
      })
    );

    const { result } = renderHook(() => useDeleteCredentialTypes(onComplete), { wrapper });
    act(() => {
      result.current(credentialTypes);
    });

    const checkbox = screen.getByRole('checkbox');
    act(() => {
      fireEvent.click(checkbox);
    });

    const submitButton = screen.getByRole('button', { name: 'Delete credential types' });
    await act(async () => {
      fireEvent.click(submitButton);
      await Promise.resolve();
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    });

    expect(onComplete).toHaveBeenCalled();
  });

  it('should show alert for managed credential types', () => {
    const managedTypes: EdaCredentialType[] = [
      {
        id: 2,
        name: 'Managed Type',
        managed: true,
      } as unknown as EdaCredentialType,
    ];

    const { result } = renderHook(() => useDeleteCredentialTypes(onComplete), { wrapper });
    act(() => {
      result.current(managedTypes);
    });

    expect(
      screen.getByText(
        '1 of the selected credential types cannot be deleted because they are read-only.'
      )
    ).toBeInTheDocument();
  });
});
