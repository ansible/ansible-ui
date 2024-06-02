/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { AwxUser } from '../../../../frontend/awx/interfaces/User';
//import { createAndEditAndDeleteHost} from '../../../support/hostsfunctions';

describe('Inventory Host Tab Tests for contructed inventory', () => {
  let organization: Organization;
  let inventory: Inventory;
  let user: AwxUser;

  before(() => {
    cy.awxLogin();
    cy.createAwxOrganization().then((org) => {
      organization = org;
      cy.createInventoryHost(organization, 'constructed').then((result) => {
        const { inventory: inv, host } = result;
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
  it.skip(`can run an ad-hoc command against a host on the inventory hosts tab`, () => {
    //1) Use the inventory created in before, access the host tab of that inventory
    //2) Use a host, EE, and credential - these resources are needed to run a command against a host
    //3) Assert redirect to the job output screen
    //4) Navigate to the details page of the job and assert the values there match what was entered in the Run Command Wizard
    //5) Navigate back to the Inventory -> Jobs Tab to assert that the Run Command job shows up there
  });

  it.skip('can run an ad-hoc command against the host on the groups tab of a host-inventory from the host details page', () => {
    //1) Use the inventory created in before, access the host tab of that inventory, visit the host details page
    //2) Use a host, EE, and credential - these resources are needed to run a command against a host
    //3) Assert redirect to the job output screen
    //4) Navigate to the details page of the job and assert the values there match what was entered in the Run Command Wizard
    //5) Navigate back to the Inventory -> Jobs Tab to assert that the Run Command job shows up there
  });

  it.skip('confirm that edit host button is missing from the host tab list of an inventory', () => {});

  it.skip('confirm that delete host button is missing from the host tab list of an inventory', () => {});

  it.skip('confirm that facts tab is missing from a host inside an inventory', () => {});
});
