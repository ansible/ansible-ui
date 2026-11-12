import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { SWRConfig, type Cache } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { edaAPI } from '../../common/eda-utils';
import { EdaSourceEventMapping } from '../../interfaces/EdaSource';

const setDialog = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    usePageDialog: () => [undefined, setDialog],
  };
});

vi.mock('../../rulebook-activations/components/SourceEventStreamMapping', () => ({
  SourceEventStreamMappingModal: () => <div>mapping-modal</div>,
}));

import { useSelectEventStreams } from './useSelectEventStreams';

const server = setupServer();

function HookWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        provider: (): Cache => new Map() as Cache,
        dedupingInterval: 0,
        shouldRetryOnError: false,
      }}
    >
      {children}
    </SWRConfig>
  );
}

describe('useSelectEventStreams', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => {
    server.resetHandlers();
    setDialog.mockClear();
  });
  afterAll(() => server.close());

  it('should open the source mapping modal when a rulebook is loaded', async () => {
    let fetched = false;
    server.use(
      http.get(edaAPI`/rulebooks/1/`, () => {
        fetched = true;
        return HttpResponse.json({ id: 1, name: 'Demo rulebook' });
      })
    );
    const setSourceMappings = vi.fn();
    const mappings: EdaSourceEventMapping[] = [];
    const { result } = renderHook(() => useSelectEventStreams('1', mappings, setSourceMappings), {
      wrapper: HookWrapper,
    });

    await waitFor(() => {
      expect(fetched).toBe(true);
    });
    await waitFor(() => {
      act(() => {
        result.current();
      });
      expect(setDialog.mock.calls[setDialog.mock.calls.length - 1]?.[0]).not.toBeUndefined();
    });
  });

  it('should close the dialog when no rulebook is loaded', async () => {
    let fetched = false;
    server.use(
      http.get(edaAPI`/rulebooks/1/`, () => {
        fetched = true;
        return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
      })
    );
    const { result } = renderHook(() => useSelectEventStreams('1', [], vi.fn()), {
      wrapper: HookWrapper,
    });

    await waitFor(() => {
      expect(fetched).toBe(true);
    });
    setDialog.mockClear();
    act(() => {
      result.current();
    });
    expect(setDialog).toHaveBeenCalledWith(undefined);
  });
});
