/* eslint-disable i18next/no-literal-string */
import { renderHook, act, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { useSelectCredentials } from './useSelectCredentials';
import { PageDialogProvider } from '../../../../../framework/PageDialogs/PageDialog';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { BrowserRouter } from 'react-router-dom';

const mockCredentials = {
  count: 2,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [
    {
      id: 1,
      name: 'Credential One',
      credential_type: { id: 1, name: 'Machine', kind: 'cloud' },
    },
    {
      id: 2,
      name: 'Credential Two',
      credential_type: { id: 2, name: 'Source Control', kind: 'scm' },
    },
  ],
};

const server = setupServer(
  http.get('*/eda-credentials/', () => HttpResponse.json(mockCredentials))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <PageDialogProvider>{children}</PageDialogProvider>
  </BrowserRouter>
);

describe('useSelectCredentials', () => {
  it('should return a function', () => {
    const { result } = renderHook(() => useSelectCredentials(), { wrapper });
    expect(typeof result.current).toBe('function');
  });

  it('should open dialog when called', async () => {
    const { result } = renderHook(() => useSelectCredentials(), { wrapper });
    const onSelect = vi.fn();

    act(() => {
      result.current(onSelect);
    });

    await waitFor(() => {
      expect(screen.getByText('Select credential')).toBeInTheDocument();
    });
  });

  it('should use custom title when provided', async () => {
    const { result } = renderHook(() => useSelectCredentials(undefined, 'Choose credentials'), {
      wrapper,
    });
    const onSelect = vi.fn();

    act(() => {
      result.current(onSelect);
    });

    await waitFor(() => {
      expect(screen.getByText('Choose credentials')).toBeInTheDocument();
    });
  });

  it('should display credentials from the API', async () => {
    const { result } = renderHook(() => useSelectCredentials(), { wrapper });
    const onSelect = vi.fn();

    act(() => {
      result.current(onSelect);
    });

    await waitFor(() => {
      expect(screen.getByText('Credential One')).toBeInTheDocument();
      expect(screen.getByText('Credential Two')).toBeInTheDocument();
    });
  });
});
