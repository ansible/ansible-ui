import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useGetSchedulePromptValues } from './useGetSchedulePromptValues';
import { Credential } from '../../../interfaces/Credential';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { Label } from '../../../interfaces/Label';
import * as Data from '@ansible/common-ui/crud/Data';
import { LaunchConfiguration } from '../../../interfaces/LaunchConfiguration';
import { Survey, Spec } from '../../../interfaces/Survey';

const credentials = {
  count: 15,
  results: Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    type: 'credential',
    name: `Credential ${i + 1}`,
    credential_type: i + 1,
    kind: 'ssh',
  })),
};

const instanceGroups = {
  count: 3,
  results: [
    { id: 1, name: 'controlplane', type: 'instance_group' },
    { id: 2, name: 'default', type: 'instance_group' },
    { id: 3, name: 'Container Group 01', type: 'instance_group', is_container_group: true },
  ],
};

const labels = {
  count: 4,
  results: [
    { id: 1, type: 'label', name: 'alex label', organization: 1 },
    { id: 111, type: 'label', name: 'L_10o0', organization: 2 },
    { id: 112, type: 'label', name: 'L_11o0', organization: 2 },
    { id: 113, type: 'label', name: 'L_12o0', organization: 2 },
  ],
};

const survey: Survey = {
  name: 'Simple',
  description: 'Description',
  spec: [
    {
      type: 'text',
      question_name: 'cantbeshort',
      question_description: 'What is a long answer',
      variable: 'long_answer',
      required: false,
      default: 'Leeloo Minai Lekarariba-Laminai-Tchai Ekbat De Sebat',
      choices: '',
      min: 5,
      max: 0,
      new_question: false,
    },
    {
      type: 'text',
      question_name: 'reqd',
      question_description: 'I should be required',
      variable: 'reqd_answer',
      required: true,
      default: 'NOT OPTIONAL',
      choices: '',
      min: 0,
      max: 0,
      new_question: false,
    },
  ],
};

const templateLaunch: LaunchConfiguration = {
  can_start_without_user_input: true,
  passwords_needed_to_start: [],
  variables_needed_to_start: [],
  credential_needed_to_start: false,
  inventory_needed_to_start: false,
  ask_scm_branch_on_launch: false,
  ask_variables_on_launch: false,
  ask_tags_on_launch: false,
  ask_diff_mode_on_launch: false,
  ask_skip_tags_on_launch: false,
  ask_job_type_on_launch: false,
  ask_limit_on_launch: false,
  ask_verbosity_on_launch: false,
  ask_inventory_on_launch: false,
  ask_credential_on_launch: false,
  ask_execution_environment_on_launch: false,
  ask_labels_on_launch: false,
  ask_forks_on_launch: false,
  ask_job_slice_count_on_launch: false,
  ask_timeout_on_launch: false,
  ask_instance_groups_on_launch: false,
  survey_enabled: false,
  credential_passwords: {
    ssh_password: '',
    become_password: '',
    ssh_key_unlock: '',
    vault_password: '',
  },
  unified_job_template_object: {
    name: 'JT with Default Cred',
    id: 7,
    description: '',
    survey_enabled: false,
  },
  job_template_data: {
    name: 'JT with Default Cred',
    id: 7,
    description: '',
  },
  defaults: {
    inventory: { name: 'Demo Inventory', id: 1 },
    limit: '',
    scm_branch: '',
    labels: [{ id: 1, name: 'alex label' }],
    job_tags: '',
    skip_tags: '',
    extra_vars: '---',
    diff_mode: false,
    job_type: 'run',
    verbosity: 0,
    credentials: [{ id: 1, name: 'Demo Credential', credential_type: 1, passwords_needed: [] }],
    execution_environment: {},
    forks: 0,
    job_slice_count: 1,
    timeout: 0,
    instance_groups: [],
  },
};

