/* eslint-disable i18next/no-literal-string */
import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { PageActionType } from '@ansible/ansible-ui-framework';
import { PageDialogProvider } from '@ansible/ansible-ui-framework/PageDialogs/PageDialog';
import { FrameworkTranslationsProvider } from '@ansible/ansible-ui-framework/useFrameworkTranslations';
import { edaAPI } from '../../common/eda-utils';
import { IEdaView } from '../../common/useEventDrivenView';
import { EdaEventStream } from '../../interfaces/EdaEventStream';
import { EdaRoute } from '../../main/EdaRoutes';
import { useEventStreamActions } from './useEventStreamActions';

const pageNavigate = vi.fn();
vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    usePageNavigate: () => pageNavigate,
  };
});

vi.mock('@patternfly/react-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@patternfly/react-core')>();
  return {
    ...actual,
    Modal: ({ children, title }: { children: React.ReactNode; title?: string }) => (
      <div data-testid="modal">
        {title ? <h1>{title}</h1> : null}
        {children}
      </div>
    ),
  };
});

const server = setupServer();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <PageDialogProvider>
      <FrameworkTranslationsProvider>{children}</FrameworkTranslationsProvider>
    </PageDialogProvider>
  </MemoryRouter>
);

describe('useEventStreamActions', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => {
    server.resetHandlers();
    pageNavigate.mockClear();
  });
  afterAll(() => server.close());

  const view = {
    unselectItemsAndRefresh: vi.fn(),
  } as unknown as IEdaView<EdaEventStream>;
  const eventStream = { id: 3, name: 'Stream 3', test_mode: true } as EdaEventStream;

  it('should return switch, edit, and delete actions', () => {
    const { result } = renderHook(() => useEventStreamActions(view), { wrapper });
    expect(result.current.map((action) => action.type)).toEqual([
      PageActionType.Switch,
      PageActionType.Button,
      PageActionType.Seperator,
      PageActionType.Button,
    ]);
  });

  it('should enable forwarding, edit, and delete from the returned actions', async () => {
    server.use(
      http.patch(edaAPI`/event-streams/3/`, () => HttpResponse.json({})),
      http.delete(edaAPI`/event-streams/3/`, () => HttpResponse.json({}))
    );
    const { result } = renderHook(() => useEventStreamActions(view), { wrapper });

    const enable = result.current[0] as { onToggle: (item: EdaEventStream, mode: boolean) => void };
    const edit = result.current[1] as { onClick: (item: EdaEventStream) => void };
    const remove = result.current[3] as { onClick: (item: EdaEventStream) => void };

    await act(async () => {
      enable.onToggle(eventStream, true);
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    expect(view.unselectItemsAndRefresh).toHaveBeenCalledWith([eventStream]);

    edit.onClick(eventStream);
    expect(pageNavigate).toHaveBeenCalledWith(EdaRoute.EditEventStream, { params: { id: 3 } });

    act(() => {
      remove.onClick(eventStream);
    });
  });

  it('should disable forwarding when the switch is turned off', () => {
    const { result } = renderHook(() => useEventStreamActions(view), { wrapper });
    const toggle = result.current[0] as { onToggle: (item: EdaEventStream, mode: boolean) => void };
    act(() => {
      toggle.onToggle(eventStream, false);
    });
  });

  it('should toast an error when enabling forwarding fails', async () => {
    server.use(http.patch(edaAPI`/event-streams/3/`, () => HttpResponse.json({}, { status: 500 })));
    const { result } = renderHook(() => useEventStreamActions(view), { wrapper });
    const enable = result.current[0] as { onToggle: (item: EdaEventStream, mode: boolean) => void };

    await act(async () => {
      enable.onToggle(eventStream, true);
      enable.onToggle({ name: 'orphan' } as EdaEventStream, true);
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    expect(view.unselectItemsAndRefresh).toHaveBeenCalled();
  });
});
