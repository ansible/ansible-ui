import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { PageDialogProvider } from '@ansible/ansible-ui-framework/PageDialogs/PageDialog';
import { FrameworkTranslationsProvider } from '@ansible/ansible-ui-framework/useFrameworkTranslations';
import { edaAPI } from '../../common/eda-utils';
import {
  EdaDecisionEnvironment,
  EdaDecisionEnvironmentRead,
} from '../../interfaces/EdaDecisionEnvironment';
import {
  useDeleteDecisionEnvironment,
  useDeleteDecisionEnvironments,
} from './useDeleteDecisionEnvironments';

const { captured } = vi.hoisted(() => ({
  captured: {
    options: undefined as
      | {
          title?: string;
          alertPrompts?: string[];
          actionFn: (item: { id: number }, signal?: AbortSignal) => Promise<unknown>;
          onComplete?: (items: unknown[]) => void;
          items: { id: number }[];
        }
      | undefined,
  },
}));

vi.mock('../../common/useEdaBulkConfirmation', () => ({
  useEdaBulkConfirmation: () => (options: NonNullable<typeof captured.options>) => {
    captured.options = options;
    void (async () => {
      for (const item of options.items) {
        await options.actionFn(item);
      }
      options.onComplete?.(options.items);
    })();
  },
}));

const server = setupServer();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <PageDialogProvider>
      <FrameworkTranslationsProvider>{children}</FrameworkTranslationsProvider>
    </PageDialogProvider>
  </MemoryRouter>
);

describe('useDeleteDecisionEnvironments', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => {
    server.resetHandlers();
    captured.options = undefined;
  });
  afterAll(() => server.close());

  it('should delete unused decision environments without force', async () => {
    const onComplete = vi.fn();
    let deletedUrl = '';
    server.use(
      http.get(edaAPI`/activations/`, () => HttpResponse.json({ count: 0, results: [] })),
      http.delete(edaAPI`/decision-environments/1/`, ({ request }) => {
        deletedUrl = request.url;
        return HttpResponse.json({});
      })
    );

    const { result } = renderHook(() => useDeleteDecisionEnvironments(onComplete), { wrapper });
    await act(async () => {
      await result.current([{ id: 1, name: 'DE 1' } as EdaDecisionEnvironment]);
    });

    expect(captured.options?.alertPrompts ?? []).toEqual([]);
    await waitFor(() => {
      expect(deletedUrl).not.toContain('force=true');
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('should warn and force-delete decision environments that are in use', async () => {
    const onComplete = vi.fn();
    let deletedUrl = '';
    server.use(
      http.get(edaAPI`/activations/`, () =>
        HttpResponse.json({ count: 1, results: [{ id: 9, name: 'activation' }] })
      ),
      http.delete(edaAPI`/decision-environments/2/`, ({ request }) => {
        deletedUrl = request.url;
        return HttpResponse.json({});
      })
    );

    const { result } = renderHook(() => useDeleteDecisionEnvironment(onComplete), { wrapper });
    await act(async () => {
      await result.current([
        { id: 2, name: 'DE in use', image_url: 'quay.io/example' } as EdaDecisionEnvironmentRead,
      ]);
    });

    expect(captured.options?.alertPrompts?.[0]).toMatch(
      /The following decision environments are in use: DE in use/
    );
    await waitFor(() => {
      expect(deletedUrl).toContain('force=true');
      expect(onComplete).toHaveBeenCalled();
    });
  });
});