const schedule = {
  id: 2,
  name: 'Cleanup Activity Schedule',
  description: 'Automatically Generated Schedule',
  created: '2023-05-08T14:57:05.224768Z',
  modified: '2023-05-15T15:41:29.376525Z',
  enabled: true,
  dtstart: '2023-05-09T14:57:05Z',
  extra_data: { days: '355' },
  summary_fields: {
    modified_by: { id: 1, username: 'admin', first_name: '', last_name: '' },
    unified_job_template: {
      id: 2,
      name: 'Cleanup Activity Stream',
      description: 'Remove activity stream history',
    },
  },
};

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

      const testConfig: LaunchConfiguration = {
        ...templateLaunch,
        defaults: { ...templateLaunch.defaults, extra_vars: 'alex: corey' },
      };
      const promptValues = await hookFunction(testConfig, [], [], []);

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
      const customSurvey: Survey = {
        ...survey,
        spec: survey.spec.map((spec: Spec) => ({ ...spec, new_question: false, max: 100, min: 1 })),
      };

      const { result } = renderHook(() => useGetSchedulePromptValues());
      const hookFunction = result.current;

      const promptValues = await hookFunction(templateLaunch, [], [], [], customSurvey);
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

      const testConfig: LaunchConfiguration = {
        ...templateLaunch,
        ask_labels_on_launch: true,
      };
      const promptValues = await hookFunction(testConfig, [], [], []);

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

      const testConfig: LaunchConfiguration = {
        ...templateLaunch,
        ask_execution_environment_on_launch: true,
      };
      const promptValues = await hookFunction(testConfig, [], [], []);

      expect(promptValues.execution_environment).toEqual({ id: 1, name: 'Default EE' });
    });

    it('should handle API errors gracefully', async () => {
      mockRequestGet.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useGetSchedulePromptValues());
      const hookFunction = result.current;

      await expect(hookFunction(templateLaunch, [], [], [])).rejects.toThrow('API Error');
    });
  });

  describe('Schedule Creation (No Existing Schedule)', () => {
    beforeEach(() => {
      // Mock no schedule_id scenario (creating new schedule)
      useParams.mockReturnValue({ id: '1' }); // No schedule_id
    });

    it('should return template defaults when no schedule_id exists', async () => {
      const templateWithPrompts: LaunchConfiguration = {
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

      const promptValues = await hookFunction(templateWithPrompts, [], [], []);

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
      const templateWithPrompts: LaunchConfiguration = {
        ...templateLaunch,
        ask_variables_on_launch: true,
      };

      const { result } = renderHook(() => useGetSchedulePromptValues());
      const hookFunction = result.current;

      await hookFunction(templateWithPrompts, [], [], []);

      // Verify no API calls were made
      expect(mockRequestGet).not.toHaveBeenCalled();
    });

    it('should properly merge provided credentials with template defaults during creation', async () => {
      const templateWithCredentialPrompt: LaunchConfiguration = {
        ...templateLaunch,
        ask_credential_on_launch: true,
      };

      const { result } = renderHook(() => useGetSchedulePromptValues());
      const hookFunction = result.current;

      const promptValues = await hookFunction(
        templateWithCredentialPrompt,
        credentials.results as unknown as Credential[],
        [],
        []
      );

      // Should merge provided credentials with template defaults
      expect(promptValues.credentials).toHaveLength(1);
      expect(promptValues.credentials).toEqual(templateLaunch.defaults.credentials);
    });

    it('should use provided instance groups when creating new schedule', async () => {
      const templateWithInstanceGroupPrompt: LaunchConfiguration = {
        ...templateLaunch,
        ask_instance_groups_on_launch: true,
      };

      const { result } = renderHook(() => useGetSchedulePromptValues());
      const hookFunction = result.current;

      const promptValues = await hookFunction(
        templateWithInstanceGroupPrompt,
        [],
        instanceGroups.results as unknown as InstanceGroup[],
        []
      );

      // Should use provided instance groups, not template defaults
      expect(promptValues.instance_groups).toEqual([]);
      expect(promptValues.instance_groups).toHaveLength(0);
    });

    it('should use provided labels when creating new schedule', async () => {
      const templateWithLabelsPrompt: LaunchConfiguration = {
        ...templateLaunch,
        ask_labels_on_launch: true,
      };

      const { result } = renderHook(() => useGetSchedulePromptValues());
      const hookFunction = result.current;

      const promptValues = await hookFunction(
        templateWithLabelsPrompt,
        [],
        [],
        labels.results as unknown as Label[]
      );

      // Should use provided labels, not template defaults
      expect(promptValues.labels).toEqual(templateLaunch.defaults.labels);
      expect(promptValues.labels).toHaveLength(templateLaunch.defaults.labels.length);
    });

    it('should handle string tag parsing from template defaults during creation', async () => {
      const customTemplate: LaunchConfiguration = {
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

      const promptValues = await hookFunction(customTemplate, [], [], []);

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
      const customTemplate: LaunchConfiguration = {
        ...templateLaunch,
        defaults: {
          ...templateLaunch.defaults,
          extra_vars: '{"custom_var": "value", "test_var": "survey_value"}',
        },
      };
      const customSurvey: Survey = {
        ...survey,
        spec: survey.spec.map((spec: Spec) => ({ ...spec, new_question: false, max: 100, min: 1 })),
      };

      const { result } = renderHook(() => useGetSchedulePromptValues());
      const hookFunction = result.current;

      const promptValues = await hookFunction(customTemplate, [], [], [], customSurvey);

      // Should use template defaults for extra_vars (survey filtering doesn't apply during creation)
      expect(promptValues.extra_vars).toBe(customTemplate.defaults.extra_vars);
    });

    it('should handle empty template defaults gracefully during creation', async () => {
      const emptyTemplate: LaunchConfiguration = {
        ...templateLaunch,
        defaults: {
          ...templateLaunch.defaults,
          extra_vars: '',
          job_tags: '',
          skip_tags: '',
          inventory: null as unknown as { name: string; id: number },
          credentials: [],
          instance_groups: [],
          labels: [],
        },
      };

      const { result } = renderHook(() => useGetSchedulePromptValues());
      const hookFunction = result.current;

      const promptValues = await hookFunction(emptyTemplate, [], [], []);

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
      const fullyPopulatedTemplate: LaunchConfiguration = {
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
          },
          forks: 10,
          job_slice_count: 4,
          timeout: 3600,
          instance_groups: [
            { id: 50, name: 'Production Cluster' } as unknown as InstanceGroup,
            { id: 51, name: 'High Memory Nodes' } as unknown as InstanceGroup,
          ],
        },
      };

      const { result } = renderHook(() => useGetSchedulePromptValues());
      const hookFunction = result.current;

      const promptValues = await hookFunction(fullyPopulatedTemplate, [], [], []);

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

      const testConfig: LaunchConfiguration = {
        ...templateLaunch,
        ask_tags_on_launch: true,
        ask_verbosity_on_launch: true,
        ask_inventory_on_launch: true,
        ask_credential_on_launch: true,
        ask_instance_groups_on_launch: true,
        ask_labels_on_launch: true,
      };
      const promptValues = await hookFunction(
        testConfig,
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

      const testConfig: LaunchConfiguration = {
        ...templateLaunch,
        ask_tags_on_launch: true,
        ask_skip_tags_on_launch: true,
        ask_limit_on_launch: true,
        ask_forks_on_launch: true,
        ask_verbosity_on_launch: true,
        ask_inventory_on_launch: true,
      };
      const promptValues = await hookFunction(testConfig, [], [], []);

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
