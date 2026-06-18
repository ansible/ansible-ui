import { describe, expect, test } from 'vitest';
import { buildEffectivePrompt } from './buildEffectivePrompt';
import type { LaunchConfiguration } from '../../../../interfaces/LaunchConfiguration';

const baseLaunchConfig = {
  ask_credential_on_launch: false,
  ask_labels_on_launch: false,
  ask_instance_groups_on_launch: false,
  ask_skip_tags_on_launch: false,
  ask_tags_on_launch: false,
  ask_variables_on_launch: false,
} as LaunchConfiguration;

describe('buildEffectivePrompt', () => {
  describe('template change detection', () => {
    test('should detect template change when IDs differ', () => {
      const { isTemplateChange } = buildEffectivePrompt({
        originalTemplateId: 1,
        newResourceId: 2,
        prompt: undefined,
        launchConfig: baseLaunchConfig,
        nodeOriginalResources: undefined,
        resourceOrganization: undefined,
      });
      expect(isTemplateChange).toBe(true);
    });

    test('should not detect template change when IDs match', () => {
      const { isTemplateChange } = buildEffectivePrompt({
        originalTemplateId: 1,
        newResourceId: 1,
        prompt: undefined,
        launchConfig: baseLaunchConfig,
        nodeOriginalResources: undefined,
        resourceOrganization: undefined,
      });
      expect(isTemplateChange).toBe(false);
    });

    test('should not detect template change when original ID is undefined', () => {
      const { isTemplateChange } = buildEffectivePrompt({
        originalTemplateId: undefined,
        newResourceId: 2,
        prompt: undefined,
        launchConfig: baseLaunchConfig,
        nodeOriginalResources: undefined,
        resourceOrganization: undefined,
      });
      expect(isTemplateChange).toBe(false);
    });
  });

  describe('force-clearing on template change', () => {
    test('should clear all fields when new template has no prompts', () => {
      const { effectivePrompt } = buildEffectivePrompt({
        originalTemplateId: 1,
        newResourceId: 2,
        prompt: {
          credentials: [{ id: 1, name: 'old', credential_type: 1, passwords_needed: [] }],
        },
        launchConfig: baseLaunchConfig,
        nodeOriginalResources: undefined,
        resourceOrganization: undefined,
      });
      expect(effectivePrompt.credentials).toEqual([]);
      expect(effectivePrompt.labels).toEqual([]);
      expect(effectivePrompt.instance_groups).toEqual([]);
      expect(effectivePrompt.skip_tags).toEqual([]);
      expect(effectivePrompt.job_tags).toEqual([]);
      expect(effectivePrompt.extra_vars).toBe('');
    });

    test('should preserve credentials when new template accepts them', () => {
      const creds = [{ id: 1, name: 'cred', credential_type: 1, passwords_needed: [] as string[] }];
      const { effectivePrompt } = buildEffectivePrompt({
        originalTemplateId: 1,
        newResourceId: 2,
        prompt: { credentials: creds },
        launchConfig: { ...baseLaunchConfig, ask_credential_on_launch: true },
        nodeOriginalResources: undefined,
        resourceOrganization: undefined,
      });
      expect(effectivePrompt.credentials).toEqual(creds);
    });

    test('should preserve extra_vars when new template accepts them', () => {
      const { effectivePrompt } = buildEffectivePrompt({
        originalTemplateId: 1,
        newResourceId: 2,
        prompt: { extra_vars: 'my_var: value' },
        launchConfig: { ...baseLaunchConfig, ask_variables_on_launch: true },
        nodeOriginalResources: undefined,
        resourceOrganization: undefined,
      });
      expect(effectivePrompt.extra_vars).toBe('my_var: value');
    });

    test('should not clear fields when template does not change', () => {
      const { effectivePrompt } = buildEffectivePrompt({
        originalTemplateId: 1,
        newResourceId: 1,
        prompt: {
          credentials: [{ id: 1, name: 'cred', credential_type: 1, passwords_needed: [] }],
        },
        launchConfig: baseLaunchConfig,
        nodeOriginalResources: undefined,
        resourceOrganization: undefined,
      });
      expect(effectivePrompt.credentials).toHaveLength(1);
    });
  });

  describe('original object construction', () => {
    test('should include isTemplateChange flag when template changed', () => {
      const { effectivePrompt } = buildEffectivePrompt({
        originalTemplateId: 1,
        newResourceId: 2,
        prompt: undefined,
        launchConfig: baseLaunchConfig,
        nodeOriginalResources: {
          credentials: [{ id: 5, name: 'old', credential_type: 1 }],
        },
        resourceOrganization: undefined,
      });
      expect(effectivePrompt.original?.isTemplateChange).toBe(true);
      expect(effectivePrompt.original?.credentials).toEqual([
        { id: 5, name: 'old', credential_type: 1 },
      ]);
    });

    test('should not include isTemplateChange when template did not change', () => {
      const { effectivePrompt } = buildEffectivePrompt({
        originalTemplateId: 1,
        newResourceId: 1,
        prompt: undefined,
        launchConfig: baseLaunchConfig,
        nodeOriginalResources: undefined,
        resourceOrganization: undefined,
      });
      expect(effectivePrompt.original?.isTemplateChange).toBeUndefined();
    });

    test('should include launch_config in original when provided', () => {
      const { effectivePrompt } = buildEffectivePrompt({
        originalTemplateId: 1,
        newResourceId: 1,
        prompt: undefined,
        launchConfig: baseLaunchConfig,
        nodeOriginalResources: undefined,
        resourceOrganization: undefined,
      });
      expect(effectivePrompt.original?.launch_config).toBe(baseLaunchConfig);
    });
  });

  describe('prompt fallback', () => {
    test('should use empty object when prompt is undefined', () => {
      const { effectivePrompt } = buildEffectivePrompt({
        originalTemplateId: 1,
        newResourceId: 1,
        prompt: undefined,
        launchConfig: undefined,
        nodeOriginalResources: undefined,
        resourceOrganization: undefined,
      });
      expect(effectivePrompt.credentials).toBeUndefined();
    });

    test('should set organization from resource', () => {
      const { effectivePrompt } = buildEffectivePrompt({
        originalTemplateId: 1,
        newResourceId: 1,
        prompt: undefined,
        launchConfig: undefined,
        nodeOriginalResources: undefined,
        resourceOrganization: 42,
      });
      expect(effectivePrompt.organization).toBe(42);
    });
  });
});
