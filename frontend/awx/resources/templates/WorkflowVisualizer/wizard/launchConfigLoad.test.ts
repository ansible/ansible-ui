import { describe, expect, it } from 'vitest';
import type { LaunchConfiguration } from '../../../../interfaces/LaunchConfiguration';
import type { JobTemplate } from '../../../../interfaces/JobTemplate';
import {
  awaitLaunchConfigLoad,
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
