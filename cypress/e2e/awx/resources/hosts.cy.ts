import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { AwxUser } from '../../../../frontend/awx/interfaces/User';
import {
  checkFactsInHost,
  checkHostGroup,
  createAndEditAndDeleteHost,
  createHostAndLaunchJob,
} from '../../../support/hostsfunctions';

describe('Host Tests', () => {
  let organization: Organization;
  let inventory: Inventory;
  let user: AwxUser;
  let project: Project;

  before(() => {
    cy.createAwxOrganization().then((org) => {
      organization = org;
      cy.createAwxInventory({ organization: organization.id }).then((inv) => {
        inventory = inv;
      });
      cy.createAwxUser(organization).then((testUser) => {
        user = testUser;
        cy.createAwxProject({ organization: organization.id }).then((proj) => {
          project = proj;
          // cy.giveUserProjectAccess(project.name, user.id, 'Read');
        });
      });
    });
  });

  after(() => {
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxUser(user, { failOnStatusCode: false });
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
    createHostAndLaunchJob(inventory, organization.id, project.id);
  });

  it.skip('can cancel jobs from host jobs tab', () => {});

  it('can view host facts in stand alone host', () => {
    checkFactsInHost(inventory);
  });
});
