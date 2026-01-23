/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useHubNavigation } from './useHubNavigation';
import { HubRoute } from './HubRoutes';

// Mock isInsightsMode
vi.mock('../common/isInsights', () => ({
  isInsightsMode: vi.fn(() => false),
}));

// Import the mock so we can change its return value
import { isInsightsMode } from '../common/isInsights';

// Mock all the component imports to avoid loading the full component tree
vi.mock('../overview/HubOverview', () => ({ HubOverview: () => null }));
vi.mock('../namespaces/HubNamespaces', () => ({ Namespaces: () => null }));
vi.mock('../namespaces/HubNamespaceForm', () => ({
  CreateHubNamespace: () => null,
  EditHubNamespace: () => null,
}));
vi.mock('../namespaces/HubNamespacePage/HubNamespacePage', () => ({
  HubNamespacePage: () => null,
}));
vi.mock('../namespaces/HubNamespacePage/HubNamespaceCollections', () => ({
  HubNamespaceCollections: () => null,
}));
vi.mock('../namespaces/HubNamespacePage/HubNamespaceDetails', () => ({
  HubNamespaceDetails: () => null,
}));
vi.mock('../namespaces/HubNamespacePage/HubNamespaceCLI', () => ({
  HubNamespaceCLI: () => null,
}));
vi.mock('../namespaces/HubNamespacePage/HubNamespaceTeamAccess', () => ({
  HubNamespaceTeamAccess: () => null,
}));
vi.mock('../namespaces/HubNamespacePage/HubNamespaceUserAccess', () => ({
  HubNamespaceUserAccess: () => null,
}));
vi.mock('../namespaces/components/HubNamespaceAddUsers', () => ({
  HubNamespaceAddUsers: () => null,
}));
vi.mock('../namespaces/components/HubNamespaceAssignTeams', () => ({
  HubNamespaceAssignTeams: () => null,
}));
vi.mock('../namespaces/components/HubNamespaceManageUsers', () => ({
  HubNamespaceManageUsers: () => null,
}));
vi.mock('../collections/Collections', () => ({ Collections: () => null }));
vi.mock('../collections/UploadCollection', () => ({ UploadCollection: () => null }));
vi.mock('../collections/CollectionSignatureUpload', () => ({
  CollectionSignatureUpload: () => null,
}));
vi.mock('../collections/CollectionPage/CollectionPage', () => ({
  CollectionPage: () => null,
}));
vi.mock('../collections/CollectionPage/CollectionDetails', () => ({
  CollectionDetails: () => null,
}));
vi.mock('../collections/CollectionPage/CollectionInstall', () => ({
  CollectionInstall: () => null,
}));
vi.mock('../collections/CollectionPage/CollectionDocumentation', () => ({
  CollectionDocumentation: () => null,
}));
vi.mock('../collections/CollectionPage/CollectionContents', () => ({
  CollectionContents: () => null,
}));
vi.mock('../collections/CollectionPage/CollectionImportLog', () => ({
  CollectionImportLog: () => null,
}));
vi.mock('../collections/CollectionPage/CollectionDistributions', () => ({
  CollectionDistributions: () => null,
}));
vi.mock('../collections/CollectionPage/CollectionDependencies', () => ({
  CollectionDependencies: () => null,
}));
vi.mock('../execution-environments/ExecutionEnvironments', () => ({
  ExecutionEnvironments: () => null,
}));
vi.mock('../execution-environments/ExecutionEnvironmentForm', () => ({
  CreateExecutionEnvironment: () => null,
  EditExecutionEnvironment: () => null,
}));
vi.mock('../execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentPage', () => ({
  ExecutionEnvironmentPage: () => null,
}));
vi.mock('../execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentDetails', () => ({
  ExecutionEnvironmentDetails: () => null,
}));
vi.mock('../execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentActivity', () => ({
  ExecutionEnvironmentActivity: () => null,
}));
vi.mock('../execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentImages', () => ({
  ExecutionEnvironmentImages: () => null,
}));
vi.mock(
  '../execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentTeamAccess',
  () => ({
    ExecutionEnvironmentTeamAccess: () => null,
  })
);
vi.mock(
  '../execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentUserAccess',
  () => ({
    ExecutionEnvironmentUserAccess: () => null,
  })
);
vi.mock('../execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentAddUser', () => ({
  ExecutionEnvironmentAddUsers: () => null,
}));
vi.mock(
  '../execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentAssignTeam',
  () => ({
    ExecutionEnvironmentAssignTeams: () => null,
  })
);
vi.mock(
  '../execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentManageUser',
  () => ({
    ExecutionEnvironmentManageUsers: () => null,
  })
);
vi.mock('../execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentImagePage', () => ({
  ExecutionEnvironmentImagePage: () => null,
}));
vi.mock(
  '../execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentImageDetails',
  () => ({
    ExecutionEnvironmentImageDetails: () => null,
  })
);
vi.mock('../administration/tasks/Tasks', () => ({ Tasks: () => null }));
vi.mock('../administration/tasks/TaskDetails', () => ({ TaskDetails: () => null }));
vi.mock('../administration/collection-approvals/Approvals', () => ({ Approvals: () => null }));
vi.mock('../administration/signature-keys/SignatureKeys', () => ({ SignatureKeys: () => null }));
vi.mock('../administration/repositories/Repositories', () => ({ Repositories: () => null }));
vi.mock('../administration/repositories/RepositoryForm', () => ({ RepositoryForm: () => null }));
vi.mock('../administration/repositories/RepositoryPage/RepositoryPage', () => ({
  RepositoryPage: () => null,
}));
vi.mock('../administration/repositories/RepositoryPage/RepositoryDetails', () => ({
  RepositoryDetails: () => null,
}));
vi.mock('../administration/repositories/RepositoryPage/RepositoryTeamAccess', () => ({
  RepositoryTeamAccess: () => null,
}));
vi.mock('../administration/repositories/RepositoryPage/RepositoryUserAccess', () => ({
  RepositoryUserAccess: () => null,
}));
vi.mock('../administration/repositories/RepositoryPage/RepositoryCollectionVersion', () => ({
  RepositoryCollectionVersion: () => null,
}));
vi.mock('../administration/repositories/RepositoryPage/RepositoryVersions', () => ({
  RepositoryVersions: () => null,
}));
vi.mock('../administration/repositories/RepositoryPage/RepositoryDistributions', () => ({
  RepositoryDistributions: () => null,
}));
vi.mock('../administration/repositories/RepositoryPage/RepositoryAddUser', () => ({
  RepositoryAddUsers: () => null,
}));
vi.mock('../administration/repositories/RepositoryPage/RepositoryAssignTeam', () => ({
  RepositoryAssignTeams: () => null,
}));
vi.mock('../administration/repositories/RepositoryPage/RepositoryManageUser', () => ({
  RepositoryManageUsers: () => null,
}));
vi.mock('../administration/repositories/RepositoryVersionPage/RepositoryVersionPage', () => ({
  RepositoryVersionPage: () => null,
}));
vi.mock('../administration/repositories/RepositoryVersionPage/RepositoryVersionDetails', () => ({
  RepositoryVersionDetails: () => null,
}));
vi.mock(
  '../administration/repositories/RepositoryVersionPage/RepositoryVersionCollections',
  () => ({
    RepositoryVersionCollections: () => null,
  })
);
vi.mock('../administration/remotes/Remotes', () => ({ Remotes: () => null }));
vi.mock('../administration/remotes/RemoteForm', () => ({
  CreateRemote: () => null,
  EditRemote: () => null,
}));
vi.mock('../administration/remotes/RemotePage/RemotePage', () => ({ RemotePage: () => null }));
vi.mock('../administration/remotes/RemotePage/RemoteDetails', () => ({
  RemoteDetails: () => null,
}));
vi.mock('../administration/remotes/RemotePage/RemoteUserAccess', () => ({
  RemoteUserAccess: () => null,
}));
vi.mock('../administration/remotes/RemotePage/RemoteTeamAccess', () => ({
  RemoteTeamAccess: () => null,
}));
vi.mock('../administration/remotes/RemotePage/RemoteAddUser', () => ({
  RemoteAddUsers: () => null,
}));
vi.mock('../administration/remotes/RemotePage/RemoteAssignTeam', () => ({
  RemoteAssignTeams: () => null,
}));
vi.mock('../administration/remotes/RemotePage/RemoteManageUser', () => ({
  RemoteManageUsers: () => null,
}));
vi.mock('../administration/remote-registries/RemoteRegistries', () => ({
  RemoteRegistries: () => null,
}));
vi.mock('../administration/remote-registries/RemoteRegistryForm', () => ({
  CreateRemoteRegistry: () => null,
  EditRemoteRegistry: () => null,
}));
vi.mock('../administration/remote-registries/RemoteRegistryPage/RemoteRegistryPage', () => ({
  RemoteRegistryPage: () => null,
}));
vi.mock('../administration/remote-registries/RemoteRegistryPage/RemoteRegistryDetails', () => ({
  RemoteRegistryDetails: () => null,
}));
vi.mock('../access/token/Token', () => ({ Token: () => null }));
vi.mock('../access/roles/HubRoles', () => ({ HubRoles: () => null }));
vi.mock('../access/roles/RolePage/HubRolePage', () => ({ HubRolePage: () => null }));
vi.mock('../access/roles/RolePage/HubRoleDetails', () => ({ HubRoleDetails: () => null }));
vi.mock('../access/roles/RolePage/HubRoleForm', () => ({
  CreateRole: () => null,
  EditRole: () => null,
}));
vi.mock('../access/teams/TeamPage/TeamUserRole', () => ({ HubTeamRoles: () => null }));
vi.mock('../access/teams/components/HubAddTeamRoles', () => ({ HubAddTeamRoles: () => null }));
vi.mock('../access/users/UserPage/HubUserRoles', () => ({ HubUserRoles: () => null }));
vi.mock('../access/users/components/HubAddUserRoles', () => ({ HubAddUserRoles: () => null }));
vi.mock('../my-imports/MyImports', () => ({ MyImports: () => null }));
vi.mock('@ansible/ansible-ui-framework', () => ({
  PageNotImplemented: () => null,
}));
vi.mock('@ansible/ansible-ui-framework/PageSettings/PageSettingsDetails', () => ({
  PageSettingsDetails: () => null,
}));
vi.mock('@ansible/ansible-ui-framework/PageSettings/PageSettingsForm', () => ({
  PageSettingsForm: () => null,
}));

