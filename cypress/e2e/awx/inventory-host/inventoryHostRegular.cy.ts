import { randomString } from '../../../../framework/utils/random-string';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { AwxUser } from '../../../../frontend/awx/interfaces/User';
import { awxAPI } from '../../../support/formatApiPathForAwx';
import {
  checkHostGroup,
  createAndEditAndDeleteHost,
  createHost,
  createHostAndCancelJob,
  launchHostJob,
  testHostBulkDelete,
} from '../../../support/hostsfunctions';
import { runCommand } from './runCommandFunction';

describe('Inventory Host Tab Tests for regular inventory', () => {
  let organization: Organization;
  let inventory: Inventory;
  let user: AwxUser;
  let project: Project;

  before(() => {
    cy.createAwxOrganization().then((org) => {
      organization = org;
      cy.createAwxInventory(organization).then((inv) => {
        inventory = inv;
      });
      cy.createAwxProject(organization).then((proj) => {
        project = proj;
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

  it('can create, edit, associate, and disassociate groups at inventory -> hosts -> groups tab', () => {
    checkHostGroup('inventory_host', organization);
  });

  it('can create, edit and delete inventory host action from list view', () => {
    createAndEditAndDeleteHost('inventory_host', inventory, 'list');
  });

  it('can edit and delete inventory host action from details view', () => {
    createAndEditAndDeleteHost('inventory_host', inventory, 'details');
  });

  it('can bulk delete multiple hosts from the hosts tab of an inventory', () => {
    testHostBulkDelete('inventory_host', inventory);
  });

  it("can view a host's facts on the facts tab of a host inside an inventory", () => {
    const hostName = 'E2E Inventory host ' + randomString(4);
    cy.navigateTo('awx', 'hosts');
    cy.clickButton(/^Create host$/);
    cy.verifyPageTitle('Create Host');
    cy.getByDataCy('name').type(hostName);
    cy.getByDataCy('description').type('This is the description');
    cy.singleSelectByDataCy('inventory', inventory.name);
    cy.getByDataCy('variables').type('test: true');
    cy.clickButton(/^Create host/);
    cy.hasDetail(/^Name$/, hostName);
    cy.hasDetail(/^Description$/, 'This is the description');
    cy.get('[data-cy="code-block-value"]').should('contains.text', 'test: true');
    cy.intercept(
      { method: 'GET', url: awxAPI`/hosts/*/ansible_facts/` },
      {
        ansible_dns: {
          search: ['dev-ui.svc.cluster.local', 'svc.cluster.local', 'cluster.local'],
          options: {
            ndots: '5',
          },
          nameservers: ['10.43.0.10'],
        },
      }
    );
    cy.navigateTo('awx', 'inventories');
    cy.filterTableByMultiSelect('name', [inventory.name]);
    cy.get('[data-cy="name-column-cell"]').contains(inventory.name).click();
    cy.get('.pf-v5-c-tabs__item > a').contains('Hosts').click();
    cy.filterTableByMultiSelect('name', [hostName]);
    cy.get('[data-cy="name-column-cell"]').contains(hostName).click();
    cy.containsBy('a', 'Facts').click();
    cy.get('code').should('contain', 'ansible_dns');
  });

  it('can launch a job template that uses an inventory with a particular host and view the job on the host jobs tab inside the inventory', () => {
    cy.createAwxProject(organization).then((project) => {
      cy.createInventoryHost(organization, '').then((result) => {
        launchHostJob(result.inventory, result.host, organization.id, project.id, 'InventoryHost');
        cy.deleteAwxInventory(result.inventory, { failOnStatusCode: false });
        cy.deleteAwxProject(project, { failOnStatusCode: false });
      });
    });
  });

  it('can cancel a currently running job from the host jobs tab inside an inventory', () => {
    createHostAndCancelJob(inventory, organization.id, project.id, true);
  });

  it(`can run an ad-hoc command against a host on the inventory hosts tab`, () => {
    createHost('inventory_host', inventory.id);
    cy.navigateTo('awx', 'inventories');
    cy.intercept('get', awxAPI`/inventories/?name=${inventory.name}*`).as('getInventories');
    cy.filterTableByMultiSelect('name', [inventory.name]);
    cy.wait('@getInventories');
    cy.contains('a', inventory.name).click();
    cy.contains(`a[role="tab"]`, 'Hosts').click();
    cy.getByDataCy('run-command').click();
    runCommand({
      selections: 'all',
      module: 'shell',
      verbosity: '0-(normal)',
      forks: 2,
      show_changes: true,
      become_enabled: true,
      organization,
    });
  });

  it('can run an ad-hoc command against the host on the groups tab of a host-inventory from the host details page', () => {
    createHost('inventory_host', inventory.id);
    const groupName = 'E2E group ' + randomString(4);
    cy.createInventoryGroup(inventory, groupName);
    cy.log(`inv: ${inventory.name}, group: ${groupName}`);
    cy.navigateTo('awx', 'inventories');
    cy.intercept('get', awxAPI`/inventories/?name=${inventory.name}*`).as('getInventories');
    cy.filterTableByMultiSelect('name', [inventory.name]);
    cy.wait('@getInventories');
    cy.contains('a', inventory.name).click();
    cy.contains(`a[role="tab"]`, 'Groups').click();
    cy.reload();
    cy.contains('a', groupName).click();
    cy.contains(`a[role="tab"]`, 'Hosts').click();
    // add existing host
    cy.getByDataCy('add-existing-host').click();
    cy.getByDataCy('select-all').click();
    cy.clickModalButton('Add hosts');
    cy.getByDataCy('run-command').click();
    runCommand({
      selections: 'all',
      module: 'shell',
      verbosity: '0-(normal)',
      forks: 2,
      show_changes: true,
      become_enabled: true,
      organization,
    });
  });
});
