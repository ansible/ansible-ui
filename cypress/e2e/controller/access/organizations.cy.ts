/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

import { randomString } from '../../../../framework/utils/random-string';
import { Organization } from '../../../../frontend/controller/interfaces/Organization';
import { ItemsResponse } from '../../../../frontend/Data';

describe('organizations', () => {
  let organization: Organization;

  after(() => {
    // Sometimes if tests are stopped in the middle, we get left over organizations
    // Cleanup E2E organizations older than 2 hours
    cy.requestGet<ItemsResponse<Organization>>(
      `/api/v2/organizations/?limit=100&created__lt=${new Date(
        Date.now() - 2 * 60 * 60 * 1000
      ).toISOString()}&name__startswith=E2E`
    ).then((itemsResponse) => {
      for (const organization of itemsResponse.results) {
        cy.requestDelete(`/api/v2/organizations/${organization.id}/`, true);
      }
    });
  });

  beforeEach(() => {
    cy.requestPost<Organization>('/api/v2/organizations/', {
      name: 'E2E Organization ' + randomString(4),
    }).then((testOrganization) => (organization = testOrganization));
  });

  afterEach(() => {
    cy.requestDelete(`/api/v2/organizations/${organization.id}/`, true);
  });

  it('organization page', () => {
    cy.navigateTo(/^Organizations$/, false);
    cy.hasTitle(/^Organizations$/);
  });
});
