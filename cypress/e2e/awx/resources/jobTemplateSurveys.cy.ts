import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { JobTemplate } from '../../../../frontend/awx/interfaces/JobTemplate';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
// import { awxAPI } from '../../../support/formatApiPathForAwx';

describe('Job Templates Surveys', function () {
  let inventory: Inventory;
  let jobTemplate: JobTemplate;

  before(function () {
    cy.awxLogin();
  });

  beforeEach(function () {
    cy.createAwxInventory({ organization: (this.globalOrganization as Organization).id }).then(
      (inv) => {
        inventory = inv;

        cy.createAwxJobTemplate({
          organization: (this.globalOrganization as Organization).id,
          project: (this.globalProject as Project).id,
          inventory: inventory.id,
        }).then((jT) => {
          jobTemplate = jT;
        });
      }
    );
  });

  afterEach(function () {
    cy.deleteAwxJobTemplate(jobTemplate, { failOnStatusCode: false });
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
  });

  describe('JT Surveys: Create and Edit', function () {
    it.skip('can create a required survey from surveys tab list of a JT, toggle survey on, and assert info on surveys list view', function () {
      //Use the JT created in the beforeEach block
      //Assert the empty state survey list
      //Assert creation of the survey and info showing on survey list
    });

    it.skip('can edit a JT survey from surveys list view and assert info on surveys list view', function () {
      //Use the JT created in the beforeEach block
      //Assert survey creation and info showing on survey list
      //Assert info on survey list after editing
    });
  });

  describe('JT Surveys: Delete', function () {
    it.skip('can delete a JT survey from the surveys list view and assert deletion', function () {
      //Use the JT created in the beforeEach block
      //Create survey, assert existence
      //Delete and assert deletion
    });

    it.skip('can create multiple surveys, assert order, change order, and assert new order, then bulk delete all surveys', function () {
      //Use the JT created in the beforeEach block
      //Create multiple surveys within the JT, assert existence and order of surveys
      //Change order and assert new order
      //Bulk delete and assert deletion
    });
  });

  describe('JT Surveys: Launch JT with Survey Enabled', function () {
    //For all tests in this section- consider creating a test that loops over the 7 survey types

    it.skip('can create and enable a Text survey type, launch JT, view default survey answer, edit survey answer, complete launch, and assert survey answer on completed job', function () {
      //Use the JT created in the beforeEach block
      //Assert the type of survey created
      //Assert info after editing
      //Assert job output screen
      //Wait for job completion
      //Assert survey info on job details screen
    });

    it.skip('can create and enable a Text Area survey type, launch JT, view default survey answer, edit survey answer, complete launch, and assert survey answer on completed job', function () {
      //Assert the type of survey created
      //Assert info after editing
      //Assert job output screen
      //Wait for job completion
      //Assert survey info on job details screen
    });

    it.skip('can create and enable a Password survey type, launch JT, view default survey answer, edit survey answer, complete launch, and assert survey answer on completed job', function () {
      //Use the JT created in the beforeEach block
      //Assert the type of survey created
      //Assert info after editing
      //Assert job output screen
      //Wait for job completion
      //Assert survey info on job details screen
    });

    it.skip('can create and enable a single select Multiple Choice survey type, launch JT, view default survey answer, edit survey answer, complete launch, and assert survey answer on completed job', function () {
      //Use the JT created in the beforeEach block
      //Assert the type of survey created
      //Assert info after editing
      //Assert job output screen
      //Wait for job completion
      //Assert survey info on job details screen
    });

    it.skip('can create and enable a multiple select Multiple Choice survey type, launch JT, view default survey answer, edit survey answer, complete launch, and assert survey answer on completed job', function () {
      //Use the JT created in the beforeEach block
      //Assert the type of survey created
      //Assert info after editing
      //Assert job output screen
      //Wait for job completion
      //Assert survey info on job details screen
    });

    it.skip('can create and enable a Integer survey type, launch JT, view default survey answer, edit survey answer, complete launch, and assert survey answer on completed job', function () {
      //Use the JT created in the beforeEach block
      //Assert the type of survey created
      //Assert info after editing
      //Assert job output screen
      //Wait for job completion
      //Assert survey info on job details screen
    });

    it.skip('can create and enable a Float survey type, launch JT, view default survey answer, edit survey answer, complete launch, and assert survey answer on completed job', function () {
      //Use the JT created in the beforeEach block
      //Assert the type of survey created
      //Assert info after editing
      //Assert job output screen
      //Wait for job completion
      //Assert survey info on job details screen
    });
  });
});
