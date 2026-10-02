import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePostAccessories } from './usePostScheduleAccessories';

const { processCredentials, processInstanceGroups, processLabels } = vi.hoisted(() => ({
  processCredentials: vi.fn(),
  processInstanceGroups: vi.fn(),
  processLabels: vi.fn(),
}));
vi.mock('./useProcessCredentials', () => ({
  useProcessCredentials: () => processCredentials,
}));
vi.mock('./useProcessInstanceGroups', () => ({
  useProcessInstanceGroups: () => processInstanceGroups,
}));
vi.mock('./useProcessLabels', () => ({
  useProcessLabels: () => processLabels,
}));

type AccessoriesPayload = Parameters<ReturnType<typeof usePostAccessories>>[1];

const schedule = { id: 42 } as Parameters<ReturnType<typeof usePostAccessories>>[0];

function payload(overrides: Record<string, unknown> = {}): AccessoriesPayload {
  return {
    launch_config: null,
    ...overrides,
  } as AccessoriesPayload;
}

describe('usePostAccessories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does nothing when no accessories are provided', async () => {
    const { result } = renderHook(() => usePostAccessories());

    await result.current(schedule, payload());

    expect(processCredentials).not.toHaveBeenCalled();
    expect(processInstanceGroups).not.toHaveBeenCalled();
    expect(processLabels).not.toHaveBeenCalled();
  });

  it('processes credentials, instance groups, and labels', async () => {
    const launchConfig = { ask_labels_on_launch: false, defaults: { labels: [] } };
    const credentials = [{ id: 1 }];
    const instanceGroups = [{ id: 2 }];
    const labels = [{ id: 3 }];
    const { result } = renderHook(() => usePostAccessories());

    await result.current(
      schedule,
      payload({
        launch_config: launchConfig,
        credentials,
        instance_groups: instanceGroups,
        labels,
        organization: 9,
      })
    );

    expect(processCredentials).toHaveBeenCalledWith(42, credentials, launchConfig);
    expect(processInstanceGroups).toHaveBeenCalledWith(42, instanceGroups, launchConfig);
    expect(processLabels).toHaveBeenCalledWith(42, labels, launchConfig, 9);
  });

  it('processes labels without replacing defaults when labels are requested on launch', async () => {
    const launchConfig = { ask_labels_on_launch: true, defaults: { labels: [] } };
    const labels = [{ id: 3 }];
    const { result } = renderHook(() => usePostAccessories());

    await result.current(schedule, payload({ launch_config: launchConfig, labels }));

    expect(processLabels).toHaveBeenCalledWith(42, labels, launchConfig, undefined);
  });
});
