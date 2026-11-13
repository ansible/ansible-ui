import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { InstanceGroup } from '../../../interfaces/InstanceGroup';
import type { LaunchConfiguration } from '../../../interfaces/LaunchConfiguration';
import type { Schedule } from '../../../interfaces/Schedule';
import { usePostAccessories } from './usePostScheduleAccessories';
import { useProcessCredentials } from './useProcessCredentials';
import { useProcessInstanceGroups } from './useProcessInstanceGroups';
import { useProcessLabels } from './useProcessLabels';

vi.mock('./useProcessCredentials');
vi.mock('./useProcessInstanceGroups');
vi.mock('./useProcessLabels');

const launchConfig = { ask_credential_on_launch: true } as LaunchConfiguration;
const schedule = { id: 42 } as Schedule;

describe('usePostAccessories', () => {
  const mockProcessCredentials = vi.fn().mockResolvedValue(undefined);
  const mockProcessInstanceGroups = vi.fn().mockResolvedValue(undefined);
  const mockProcessLabels = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useProcessCredentials).mockReturnValue(mockProcessCredentials);
    vi.mocked(useProcessInstanceGroups).mockReturnValue(mockProcessInstanceGroups);
    vi.mocked(useProcessLabels).mockReturnValue(mockProcessLabels);
  });

  it('processes credentials when payload includes credentials', async () => {
    const { result } = renderHook(() => usePostAccessories());
    const credentials = [{ id: 1, name: 'Cred', credential_type: 1, passwords_needed: [] }];

    await result.current(schedule, { launch_config: launchConfig, credentials });

    expect(mockProcessCredentials).toHaveBeenCalledWith(42, credentials, launchConfig);
    expect(mockProcessInstanceGroups).not.toHaveBeenCalled();
    expect(mockProcessLabels).not.toHaveBeenCalled();
  });

  it('processes instance groups and labels when provided', async () => {
    const { result } = renderHook(() => usePostAccessories());
    const instance_groups = [{ id: 1, name: 'default' }] as unknown as InstanceGroup[];
    const labels = [{ id: 2, name: 'prod' }];

    await result.current(schedule, {
      launch_config: launchConfig,
      instance_groups,
      labels,
      organization: 1,
    });

    expect(mockProcessInstanceGroups).toHaveBeenCalledWith(42, instance_groups, launchConfig);
    expect(mockProcessLabels).toHaveBeenCalledWith(42, labels, launchConfig, 1);
  });
});
