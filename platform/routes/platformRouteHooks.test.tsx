import { renderHook } from '@testing-library/react';
import { AwxRoute } from '@ansible/awx-ui/main/AwxRoutes';
import { EdaRoute } from '@ansible/eda-ui/main/EdaRoutes';
import { HubRoute } from '@ansible/hub-ui/main/HubRoutes';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import { PlatformRoute } from '../main/PlatformRoutes';
import { collectPageNavigationRouteIds } from '../test-utils/collectPageNavigationRoutes';
import { useGetPlatformApplicationsRoutes } from './useGetPlatformApplicationsRoutes';
import { useGetPlatformAuthenticatorsRoutes } from './useGetPlatformAuthenticatorsRoutes';
import { useGetPlatformOrganizationsRoutes } from './useGetPlatformOrganizationsRoutes';
import { useGetPlatformResourceRoutes } from './useGetPlatformResourceRoutes';
import { useGetPlatformRolesRoutes } from './useGetPlatformRolesRoutes';
import { useGetPlatformTeamsRoutes } from './useGetPlatformTeamsRoutes';
import { useGetPlatformUsersRoutes } from './useGetPlatformUsersRoutes';

function renderPlatformRouteHook<T>(useRoutes: () => T) {
  return renderHook(useRoutes, {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
  });
}

describe('platform route definition hooks', () => {
  test('useGetPlatformUsersRoutes should define users access routes', () => {
    const { result } = renderPlatformRouteHook(useGetPlatformUsersRoutes);
    const routeIds = collectPageNavigationRouteIds(result.current);

    expect(result.current.id).toBe(PlatformRoute.Users);
    expect(result.current.path).toBe('users');
    expect(routeIds).toEqual(
      expect.arrayContaining([
        PlatformRoute.CreateUser,
        PlatformRoute.EditUser,
        PlatformRoute.UserPage,
        PlatformRoute.UserDetails,
        PlatformRoute.UserTeams,
        PlatformRoute.UserRoles,
        PlatformRoute.UserAssignRoles,
      ])
    );
  });

  test('useGetPlatformTeamsRoutes should define teams access routes', () => {
    const { result } = renderPlatformRouteHook(useGetPlatformTeamsRoutes);
    const routeIds = collectPageNavigationRouteIds(result.current);

    expect(result.current.id).toBe(PlatformRoute.Teams);
    expect(result.current.path).toBe('teams');
    expect(routeIds).toEqual(
      expect.arrayContaining([
        PlatformRoute.CreateTeam,
        PlatformRoute.EditTeam,
        PlatformRoute.TeamPage,
        PlatformRoute.TeamDetails,
        PlatformRoute.TeamAssignRoles,
      ])
    );
  });

  test('useGetPlatformOrganizationsRoutes should define organization access routes', () => {
    const { result } = renderPlatformRouteHook(useGetPlatformOrganizationsRoutes);
    const routeIds = collectPageNavigationRouteIds(result.current);

    expect(result.current.id).toBe(PlatformRoute.Organizations);
    expect(result.current.path).toBe('organizations');
    expect(routeIds).toEqual(
      expect.arrayContaining([
        PlatformRoute.CreateOrganization,
        PlatformRoute.EditOrganization,
        PlatformRoute.OrganizationPage,
        PlatformRoute.OrganizationDetails,
      ])
    );
  });

  test('useGetPlatformAuthenticatorsRoutes should define authenticator routes', () => {
    const { result } = renderPlatformRouteHook(useGetPlatformAuthenticatorsRoutes);
    const routeIds = collectPageNavigationRouteIds(result.current);

    expect(result.current.id).toBe(PlatformRoute.Authenticators);
    expect(result.current.path).toBe('authenticators');
    expect(routeIds).toEqual(
      expect.arrayContaining([
        PlatformRoute.CreateAuthenticator,
        PlatformRoute.EditAuthenticator,
        PlatformRoute.AuthenticatorPage,
      ])
    );
  });

  test('useGetPlatformRolesRoutes should define roles access routes', () => {
    const { result } = renderPlatformRouteHook(useGetPlatformRolesRoutes);
    const routeIds = collectPageNavigationRouteIds(result.current);

    expect(routeIds).toEqual(
      expect.arrayContaining([
        PlatformRoute.Roles,
        PlatformRoute.CreateRole,
        PlatformRoute.EditRole,
        PlatformRoute.RoleDetails,
      ])
    );
  });

  test('useGetPlatformApplicationsRoutes should define OAuth application routes', () => {
    const { result } = renderPlatformRouteHook(useGetPlatformApplicationsRoutes);
    const routeIds = collectPageNavigationRouteIds(result.current);

    expect(routeIds).toEqual(
      expect.arrayContaining([
        PlatformRoute.Applications,
        PlatformRoute.ApplicationPage,
        PlatformRoute.ApplicationDetails,
        PlatformRoute.CreateApplication,
        PlatformRoute.EditApplication,
      ])
    );
  });

  test('useGetPlatformResourceRoutes should define platform resource redirect routes', () => {
    const routes = useGetPlatformResourceRoutes();
    const routeIds = collectPageNavigationRouteIds(routes);

    expect(routes.id).toBe(PlatformRoute.PlatformResources);
    expect(routes.path).toBe('resources');
    expect(routeIds).toEqual(
      expect.arrayContaining([
        PlatformRoute.PlatformResource,
        PlatformRoute.PlatformResourceRoute,
        AwxRoute.OrganizationPage,
        AwxRoute.UserPage,
        AwxRoute.TeamPage,
        EdaRoute.OrganizationPage,
        EdaRoute.UserPage,
        HubRoute.UserDetails,
        HubRoute.TeamDetails,
      ])
    );
  });
});
