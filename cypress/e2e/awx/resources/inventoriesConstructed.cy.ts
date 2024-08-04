import { randomString } from '../../../../framework/utils/random-string';
import { InstanceGroup } from '../../../../frontend/awx/interfaces/InstanceGroup';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { awxAPI } from '../../../support/formatApiPathForAwx';

describe('Constructed Inventories CRUD Tests', () => {
  let organization: Organization;
  let constructedInv: Inventory;
  let instanceGroup: InstanceGroup;
  let newInventory: Inventory;
  let inventory: Inventory;

  before(() => {
    cy.login();
    const orgName = 'E2E Org Constructed Inventory tests ' + randomString(4);
    cy.createAwxOrganization({ name: orgName }).then((org) => {
      organization = org;
      cy.createAwxInstanceGroup().then((ig) => {
        instanceGroup = ig;
      });
      cy.createAwxInventory(organization).then((inv) => {
        inventory = inv;
      });
      cy.createInventoryHost(organization, 'constructed').then((result) => {
        const { inventory: inv } = result;
        newInventory = inv;
      });
    });
  });

  beforeEach(() => {
    cy.createAwxConstructedInventory(organization).then((constInv) => {
      constructedInv = constInv;
    });
  });

  afterEach(() => {
    cy.deleteAwxConstructedInventory(constructedInv);
  });

  after(() => {
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxInventory(newInventory);
    cy.deleteAwxInstanceGroup(instanceGroup);
    cy.deleteAwxOrganization(organization);
  });

  it('can create a constructed inventory using specific source_vars and limit and then delete that inventory', () => {
    cy.intercept('POST', awxAPI`/constructed_inventories/`).as('createInv');
    const constInvName = 'E2E Constructed Inventory ' + randomString(4);
    // generates random values to be used during the test.
    const cacheTimeoutValue = generateRandom(0, 15);
    // which combination should be used to test verbosity from 1 to 5 - UI forces to use only 0-2
    const verbosityValue = generateRandom(0, 2);
    cy.navigateTo('awx', 'inventories');
    cy.verifyPageTitle('Inventories');
    cy.clickButton(/^Create inventory$/);
    cy.clickButton(/^Create constructed inventory$/);
    cy.getByDataCy('name').type(constInvName);
    cy.getByDataCy('description').type(`Description of "${constInvName}" typed by Cypress`);
    cy.singleSelectBy('[data-cy="organization"]', organization.name);
    // this can be simplified if we include data-cy to the search button of instance groups
    cy.multiSelectByDataCy('instance-group-select-form-group', [instanceGroup.name]);
    cy.multiSelectByDataCy('inventories', [inventory.name]);
    cy.getByDataCy('update_cache_timeout').clear().type(String(cacheTimeoutValue));
    cy.singleSelectByDataCy('verbosity', String(verbosityValue));
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
    // Assert the inventory doesn't exist anymore
    cy.filterTableBySingleSelect('name', constInvName, true);
    cy.contains('No results found');
  });

  it('can edit and run a sync on the edited constructed inventory', () => {
    cy.intercept('PATCH', awxAPI`/constructed_inventories/*`).as('saveInv');
    cy.intercept('POST', awxAPI`/inventory_sources/*/update`).as('syncInv');
    cy.navigateTo('awx', 'inventories');
    cy.verifyPageTitle('Inventories');
    cy.intercept({
      method: 'GET',
      pathname: awxAPI`/inventories/`,
      query: { name__icontains: constructedInv.name },
    }).as('filterConstInventory');
    cy.filterTableBySingleSelect('name', constructedInv.name);
    cy.wait('@filterConstInventory');
    cy.clickTableRowLink('name', constructedInv.name, { disableFilter: true });
    cy.verifyPageTitle(constructedInv.name);

    const description = 'Edit action: New description typed by cypress';
    cy.getByDataCy('edit-inventory').click();
    cy.getByDataCy('name').should('have.value', constructedInv.name);
    cy.getByDataCy('description').should('have.value', '');
    cy.getByDataCy('description').type(description);
    cy.dataEditorTypeByDataCy('source-vars', 'plugin: constructed');
    cy.clickButton(/^Save inventory$/);
    cy.wait('@saveInv')
      .its('response.statusCode')
      .then((statusCode) => {
        expect(statusCode).to.be.equal(200);
        cy.verifyPageTitle(constructedInv.name);
        cy.getByDataCy('description').contains(description);
      });
    cy.clickButton(/^Sync inventory$/);
    cy.wait('@syncInv')
      .then((response) => {
        expect(response.response?.statusCode).to.be.equal(202);
      })
      .its('response.body.id')
      .then((jobID: number) => {
        cy.verifyPageTitle(constructedInv.name);
        cy.getByDataCy('last-job-status').contains('Success');
        cy.waitForJobToProcessEvents(jobID.toString(), 'inventory_updates');
      });
  });

  it('shows a failed sync on the constructed inventory if the user sets strict to true and enters bad variables', () => {
    //Run a sync and assert failure of the job
    cy.navigateTo('awx', 'inventories');
    cy.verifyPageTitle('Inventories');
    cy.filterTableBySingleSelect('name', newInventory.name);
    cy.clickTableRowLink('name', newInventory.name, { disableFilter: true });
    //Assert the original details of the inventory
    cy.verifyPageTitle(newInventory.name);
    cy.getByDataCy('organization').contains(organization.name);
    //Assert the user navigating to the edit constructed inventory form
    cy.getByDataCy('edit-inventory').click();
    cy.verifyPageTitle('Edit Constructed Inventory');
    cy.getByDataCy('toggle-json').click();
    //Assert the change to the strict setting
    //Add bad variables
    cy.getByDataCy('source-vars').type(
      `{{}    
      "plugin": "constructed",
      "strict": true,
      "groups": {
      "is_shutdown": "state | default('running') == 'shutdown'",
      "product_dev": "account_alias == 'product_dev'"
      }}`
    );
    cy.clickButton(/^Save inventory$/);
    cy.verifyPageTitle(newInventory.name);
    cy.intercept('POST', awxAPI`/inventory_sources/*/update`).as('syncInventory');
    cy.clickButton('Sync inventory');
    cy.wait('@syncInventory')
      .then((response) => {
        expect(response.response?.statusCode).to.be.equal(202);
      })
      .its('response.body.id')
      .then(() => {
        cy.verifyPageTitle(newInventory.name);
        //Run a sync and assert failure of the job
        cy.getByDataCy('last-job-status').contains('Failed');
        cy.getByDataCy('last-job-status').click();
        cy.contains('Failed');
      });
  });
});

