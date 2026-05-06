import { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { Instance } from '../../../interfaces/Instance';
import { cannotRunHealthCheckDueToPermissions } from './useInstanceActions';

describe('cannotRunHealthCheckDueToPermissions', () => {
  const mockTranslate = ((key: string) => key) as TFunction<'translation', undefined>;

  it('should return error message when instance.related.health_check is missing', () => {
    const instance: Partial<Instance> = {
      id: 1,
      hostname: 'test-instance',
      node_type: 'execution',
      related: {
        jobs: '/api/v2/instances/1/jobs/',
        instance_groups: '/api/v2/instances/1/instance_groups/',
        peers: '/api/v2/instances/1/peers/',
        receptor_addresses: '/api/v2/instances/1/receptor_addresses/',
        // health_check is missing - user doesn't have RBAC permission
      },
    };

    const result = cannotRunHealthCheckDueToPermissions(instance as Instance, mockTranslate);

    expect(result).toBe('You do not have permission to run health checks on this instance.');
  });

  it('should return empty string when instance.related.health_check is present', () => {
    const instance: Partial<Instance> = {
      id: 1,
      hostname: 'test-instance',
      node_type: 'execution',
      related: {
        jobs: '/api/v2/instances/1/jobs/',
        instance_groups: '/api/v2/instances/1/instance_groups/',
        peers: '/api/v2/instances/1/peers/',
        health_check: '/api/v2/instances/1/health_check/', // User has RBAC permission
        receptor_addresses: '/api/v2/instances/1/receptor_addresses/',
      },
    };

    const result = cannotRunHealthCheckDueToPermissions(instance as Instance, mockTranslate);

    expect(result).toBe('');
  });

  it('should return error message when instance.related is undefined', () => {
    const instance: Partial<Instance> = {
      id: 1,
      hostname: 'test-instance',
      node_type: 'execution',
      // related is undefined
    };

    const result = cannotRunHealthCheckDueToPermissions(instance as Instance, mockTranslate);

    expect(result).toBe('You do not have permission to run health checks on this instance.');
  });
});
