import { describe, expect, it, vi } from 'vitest';
import type { LaunchConfiguration } from '../../../../interfaces/LaunchConfiguration';
import type { JobTemplate } from '../../../../interfaces/JobTemplate';
import {
  awaitLaunchConfigLoad,
  ensureLaunchConfigLoad,
  registerLaunchConfigLoad,
  type LaunchConfigLoadResult,
} from './launchConfigLoad';

describe('launchConfigLoad', () => {
  it('awaits a registered launch config load promise', async () => {
    const loadResult: LaunchConfigLoadResult = {
      launch_config: { survey_enabled: true } as LaunchConfiguration,
      resource: { id: 1, name: 'Template', type: 'job_template' } as JobTemplate,
      resourceId: 1,
    };

    registerLaunchConfigLoad(
      'job',
      1,
      new Promise((resolve) => {
        setTimeout(() => resolve(loadResult), 10);
      })
    );

    await expect(awaitLaunchConfigLoad('job', 1)).resolves.toEqual(loadResult);
  });

  it('resolves immediately when no load is registered', async () => {
    await expect(awaitLaunchConfigLoad('job', 99)).resolves.toBeUndefined();
  });

  it('registers and returns the loader promise when no load is pending', async () => {
    const loadResult: LaunchConfigLoadResult = {
      launch_config: null,
      resource: { id: 3, name: 'JT', type: 'job_template' } as JobTemplate,
      resourceId: 3,
    };
    let resolveLoader!: (value: LaunchConfigLoadResult) => void;
    const loader = vi.fn(
      () =>
        new Promise<LaunchConfigLoadResult>((resolve) => {
          resolveLoader = resolve;
        })
    );

    const loadPromise = ensureLaunchConfigLoad('job', 3, loader);
    const concurrentAwait = awaitLaunchConfigLoad('job', 3);
    expect(loader).toHaveBeenCalledOnce();
    expect(concurrentAwait).toBe(loadPromise);

    resolveLoader(loadResult);
    await expect(loadPromise).resolves.toEqual(loadResult);
    await expect(concurrentAwait).resolves.toEqual(loadResult);
  });

  it('returns the in-flight promise when ensureLaunchConfigLoad is called again', async () => {
    const loadResult: LaunchConfigLoadResult = {
      launch_config: null,
      resource: { id: 11, name: 'JT', type: 'job_template' } as JobTemplate,
      resourceId: 11,
    };
    const loader = vi.fn(
      () =>
        new Promise<LaunchConfigLoadResult | undefined>((resolve) =>
          setTimeout(() => resolve(loadResult), 20)
        )
    );

    const first = ensureLaunchConfigLoad('job', 11, loader);
    const second = ensureLaunchConfigLoad('job', 11, loader);

    expect(second).toBe(first);
    expect(loader).toHaveBeenCalledOnce();
    await expect(first).resolves.toEqual(loadResult);
  });

  it('does not remove a newer registered load when an older load settles', async () => {
    const newerResult: LaunchConfigLoadResult = {
      launch_config: { survey_enabled: false } as LaunchConfiguration,
      resource: { id: 7, name: 'Current Template', type: 'job_template' } as JobTemplate,
      resourceId: 7,
    };
    const olderResult: LaunchConfigLoadResult = {
      launch_config: { survey_enabled: true } as LaunchConfiguration,
      resource: { id: 7, name: 'Stale Template', type: 'job_template' } as JobTemplate,
      resourceId: 7,
    };

    let resolveOlder: (value: LaunchConfigLoadResult) => void;
    const olderPromise = new Promise<LaunchConfigLoadResult>((resolve) => {
      resolveOlder = resolve;
    });

    registerLaunchConfigLoad('job', 7, olderPromise);
    registerLaunchConfigLoad('job', 7, Promise.resolve(newerResult));

    await expect(awaitLaunchConfigLoad('job', 7)).resolves.toEqual(newerResult);

    resolveOlder!(olderResult);
    await new Promise((resolve) => setTimeout(resolve, 0));

    await expect(awaitLaunchConfigLoad('job', 7)).resolves.toBeUndefined();
  });
});
