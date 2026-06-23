import { describe, expect, test } from 'vitest';
import { awxAPI } from '../../../../common/api/awx-utils';
import type { Survey } from '../../../../interfaces/Survey';
import { getConvergenceType, getResourceURL, processSurvey } from './helpers';

describe('getConvergenceType', () => {
  test('should return "all" when convergence is true', () => {
    expect(getConvergenceType(true)).toBe('all');
  });

  test('should return "any" when convergence is false', () => {
    expect(getConvergenceType(false)).toBe('any');
  });

  test('should return "any" when convergence is null', () => {
    expect(getConvergenceType(null)).toBe('any');
  });

  test('should return "any" when convergence is undefined', () => {
    expect(getConvergenceType(undefined)).toBe('any');
  });
});

describe('getResourceURL', () => {
  test('should return job_templates URL for "job" type', () => {
    expect(getResourceURL('job')).toBe(awxAPI`/job_templates/`);
  });

  test('should return job_templates URL for "job_template" type', () => {
    expect(getResourceURL('job_template')).toBe(awxAPI`/job_templates/`);
  });

  test('should return workflow_job_templates URL for "workflow_job" type', () => {
    expect(getResourceURL('workflow_job')).toBe(awxAPI`/workflow_job_templates/`);
  });

  test('should return workflow_job_templates URL for "workflow_job_template" type', () => {
    expect(getResourceURL('workflow_job_template')).toBe(awxAPI`/workflow_job_templates/`);
  });

  test('should return inventory_sources URL for "inventory_update" type', () => {
    expect(getResourceURL('inventory_update')).toBe(awxAPI`/inventory_sources`);
  });

  test('should return inventory_sources URL for "inventory_source" type', () => {
    expect(getResourceURL('inventory_source')).toBe(awxAPI`/inventory_sources`);
  });

  test('should return projects URL for "project" type', () => {
    expect(getResourceURL('project')).toBe(awxAPI`/projects/`);
  });

  test('should return projects URL for "project_update" type', () => {
    expect(getResourceURL('project_update')).toBe(awxAPI`/projects/`);
  });

  test('should return system_job_templates URL for "system_job" type', () => {
    expect(getResourceURL('system_job')).toBe(awxAPI`/system_job_templates/`);
  });

  test('should return system_job_templates URL for "system_job_template" type', () => {
    expect(getResourceURL('system_job_template')).toBe(awxAPI`/system_job_templates/`);
  });

  test('should return empty string for "workflow_approval" type', () => {
    expect(getResourceURL('workflow_approval')).toBe('');
  });

  test('should return empty string for unknown type', () => {
    expect(getResourceURL('unknown_type')).toBe('');
  });
});

describe('processSurvey', () => {
  const mockSurveySpec: Survey = {
    name: 'Test Survey',
    description: '',
    spec: [
      {
        variable: 'text_var',
        type: 'text',
        question_name: 'Text',
        question_description: '',
        required: false,
        default: '',
        min: 0,
        max: 255,
        choices: [],
        new_question: false,
      },
      {
        variable: 'password_var',
        type: 'password',
        question_name: 'Password',
        question_description: '',
        required: false,
        default: '',
        min: 0,
        max: 255,
        choices: [],
        new_question: false,
      },
    ],
  };

  test('should merge null extra_vars with survey data and return YAML', () => {
    const result = processSurvey(null, { my_var: 'value' }, null);
    expect(result).toContain('my_var');
    expect(result).toContain('value');
  });

  test('should merge extra_vars YAML with survey data', () => {
    const result = processSurvey('extra_key: extra_val', { survey_key: 'survey_val' }, null);
    expect(result).toContain('extra_key');
    expect(result).toContain('survey_key');
  });

  test('should mask password fields when surveyConfig is provided', () => {
    const result = processSurvey(
      null,
      { password_var: 'supersecret', text_var: 'visible' },
      mockSurveySpec
    );
    expect(result).toContain('$encrypted$');
    expect(result).not.toContain('supersecret');
    expect(result).toContain('visible');
  });

  test('should not mask non-password fields', () => {
    const result = processSurvey(null, { text_var: 'visible_value' }, mockSurveySpec);
    expect(result).toContain('visible_value');
  });

  test('should not mask fields when surveyConfig is null', () => {
    const result = processSurvey(null, { secret_field: 'plaintext' }, null);
    expect(result).toContain('plaintext');
  });

  test('should allow survey data to override extra_vars keys', () => {
    const result = processSurvey('my_key: from_vars', { my_key: 'from_survey' }, null);
    expect(result).toContain('from_survey');
    expect(result).not.toContain('from_vars');
  });

  test('should mask only variables present in survey answers', () => {
    const result = processSurvey(null, { text_var: 'shown' }, mockSurveySpec);
    expect(result).toContain('shown');
    expect(result).not.toContain('$encrypted$');
  });
});
