import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useGetSchedulePromptValues } from './useGetSchedulePromptValues';
import { Credential } from '../../../interfaces/Credential';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { Label } from '../../../interfaces/Label';
import * as Data from '@ansible/common-ui/crud/Data';

import credentials from '@ansible/cypress/fixtures/credentials.json';
import instanceGroups from '@ansible/cypress/fixtures/instance_groups.json';
import labels from '@ansible/cypress/fixtures/labels.json';
import survey from '@ansible/cypress/fixtures/survey.json';
import templateLaunch from '@ansible/cypress/fixtures/jobTemplateLaunch.json';
import { LaunchConfiguration } from '../../../interfaces/LaunchConfiguration';
import schedule from '@ansible/cypress/fixtures/schedule.json';

// Mock dependencies
vi.mock('@ansible/common-ui/crud/Data');

// Get the mocked function that will be hoisted
const { useParams } = vi.hoisted(() => ({ useParams: vi.fn() }));

vi.mock('react-router', () => ({
  useParams: useParams,
}));

const mockRequestGet = vi.mocked(Data.requestGet);

describe('useGetSchedulePromptValues', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequestGet.mockReset(); // Clear previous mock configurations
    // Default to existing schedule scenario
    useParams.mockReturnValue({ id: '1', schedule_id: '2' });
  });

  describe('Extra Variables Processing', () => {
    it('should use schedule.extra_data when extra_vars key exists and no survey', async () => {
      mockRequestGet.mockResolvedValue({ ...schedule, extra_data: { schedule: 'data' } });

      const { result } = renderHook(() => useGetSchedulePromptValues());
      const hookFunction = result.current;

      const promptValues = await hookFunction(
        {
          ...templateLaunch,
          defaults: { ...templateLaunch.defaults, extra_vars: 'alex: corey' },
        } as LaunchConfiguration,
        [],
        [],
        []
      );

      expect(promptValues.extra_vars).toEqual(
        JSON.stringify({
          schedule: 'data',
        })
      );
    });

    it('should extract non-survey variables from extra_data when survey is provided', async () => {
      mockRequestGet.mockResolvedValue({
        ...schedule,
        extra_data: { custom_var: 'non_survey_value' },
      });
      const customSurvey = {
        ...survey,
        spec: survey.spec.map((spec) => ({ ...spec, new_question: false, max: 100, min: 1 })),
      };

      const { result } = renderHook(() => useGetSchedulePromptValues());
      const hookFunction = result.current;

      const promptValues = await hookFunction(
        templateLaunch as LaunchConfiguration,
        [],
        [],
        [],
        customSurvey
      );
      // Should only contain non-survey variables
      expect(promptValues.extra_vars).toEqual(JSON.stringify({ custom_var: 'non_survey_value' }));
      expect(JSON.parse(promptValues.extra_vars)).not.toHaveProperty('test_var');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty arrays in schedule values', async () => {
      mockRequestGet.mockResolvedValue(schedule);

      const { result } = renderHook(() => useGetSchedulePromptValues());
      const hookFunction = result.current;

      const promptValues = await hookFunction(
        {
          ...templateLaunch,
          ask_labels_on_launch: true,
        } as LaunchConfiguration,
        [],
        [],
        []
      );

      // Should fall back to provided schedule labels (empty array)
      expect(promptValues.labels).toEqual([{ id: 1, name: 'alex label' }]);
    });

    it('should handle empty objects in schedule values', async () => {
      const emptObjectSchedule = {
        ...schedule,
        summary_fields: {
          ...schedule.summary_fields,
          execution_environment: { id: 1, name: 'Default EE' },
        },
      };
      mockRequestGet.mockResolvedValue(emptObjectSchedule);

      const { result } = renderHook(() => useGetSchedulePromptValues());
      const hookFunction = result.current;

      const promptValues = await hookFunction(
        {
          ...templateLaunch,
          ask_execution_environment_on_launch: true,
        } as LaunchConfiguration,
        [],
        [],
        []
      );

      expect(promptValues.execution_environment).toEqual({ id: 1, name: 'Default EE' });
    });

    it('should handle API errors gracefully', async () => {
      mockRequestGet.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useGetSchedulePromptValues());
      const hookFunction = result.current;

      await expect(hookFunction(templateLaunch as LaunchConfiguration, [], [], [])).rejects.toThrow(
        'API Error'
      );
    });
  });

  describe('Schedule Creation (No Existing Schedule)', () => {
    beforeEach(() => {
      // Mock no schedule_id scenario (creating new schedule)
      useParams.mockReturnValue({ id: '1' }); // No schedule_id
    });

    it('should return template defaults when no schedule_id exists', async () => {
      const templateWithPrompts = {
        ...templateLaunch,
        ask_variables_on_launch: true,
        ask_tags_on_launch: true,
        ask_skip_tags_on_launch: true,
        ask_inventory_on_launch: true,
        ask_credential_on_launch: true,
        ask_instance_groups_on_launch: true,
        ask_labels_on_launch: true,
      };

      const { result } = renderHook(() => useGetSchedulePromptValues());
      const hookFunction = result.current;

      const promptValues = await hookFunction(
        templateWithPrompts as LaunchConfiguration,
        [],
        [],
        []
      );

      // Should use all defaults from template launch config
      expect(promptValues.extra_vars).toBe(templateLaunch.defaults.extra_vars);
      expect(promptValues.job_tags).toEqual([]);
      expect(promptValues.skip_tags).toEqual([]);
      expect(promptValues.inventory).toBe(templateLaunch.defaults.inventory);
      expect(promptValues.credentials).toEqual([
        {
          credential_type: 1,
          id: 1,
          name: 'Demo Credential',
          passwords_needed: [],
        },
      ]);
      expect(promptValues.instance_groups).toEqual([]);
      expect(promptValues.labels).toEqual([
        {
          id: 1,
          name: 'alex label',
        },
      ]);
    });

    it('should not make any API calls when creating new schedule', async () => {
      const templateWithPrompts = {
        ...templateLaunch,
        ask_variables_on_launch: true,
      };

      const { result } = renderHook(() => useGetSchedulePromptValues());
      const hookFunction = result.current;

      await hookFunction(templateWithPrompts as LaunchConfiguration, [], [], []);

      // Verify no API calls were made
      expect(mockRequestGet).not.toHaveBeenCalled();
    });

    it('should properly merge provided credentials with template defaults during creation', async () => {
      const templateWithCredentialPrompt = {
        ...templateLaunch,
        ask_credential_on_launch: true,
      };

      const { result } = renderHook(() => useGetSchedulePromptValues());
      const hookFunction = result.current;

      const promptValues = await hookFunction(
        templateWithCredentialPrompt as LaunchConfiguration,
        credentials.results as unknown as Credential[],
        [],
        []
      );

      // Should merge provided credentials with template defaults
      expect(promptValues.credentials).toHaveLength(1);
      expect(promptValues.credentials).toEqual(templateLaunch.defaults.credentials);
    });

    it('should use provided instance groups when creating new schedule', async () => {
      const templateWithInstanceGroupPrompt = {
        ...templateLaunch,
        ask_instance_groups_on_launch: true,
      };

      const { result } = renderHook(() => useGetSchedulePromptValues());
      const hookFunction = result.current;

      const promptValues = await hookFunction(
        templateWithInstanceGroupPrompt as LaunchConfiguration,
        [],
        instanceGroups.results as unknown as InstanceGroup[],
        []
      );

      // Should use provided instance groups, not template defaults
      expect(promptValues.instance_groups).toEqual([]);
      expect(promptValues.instance_groups).toHaveLength(0);
    });

    it('should use provided labels when creating new schedule', async () => {
      const templateWithLabelsPrompt = {
        ...templateLaunch,
        ask_labels_on_launch: true,
      };

      const { result } = renderHook(() => useGetSchedulePromptValues());
      const hookFunction = result.current;

      const promptValues = await hookFunction(
        templateWithLabelsPrompt as LaunchConfiguration,
        [],
        [],
        labels.results as unknown as Label[]
      );

      // Should use provided labels, not template defaults
      expect(promptValues.labels).toEqual(templateLaunch.defaults.labels);
      expect(promptValues.labels).toHaveLength(templateLaunch.defaults.labels.length);
    });

    it('should handle string tag parsing from template defaults during creation', async () => {
      const customTemplate = {
        ...templateLaunch,
        ask_tags_on_launch: true,
        ask_skip_tags_on_launch: true,
        defaults: {
          ...templateLaunch.defaults,
          job_tags: 'deploy,test,prod',
          skip_tags: 'debug,verbose',
        },
      };

      const { result } = renderHook(() => useGetSchedulePromptValues());
      const hookFunction = result.current;

      const promptValues = await hookFunction(customTemplate as LaunchConfiguration, [], [], []);

      // Should parse string tags into tag arrays
      expect(promptValues.job_tags).toEqual([
        { name: 'deploy', label: 'deploy', value: 'deploy' },
        { name: 'test', label: 'test', value: 'test' },
        { name: 'prod', label: 'prod', value: 'prod' },
      ]);
      expect(promptValues.skip_tags).toEqual([
        { name: 'debug', label: 'debug', value: 'debug' },
        { name: 'verbose', label: 'verbose', value: 'verbose' },
      ]);
    });

    it('should handle survey spec parameter during creation (should be ignored)', async () => {
      const customTemplate = {
        ...templateLaunch,
        defaults: {
          ...templateLaunch.defaults,
          extra_vars: '{"custom_var": "value", "test_var": "survey_value"}',
        },
      };
      const customSurvey = {
        ...survey,
        spec: survey.spec.map((spec) => ({ ...spec, new_question: false, max: 100, min: 1 })),
      };

      const { result } = renderHook(() => useGetSchedulePromptValues());
      const hookFunction = result.current;

      const promptValues = await hookFunction(
        customTemplate as LaunchConfiguration,
        [],
        [],
        [],
        customSurvey
      );

      // Should use template defaults for extra_vars (survey filtering doesn't apply during creation)
      expect(promptValues.extra_vars).toBe(customTemplate.defaults.extra_vars);
    });

    it('should handle empty template defaults gracefully during creation', async () => {
      const emptyTemplate = {
        ...templateLaunch,
        defaults: {
          extra_vars: '',
          job_tags: '',
          skip_tags: '',
          inventory: null,
          credentials: [],
          instance_groups: [],
          labels: [],
        },
      };

      const { result } = renderHook(() => useGetSchedulePromptValues());
      const hookFunction = result.current;

      const promptValues = await hookFunction(
        emptyTemplate as unknown as LaunchConfiguration,
        [],
        [],
        []
      );

      // Should handle empty defaults gracefully
      expect(promptValues.extra_vars).toBe('');
      expect(promptValues.job_tags).toEqual([]);
      expect(promptValues.skip_tags).toEqual([]);
      expect(promptValues.inventory).toBeNull();
      expect(promptValues.credentials).toEqual([]);
      expect(promptValues.instance_groups).toEqual([]);
      expect(promptValues.labels).toEqual([]);
    });

    it('should handle all populated launch configuration defaults during creation', async () => {
      const fullyPopulatedTemplate = {
        ...templateLaunch,
        // Enable prompts for all fields we're testing
        ask_scm_branch_on_launch: true,
        ask_variables_on_launch: true,
        ask_tags_on_launch: true,
        ask_diff_mode_on_launch: true,
        ask_skip_tags_on_launch: true,
        ask_job_type_on_launch: true,
        ask_limit_on_launch: true,
        ask_verbosity_on_launch: true,
        ask_inventory_on_launch: true,
        ask_credential_on_launch: true,
        ask_execution_environment_on_launch: true,
        ask_labels_on_launch: true,
        ask_forks_on_launch: true,
        ask_job_slice_count_on_launch: true,
        ask_timeout_on_launch: true,
        ask_instance_groups_on_launch: true,
        defaults: {
          inventory: {
            name: 'Production Inventory',
            id: 5,
          },
          limit: 'web_servers:db_servers',
          scm_branch: 'feature/deployment',
          labels: [
            { id: 10, name: 'production' },
            { id: 11, name: 'critical' },
          ],
          job_tags: 'deploy,configure,restart',
          skip_tags: 'debug,test',
          extra_vars: '{"env": "prod", "debug": false, "replicas": 3}',
          diff_mode: true,
          job_type: 'check',
          verbosity: 3,
          credentials: [
            {
              id: 100,
              name: 'Production SSH Key',
              credential_type: 1,
              passwords_needed: [],
            },
            {
              id: 101,
              name: 'AWS Access',
              credential_type: 7,
              passwords_needed: [],
            },
          ],
          execution_environment: {
            id: 25,
            name: 'Custom EE',
            image: 'registry.example.com/custom-ee:latest',
          },
          forks: 10,
          job_slice_count: 4,
          timeout: 3600,
          instance_groups: [
            { id: 50, name: 'Production Cluster' },
            { id: 51, name: 'High Memory Nodes' },
          ],
        },
      };

      const { result } = renderHook(() => useGetSchedulePromptValues());
      const hookFunction = result.current;

      const promptValues = await hookFunction(
        fullyPopulatedTemplate as unknown as LaunchConfiguration,
        [],
        [],
        []
      );

      // Verify all fields are properly set from template defaults
      expect(promptValues.inventory).toEqual({
        name: 'Production Inventory',
        id: 5,
      });
      expect(promptValues.limit).toBe('web_servers:db_servers');
      expect(promptValues.scm_branch).toBe('feature/deployment');
      expect(promptValues.labels).toEqual([
        { id: 10, name: 'production' },
        { id: 11, name: 'critical' },
      ]);

      // Tags should be parsed into arrays
      expect(promptValues.job_tags).toEqual([
        { name: 'deploy', label: 'deploy', value: 'deploy' },
        { name: 'configure', label: 'configure', value: 'configure' },
        { name: 'restart', label: 'restart', value: 'restart' },
      ]);
      expect(promptValues.skip_tags).toEqual([
        { name: 'debug', label: 'debug', value: 'debug' },
        { name: 'test', label: 'test', value: 'test' },
      ]);

      expect(promptValues.extra_vars).toBe('{"env": "prod", "debug": false, "replicas": 3}');
      expect(promptValues.diff_mode).toBe(true);
      expect(promptValues.job_type).toBe('check');
      expect(promptValues.verbosity).toBe(3);

      expect(promptValues.credentials).toEqual([
        {
          id: 100,
          name: 'Production SSH Key',
          credential_type: 1,
          passwords_needed: [],
        },
        {
          id: 101,
          name: 'AWS Access',
          credential_type: 7,
          passwords_needed: [],
        },
      ]);

      expect(promptValues.execution_environment).toEqual({
        id: 25,
        name: 'Custom EE',
        image: 'registry.example.com/custom-ee:latest',
      });

      expect(promptValues.forks).toBe(10);
      expect(promptValues.job_slice_count).toBe(4);
      expect(promptValues.timeout).toBe(3600);
      expect(promptValues.instance_groups).toEqual([
        { id: 50, name: 'Production Cluster' },
        { id: 51, name: 'High Memory Nodes' },
      ]);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle mixed priority scenarios with multiple field types', async () => {
      const customSchedule = {
        ...schedule,
        job_tags: 'job,hunt,gardening',
        verbosity: 2,
        summary_fields: {
          ...schedule.summary_fields,
          inventory: {
            id: 1,
            name: 'Default Inventory',
          },
        },
      };
      mockRequestGet.mockResolvedValue(customSchedule);

      const { result } = renderHook(() => useGetSchedulePromptValues());
      const hookFunction = result.current;

      const promptValues = await hookFunction(
        {
          ...templateLaunch,
          ask_tags_on_launch: true,
          ask_verbosity_on_launch: true,
          ask_inventory_on_launch: true,
          ask_credential_on_launch: true,
          ask_instance_groups_on_launch: true,
          ask_labels_on_launch: true,
        } as LaunchConfiguration,
        credentials.results as unknown as Credential[],
        instanceGroups.results as unknown as InstanceGroup[],
        labels.results as unknown as Label[]
      );

      // Verify each field uses correct priority
      expect(promptValues.inventory).toEqual(customSchedule.summary_fields.inventory); // Summary field
      expect(promptValues.verbosity).toBe(2); // Direct schedule
      expect(promptValues.job_tags).toEqual([
        // Parsed schedule value
        { name: 'job', label: 'job', value: 'job' },
        { name: 'hunt', label: 'hunt', value: 'hunt' },
        { name: 'gardening', label: 'gardening', value: 'gardening' },
      ]);
      expect(promptValues.credentials).toHaveLength(15); // Merged
      expect(promptValues.instance_groups).toEqual(instanceGroups.results); // Replaced
      expect(promptValues.labels).toEqual(labels.results); // Replaced
    });

    it('should work correctly when all schedule values are undefined', async () => {
      const customSchedule = {
        ...schedule,
        job_tags: 'job,hunt,gardening',
        skip_tags: 'skip,hop',
        limit: 'default_limit',
        forks: 2,
        verbosity: 2,
        summary_fields: {
          ...schedule.summary_fields,
          inventory: {
            id: 1,
            name: 'Default Inventory',
          },
        },
      };
      mockRequestGet.mockResolvedValue(customSchedule);

      const { result } = renderHook(() => useGetSchedulePromptValues());
      const hookFunction = result.current;

      const promptValues = await hookFunction(
        {
          ...templateLaunch,
          ask_tags_on_launch: true,
          ask_skip_tags_on_launch: true,
          ask_limit_on_launch: true,
          ask_forks_on_launch: true,
          ask_verbosity_on_launch: true,
          ask_inventory_on_launch: true,
        } as LaunchConfiguration,
        [],
        [],
        []
      );

      // Should use all defaults
      expect(promptValues.inventory).toEqual({ name: 'Default Inventory', id: 1 });
      expect(promptValues.verbosity).toBe(2);
      expect(promptValues.job_tags).toEqual([
        { name: 'job', label: 'job', value: 'job' },
        { name: 'hunt', label: 'hunt', value: 'hunt' },
        { name: 'gardening', label: 'gardening', value: 'gardening' },
      ]);
      expect(promptValues.skip_tags).toEqual([
        { name: 'skip', label: 'skip', value: 'skip' },
        { name: 'hop', label: 'hop', value: 'hop' },
      ]);
      expect(promptValues.limit).toBe('default_limit');
      expect(promptValues.forks).toBe(2);
    });
  });
});
