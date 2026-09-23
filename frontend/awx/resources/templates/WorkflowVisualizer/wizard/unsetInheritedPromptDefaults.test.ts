import { describe, expect, it } from 'vitest';
import type { LaunchConfiguration } from '../../../../interfaces/LaunchConfiguration';
import { unsetInheritedPromptDefaults } from './unsetInheritedPromptDefaults';

const launchConfig = {
  defaults: {
    timeout: 3000,
    limit: 'webservers',
    forks: 5,
    verbosity: 2,
    job_slice_count: 3,
    job_type: 'check',
    diff_mode: true,
    scm_branch: 'release',
  },
} as LaunchConfiguration;

describe('unsetInheritedPromptDefaults', () => {
  it('should omit prompt fields that match template defaults when the node had no override', () => {
    const effectivePrompt = {
      timeout: 3000,
      limit: 'webservers',
      forks: 5,
    };

    unsetInheritedPromptDefaults(effectivePrompt, launchConfig, {
      timeout: null,
      limit: null,
      forks: null,
    });

    expect(effectivePrompt).toEqual({});
  });

  it('should keep prompt fields when the node has an explicit override', () => {
    const effectivePrompt = { timeout: 3000, forks: 5 };

    unsetInheritedPromptDefaults(effectivePrompt, launchConfig, { timeout: 0, forks: null });

    expect(effectivePrompt).toEqual({ timeout: 3000, forks: 5 });
  });

  it('should keep prompt fields when the user changed the value away from the template default', () => {
    const effectivePrompt = { timeout: 120 };

    unsetInheritedPromptDefaults(effectivePrompt, launchConfig, { timeout: null });

    expect(effectivePrompt).toEqual({ timeout: 120 });
  });

  it('should preserve explicit zero on the node even when it matches a numeric template default', () => {
    const configWithZeroForks = {
      defaults: { forks: 0 },
    } as LaunchConfiguration;
    const effectivePrompt = { forks: 0 };

    unsetInheritedPromptDefaults(effectivePrompt, configWithZeroForks, { forks: 0 });

    expect(effectivePrompt).toEqual({ forks: 0 });
  });
});
