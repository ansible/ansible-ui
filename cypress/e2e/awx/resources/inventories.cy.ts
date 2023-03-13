/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { AwxOrgResource } from '../../../support/commands';

describe('inventories', () => {
  let organization: Organization;

  before(() => {
    cy.awxLogin();

    cy.createBaselineResourcesForAWX({ onlyCreateOrg: true }).then((resources) => {
      organization = (resources as AwxOrgResource).organization;
    });
  });

  after(() => {
    cy.cleanupBaselineResourcesForAWX();
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
