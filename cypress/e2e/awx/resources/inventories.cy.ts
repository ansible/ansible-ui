/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { randomString } from '../../../../framework/utils/random-string';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';

describe('inventories', () => {
  let organization: Organization;

  before(() => {
    cy.awxLogin();

    cy.requestPost<Organization>('/api/v2/organizations/', {
      name: 'E2E Teams ' + randomString(4),
    }).then((testOrg) => {
      organization = testOrg;
    });
  });

  after(() => {
    cy.requestDelete(`/api/v2/organizations/${organization.id}/`, true);
  });

  it('renders the inventories list page', () => {
    cy.navigateTo(/^Inventories$/, false);
    cy.hasTitle(/^Inventories$/);
  });

  it('test inventory with host and group', () => {
    cy.createInventoryHostGroup(organization).then((result) => {
      const { inventory, host, group } = result;
      expect(host.inventory).to.eq(inventory.id);
      expect(group.inventory).to.eq(inventory.id);
    });
  });
});
