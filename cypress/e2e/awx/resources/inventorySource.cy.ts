import { randomString } from '../../../../framework/utils/random-string';
import { Credential } from '../../../../frontend/awx/interfaces/Credential';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { InventorySource } from '../../../../frontend/awx/interfaces/InventorySource';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { Schedule } from '../../../../frontend/awx/interfaces/Schedule';

describe('Inventory Sources', () => {
  const credentialName = 'e2e-' + randomString(4);

  let organization: Organization;
  let project: Project;
  let inventory: Inventory;
  let inventorySource: InventorySource;
  let credential: Credential;
  let schedA: Schedule;

  before(() => {
    cy.awxLogin();
  });

  beforeEach(() => {
    cy.createAwxOrganization().then((org) => {
      organization = org;
      cy.createAwxProject({ organization: organization.id }).then((p) => {
        project = p;
      });
      cy.createAwxInventory({ organization: organization.id }).then((inv) => {
        inventory = inv;
        cy.createAwxInventorySource(inv, project).then((invSrc) => {
          inventorySource = invSrc;
        });
      });

      cy.createAWXCredential({
        name: credentialName,
        kind: 'gce',
        organization: organization.id,
        credential_type: 9,
      }).then((cred) => {
        credential = cred;
      });
    });
  });

  afterEach(() => {
    cy.deleteAwxProject(project, { failOnStatusCode: false });
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
    cy.deleteAwxCredential(credential, { failOnStatusCode: false });
  });

  describe('Inventory Source List', () => {
    it('can navigate to the Create Source form, create new Source, and verify all expected info shows on the details page', () => {
      cy.navigateTo('awx', 'inventories');
      cy.filterTableBySingleSelect('name', inventory.name);
      cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
      cy.verifyPageTitle(inventory.name);
      cy.clickLink(/^Sources$/);
      cy.clickButton(/^Add source/);
      cy.verifyPageTitle('Add new source');
      cy.getBy('[data-cy="name"]').type('project source');
      cy.selectDropdownOptionByResourceName('source_control_type', 'Sourced from a Project');
      cy.selectDropdownOptionByResourceName('project', project.name);
      cy.selectDropdownOptionByResourceName('inventory', 'Dockerfile');
      cy.getBy('.pf-v5-c-input-group > .pf-v5-c-button').click();
      cy.getBy('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
        cy.searchAndDisplayResource(credentialName);
        cy.getBy('[data-cy="checkbox-column-cell"] > label').click();
        cy.getBy('#submit').click();
      });
      cy.getBy('[data-cy="host-filter"]').type('/^test$/');
      cy.getBy('[data-cy="verbosity"]').type('1');
      cy.getBy('[data-cy="enabled-var"]').type('foo.bar');
      cy.getBy('[data-cy="enabled-value"]').type('test');
      cy.getBy('[data-cy="overwrite"]').check();
      cy.getBy('[data-cy="overwrite_vars"]').check();
      cy.getBy('[data-cy="update_on_launch"]').check();
      cy.getBy('[data-cy="update-cache-timeout"]').type('1');
      cy.getBy('.view-lines').type('test: "output"');
      cy.getBy('[data-cy="Submit"]').click();
      cy.verifyPageTitle('project source');
      //Add assertion lines to verify the info on the details page
    });

    it.skip('can sync a Source from its table view action on the list view and and confirm completed sync action', () => {
      //Use the source and inventory created in the beforeEach block
      //assert the UI behavior after clicking the Sync button in the Source line item in the table
      //follow the link to the job output screen and assert info there
    });

    it.skip('can sync all Sources on the list view and and confirm completed sync action', () => {
      //Use the source and inventory created in the beforeEach block
      //create one additional source in this test so the Sync All button has at least 2 sources to sync
      //assert the UI behavior after clicking the Sync All button
      //follow the link to the job output screens and assert info there
    });

    it.skip('can access the Edit form of an existing Source from the list view, update info, and verify the presence of edited info on the details page', () => {
      //Use the source and inventory created in the beforeEach block; access the edit form from the Source list view
      //Make sure to assert the original information as well as the edited information of the Source
    });

    it('can create an Amazon EC2 Inventory Source and edit the form', () => {
      cy.navigateTo('awx', 'inventories');
      cy.filterTableBySingleSelect('name', inventory.name);
      cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
      cy.verifyPageTitle(inventory.name);
      cy.clickLink(/^Sources$/);
      cy.getBy('#add-source').click();
      cy.verifyPageTitle('Add new source');
      cy.getBy('[data-cy="name"]').type('amazon ec2 source');
      cy.selectDropdownOptionByResourceName('source_control_type', 'Amazon EC2');
      cy.getBy('[data-cy="host-filter"]').type('/^test$/');
      cy.getBy('[data-cy="verbosity"]').type('1');
      cy.getBy('[data-cy="enabled-var"]').type('foo.bar');
      cy.getBy('[data-cy="enabled-value"]').type('test');
      cy.getBy('[data-cy="overwrite"]').check();
      cy.getBy('[data-cy="Submit"]').click();
      cy.verifyPageTitle('amazon ec2 source');
      cy.clickButton('Edit inventory source');
      cy.verifyPageTitle('Edit source');
      cy.getBy('[data-cy="name"]').clear().type('new project');
      cy.selectDropdownOptionByResourceName('source_control_type', 'Sourced from a Project');
      cy.getBy('[data-cy="overwrite_vars"]').check();
      cy.getBy('[data-cy="update_on_launch"]').check();
      cy.getBy('[data-cy="update-cache-timeout"]').type('1');
      cy.selectDropdownOptionByResourceName('project', project.name);
      cy.selectDropdownOptionByResourceName('inventory', 'Dockerfile');
      cy.getBy('[data-cy="Submit"]').click();
      //intercept the edit call in order to assert the edited information
      cy.verifyPageTitle('new project');
      //Add assertions to verify the edited information on the Source
    });
  });

  describe('Inventory Details Page', () => {
    it.skip('can access the Edit form of an existing source from the details page, update information, and verify the presence of the edited information on the details page', () => {
      //Use the source and inventory created in the beforeEach block; access the edit form from the Source details view
      //Make sure to assert the original information as well as the edited information of the Source
    });

    it.skip('can sync a Source from its details page and view the output screen for the completed sync job', () => {
      //Use the source and inventory created in the beforeEach block; access the edit form from the Source details view
      //assert the redirect to the job output screen
      //assert the info for the Source on the job details screen
    });

    it.skip('can sync a Source from its details page, cancel the sync before completion, and verify the canceled sync', () => {
      //Use the source and inventory created in the beforeEach block; access the edit form from the Source details view
      //Warning: this test has the potential to be flaky if not executed properly
      //Make sure to assert the sync being canceled as well as the subsequent redirect
    });

    it('can delete a Source from its details page and confirm the delete', () => {
      cy.visit(
        `/infrastructure/inventories/inventory/${inventorySource.inventory}/sources/${inventorySource.id}/details`
      );
      cy.verifyPageTitle(inventorySource.name);
      cy.clickPageAction('delete-inventory-source');
      cy.getBy('#confirm').click();
      cy.clickButton(/^Delete inventory source/);
      //Add assertion to confirm delete
    });
  });

  describe('Inventory Source Schedules List Page', () => {
    it.skip('can navigate to the Create Schedules form, create a new Schedule, toggle the Schedule on, and verify all expected information is showing on the details page', () => {
      //Assert that the user can visit the Schedules list page
      //Assert that the user can view the Schedule creation form
      //Assert the info on the Schedules details page after the Schedule has been created
    });

    it.skip("can access the Edit form of an existing Schedule, update information, and verify the presence of the edited information on the schedule's details page", () => {
      //Assert that the user can visit the Schedules list page and navigate from there to the Edit Schedules form
      //Assert the original info on the Schedule
      //Intercept the Patch request
      //Assert the edited info on the Schedule
    });

    it.skip('can delete a single schedule from the Source Schedule list and confirm delete', () => {
      //Make sure to assert the deletion by intercepting the Delete request
    });

    it.skip('can bulk delete multiple schedules from the Source Schedule list and confirm delete', () => {
      //Make sure to assert the deletion by intercepting the Delete request
    });
  });

  describe('Inventory Source Schedules Details Page', () => {
    it.skip("can access the Edit form of an existing Schedule, update information, and verify the presence of the edited information on the schedule's details page", () => {
      //Make sure to access the Edit Schedules form from the details page of the Schedule
      //Assert original info on the Schedule
      //Intercept the Edit request
      //Assert edited info on the Schedule
    });

    it.skip('can delete a single schedule from the Source Schedule details page and confirm delete', () => {
      //Make sure to assert the deletion by intercepting the Delete request
    });
  });

  describe('Inventory Source Notifications Page', () => {
    beforeEach(() => {
      cy.createAWXSchedule().then((schedule1: Schedule) => {
        schedA = schedule1;
        cy.log('Schedule', schedA); //Delete this line after schedA is used in the following tests
      });
    });

    it.skip('can visit the Notifications tab of an Inventory Source and enable a notification upon Start', () => {
      //Utilize the schedule and inventory source created in the beforeEach blocks
      //Enable the notification in the source as Start
      //Intercept the Post request
      //Assert the final result in the UI
    });

    it.skip('can visit the Notifications tab of an Inventory Source and enable a notification upon Success', () => {
      //Utilize the schedule and inventory source created in the beforeEach blocks
      //Enable the notification in the source as Success
      //Intercept the Post request
      //Assert the final result in the UI
    });

    it.skip('can visit the Notifications tab of an Inventory Source and enable a notification upon Failure', () => {
      //Utilize the schedule and inventory source created in the beforeEach blocks
      //Enable the notification in the source as Failure
      //Intercept the Post request
      //Assert the final result in the UI
    });
  });
});
