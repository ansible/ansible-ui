/* eslint-disable i18next/no-literal-string */
import { renderHook, act, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { edaAPI } from '../../common/eda-utils';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { useCopyRulebookActivation } from './useCopyRulebookactivation';

const mockAddAlert = vi.fn();
vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    usePageAlertToaster: () => ({
      addAlert: mockAddAlert,
    }),
  };
});

const server = setupServer();

describe('useCopyRulebookActivation', () => {
  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    mockAddAlert.mockClear();
  });
  afterAll(() => server.close());

  const mockActivation = {
    id: 1,
    name: 'Test Activation',
  } as EdaRulebookActivation;

  it('should return a function', () => {
    const { result } = renderHook(() => useCopyRulebookActivation());
    expect(typeof result.current).toBe('function');
  });

  it('should post copy request and show success alert', async () => {
    server.use(
      http.post(edaAPI`/activations/1/copy/`, () => {
        return HttpResponse.json({ id: 2, name: 'Test Activation @ 12:00:00' });
      })
    );

    const { result } = renderHook(() => useCopyRulebookActivation());

    act(() => {
      result.current(mockActivation);
    });

    await waitFor(() => {
      expect(mockAddAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'success',
          title: 'Test Activation duplicated.',
        })
      );
    });
  });

  it('should show danger alert on failure', async () => {
    server.use(
      http.post(edaAPI`/activations/1/copy/`, () => {
        return new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' });
      })
    );

    const { result } = renderHook(() => useCopyRulebookActivation());

    act(() => {
      result.current(mockActivation);
    });

    await waitFor(() => {
      expect(mockAddAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'danger',
          title: 'Failed to duplicate the rulebook activation',
        })
      );
    });
  });

  it('should show permission error message on 403', async () => {
    server.use(
      http.post(edaAPI`/activations/1/copy/`, () => {
        return HttpResponse.json({ detail: 'Forbidden' }, { status: 403 });
      })
    );

    const { result } = renderHook(() => useCopyRulebookActivation());

    act(() => {
      result.current(mockActivation);
    });

    await waitFor(() => {
      expect(mockAddAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'danger',
        })
      );
    });
  });

  it('should call onComplete callback after copy', async () => {
    server.use(
      http.post(edaAPI`/activations/1/copy/`, () => {
        return HttpResponse.json({ id: 2, name: 'Copy' });
      })
    );

    const onComplete = vi.fn();
    const { result } = renderHook(() => useCopyRulebookActivation(onComplete));

    act(() => {
      result.current(mockActivation);
    });

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('should call onComplete callback even on failure', async () => {
    server.use(
      http.post(edaAPI`/activations/1/copy/`, () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const onComplete = vi.fn();
    const { result } = renderHook(() => useCopyRulebookActivation(onComplete));

    act(() => {
      result.current(mockActivation);
    });

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });
});
