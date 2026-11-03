/* eslint-disable i18next/no-literal-string */
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { PageDialogProvider } from '@ansible/ansible-ui-framework/PageDialogs/PageDialog';
import { FrameworkTranslationsProvider } from '@ansible/ansible-ui-framework/useFrameworkTranslations';
import { edaAPI } from '../../common/eda-utils';
import { EdaEventStream } from '../../interfaces/EdaEventStream';
import { useDisableEventStreams } from './useDisableEventStreams';

const { captured } = vi.hoisted(() => ({
  captured: {
    options: undefined as
      | {
          title?: string;
          actionFn: (item: EdaEventStream) => Promise<unknown>;
          onComplete?: (items: EdaEventStream[]) => void;
          items: EdaEventStream[];
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

describe('useDisableEventStreams', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => {
    server.resetHandlers();
    captured.options = undefined;
  });
  afterAll(() => server.close());

  it('should open a confirmation dialog and patch test_mode on confirm', async () => {
    const onComplete = vi.fn();
    let patchedBody: unknown;
    server.use(
      http.patch(edaAPI`/event-streams/1/`, async ({ request }) => {
        patchedBody = await request.json();
        return HttpResponse.json({});
      })
    );

    const { result } = renderHook(() => useDisableEventStreams(onComplete), { wrapper });
    act(() => {
      result.current([{ id: 1, name: 'Stream 1' } as EdaEventStream]);
    });

    expect(captured.options?.title).toBe('Disable forwarding of events?');
    await waitFor(() => {
      expect(patchedBody).toEqual({ test_mode: true });
      expect(onComplete).toHaveBeenCalled();
    });
  });
});
