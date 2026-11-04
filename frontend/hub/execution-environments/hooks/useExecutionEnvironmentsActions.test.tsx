/* eslint-disable i18next/no-literal-string */
import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { PageActionSelection } from '@ansible/ansible-ui-framework';
import { pulpAPI } from '../../common/api/formatPath';
import { mockExecutionEnvironment } from '../test/mockExecutionEnvironment';
import {
  getContainerPulpType,
  useDeleteExecutionEnvironments,
  useEmptyEEsActions,
  useExecutionEnvironmentsActions,
  useSignExecutionEnvironments,
  useSyncExecutionEnvironments,
} from './useExecutionEnvironmentsActions';

const { capturedDialog, capturedBulkActionConfig, mockNavigate } = vi.hoisted(() => ({
  capturedDialog: { current: null as React.ReactNode },
  capturedBulkActionConfig: {} as {
    title?: string;
    actionFn?: (ee: typeof mockExecutionEnvironment, signal: AbortSignal) => Promise<unknown>;
  },
  mockNavigate: vi.fn(),
}));

vi.mock('../../common/useHubBulkConfirmation', () => ({
  useHubBulkConfirmation: () => (config: typeof capturedBulkActionConfig) => {
    Object.assign(capturedBulkActionConfig, config);
  },
}));

vi.mock('../../common/utils/canSign', () => ({
  useCanSignEE: vi.fn(() => true),
}));

vi.mock('../../common/useHubContext', () => ({
  useHubContext: () => ({
    settings: { GALAXY_CONTAINER_SIGNING_SERVICE: 'test-signing' },
    featureFlags: {},
    user: null,
    hasPermission: () => true,
  }),
}));

vi.mock('../../common/api/hub-api-utils', async () => {
  const actual = await vi.importActual('../../common/api/hub-api-utils');
  return {
    ...actual,
    hubAPIDelete: vi.fn().mockResolvedValue(undefined),
    hubAPIPost: vi.fn().mockResolvedValue({ state: 'completed' }),
  };
});

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageDialog: () => [
      undefined,
      (dialog: React.ReactNode) => {
        capturedDialog.current = dialog;
      },
    ],
    usePageNavigate: () => mockNavigate,
  };
});

import { hubAPIDelete, hubAPIPost } from '../../common/api/hub-api-utils';
import { useCanSignEE } from '../../common/utils/canSign';

function getActionLabel(
  actions: ReturnType<typeof useExecutionEnvironmentsActions>,
  label: string
) {
  return actions.find((action) => 'label' in action && action.label === label);
}

