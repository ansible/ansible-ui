import { Inventory } from '../../../../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../../frontend/awx/interfaces/Project';
import {
  checkFactsInHost,
  checkHostGroup,
  createAndEditAndDeleteHost,
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

  //tests
  it('can create, edit and delete a stand alone host', () => {
    // use createAndEditAndDeleteHost function in order to test stand alone hosts basic functions
    // after navigating to the right url
    cy.navigateTo('awx', 'hosts');
    createAndEditAndDeleteHost('stand_alone_host', inventory, 'list');
  });

  it('can create, edit, assosiat and disassosiate groups at stand alone host groups tab', () => {
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
    checkFactsInHost(inventory, 'stand_alone');
  });
});
