import { describe, expect, it, vi, beforeEach } from 'vitest';
import { assignRoles, PulpRbacApi, PulpRole } from './pulp-rbac';

// Mock the request functions
vi.mock('./request', () => ({
  getHubRequest: vi.fn(),
  postHubRequest: vi.fn(),
}));

// Mock formatPath
vi.mock('./formatPath', () => ({
  pulpAPI: (strings: TemplateStringsArray, ...values: string[]) =>
    '/api/automation-hub/pulp/api/v3' +
    strings.reduce((acc, str, i) => acc + str + (values[i] || ''), ''),
}));

describe('assignRoles', () => {
  it('should return empty arrays when given empty roles', () => {
    const result = assignRoles([]);

    expect(result.users).toEqual([]);
    expect(result.groups).toEqual([]);
  });

  it('should correctly assign roles to users', () => {
    const roles: PulpRole[] = [
      { role: 'admin', users: ['user1', 'user2'], groups: [] },
      { role: 'viewer', users: ['user1'], groups: [] },
    ];

    const result = assignRoles(roles);

    expect(result.users).toHaveLength(2);
    expect(result.users[0]).toEqual({
      username: 'user1',
      object_roles: ['admin', 'viewer'],
    });
    expect(result.users[1]).toEqual({
      username: 'user2',
      object_roles: ['admin'],
    });
  });

  it('should correctly assign roles to groups', () => {
    const roles: PulpRole[] = [
      { role: 'admin', users: [], groups: ['group1', 'group2'] },
      { role: 'editor', users: [], groups: ['group1'] },
    ];

    const result = assignRoles(roles);

    expect(result.groups).toHaveLength(2);
    expect(result.groups[0]).toEqual({
      name: 'group1',
      object_roles: ['admin', 'editor'],
    });
    expect(result.groups[1]).toEqual({
      name: 'group2',
      object_roles: ['admin'],
    });
  });

  it('should correctly assign roles to both users and groups', () => {
    const roles: PulpRole[] = [
      { role: 'admin', users: ['alice'], groups: ['admins'] },
      { role: 'viewer', users: ['bob', 'alice'], groups: ['viewers'] },
    ];

    const result = assignRoles(roles);

    expect(result.users).toHaveLength(2);
    expect(result.groups).toHaveLength(2);
    expect(result.users.find((u) => u.username === 'alice')?.object_roles).toEqual([
      'admin',
      'viewer',
    ]);
    expect(result.groups.find((g) => g.name === 'admins')?.object_roles).toEqual(['admin']);
  });

  it('should sort users alphabetically by username', () => {
    const roles: PulpRole[] = [{ role: 'admin', users: ['zoe', 'alice', 'bob'], groups: [] }];

    const result = assignRoles(roles);

    expect(result.users.map((u) => u.username)).toEqual(['alice', 'bob', 'zoe']);
  });

  it('should sort groups alphabetically by name', () => {
    const roles: PulpRole[] = [{ role: 'admin', users: [], groups: ['zebras', 'alphas', 'betas'] }];

    const result = assignRoles(roles);

    expect(result.groups.map((g) => g.name)).toEqual(['alphas', 'betas', 'zebras']);
  });

  it('should handle roles with undefined users or groups', () => {
    const roles = [{ role: 'admin', users: undefined, groups: undefined }] as unknown as PulpRole[];

    const result = assignRoles(roles);

    expect(result.users).toEqual([]);
    expect(result.groups).toEqual([]);
  });

  it('should handle roles with null users or groups', () => {
    const roles = [{ role: 'admin', users: null, groups: null }] as unknown as PulpRole[];

    const result = assignRoles(roles);

    expect(result.users).toEqual([]);
    expect(result.groups).toEqual([]);
  });
});

describe('PulpRbacApi', () => {
  let api: PulpRbacApi;
  let mockGetHubRequest: ReturnType<typeof vi.fn>;
  let mockPostHubRequest: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const requestModule = await import('./request');
    mockGetHubRequest = requestModule.getHubRequest as ReturnType<typeof vi.fn>;
    mockPostHubRequest = requestModule.postHubRequest as ReturnType<typeof vi.fn>;
    api = new PulpRbacApi('remotes/ansible/collection');
  });

  describe('listRoles', () => {
    it('should call getHubRequest with correct URL', async () => {
      mockGetHubRequest.mockResolvedValue({
        response: { roles: [] },
      });

      await api.listRoles('test-id');

      expect(mockGetHubRequest).toHaveBeenCalledWith(
        expect.stringContaining('/remotes/ansible/collection/test-id/list_roles/')
      );
    });

    it('should include query params when provided', async () => {
      mockGetHubRequest.mockResolvedValue({
        response: { roles: [] },
      });

      await api.listRoles('test-id', { limit: 100 });

      expect(mockGetHubRequest).toHaveBeenCalledWith(expect.stringContaining('limit=100'));
    });

    it('should return roles response', async () => {
      const mockRoles = {
        roles: [{ role: 'admin', users: ['user1'], groups: [] }],
      };
      mockGetHubRequest.mockResolvedValue({ response: mockRoles });

      const result = await api.listRoles('test-id');

      expect(result).toEqual(mockRoles);
    });
  });

  describe('myPermissions', () => {
    it('should call getHubRequest with correct URL', async () => {
      mockGetHubRequest.mockResolvedValue({
        response: { permissions: [] },
      });

      await api.myPermissions('test-id');

      expect(mockGetHubRequest).toHaveBeenCalledWith(
        expect.stringContaining('/remotes/ansible/collection/test-id/my_permissions/')
      );
    });

    it('should return permissions response', async () => {
      const mockPerms = { permissions: ['view_remote', 'edit_remote'] };
      mockGetHubRequest.mockResolvedValue({ response: mockPerms });

      const result = await api.myPermissions('test-id');

      expect(result).toEqual(mockPerms);
    });
  });

  describe('addRole', () => {
    it('should call postHubRequest with correct URL and data', async () => {
      mockPostHubRequest.mockResolvedValue({});

      await api.addRole('test-id', { role: 'admin', users: ['user1'] });

      expect(mockPostHubRequest).toHaveBeenCalledWith(
        expect.stringContaining('/remotes/ansible/collection/test-id/add_role/'),
        { role: 'admin', users: ['user1'] }
      );
    });

    it('should support adding roles to groups', async () => {
      mockPostHubRequest.mockResolvedValue({});

      await api.addRole('test-id', { role: 'viewer', groups: ['group1'] });

      expect(mockPostHubRequest).toHaveBeenCalledWith(expect.stringContaining('/add_role/'), {
        role: 'viewer',
        groups: ['group1'],
      });
    });
  });

  describe('removeRole', () => {
    it('should call postHubRequest with correct URL and data', async () => {
      mockPostHubRequest.mockResolvedValue({});

      await api.removeRole('test-id', { role: 'admin', users: ['user1'] });

      expect(mockPostHubRequest).toHaveBeenCalledWith(
        expect.stringContaining('/remotes/ansible/collection/test-id/remove_role/'),
        { role: 'admin', users: ['user1'] }
      );
    });

    it('should support removing roles from groups', async () => {
      mockPostHubRequest.mockResolvedValue({});

      await api.removeRole('test-id', { role: 'viewer', groups: ['group1'] });

      expect(mockPostHubRequest).toHaveBeenCalledWith(expect.stringContaining('/remove_role/'), {
        role: 'viewer',
        groups: ['group1'],
      });
    });
  });
});
