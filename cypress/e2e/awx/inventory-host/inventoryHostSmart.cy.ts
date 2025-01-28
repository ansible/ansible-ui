/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Inventory } from '@ansible/awx-ui/interfaces/Inventory';
import { Organization } from '@ansible/awx-ui/interfaces/Organization';
import { AwxUser } from '@ansible/awx-ui/interfaces/User';
import { awxAPI } from '../../../support/formatApiPathForAwx';
import { checkHiddenButton, checkHiddenTab, launchHostJob } from '../../../support/hostsfunctions';
import { runCommand } from './runCommandFunction';

describe('Inventory Host Tab Tests for smart inventory', () => {
  let organization: Organization;
  let inventory: Inventory;
  let user: AwxUser;

  before(() => {
    cy.createAwxOrganization().then((org) => {
      organization = org;
      cy.createInventoryHost(organization, 'smart').then((result) => {
        const { inventory: inv } = result;
        inventory = inv;
      });

      cy.createAwxUser({ organization: organization.id }).then((testUser) => {
        user = testUser;
      });
    });
  });

  after(() => {
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxUser(user, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  it(`can run an ad-hoc command against a host on the inventory hosts tab`, () => {
    cy.navigateTo('awx', 'inventories');
    cy.intercept('get', awxAPI`/inventories/?search=${encodeParam(inventory.name)}*`).as(
      'getInventories'
    );
    cy.filterTableBySearch(inventory.name);
    cy.wait('@getInventories');
    cy.contains('a', inventory.name).click();
    cy.contains(`a[role="tab"]`, 'Hosts').click();
    cy.getByDataCy('run-command').click();

    runCommand({
      selections: 'all',
      module: 'shell',
      verbosity: '0',
      forks: 2,
      show_changes: true,
      become_enabled: true,
      organization,
    });
  });

  it('can launch a job template that uses an inventory with a particular host and view the job on the host jobs tab inside the inventory', () => {
    cy.createAwxProject(organization).then((project) => {
      cy.createInventoryHost(organization, 'smart').then((result) => {
        launchHostJob(result.inventory, result.host, organization.id, project.id, 'InventoryHost');
        cy.deleteAwxInventory(result.inventory, { failOnStatusCode: false });
        cy.deleteAwxProject(project, { failOnStatusCode: false });
      });
    });
  });

  it('test edit, delete and facts are not part of constracted inventory host options', () => {
    checkHiddenButton('inventory_host', inventory, `[data-cy="edit-host"]`);
    const hiddenElement = `[data-cy="actions-column-cell"] [data-cy="actions-dropdown"]`;
    checkHiddenButton('inventory_host', inventory, hiddenElement);
    checkHiddenTab('inventory_host', inventory, 'Facts');
  });
});

// encode URI params with `+` for spaces to match URLSearchParam behavior
// in the query string builder
function encodeParam(str: string) {
  return encodeURIComponent(str).replaceAll('%20', '+');
}
