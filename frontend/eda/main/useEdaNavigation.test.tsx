/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PageNavigationItem } from '@ansible/ansible-ui-framework/PageNavigation/PageNavigationItem';
import { EdaRoute } from './EdaRoutes';
import { useEdaNavigation } from './useEdaNavigation';

function renderUseEdaNavigation() {
  return renderHook(() => useEdaNavigation(), {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
  });
}

function hasChildren(
  item: PageNavigationItem
): item is PageNavigationItem & { children: PageNavigationItem[] } {
  return 'children' in item && Array.isArray(item.children);
}

function hasElement(
  item: PageNavigationItem
): item is PageNavigationItem & { element: JSX.Element } {
  return 'element' in item;
}

function findNavItemById(items: PageNavigationItem[], id: string): PageNavigationItem | undefined {
  for (const item of items) {
    if (item.id === id) return item;
    if (hasChildren(item)) {
      const found = findNavItemById(item.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

function collectRouteIds(items: PageNavigationItem[]): string[] {
  const ids: string[] = [];
  for (const item of items) {
    if (item.id) ids.push(item.id);
    if (hasChildren(item)) {
      ids.push(...collectRouteIds(item.children));
    }
  }
  return ids;
}

describe('useEdaNavigation', () => {
  it('should return a navigation items array', () => {
    const { result } = renderUseEdaNavigation();

    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('should include Overview as the first item', () => {
    const { result } = renderUseEdaNavigation();
    const overview = result.current[0];

    expect(overview.id).toBe(EdaRoute.Overview);
    expect(overview.path).toBe('overview');
    expect(overview.label).toBe('Overview');
    expect(hasElement(overview)).toBe(true);
  });

  it('should include all expected top-level sections', () => {
    const { result } = renderUseEdaNavigation();
    const paths = result.current.map((item) => item.path);

    expect(paths).toContain('overview');
    expect(paths).toContain('rule-audits');
    expect(paths).toContain('rulebook-activations');
    expect(paths).toContain('projects');
    expect(paths).toContain('decision-environments');
    expect(paths).toContain('event-streams');
    expect(paths).toContain('access');
    expect(paths).toContain('settings');
    expect(paths).toContain('');
  });

  it('should redirect the empty path to overview', () => {
    const { result } = renderUseEdaNavigation();
    const rootRedirect = result.current.find((item) => item.path === '' && hasElement(item));

    expect(rootRedirect).toBeDefined();
  });

  it('should include every registered EDA route id except login and root', () => {
    const { result } = renderUseEdaNavigation();
    const routeIds = collectRouteIds(result.current);

    expect(routeIds).toEqual(
      expect.arrayContaining([
        EdaRoute.Overview,
        EdaRoute.RuleAudits,
        EdaRoute.RuleAuditPage,
        EdaRoute.RuleAuditDetails,
        EdaRoute.RuleAuditActions,
        EdaRoute.RuleAuditEvents,
        EdaRoute.RulebookActivations,
        EdaRoute.CreateRulebookActivation,
        EdaRoute.EditRulebookActivation,
        EdaRoute.RulebookActivationInstancePage,
        EdaRoute.RulebookActivationInstanceDetails,
        EdaRoute.RulebookActivationPage,
        EdaRoute.RulebookActivationDetails,
        EdaRoute.RulebookActivationHistory,
        EdaRoute.RulebookActivationTeamAccess,
        EdaRoute.RulebookActivationUserAccess,
        EdaRoute.RulebookActivationAddUsers,
        EdaRoute.RulebookActivationManageUsers,
        EdaRoute.RulebookActivationAssignTeams,
        EdaRoute.Projects,
        EdaRoute.CreateProject,
        EdaRoute.EditProject,
        EdaRoute.ProjectPage,
        EdaRoute.ProjectDetails,
        EdaRoute.ProjectTeamAccess,
        EdaRoute.ProjectUserAccess,
        EdaRoute.ProjectAddUsers,
        EdaRoute.ProjectManageUsers,
        EdaRoute.ProjectAssignTeams,
        EdaRoute.DecisionEnvironments,
        EdaRoute.CreateDecisionEnvironment,
        EdaRoute.EditDecisionEnvironment,
        EdaRoute.DecisionEnvironmentPage,
        EdaRoute.DecisionEnvironmentDetails,
        EdaRoute.DecisionEnvironmentTeamAccess,
        EdaRoute.DecisionEnvironmentUserAccess,
        EdaRoute.DecisionEnvironmentAddUsers,
        EdaRoute.DecisionEnvironmentManageUsers,
        EdaRoute.DecisionEnvironmentAssignTeams,
        EdaRoute.EventStreams,
        EdaRoute.CreateEventStream,
        EdaRoute.EditEventStream,
        EdaRoute.EventStreamPage,
        EdaRoute.EventStreamDetails,
        EdaRoute.EventStreamActivations,
        EdaRoute.EventStreamTeamAccess,
        EdaRoute.EventStreamUserAccess,
        EdaRoute.EventStreamAddUsers,
        EdaRoute.EventStreamManageUsers,
        EdaRoute.EventStreamAssignTeams,
        EdaRoute.Access,
        EdaRoute.Users,
        EdaRoute.MyPage,
        EdaRoute.MyDetails,
        EdaRoute.CreateUser,
        EdaRoute.EditUser,
        EdaRoute.EditCurrentUser,
        EdaRoute.UserPage,
        EdaRoute.UserDetails,
        EdaRoute.UserRoles,
        EdaRoute.UserAddRoles,
        EdaRoute.Teams,
        EdaRoute.CreateTeam,
        EdaRoute.EditTeam,
        EdaRoute.TeamPage,
        EdaRoute.TeamRoles,
        EdaRoute.TeamDetails,
        EdaRoute.TeamAddRoles,
        EdaRoute.Organizations,
        EdaRoute.CreateOrganization,
        EdaRoute.EditOrganization,
        EdaRoute.OrganizationPage,
        EdaRoute.OrganizationDetails,
        EdaRoute.Roles,
        EdaRoute.CreateRole,
        EdaRoute.EditRole,
        EdaRoute.RolePage,
        EdaRoute.RoleDetails,
        EdaRoute.Credentials,
        EdaRoute.CreateCredential,
        EdaRoute.EditCredential,
        EdaRoute.CredentialPage,
        EdaRoute.CredentialDetails,
        EdaRoute.CredentialTeamAccess,
        EdaRoute.CredentialUserAccess,
        EdaRoute.CredentialAddUsers,
        EdaRoute.CredentialManageUsers,
        EdaRoute.CredentialAssignTeams,
        EdaRoute.CredentialTypes,
        EdaRoute.CreateCredentialType,
        EdaRoute.EditCredentialType,
        EdaRoute.CredentialTypePage,
        EdaRoute.CredentialTypeDetails,
        EdaRoute.CredentialTypeCredentials,
        EdaRoute.Settings,
        EdaRoute.SettingsPreferences,
      ])
    );
    expect(routeIds).not.toContain(EdaRoute.Login);
    expect(routeIds).not.toContain(EdaRoute.Eda);
  });

  it('should nest Rule Audit details, actions, and events under the page route', () => {
    const { result } = renderUseEdaNavigation();
    const page = findNavItemById(result.current, EdaRoute.RuleAuditPage);

    expect(page?.path).toBe(':id');
    expect(page && hasChildren(page)).toBe(true);
    if (page && hasChildren(page)) {
      const childIds = page.children.map((child) => child.id);
      expect(childIds).toContain(EdaRoute.RuleAuditDetails);
      expect(childIds).toContain(EdaRoute.RuleAuditActions);
      expect(childIds).toContain(EdaRoute.RuleAuditEvents);
    }
  });

  it('should nest Rulebook Activation page tabs and instance history', () => {
    const { result } = renderUseEdaNavigation();
    const page = findNavItemById(result.current, EdaRoute.RulebookActivationPage);
    const instancePage = findNavItemById(result.current, EdaRoute.RulebookActivationInstancePage);

    expect(findNavItemById(result.current, EdaRoute.CreateRulebookActivation)?.path).toBe('create');
    expect(findNavItemById(result.current, EdaRoute.EditRulebookActivation)?.path).toBe('edit/:id');
    expect(instancePage?.path).toBe(':id/history/:instanceId');
    expect(page && hasChildren(page)).toBe(true);
    if (page && hasChildren(page)) {
      const childIds = page.children.map((child) => child.id);
      expect(childIds).toContain(EdaRoute.RulebookActivationDetails);
      expect(childIds).toContain(EdaRoute.RulebookActivationHistory);
      expect(childIds).toContain(EdaRoute.RulebookActivationTeamAccess);
      expect(childIds).toContain(EdaRoute.RulebookActivationUserAccess);
    }
  });

  it('should nest Project page tabs and access routes', () => {
    const { result } = renderUseEdaNavigation();
    const page = findNavItemById(result.current, EdaRoute.ProjectPage);

    expect(findNavItemById(result.current, EdaRoute.CreateProject)?.path).toBe('create');
    expect(findNavItemById(result.current, EdaRoute.EditProject)?.path).toBe('edit/:id');
    expect(findNavItemById(result.current, EdaRoute.ProjectAddUsers)?.path).toBe(
      ':id/user-access/add'
    );
    expect(findNavItemById(result.current, EdaRoute.ProjectManageUsers)?.path).toBe(
      ':resource_id/user-access/:resource_type/:user_id/manage'
    );
    expect(findNavItemById(result.current, EdaRoute.ProjectAssignTeams)?.path).toBe(
      ':id/team-access/assign'
    );
    expect(page && hasChildren(page)).toBe(true);
    if (page && hasChildren(page)) {
      const childIds = page.children.map((child) => child.id);
      expect(childIds).toContain(EdaRoute.ProjectDetails);
      expect(childIds).toContain(EdaRoute.ProjectTeamAccess);
      expect(childIds).toContain(EdaRoute.ProjectUserAccess);
    }
  });

  it('should nest Decision Environment page tabs and access routes', () => {
    const { result } = renderUseEdaNavigation();
    const page = findNavItemById(result.current, EdaRoute.DecisionEnvironmentPage);

    expect(findNavItemById(result.current, EdaRoute.CreateDecisionEnvironment)?.path).toBe(
      'create'
    );
    expect(findNavItemById(result.current, EdaRoute.EditDecisionEnvironment)?.path).toBe(
      'edit/:id'
    );
    expect(page && hasChildren(page)).toBe(true);
    if (page && hasChildren(page)) {
      const childIds = page.children.map((child) => child.id);
      expect(childIds).toContain(EdaRoute.DecisionEnvironmentDetails);
      expect(childIds).toContain(EdaRoute.DecisionEnvironmentTeamAccess);
      expect(childIds).toContain(EdaRoute.DecisionEnvironmentUserAccess);
    }
  });

  it('should nest Event Stream page tabs and access routes', () => {
    const { result } = renderUseEdaNavigation();
    const page = findNavItemById(result.current, EdaRoute.EventStreamPage);

    expect(findNavItemById(result.current, EdaRoute.CreateEventStream)?.path).toBe('create');
    expect(findNavItemById(result.current, EdaRoute.EditEventStream)?.path).toBe('edit/:id');
    expect(page && hasChildren(page)).toBe(true);
    if (page && hasChildren(page)) {
      const childIds = page.children.map((child) => child.id);
      expect(childIds).toContain(EdaRoute.EventStreamDetails);
      expect(childIds).toContain(EdaRoute.EventStreamActivations);
      expect(childIds).toContain(EdaRoute.EventStreamTeamAccess);
      expect(childIds).toContain(EdaRoute.EventStreamUserAccess);
    }
  });

  it('should nest Access Management users, teams, organizations, roles, credentials, and credential types', () => {
    const { result } = renderUseEdaNavigation();
    const access = findNavItemById(result.current, EdaRoute.Access);

    expect(access?.path).toBe('access');
    expect(access?.label).toBe('Access Management');
    expect(findNavItemById(result.current, EdaRoute.Users)?.path).toBe('users');
    expect(findNavItemById(result.current, EdaRoute.Teams)?.path).toBe('teams');
    expect(findNavItemById(result.current, EdaRoute.Organizations)?.path).toBe('organizations');
    expect(findNavItemById(result.current, EdaRoute.Roles)?.path).toBe('roles');
    expect(findNavItemById(result.current, EdaRoute.Credentials)?.path).toBe('credentials');
    expect(findNavItemById(result.current, EdaRoute.CredentialTypes)?.path).toBe(
      'credential-types'
    );
  });

  it('should nest user, team, credential, and credential type page children', () => {
    const { result } = renderUseEdaNavigation();
    const userPage = findNavItemById(result.current, EdaRoute.UserPage);
    const teamPage = findNavItemById(result.current, EdaRoute.TeamPage);
    const credentialPage = findNavItemById(result.current, EdaRoute.CredentialPage);
    const credentialTypePage = findNavItemById(result.current, EdaRoute.CredentialTypePage);
    const myPage = findNavItemById(result.current, EdaRoute.MyPage);

    expect(userPage && hasChildren(userPage)).toBe(true);
    expect(teamPage && hasChildren(teamPage)).toBe(true);
    expect(credentialPage && hasChildren(credentialPage)).toBe(true);
    expect(credentialTypePage && hasChildren(credentialTypePage)).toBe(true);
    expect(myPage && hasChildren(myPage)).toBe(true);
    if (userPage && hasChildren(userPage)) {
      expect(userPage.children.map((child) => child.id)).toEqual(
        expect.arrayContaining([EdaRoute.UserDetails, EdaRoute.UserRoles])
      );
    }
    if (credentialPage && hasChildren(credentialPage)) {
      expect(credentialPage.children.map((child) => child.id)).toEqual(
        expect.arrayContaining([
          EdaRoute.CredentialDetails,
          EdaRoute.CredentialTeamAccess,
          EdaRoute.CredentialUserAccess,
        ])
      );
    }
  });

  it('should include Settings user preferences', () => {
    const { result } = renderUseEdaNavigation();
    const settings = findNavItemById(result.current, EdaRoute.Settings);
    const preferences = findNavItemById(result.current, EdaRoute.SettingsPreferences);

    expect(settings?.path).toBe('settings');
    expect(settings?.label).toBe('Settings');
    expect(preferences?.path).toBe('preferences');
    expect(preferences?.label).toBe('User Preferences');
    expect(preferences && hasChildren(preferences)).toBe(true);
  });
});
