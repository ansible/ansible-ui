import { describe, expect, it } from 'vitest';
import { awaitLaunchConfigLoad, registerLaunchConfigLoad } from './launchConfigLoad';

describe('launchConfigLoad', () => {
  it('awaits a registered launch config load promise', async () => {
    const loadResult = {
      launch_config: { survey_enabled: true },
      resource: { id: 1, name: 'Template', type: 'job_template' },
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
});
