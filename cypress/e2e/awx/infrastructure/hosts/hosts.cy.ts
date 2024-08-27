import { randomString } from '../../../../../framework/utils/random-string';
import { Inventory } from '../../../../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../../frontend/awx/interfaces/Project';
import { awxAPI } from '../../../../support/formatApiPathForAwx';
import {
  checkHostGroup,
  createHostAndCancelJob,
  launchHostJob,
} from '../../../../support/hostsfunctions';

describe('Host Tests', () => {
  let organization: Organization;
  let inventory: Inventory;
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
    });
  });

  after(() => {
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
    cy.deleteAwxProject(project, { failOnStatusCode: false });
  });

  it('can create, edit and delete a stand alone host', () => {
    const hostName = 'E2E Inventory host ' + randomString(4);
    cy.navigateTo('awx', 'hosts');
    cy.clickButton(/^Create host$/);
    cy.verifyPageTitle('Create host');
    cy.getByDataCy('name').type(hostName);
    cy.getByDataCy('description').type('This is the description');
    cy.singleSelectByDataCy('inventory', inventory.name);
    cy.getByDataCy('variables').type('test: true');
    cy.clickButton(/^Create host/);
    cy.hasDetail(/^Name$/, hostName);
    cy.hasDetail(/^Description$/, 'This is the description');
    cy.get('[data-cy="code-block-value"]').should('contains.text', 'test: true');
    cy.navigateTo('awx', 'hosts');
    cy.filterTableByMultiSelect('name', [hostName]);
    cy.getByDataCy('edit-host').click();
    cy.verifyPageTitle(`Edit ${hostName}`);
    cy.getByDataCy('description').clear().type('This is the description edited');
    cy.getByDataCy('Submit').click();
    cy.hasDetail(/^Description$/, 'This is the description edited');
    cy.navigateTo('awx', 'hosts');
    cy.filterTableByMultiSelect('name', [hostName]);
    cy.get(`[data-cy="actions-column-cell"] [data-cy="actions-dropdown"]`).click();
    cy.getByDataCy('delete-host').click();
    cy.clickModalConfirmCheckbox();
    cy.clickModalButton('Delete hosts');
    cy.contains('button', 'Close').click();
    cy.contains(/^No results found./);
  });

  it('can create, edit, associate and disassociate groups at stand alone host groups tab', () => {
    // use checkHostGroup function in order to test stand alone host group
    checkHostGroup('stand_alone_host', organization);
  });

  it('can see and launch jobs from host jobs tab', () => {
    cy.createInventoryHost(organization, '').then((result) => {
      launchHostJob(result.inventory, result.host, organization.id, project.id, 'Host');
      cy.deleteAwxInventory(result.inventory, { failOnStatusCode: false });
    });
  });

  it('can cancel jobs from host jobs tab', () => {
    createHostAndCancelJob(inventory, organization.id, project.id);
  });

  it('can view host facts in stand alone host', () => {
    const hostName = 'E2E Inventory host ' + randomString(4);
    cy.navigateTo('awx', 'hosts');
    cy.clickButton(/^Create host$/);
    cy.verifyPageTitle('Create host');
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
    cy.containsBy('a', 'Facts').click();
    cy.get('code').should('contain', 'ansible_dns');
  });
});
