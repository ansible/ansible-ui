import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { AwxUser } from '../../../../frontend/awx/interfaces/User';
import { checkHostGroup, createAndEditAndDeleteHost } from '../../../support/hostsfunctions';

describe('Host Tests', () => {
  let organization: Organization;
  let inventory: Inventory;
  let user: AwxUser;

  before(() => {
    cy.createAwxOrganization().then((org) => {
      organization = org;
      cy.createAwxInventory({ organization: organization.id }).then((inv) => {
        inventory = inv;
      });
      cy.createAwxUser(organization).then((testUser) => {
        user = testUser;
      });
    });
  });

  after(() => {
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxUser(user, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  //tests
  it('can create, edit and delete a stand alone host', () => {
    // use createAndEditAndDeleteHost function in order to test stand alone hosts basic functions
    // after navigating to the right url
    cy.visit(`/infrastructure/hosts`);
    createAndEditAndDeleteHost('stand_alone_host', inventory, 'list');
  });

  it('can create, edit, assosiat and disassosiate groups at stand alone host groups tab', () => {
    // use checkHostGroup function in order to test stand alone host group
    checkHostGroup('stand_alone_host', organization);
  });

  it.skip('can see, launch and cancel jobs from host jobs tab', () => {
    // create new host
    // create job template with the current inventory
    // job type must be run.
    // TODO: check if there is a function for that
    // launch job
    // got to host - make sure job is visible
    // launch it for all hosts
    // verify
    // lanuch it for all failed hosts
    // cancel launch
  });

  it.skip('can view host facts in stand alone host', () => {
    // create stand alone host with facts
    // TODO: check if there is some function that creates facts
    // make sure facts are visible to the user
  });
});
