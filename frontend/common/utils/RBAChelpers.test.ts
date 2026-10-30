import { describe, expect, it } from 'vitest';
import {
  cannotCopyResource,
  cannotDeleteResource,
  cannotDeleteResources,
  cannotEditResource,
} from './RBAChelpers';

const t = (key: string) => key;

const editableResource = {
  summary_fields: { user_capabilities: { edit: true, delete: true, copy: true } },
};

const readOnlyResource = {
  summary_fields: { user_capabilities: { edit: false, delete: false, copy: false } },
};

describe('RBAChelpers', () => {
  it('should allow edit when user has edit capability', () => {
    expect(cannotEditResource(editableResource, t)).toBe('');
  });

  it('should block edit when user lacks edit capability', () => {
    expect(cannotEditResource(readOnlyResource, t)).toBe(
      'This cannot be edited due to insufficient permissions.'
    );
  });

  it('should allow edit when canCreateResource is true', () => {
    expect(cannotEditResource(readOnlyResource, t, true)).toBe('');
  });

  it('should allow delete when user has delete capability', () => {
    expect(cannotDeleteResource(editableResource, t)).toBe('');
  });

  it('should block delete when user lacks delete capability', () => {
    expect(cannotDeleteResource(readOnlyResource, t)).toBe(
      'This cannot be deleted due to insufficient permissions.'
    );
  });

  it('should block bulk delete when any item lacks delete capability', () => {
    expect(cannotDeleteResources([editableResource, readOnlyResource], t)).toBe(
      'Cannot delete due to insufficient permissions with one or many items.'
    );
  });

  it('should allow bulk delete when all items are deletable', () => {
    expect(cannotDeleteResources([editableResource], t)).toBe('');
  });

  it('should allow copy when user has copy capability', () => {
    expect(cannotCopyResource(editableResource, t)).toBe('');
  });

  it('should block copy when user lacks copy capability', () => {
    expect(cannotCopyResource(readOnlyResource, t)).toBe(
      'This cannot be copied due to insufficient permissions.'
    );
  });
});
