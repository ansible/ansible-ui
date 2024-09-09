import { Authenticator } from '../../../../platform/interfaces/Authenticator';
import { PlatformItemsResponse } from '../../../../platform/interfaces/PlatformItemsResponse';
import { PlatformOrganization } from '../../../../platform/interfaces/PlatformOrganization';
import { PlatformTeam } from '../../../../platform/interfaces/PlatformTeam';
import { PlatformUser } from '../../../../platform/interfaces/PlatformUser';
import { gatewayAPI } from '../../../support/formatApiPathForPlatform';

const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

describe('Platform Authenticator methods cleanup', () => {
  it('cleanup platform authenticator methods', () => {
    cy.requestGet<{ results?: Authenticator[] }>(
      gatewayAPI`/authenticators/?name__startswith=E2E&order_by=order&page=1&page_size=10&created__lt=${thirtyMinutesAgo}`
    ).then((result: { results?: Authenticator[] }) => {
      const filteredResources: Authenticator[] =
        result.results?.filter((resource) => resource.name.toLowerCase().startsWith('e2e')) ?? [];

      for (const resource of filteredResources) {
        cy.deleteAuthenticator(resource, { failOnStatusCode: false });
      }
    });
  });
});

describe('Platform Access resources cleanup', () => {
  it('cleanup platform teams', () => {
    cy.requestGet<PlatformItemsResponse<PlatformTeam>>(
      gatewayAPI`/teams/?name__startswith=Platform E2E Team&page=1&page_size=200&created__lt=${thirtyMinutesAgo}`
    ).then((result: { results?: PlatformTeam[] }) => {
      const filteredResources: PlatformTeam[] =
        result.results?.filter((resource) => resource.name.toLowerCase().startsWith('e2e')) ?? [];

      for (const resource of filteredResources) {
        cy.deletePlatformTeam(resource, { failOnStatusCode: false });
      }
    });
  });

  it('cleanup platform organizations', () => {
    cy.requestGet<PlatformItemsResponse<PlatformOrganization>>(
      gatewayAPI`/organizations/?name__startswith=E2E Platform Org&page=1&page_size=200&created__lt=${thirtyMinutesAgo}`
    ).then((result: { results?: PlatformOrganization[] }) => {
      const filteredResources: PlatformOrganization[] =
        result.results?.filter((resource) => resource.name.toLowerCase().startsWith('e2e')) ?? [];

      for (const resource of filteredResources) {
        cy.deletePlatformOrganization(resource, { failOnStatusCode: false });
      }
    });
  });

  it('cleanup platform users', () => {
    cy.requestGet<PlatformItemsResponse<PlatformUser>>(
      gatewayAPI`/users/?username__startswith=platform-e2e-user-&page=1&page_size=200&created__lt=${thirtyMinutesAgo}`
    ).then((result: { results?: PlatformUser[] }) => {
      const filteredResources: PlatformUser[] =
        result.results?.filter((resource) =>
          resource.username.toLowerCase().startsWith('platform-e2e-user-')
        ) ?? [];

      for (const resource of filteredResources) {
        cy.deletePlatformUser(resource, { failOnStatusCode: false });
      }
    });
  });
});
