import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { InventorySource } from '../../../../frontend/awx/interfaces/InventorySource';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
describe('Inventory source page', () => {
  let organization: Organization;
  let project: Project;
  let inventory: Inventory;
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
        inventory = inv;
        cy.createAwxInventorySource(inv, project).then((invSrc) => {
          inventorySource = invSrc;
        });
      });
    });
  });

  afterEach(() => {
    cy.deleteAwxProject(project, { failOnStatusCode: false });
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  it('deletes an inventory source from the details page', () => {
    cy.visit(
      `/infrastructure/inventories/inventory/${inventorySource.inventory}/sources/${inventorySource.id}/details`
    );

    cy.verifyPageTitle(inventorySource.name);
    cy.clickPageAction('delete-inventory-source');
    cy.get('#confirm').click();
    cy.clickButton(/^Delete inventory source/);
  });

  it('creates an inventory source from the details page', () => {
    cy.navigateTo('awx', 'inventories');
    cy.clickTableRow(inventory.name);
    cy.verifyPageTitle(inventory.name);
    cy.clickLink(/^Sources$/);
    cy.get('#add-source').click();
    cy.verifyPageTitle('Add new source');
    cy.get('[data-cy="name"]').type('source 1');
    cy.selectDropdownOptionByResourceName('source_control_type', 'Sourced from a Project');
    cy.selectDropdownOptionByResourceName('project', project.name);
    cy.selectDropdownOptionByResourceName('inventory', 'Dockerfile');
    cy.get('.pf-v5-c-input-group > .pf-v5-c-button').click();
    cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
      cy.searchAndDisplayResource('Demo Credential');
      cy.get('[data-cy="checkbox-column-cell"] > label').click();
      cy.get('#confirm').click();
    });
    cy.get('[data-cy="host-filter"]').type('/^test$/');
    cy.get('[data-cy="verbosity"]').type('1');
    cy.get('[data-cy="enabled-var"]').type('foo.bar');
    cy.get('[data-cy="enabled-value"]').type('test');
    cy.get('[data-cy="overwrite"]').check();
    cy.get('[data-cy="overwrite_vars"]').check();
    cy.get('[data-cy="update_on_launch"]').check();
    cy.get('[data-cy="update-cache-timeout"]').type('1');
    cy.get('.view-lines').type('test: "output"');
    cy.get('[data-cy="Submit"]').click();
    cy.verifyPageTitle('source 1');
  });
});
