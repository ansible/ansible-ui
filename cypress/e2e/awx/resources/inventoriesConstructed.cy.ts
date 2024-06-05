import { randomString } from '../../../../framework/utils/random-string';
import { InstanceGroup } from '../../../../frontend/awx/interfaces/InstanceGroup';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { awxAPI } from '../../../support/formatApiPathForAwx';

describe('Constructed Inventories CRUD Tests', () => {
  let organization: Organization;
  const arrayOfInventories = <Inventory[]>[];
  const invNames = <string[]>[];
  let constructedInv: Inventory;
  let arrayOfInputInvID: number[];
  let instanceGroup: InstanceGroup;

  before(() => {
    cy.awxLogin();

    const orgName = 'E2E Organization Constructed Inventory tests ' + randomString(4);
    cy.createAwxOrganization(orgName).then((org) => {
      organization = org;
      cy.createAwxInstanceGroup().then((ig) => {
        instanceGroup = ig;
      });
    });

    beforeEach(() => {
      // creates 3 inventories
      for (let i = 0; i < 3; i++) {
        cy.createAwxInventory({ organization: organization.id }).then((inv) => {
          arrayOfInventories.push(inv);
        });
      }
      arrayOfInventories.forEach((inv) => {
        invNames.push(inv.name);
      });
      cy.createAwxConstructedInventory(organization).then(({ constInv, inputInvList }) => {
        constructedInv = constInv;
        arrayOfInputInvID = inputInvList;
      });
    });

    afterEach(() => {
      arrayOfInventories.forEach((inv) => {
        cy.deleteAwxInventory(inv);
      });
      cy.deleteAwxConstructedInventory(constructedInv, arrayOfInputInvID);
      cy.deleteAwxInstanceGroup(instanceGroup);
      cy.deleteAwxOrganization(organization);
    });

    it('can create a constructed inventory using specific source_vars and limit and then delete that inventory', () => {
      const constInvName = 'E2E Constructed Inventory ' + randomString(4);
      // generates random values to be used during the test.
      const cacheTimeoutValue = generateRandom(0, 15);
      // which combination should be used to test verbosity from 1 to 5 - UI forces to use only 0-2
      const verbosityValue = generateRandom(0, 2);

      cy.intercept('POST', awxAPI`/constructed_inventories/`).as('createInv');

      cy.navigateTo('awx', 'inventories');
      cy.getByDataCy('create-inventory').click();
      cy.get('.pf-v5-c-dropdown__menu').within(() => {
        cy.get('[data-cy="create-constructed-inventory"]').click();
      });
      cy.getByDataCy('name').type(constInvName);
      cy.getByDataCy('description').type(`Description of "${constInvName}" typed by Cypress`);
      cy.singleSelectBy('[data-cy="organization"]', organization.name);
      cy.getByDataCy('instance-group-select-form-group')
        .find('[aria-label="Options menu"]')
        .click(); // this can be simplified if we include data-cy to the search button

      cy.filterTableByMultiSelect('name', [instanceGroup.name]);
      cy.getByDataCy('checkbox-column-cell').click();
      cy.clickModalButton('Confirm');
      cy.singleSelectBy('[data-cy="organization"]', organization.name);

      cy.multiSelectBy('[data-cy="inventories"]', invNames);
      cy.getByDataCy('update_cache_timeout').clear().type(String(cacheTimeoutValue));
      cy.singleSelectByDataCy('verbosity', String(verbosityValue));
      // FIXME: when verbosity is 0 the filed remains empty
      cy.getByDataCy('limit').type('5');
      cy.dataEditorTypeByDataCy('source-vars', 'plugin: constructed');
      cy.clickButton(/^Create inventory$/);
      cy.wait('@createInv')
        .its('response.statusCode')
        .then((statusCode) => {
          expect(statusCode).to.be.equal(201);
          cy.verifyPageTitle(constInvName);
        });
      cy.clickKebabAction('actions-dropdown', 'delete-inventory');

      cy.getModal().within(() => {
        cy.get('header').contains('Permanently delete inventory');
        cy.get('button').contains('Delete inventory').should('have.attr', 'aria-disabled', 'true');
        cy.get('[data-cy="name-column-cell"]').should('have.text', constInvName);
        cy.get('input[id="confirm"]').click();
        cy.clickButton(/^Delete inventory/);
      });

      cy.filterTableBySingleSelect('name', constInvName, true);
    });

    it('can edit and run a sync on the edited constructed inventory', () => {
      cy.visit(
        `/infrastructure/inventories/constructed_inventory/${String(constructedInv.id)}/details`
      );
      cy.verifyPageTitle(constructedInv.name);
      cy.getByDataCy('edit-inventory').click();
      //Assert the edited changes of the inventory
      //Assert that the sync ran successfully
    });

    it('can edit the input_inventories, verify the preservation of the order they were added in, and manually change the order', () => {
      //Create a constructed inventory in the beforeEach hook
      //Assert the original order of the input inventories
      //Assert the UI change to the order of input inventories
    });

    it('shows a failed sync on the constructed inventory if the user sets strict to true and enters bad variables', () => {
      //Create a constructed inventory in the beforeEach hook
      //Assert the original details of the inventory
      //Assert the user navigating to the edit constructed inventory form
      //Assert the change to the strict setting
      //Add bad variables
      //Assert the edited changes of the inventory
      //Run a sync and assert failure of the job
    });
  });
});

function generateRandom(min = 0, max = 5) {
  // find diff
  const difference = max - min;
  // generate random number
  let rand = Math.random();
  // multiply with difference
  rand = Math.floor(rand * difference);
  // add with min value
  rand = rand + min;

  return rand;
}