describe('Constructed Inventories CRUD Tests - reorder input inventories', () => {
  let organization: Organization;
  let constructedInv: Inventory;
  let instanceGroup: InstanceGroup;
  const constrInvToDelete: Inventory[] = [];

  before(() => {
    const orgName = 'E2E Org Constructed Inventory tests ' + randomString(4);
    cy.createAwxOrganization({ name: orgName }).then((org) => {
      organization = org;
      cy.createAwxInstanceGroup().then((ig) => {
        instanceGroup = ig;
      });
    });
  });

  beforeEach(() => {
    cy.createAwxConstructedInventory(organization, { source_vars: true }).then((constInv) => {
      constructedInv = constInv;
    });
  });

  afterEach(() => {
    constrInvToDelete.push(constructedInv);
  });

  after(() => {
    cy.deleteAwxInstanceGroup(instanceGroup);
    constrInvToDelete.map((constrInventory) => cy.deleteAwxConstructedInventory(constrInventory));
    cy.deleteAwxOrganization(organization);
  });

  it('can edit the input_inventories, verify the preservation of the order they were added in, and manually change the order', () => {
    //Create a constructed inventory in the beforeEach hook
    //Assert the original order of the input inventories
    //Assert the UI change to the order of input inventories
    cy.navigateTo('awx', 'inventories');
    cy.verifyPageTitle('Inventories');
    cy.filterTableByMultiSelect('name', [constructedInv.name]);
    cy.get(`[aria-label="Simple table"] tr`).should('have.length', 2);
    cy.contains('a', constructedInv.name).click();

    let expectedOrder: string[] = [];
    cy.getByDataCy('input-inventories');
    // get initial order
    cy.get(`[data-cy="input-inventories"] ul > li`) // Adjust the selector to match your list items
      .should(($lis) => {
        expectedOrder = $lis.map((index, el) => Cypress.$(el).text()).get();
      })
      .then(() => {
        cy.getByDataCy('edit-inventory').click();
        // remove one item
        cy.contains(`[aria-label="Chip group category"] li`, expectedOrder[0]).within(() => {
          cy.get('button').click();
        });
        const deletedItem = expectedOrder[0];
        expectedOrder = expectedOrder.slice(1);
        expectedOrder.push(deletedItem);
        // now add it also in GUI
        cy.get(`[aria-label="Search input"]`).type(deletedItem);
        cy.contains('label', deletedItem).within(() => {
          cy.get('input').click();
        });
        cy.clickButton(/^Save inventory$/);
        cy.getByDataCy('input-inventories');
        cy.navigateTo('awx', 'inventories');
        cy.verifyPageTitle('Inventories');
        cy.filterTableByMultiSelect('name', [constructedInv.name]);
        cy.get(`[aria-label="Simple table"] tr`).should('have.length', 2);
        cy.contains('a', constructedInv.name).click();
        // verify order
        cy.getByDataCy('input-inventories');
        cy.get(`[data-cy="input-inventories"] ul > li`) // Adjust the selector to match your list items
          .should(($lis) => {
            const actualOrder = $lis.map((index, el) => Cypress.$(el).text()).get();
            expect(actualOrder).to.deep.equal(expectedOrder);
          });
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
