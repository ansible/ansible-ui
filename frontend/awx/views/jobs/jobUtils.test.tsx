import { describe, expect, it } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { UnifiedJob } from '../../interfaces/UnifiedJob';
import { getFilteredExtraVars, getJobsAPIUrl, isJobRunning, relaunchEndpoint } from './jobUtils';

describe('jobUtils', () => {
  describe('getJobsAPIUrl', () => {
    it('should return ad_hoc_commands endpoint for ad_hoc_command type', () => {
      expect(getJobsAPIUrl('ad_hoc_command')).toBe(awxAPI`/ad_hoc_commands/`);
    });

    it('should return inventory_updates endpoint for inventory_update type', () => {
      expect(getJobsAPIUrl('inventory_update')).toBe(awxAPI`/inventory_updates/`);
    });

    it('should return project_updates endpoint for project_update type', () => {
      expect(getJobsAPIUrl('project_update')).toBe(awxAPI`/project_updates/`);
    });

    it('should return system_jobs endpoint for system_job type', () => {
      expect(getJobsAPIUrl('system_job')).toBe(awxAPI`/system_jobs/`);
    });

    it('should return workflow_jobs endpoint for workflow_job type', () => {
      expect(getJobsAPIUrl('workflow_job')).toBe(awxAPI`/workflow_jobs/`);
    });

    it('should return jobs endpoint for default/job type', () => {
      expect(getJobsAPIUrl('job')).toBe(awxAPI`/jobs/`);
    });

    it('should return jobs endpoint for unknown types', () => {
      expect(getJobsAPIUrl('unknown_type')).toBe(awxAPI`/jobs/`);
    });
  });

  describe('isJobRunning', () => {
    it('should return true for new status', () => {
      expect(isJobRunning('new')).toBe(true);
    });

    it('should return true for pending status', () => {
      expect(isJobRunning('pending')).toBe(true);
    });

    it('should return true for waiting status', () => {
      expect(isJobRunning('waiting')).toBe(true);
    });

    it('should return true for running status', () => {
      expect(isJobRunning('running')).toBe(true);
    });

    it('should return false for successful status', () => {
      expect(isJobRunning('successful')).toBe(false);
    });

    it('should return false for failed status', () => {
      expect(isJobRunning('failed')).toBe(false);
    });

    it('should return false for error status', () => {
      expect(isJobRunning('error')).toBe(false);
    });

    it('should return false for canceled status', () => {
      expect(isJobRunning('canceled')).toBe(false);
    });

    it('should return true for undefined status (defaults to waiting)', () => {
      expect(isJobRunning(undefined)).toBe(true);
    });
  });

  describe('relaunchEndpoint', () => {
    it('should return ad_hoc_commands relaunch endpoint for ad_hoc_command type', () => {
      const mockJob = { id: 123, type: 'ad_hoc_command' } as unknown as UnifiedJob;
      expect(relaunchEndpoint(mockJob)).toBe(awxAPI`/ad_hoc_commands/123/relaunch/`);
    });

    it('should return workflow_jobs relaunch endpoint for workflow_job type', () => {
      const mockJob = { id: 491, type: 'workflow_job' } as unknown as UnifiedJob;
      expect(relaunchEndpoint(mockJob)).toBe(awxAPI`/workflow_jobs/491/relaunch/`);
    });

    it('should return jobs relaunch endpoint for job type', () => {
      const mockJob = { id: 492, type: 'job' } as unknown as UnifiedJob;
      expect(relaunchEndpoint(mockJob)).toBe(awxAPI`/jobs/492/relaunch/`);
    });

    it('should return inventory_sources update endpoint for inventory_update type', () => {
      const mockJob = {
        id: 100,
        type: 'inventory_update',
        inventory_source: 50,
      } as unknown as UnifiedJob;
      expect(relaunchEndpoint(mockJob)).toBe(awxAPI`/inventory_sources/50/update/`);
    });

    it('should return empty string for inventory_update without inventory_source', () => {
      const mockJob = { id: 100, type: 'inventory_update' } as unknown as UnifiedJob;
      expect(relaunchEndpoint(mockJob)).toBe('');
    });

    it('should return projects update endpoint for project_update type', () => {
      const mockJob = { id: 200, type: 'project_update', project: 10 } as unknown as UnifiedJob;
      expect(relaunchEndpoint(mockJob)).toBe(awxAPI`/projects/10/update/`);
    });

    it('should return empty string for project_update without project', () => {
      const mockJob = { id: 200, type: 'project_update' } as unknown as UnifiedJob;
      expect(relaunchEndpoint(mockJob)).toBe('');
    });

    it('should return empty string for system_job type', () => {
      const mockJob = { id: 490, type: 'system_job' } as unknown as UnifiedJob;
      expect(relaunchEndpoint(mockJob)).toBe('');
    });

    it('should return empty string for unknown types', () => {
      const mockJob = { id: 999, type: 'unknown' } as unknown as UnifiedJob;
      expect(relaunchEndpoint(mockJob)).toBe('');
    });
  });

  describe('getFilteredExtraVars', () => {
    it('should return null for null input', () => {
      expect(getFilteredExtraVars(null)).toBe(null);
    });

    it('should return undefined for undefined input', () => {
      expect(getFilteredExtraVars(undefined)).toBe(undefined);
    });

    it('should return empty string for empty string input', () => {
      expect(getFilteredExtraVars('')).toBe('');
    });

    it('should filter out empty string values', () => {
      const input = JSON.stringify({ name: 'test', empty: '', value: 123 });
      const result = getFilteredExtraVars(input);
      const parsed = JSON.parse(result!) as Record<string, unknown>;
      expect(parsed).toEqual({ name: 'test', value: 123 });
    });

    it('should preserve non-empty values', () => {
      const input = JSON.stringify({ name: 'test', count: 0, active: false });
      const result = getFilteredExtraVars(input);
      const parsed = JSON.parse(result!) as Record<string, unknown>;
      expect(parsed).toEqual({ name: 'test', count: 0, active: false });
    });

    it('should return original string for invalid JSON', () => {
      const invalidJson = 'not valid json';
      expect(getFilteredExtraVars(invalidJson)).toBe(invalidJson);
    });

    it('should handle empty object', () => {
      const input = '{}';
      const result = getFilteredExtraVars(input);
      expect(JSON.parse(result!)).toEqual({});
    });
  });
});
