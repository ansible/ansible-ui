import { randomString } from '../../../../framework/utils/random-string';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { InventorySource } from '../../../../frontend/awx/interfaces/InventorySource';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';

describe('Inventory source page', () => {
  const credentialName = 'e2e-' + randomString(4);

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

      cy.createAWXCredential({
        name: credentialName,
        kind: 'gce',
        organization: organization.id,
        credential_type: 9,
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
    cy.getBy('#confirm').click();
    cy.clickButton(/^Delete inventory source/);
  });

  it('creates a project inventory source', () => {
    cy.navigateTo('awx', 'inventories');
    cy.clickTableRow(inventory.name);
    cy.verifyPageTitle(inventory.name);
    cy.clickLink(/^Sources$/);
    cy.clickButton(/^Add source/);
    cy.verifyPageTitle('Add new source');
    cy.getBy('[data-cy="name"]').type('project source');
    cy.selectDropdownOptionByResourceName('source_control_type', 'Sourced from a Project');
    cy.selectDropdownOptionByResourceName('project', project.name);
    cy.selectDropdownOptionByResourceName('inventory', 'Dockerfile');
    cy.getBy('.pf-v5-c-input-group > .pf-v5-c-button').click();
    cy.getBy('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
      cy.searchAndDisplayResource(credentialName);
      cy.getBy('[data-cy="checkbox-column-cell"] > label').click();
      cy.getBy('#confirm').click();
    });
    cy.getBy('[data-cy="host-filter"]').type('/^test$/');
    cy.getBy('[data-cy="verbosity"]').type('1');
    cy.getBy('[data-cy="enabled-var"]').type('foo.bar');
    cy.getBy('[data-cy="enabled-value"]').type('test');
    cy.getBy('[data-cy="overwrite"]').check();
    cy.getBy('[data-cy="overwrite_vars"]').check();
    cy.getBy('[data-cy="update_on_launch"]').check();
    cy.getBy('[data-cy="update-cache-timeout"]').type('1');
    cy.getBy('.view-lines').type('test: "output"');
    cy.getBy('[data-cy="Submit"]').click();
    cy.verifyPageTitle('project source');
  });

  it('creates an amazon ec2 inventory source', () => {
    cy.navigateTo('awx', 'inventories');
    cy.clickTableRow(inventory.name);
    cy.verifyPageTitle(inventory.name);
    cy.clickLink(/^Sources$/);
    cy.getBy('#add-source').click();
    cy.verifyPageTitle('Add new source');
    cy.getBy('[data-cy="name"]').type('amazon ec2 source');
    cy.selectDropdownOptionByResourceName('source_control_type', 'Amazon EC2');
    cy.getBy('[data-cy="Submit"]').click();
    cy.verifyPageTitle('amazon ec2 source');
  });
});
