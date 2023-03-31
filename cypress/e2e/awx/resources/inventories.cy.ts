/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Organization } from '../../../../frontend/awx/interfaces/Organization';

describe('inventories', () => {
  let organization: Organization;

  before(() => {
    cy.awxLogin();

    cy.createAwxOrganization().then((org) => {
      organization = org;
    });
  });

  after(() => {
    cy.deleteAwxOrganization(organization);
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
