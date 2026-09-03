import { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { Instance } from '../../../interfaces/Instance';
import { cannotRunHealthCheckDueToManagedInstance } from './useInstanceActions';

describe('cannotRunHealthCheckDueToManagedInstance', () => {
  const mockTranslate = ((key: string) => key) as TFunction<'translation', undefined>;

  it('should allow health checks on managed instances', () => {
    const managedInstance: Partial<Instance> = {
      id: 1,
      hostname: 'managed-instance',
      node_type: 'execution',
      managed: true,
    };

    const result = cannotRunHealthCheckDueToManagedInstance(
      managedInstance as Instance,
      mockTranslate
    );

    expect(result).toBe('');
  });

  it('should allow health checks on non-managed instances', () => {
    const nonManagedInstance: Partial<Instance> = {
      id: 2,
      hostname: 'non-managed-instance',
      node_type: 'execution',
      managed: false,
    };

    const result = cannotRunHealthCheckDueToManagedInstance(
      nonManagedInstance as Instance,
      mockTranslate
    );

    expect(result).toBe('');
  });

  it('should allow health checks when managed property is undefined', () => {
    const instance: Partial<Instance> = {
      id: 3,
      hostname: 'instance-no-managed-field',
      node_type: 'execution',
    };

    const result = cannotRunHealthCheckDueToManagedInstance(instance as Instance, mockTranslate);

    expect(result).toBe('');
  });
});
