import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { InventorySource } from '../../../../frontend/awx/interfaces/InventorySource';
describe('Inventory source page', () => {
  let organization: Organization;
  let project: Project;
  let inventorySource: InventorySource;
  before(() => {
    cy.awxLogin();
  });

  beforeEach(() => {
    cy.createAwxOrganization().then((org) => {
      organization = org;
      cy.createAwxProject({ organization: organization.id }).then((p) => {
        project = p;
      });
      cy.createAwxInventory({ organization: organization.id }).then((inv) => {
        cy.createAwxInventorySource(inv, project).then((invSrc) => {
          inventorySource = invSrc;
        });
      });
    });
  });
  it('deletes an inventory source from the details page', () => {
    cy.visit(
      `/ui_next/resources/inventories/inventory/${inventorySource.inventory}/sources/${inventorySource.id}/details`
    );

    cy.verifyPageTitle(inventorySource.name);
    cy.clickPageAction(/^Delete inventory source/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete inventory source/);

    cy.deleteAwxOrganization(organization);
  });
});