function renderUseHubNavigation() {
  return renderHook(() => useHubNavigation(), {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
  });
}

// Helper type guard to check if nav item has children
function hasChildren(item: ReturnType<typeof useHubNavigation>[number]): item is ReturnType<
  typeof useHubNavigation
>[number] & {
  children: ReturnType<typeof useHubNavigation>;
} {
  return 'children' in item && Array.isArray(item.children);
}

// Helper type guard to check if nav item has an element
function hasElement(
  item: ReturnType<typeof useHubNavigation>[number]
): item is ReturnType<typeof useHubNavigation>[number] & { element: JSX.Element } {
  return 'element' in item;
}

// Helper to find a navigation item by id
function findNavItemById(
  items: ReturnType<typeof useHubNavigation>,
  id: string
): ReturnType<typeof useHubNavigation>[number] | undefined {
  for (const item of items) {
    if (item.id === id) return item;
    if (hasChildren(item)) {
      const found = findNavItemById(item.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

describe('useHubNavigation', () => {
  beforeEach(() => {
    vi.mocked(isInsightsMode).mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('in standalone mode (non-Insights)', () => {
    it('should return navigation items array', () => {
      const { result } = renderUseHubNavigation();
      expect(result.current).toBeDefined();
      expect(Array.isArray(result.current)).toBe(true);
      expect(result.current.length).toBeGreaterThan(0);
    });

    it('should include Overview as first item', () => {
      const { result } = renderUseHubNavigation();
      const overview = result.current[0];
      expect(overview.id).toBe(HubRoute.Overview);
      expect(overview.path).toBe('overview');
      expect(overview.label).toBe('Overview');
    });

    it('should use "namespaces" path for Namespaces', () => {
      const { result } = renderUseHubNavigation();
      const namespaces = findNavItemById(result.current, HubRoute.Namespaces);
      expect(namespaces).toBeDefined();
      expect(namespaces?.path).toBe('namespaces');
    });

    it('should include Execution Environments', () => {
      const { result } = renderUseHubNavigation();
      const execEnvs = findNavItemById(result.current, HubRoute.ExecutionEnvironments);
      expect(execEnvs).toBeDefined();
      expect(execEnvs?.path).toBe('execution-environments');
      expect(execEnvs?.label).toBe('Execution Environments');
    });

    it('should use "api-token" path for API Token', () => {
      const { result } = renderUseHubNavigation();
      const token = result.current.find(
        (item) => item.id === HubRoute.APIToken && item.path === 'api-token'
      );
      expect(token).toBeDefined();
    });

    it('should include Administration section with nested routes', () => {
      const { result } = renderUseHubNavigation();
      const admin = result.current.find((item) => item.path === 'administration');
      expect(admin).toBeDefined();
      expect(admin?.label).toBe('Administration');
      expect(admin && hasChildren(admin)).toBe(true);
      if (admin && hasChildren(admin)) {
        expect(admin.children.length).toBeGreaterThan(0);
      }
    });

    it('should include Collections with child routes', () => {
      const { result } = renderUseHubNavigation();
      const collections = findNavItemById(result.current, HubRoute.Collections);
      expect(collections).toBeDefined();
      expect(collections?.path).toBe('collections');
      expect(collections && hasChildren(collections)).toBe(true);

      // Check for upload collection route
      if (collections && hasChildren(collections)) {
        const upload = collections.children.find(
          (c: ReturnType<typeof useHubNavigation>[number]) => c.id === HubRoute.UploadCollection
        );
        expect(upload).toBeDefined();
        expect(upload?.path).toBe('upload');
      }
    });

    it('should include Access Management section', () => {
      const { result } = renderUseHubNavigation();
      const access = findNavItemById(result.current, HubRoute.Access);
      expect(access).toBeDefined();
      expect(access?.path).toBe('access');
      expect(access?.label).toBe('Access Management');
    });

    it('should include Roles under Access Management', () => {
      const { result } = renderUseHubNavigation();
      const roles = findNavItemById(result.current, HubRoute.Roles);
      expect(roles).toBeDefined();
      expect(roles?.path).toBe('roles');
    });

    it('should include Settings section', () => {
      const { result } = renderUseHubNavigation();
      const settings = findNavItemById(result.current, HubRoute.Settings);
      expect(settings).toBeDefined();
      expect(settings?.path).toBe('settings');
    });

    it('should include My Imports as hidden route', () => {
      const { result } = renderUseHubNavigation();
      const myImports = findNavItemById(result.current, HubRoute.MyImports);
      expect(myImports).toBeDefined();
      expect(myImports?.hidden).toBe(true);
    });

    it('should NOT include top-level Tasks route in standalone mode', () => {
      const { result } = renderUseHubNavigation();
      // In standalone mode, Tasks is under Administration, not top-level
      const topLevelTasks = result.current.find(
        (item) => item.id === HubRoute.Tasks && item.path === 'tasks'
      );
      // Should not have top-level tasks (that's only in Insights mode)
      expect(topLevelTasks).toBeUndefined();
    });
  });

  describe('in Insights mode', () => {
    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(true);
    });

    it('should use "partners" path for Namespaces', () => {
      const { result } = renderUseHubNavigation();
      const namespaces = findNavItemById(result.current, HubRoute.Namespaces);
      expect(namespaces).toBeDefined();
      expect(namespaces?.path).toBe('partners');
    });

    it('should NOT include Execution Environments', () => {
      const { result } = renderUseHubNavigation();
      const execEnvs = findNavItemById(result.current, HubRoute.ExecutionEnvironments);
      expect(execEnvs).toBeUndefined();
    });

    it('should use "token" path for API Token', () => {
      const { result } = renderUseHubNavigation();
      const token = result.current.find(
        (item) => item.id === HubRoute.APIToken && item.path === 'token'
      );
      expect(token).toBeDefined();
    });

    it('should include top-level Task Management', () => {
      const { result } = renderUseHubNavigation();
      const tasks = result.current.find(
        (item) => item.id === HubRoute.Tasks && item.path === 'tasks'
      );
      expect(tasks).toBeDefined();
      expect(tasks?.label).toBe('Task Management');
    });

    it('should include top-level Collection Approvals with approval-dashboard path', () => {
      const { result } = renderUseHubNavigation();
      const approvals = result.current.find(
        (item) => item.id === HubRoute.Approvals && item.path === 'approval-dashboard'
      );
      expect(approvals).toBeDefined();
      expect(approvals?.label).toBe('Collection Approvals');
    });

    it('should include top-level Signature Keys', () => {
      const { result } = renderUseHubNavigation();
      const sigKeys = result.current.find(
        (item) => item.id === HubRoute.SignatureKeys && item.path === 'signature-keys'
      );
      expect(sigKeys).toBeDefined();
    });

    it('should include ansible path wrapper for Repositories and Remotes', () => {
      const { result } = renderUseHubNavigation();
      const ansible = result.current.find((item) => item.path === 'ansible');
      expect(ansible).toBeDefined();
      expect(ansible && hasChildren(ansible)).toBe(true);

      if (ansible && hasChildren(ansible)) {
        // Check for repositories under ansible
        const repos = ansible.children.find(
          (c: ReturnType<typeof useHubNavigation>[number]) => c.path === 'repositories'
        );
        expect(repos).toBeDefined();

        // Check for remotes under ansible
        const remotes = ansible.children.find(
          (c: ReturnType<typeof useHubNavigation>[number]) => c.path === 'remotes'
        );
        expect(remotes).toBeDefined();
      }
    });
  });

  describe('navigation structure', () => {
    it('should have default redirect to overview at root', () => {
      const { result } = renderUseHubNavigation();
      const rootRedirect = result.current.find((item) => item.path === '' && hasElement(item));
      expect(rootRedirect).toBeDefined();
    });

    it('should have all required top-level sections', () => {
      const { result } = renderUseHubNavigation();
      const paths = result.current.map((item) => item.path);

      expect(paths).toContain('overview');
      expect(paths).toContain('namespaces');
      expect(paths).toContain('collections');
      expect(paths).toContain('administration');
      expect(paths).toContain('access');
    });

    it('should have proper nested structure for Collection page', () => {
      const { result } = renderUseHubNavigation();
      const collectionPage = findNavItemById(result.current, HubRoute.CollectionPage);
      expect(collectionPage).toBeDefined();
      expect(collectionPage?.path).toBe(':repository/:namespace/:name');
      expect(collectionPage && hasChildren(collectionPage)).toBe(true);

      // Check child routes
      if (collectionPage && hasChildren(collectionPage)) {
        const childIds = collectionPage.children.map(
          (c: ReturnType<typeof useHubNavigation>[number]) => c.id
        );
        expect(childIds).toContain(HubRoute.CollectionDetails);
        expect(childIds).toContain(HubRoute.CollectionInstall);
        expect(childIds).toContain(HubRoute.CollectionDocumentation);
        expect(childIds).toContain(HubRoute.CollectionContents);
      }
    });

    it('should have proper nested structure for Repository page', () => {
      const { result } = renderUseHubNavigation();
      const repoPage = findNavItemById(result.current, HubRoute.RepositoryPage);
      expect(repoPage).toBeDefined();
      expect(repoPage && hasChildren(repoPage)).toBe(true);

      // Check child routes
      if (repoPage && hasChildren(repoPage)) {
        const childIds = repoPage.children.map(
          (c: ReturnType<typeof useHubNavigation>[number]) => c.id
        );
        expect(childIds).toContain(HubRoute.RepositoryDetails);
        expect(childIds).toContain(HubRoute.RepositoryTeamAccess);
        expect(childIds).toContain(HubRoute.RepositoryUserAccess);
      }
    });
  });
});
