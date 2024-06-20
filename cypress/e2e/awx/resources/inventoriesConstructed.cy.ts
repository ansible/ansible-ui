import { randomString } from '../../../../framework/utils/random-string';
import { InstanceGroup } from '../../../../frontend/awx/interfaces/InstanceGroup';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { awxAPI } from '../../../support/formatApiPathForAwx';

describe('Constructed Inventories CRUD Tests', () => {
  let organization: Organization;
  let inventoriesList: Inventory[] = [];
  let invNames: string[] = [];
  let constructedInv: Inventory;
  let instanceGroup: InstanceGroup;
  const invToDelete: Inventory[] = [];
  const constrInvToDelete: Inventory[] = [];
  const invToCreate: number = 3;

  before(() => {
    const orgName = 'E2E Org Constructed Inventory tests ' + randomString(4);
    cy.createAwxOrganization(orgName).then((org) => {
      organization = org;
      cy.createAwxInstanceGroup().then((ig) => {
        instanceGroup = ig;
      });
    });
  });

  beforeEach(() => {
    inventoriesList = [];
    invNames = [];
    for (let i = 0; i < invToCreate; i++) {
      cy.createAwxInventory({ organization: organization.id }).then((inv) => {
        inventoriesList.push(inv);
      });
    }
    cy.createAwxConstructedInventory(organization).then((constInv) => {
      constructedInv = constInv;
    });
  });

  afterEach(() => {
    constrInvToDelete.push(constructedInv);
    invToDelete.push(...inventoriesList);
  });

  after(() => {
    cy.deleteAwxInstanceGroup(instanceGroup);
    invToDelete.map((inventory) => cy.deleteAwxInventory(inventory, { failOnStatusCode: false }));
    constrInvToDelete.map((constrInventory) => cy.deleteAwxConstructedInventory(constrInventory));
    cy.deleteAwxOrganization(organization);
  });

  it('can create a constructed inventory using specific source_vars and limit and then delete that inventory', () => {
    invNames = inventoriesList.map(({ name }) => String(name));
    cy.intercept('POST', awxAPI`/constructed_inventories/`).as('createInv');
    const constInvName = 'E2E Constructed Inventory ' + randomString(4);
    // generates random values to be used during the test.
    const cacheTimeoutValue = generateRandom(0, 15);
    // which combination should be used to test verbosity from 1 to 5 - UI forces to use only 0-2
    const verbosityValue = generateRandom(0, 2);

    cy.navigateTo('awx', 'inventories');
    cy.getByDataCy('create-inventory').click();
    cy.get('.pf-v5-c-dropdown__menu').within(() => {
      cy.get('[data-cy="create-constructed-inventory"]').click();
    });
    cy.getByDataCy('name').type(constInvName);
    cy.getByDataCy('description').type(`Description of "${constInvName}" typed by Cypress`);
    cy.intercept({
      method: 'GET',
      pathname: awxAPI`/organizations/`,
      query: { name__icontains: organization.name },
    }).as('filterOrg');
    cy.singleSelectBy('[data-cy="organization"]', organization.name);
    cy.wait('@filterOrg');
    // this can be simplified if we include data-cy to the search button of instance groups
    cy.getByDataCy('instance-group-select-form-group').find('[aria-label="Options menu"]').click();
    cy.intercept({
      method: 'GET',
      pathname: awxAPI`/instance_groups/`,
      query: { name: instanceGroup.name },
    }).as('filterInstanceG');
    cy.filterTableByMultiSelect('name', [instanceGroup.name]);
    cy.wait('@filterInstanceG');
    cy.getByDataCy('checkbox-column-cell').click();
    cy.clickModalButton('Confirm');
    cy.intercept({
      method: 'GET',
      pathname: awxAPI`/inventories/`,
      query: { name__icontains: invNames[invToCreate - 1] },
    }).as('filterInputInventories');
    cy.multiSelectBy('[data-cy="inventories"]', invNames);
    cy.wait('@filterInputInventories');
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
    cy.intercept({
      method: 'GET',
      pathname: awxAPI`/inventories/`,
      query: { name__icontains: constInvName },
    }).as('filterInventory');
    cy.filterTableBySingleSelect('name', constInvName, true);
    cy.wait('@filterInventory');
  });

  it('can edit and run a sync on the edited constructed inventory', () => {
    cy.intercept('PATCH', awxAPI`/constructed_inventories/*`).as('saveInv');
    cy.intercept('POST', awxAPI`/inventory_sources/*/update`).as('syncInv');
    cy.navigateTo('awx', 'inventories');
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

  it.skip('can edit the input_inventories, verify the preservation of the order they were added in, and manually change the order', () => {
    //Create a constructed inventory in the beforeEach hook
    //Assert the original order of the input inventories
    //Assert the UI change to the order of input inventories
  });

  it.skip('shows a failed sync on the constructed inventory if the user sets strict to true and enters bad variables', () => {
    //Create a constructed inventory in the beforeEach hook
    //Assert the original details of the inventory
    //Assert the user navigating to the edit constructed inventory form
    //Assert the change to the strict setting
    //Add bad variables
    //Assert the edited changes of the inventory
    //Run a sync and assert failure of the job
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
