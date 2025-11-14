import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { describe, expect, it } from 'vitest';

describe('ScheduleAddWizard - Error Handling', () => {
  it('should handle missing resources error and format it correctly', () => {
    const fieldErrors = [
      {
        name: 'resources_needed_to_start',
        message: 'Job Template inventory is missing or undefined.',
      },
    ];

    const missingResource = fieldErrors.find((err) => err?.name === 'resources_needed_to_start');

    expect(missingResource).toBeDefined();
    expect(missingResource?.message).toBe('Job Template inventory is missing or undefined.');

    if (missingResource) {
      const errors = {
        __all__: [missingResource.message],
      };
      const requestError = new RequestError('', '', 400, '', errors);
      expect(requestError.json).toEqual({
        __all__: ['Job Template inventory is missing or undefined.'],
      });
      expect(requestError.statusCode).toBe(400);
    }
  });

  it('should re-throw other errors that are not missing resources', () => {
    const fieldErrors = [
      {
        name: 'some_other_error',
        message: 'Some other validation error',
      },
    ];

    const missingResource = fieldErrors.find((err) => err?.name === 'resources_needed_to_start');

    expect(missingResource).toBeUndefined();
  });

  it('should handle multiple field errors and only catch resources_needed_to_start', () => {
    const fieldErrors = [
      {
        name: 'name',
        message: 'Name is required',
      },
      {
        name: 'resources_needed_to_start',
        message: 'Job Template inventory is missing or undefined.',
      },
      {
        name: 'timezone',
        message: 'Invalid timezone',
      },
    ];

    const missingResource = fieldErrors.find((err) => err?.name === 'resources_needed_to_start');

    expect(missingResource).toBeDefined();
    expect(missingResource?.name).toBe('resources_needed_to_start');
    expect(missingResource?.message).toBe('Job Template inventory is missing or undefined.');
  });
});