describe('useExecutionEnvironmentsActions', () => {
  const server = setupServer(
    http.get(pulpAPI`/signing-services/`, () =>
      HttpResponse.json({ results: [{ pulp_href: '/pulp/signing/1/' }] })
    )
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => {
    server.resetHandlers();
    capturedDialog.current = null;
    Object.keys(capturedBulkActionConfig).forEach((key) => {
      delete capturedBulkActionConfig[key as keyof typeof capturedBulkActionConfig];
    });
    vi.mocked(hubAPIDelete).mockClear();
    vi.mocked(hubAPIPost).mockClear();
    mockNavigate.mockClear();
  });
  afterAll(() => server.close());

  it('includes create, push, sign, and delete actions', () => {
    const { result } = renderHook(() => useExecutionEnvironmentsActions(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(getActionLabel(result.current, 'Create execution environment')).toBeDefined();
    expect(getActionLabel(result.current, 'Push container images')).toBeDefined();
    expect(getActionLabel(result.current, 'Sign execution environments')).toBeDefined();
    expect(getActionLabel(result.current, 'Delete execution environments')).toBeDefined();
  });

  it('useEmptyEEsActions returns pinned create and push actions', () => {
    const { result } = renderHook(() => useEmptyEEsActions(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });
    expect(result.current).toHaveLength(2);
    const [first, second] = result.current;
    expect('isPinned' in first && first.isPinned).toBe(true);
    expect('isPinned' in second && second.isPinned).toBe(true);
  });

  it('opens push container modal from empty actions', async () => {
    const user = userEvent.setup();
    const { result } = renderHook(() => useEmptyEEsActions(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    act(() => {
      const action = result.current[1];
      if ('onClick' in action && action.selection === PageActionSelection.None) {
        action.onClick();
      }
    });

    render(<MemoryRouter>{capturedDialog.current}</MemoryRouter>);
    expect(screen.getAllByText('Push container images').length).toBeGreaterThan(0);

    await user.click(screen.getByText('HTTP or self-signed HTTPS'));
    await user.click(screen.getAllByRole('button', { name: 'Close' })[0]);
  });

  it('useDeleteExecutionEnvironments configures bulk delete', async () => {
    const { result } = renderHook(() => useDeleteExecutionEnvironments(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    act(() => {
      result.current([mockExecutionEnvironment]);
    });

    expect(capturedBulkActionConfig.title).toContain('Permanently delete execution environments');
    await capturedBulkActionConfig.actionFn?.(
      mockExecutionEnvironment,
      new AbortController().signal
    );
    expect(hubAPIDelete).toHaveBeenCalled();
  });

  it('useSyncExecutionEnvironments posts sync request', async () => {
    const { result } = renderHook(() => useSyncExecutionEnvironments(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    act(() => {
      result.current([mockExecutionEnvironment]);
    });

    await capturedBulkActionConfig.actionFn?.(
      mockExecutionEnvironment,
      new AbortController().signal
    );
    expect(hubAPIPost).toHaveBeenCalled();
  });

  it('useSignExecutionEnvironments signs container when sync task exists', async () => {
    const { result } = renderHook(() => useSignExecutionEnvironments(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    act(() => {
      result.current([mockExecutionEnvironment]);
    });

    await capturedBulkActionConfig.actionFn?.(
      mockExecutionEnvironment,
      new AbortController().signal
    );
    expect(hubAPIPost).toHaveBeenCalled();
  });

  it('useSignExecutionEnvironments rejects when remote was never synced', async () => {
    const unsyncedEE = {
      ...mockExecutionEnvironment,
      pulp: {
        ...mockExecutionEnvironment.pulp!,
        repository: {
          ...mockExecutionEnvironment.pulp!.repository!,
          remote: {
            ...mockExecutionEnvironment.pulp!.repository!.remote!,
            last_sync_task: {},
          },
        },
      },
    };
    const { result } = renderHook(() => useSignExecutionEnvironments(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    act(() => {
      result.current([unsyncedEE]);
    });

    await expect(
      capturedBulkActionConfig.actionFn?.(unsyncedEE, new AbortController().signal)
    ).rejects.toThrow(/synchronized with remote repository first/i);
  });

  it('useSignExecutionEnvironments signs container-push repositories without future_base_path', async () => {
    const pushEE = {
      ...mockExecutionEnvironment,
      pulp: {
        ...mockExecutionEnvironment.pulp!,
        repository: {
          ...mockExecutionEnvironment.pulp!.repository!,
          pulp_type: 'container.container-push',
        },
      },
    };
    const { result } = renderHook(() => useSignExecutionEnvironments(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    act(() => {
      result.current([pushEE]);
    });

    await capturedBulkActionConfig.actionFn?.(pushEE, new AbortController().signal);
    const [url, payload] = vi.mocked(hubAPIPost).mock.calls[0] as [string, Record<string, unknown>];
    expect(url).toContain('/repositories/container/container-push/');
    expect(payload).not.toHaveProperty('future_base_path');
  });

  it('navigates to create route when create action is clicked', () => {
    const { result } = renderHook(() => useEmptyEEsActions(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    act(() => {
      const action = result.current[0];
      if ('onClick' in action && action.selection === PageActionSelection.None) {
        action.onClick();
      }
    });

    expect(mockNavigate).toHaveBeenCalled();
  });

  it('disables sign action when user cannot sign', () => {
    vi.mocked(useCanSignEE).mockReturnValue(false);
    const { result } = renderHook(() => useExecutionEnvironmentsActions(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const sign = getActionLabel(result.current, 'Sign execution environments');
    const isDisabled: unknown = sign && 'isDisabled' in sign ? sign.isDisabled : undefined;
    const disabledReason = Array.isArray(isDisabled) ? String(isDisabled[0]) : String(isDisabled);
    expect(disabledReason).toBe('You do not have rights to this operation');
  });
});

describe('getContainerPulpType', () => {
  it('returns container segment from pulp_type', () => {
    expect(getContainerPulpType(mockExecutionEnvironment)).toBe('container');
  });

  it('returns empty string when pulp_type is missing segments', () => {
    expect(
      getContainerPulpType({
        ...mockExecutionEnvironment,
        pulp: { repository: { ...mockExecutionEnvironment.pulp!.repository!, pulp_type: 'solo' } },
      })
    ).toBe('');
  });
});
