import { describe, expect, it } from 'vitest';
import { JobEvent } from '../../../interfaces/JobEvent';
import { isHostEvent, isJobRunning } from './util';

describe('JobOutput util', () => {
  describe('isJobRunning', () => {
    it('should return true for "new" status', () => {
      expect(isJobRunning('new')).toBe(true);
    });

    it('should return true for "pending" status', () => {
      expect(isJobRunning('pending')).toBe(true);
    });

    it('should return true for "waiting" status', () => {
      expect(isJobRunning('waiting')).toBe(true);
    });

    it('should return true for "running" status', () => {
      expect(isJobRunning('running')).toBe(true);
    });

    it('should return true for undefined status', () => {
      expect(isJobRunning(undefined)).toBe(true);
    });

    it('should return false for "successful" status', () => {
      expect(isJobRunning('successful')).toBe(false);
    });

    it('should return false for "failed" status', () => {
      expect(isJobRunning('failed')).toBe(false);
    });

    it('should return false for "error" status', () => {
      expect(isJobRunning('error')).toBe(false);
    });

    it('should return false for "canceled" status', () => {
      expect(isJobRunning('canceled')).toBe(false);
    });
  });

  describe('isHostEvent', () => {
    it('should return true when host is a number', () => {
      const event = { host: 1, event: 'runner_on_ok', type: 'job_event' } as unknown as JobEvent;
      expect(isHostEvent(event)).toBe(true);
    });

    it('should return true when event_data.res is present', () => {
      const event = {
        host: null,
        event: 'runner_on_ok',
        type: 'job_event',
        event_data: { res: { stderr: '' } },
      } as unknown as JobEvent;
      expect(isHostEvent(event)).toBe(true);
    });

    it('should return true for project_update_event with event_data.host and non-skipped event', () => {
      const event = {
        host: null,
        event: 'runner_on_ok',
        type: 'project_update_event',
        event_data: { host: 'localhost' },
      } as unknown as JobEvent;
      expect(isHostEvent(event)).toBe(true);
    });

    it('should return false for project_update_event with runner_on_skipped event', () => {
      const event = {
        host: null,
        event: 'runner_on_skipped',
        type: 'project_update_event',
        event_data: { host: 'localhost' },
      } as unknown as JobEvent;
      expect(isHostEvent(event)).toBe(false);
    });

    it('should return false for project_update_event without event_data.host', () => {
      const event = {
        host: null,
        event: 'runner_on_ok',
        type: 'project_update_event',
        event_data: {},
      } as unknown as JobEvent;
      expect(isHostEvent(event)).toBe(false);
    });

    it('should return false when host is null and no event_data.res', () => {
      const event = {
        host: null,
        event: 'playbook_on_start',
        type: 'job_event',
        event_data: {},
      } as unknown as JobEvent;
      expect(isHostEvent(event)).toBe(false);
    });

    it('should return false when event_data is undefined', () => {
      const event = {
        host: null,
        event: 'playbook_on_start',
        type: 'job_event',
      } as unknown as JobEvent;
      expect(isHostEvent(event)).toBe(false);
    });

    it('should return true when host is 0 (falsy number)', () => {
      const event = { host: 0, event: 'runner_on_ok', type: 'job_event' } as unknown as JobEvent;
      expect(isHostEvent(event)).toBe(true);
    });
  });
});
