import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { JobTemplate } from '../../../../frontend/awx/interfaces/JobTemplate';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { awxAPI } from '../../../support/formatApiPathForAwx';

describe('Job Templates Surveys', function () {
  let inventory: Inventory;
  let jobTemplate: JobTemplate;

  before(function () {
    cy.awxLogin();
  });

  describe('JT Surveys: Create and Edit', function () {
    const question = {
      question_name: "Who's that?",
      question_description: 'The person behind this.',
      variable: 'who_is_that',
      default: 'John Doe',
      type: 'text',
    };

    before(function () {
      cy.createAwxInventory({ organization: (this.globalOrganization as Organization).id }).then(
        (inv) => {
          inventory = inv;

          cy.createAwxJobTemplate({
            organization: (this.globalOrganization as Organization).id,
            project: (this.globalProject as Project).id,
            inventory: inventory.id,
          }).then((jT) => {
            jobTemplate = jT;

            cy.visit(`/templates/job_template/${jobTemplate.id}/survey`);
          });
        }
      );
    });

    after(function () {
      cy.deleteAwxJobTemplate(jobTemplate, { failOnStatusCode: false });
      cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    });

    it('can create a required survey from surveys tab list of a JT, toggle survey on, and assert info on surveys list view', function () {
      //Use the JT created in the beforeEach block
      //Assert the empty state survey list
      //Assert creation of the survey and info showing on survey list
      cy.contains(jobTemplate.name);
      cy.get('[aria-selected="true"]').contains('Survey');
      cy.contains('There are currently no survey questions.');
      cy.contains('Create a survey question by clicking the button below.');
      cy.clickButton('Create survey question');

      cy.createTemplateSurvey(jobTemplate, question);

      cy.contains('Survey disabled');

      cy.get('[for="survey-switch"]').click();
      cy.contains('Survey enabled');

      cy.getByDataCy('row-0').within(() => {
        cy.contains(question?.question_name);
        cy.contains(question?.type);
      });
    });

    it('can edit a JT survey from surveys list view and assert info on surveys list view', function () {
      //Use the JT created in the beforeEach block
      //Assert survey creation and info showing on survey list
      //Assert info on survey list after editing

      cy.getByDataCy('name-column-cell').contains(question?.question_name);
      cy.getByDataCy('type-column-cell').contains(question?.type);
      cy.getByDataCy('default-column-cell').contains(question?.default);

      cy.getByDataCy('edit-question').click();

      cy.getByDataCy('question-name').clear().type('foo');
      cy.getByDataCy('question-description').clear();

      cy.selectDropdownOptionByResourceName('type', 'Integer');

      cy.getByDataCy('question-max').type('0');
      cy.getByDataCy('question-default').clear().type('1337');

      cy.clickButton('Save question');

      cy.getByDataCy('name-column-cell').contains('foo');
      cy.getByDataCy('type-column-cell').contains('integer');
      cy.getByDataCy('default-column-cell').contains('1337');
    });

    it('can delete a JT survey from the surveys list view and assert deletion', function () {
      //Use the JT created in the beforeEach block
      //Create survey, assert existence
      //Delete and assert deletion

      cy.createTemplateSurvey(jobTemplate, {
        question_name: 'multi choice question',
        question_description: 'description for multi choice question.',
        variable: 'multi_choice',
        type: 'Multiple Choice (multiple select)',
        choices: ['choice 1', 'choice 2', 'choice 3'],
        default: 'choice 1\nchoice 2',
      });

      cy.contains('multi choice question');
      cy.contains('multiselect');
      cy.contains('choice 1');
      cy.contains('choice 2');

      cy.getByDataCy('row-1').within(() => {
        cy.getByDataCy('actions-dropdown').click();
        cy.contains('Delete question').click();
      });
      cy.clickModalConfirmCheckbox();
      cy.intercept('POST', awxAPI`/job_templates/*/survey_spec/`).as('deleteSurveySpec');
      cy.clickModalButton('Delete');
      cy.wait('@deleteSurveySpec');

      cy.contains('multi choice question').should('not.exist');
      cy.contains('multiselect').should('not.exist');
      cy.contains('choice 1').should('not.exist');
      cy.contains('choice 2').should('not.exist');

      cy.getByDataCy('name-column-cell').contains('foo');
      cy.getByDataCy('type-column-cell').contains('integer');
      cy.getByDataCy('default-column-cell').contains('1337');

      cy.getByDataCy('row-0').within(() => {
        cy.getByDataCy('actions-dropdown').click();
        cy.contains('Delete question').click();
      });

      cy.clickModalConfirmCheckbox();
      cy.intercept('DELETE', awxAPI`/job_templates/*/survey_spec/`).as('deleteSurveySpec');
      cy.clickModalButton('Delete');
      cy.wait('@deleteSurveySpec');

      cy.contains('There are currently no survey questions.');
      cy.contains('Create a survey question by clicking the button below.');
    });

    it('can create multiple surveys, assert order, change order, and assert new order, then bulk delete all surveys', function () {
      //Use the JT created in the beforeEach block
      //Create multiple surveys within the JT, assert existence and order of surveys
      //Change order and assert new order
      //Bulk delete and assert deletion

      const specs = [
        {
          question_name: 'Foo',
          question_description: 'this is Foo.',
          variable: 'foo',
          default: 'John Doe',
          type: 'text',
        },
        {
          question_name: 'Bar',
          question_description: 'This is Bar.',
          variable: 'bar',
          default: 'Jane Doe',
          type: 'text',
        },
        {
          question_name: 'Baz',
          question_description: 'This is Baz.',
          variable: 'baz',
          default: 'Baby Doe',
          type: 'text',
        },
      ];

      specs.forEach((spec) => {
        cy.createTemplateSurvey(jobTemplate, spec);
      });

      specs.forEach((spec, index) => {
        cy.getByDataCy(`row-${index}`).within(() => {
          cy.getByDataCy('name-column-cell').contains(spec.question_name);
          cy.getByDataCy('type-column-cell').contains(spec.type);
          cy.getByDataCy('default-column-cell').contains(spec.default);
        });
      });

      cy.clickToolbarKebabAction('manage-question-order');
      cy.get('#draggable-row-Foo').drag('#draggable-row-Baz');
      cy.clickButton('Apply');

      [
        {
          question_name: 'Bar',
          question_description: 'This is Bar.',
          variable: 'bar',
          default: 'Jane Doe',
          type: 'text',
        },
        {
          question_name: 'Baz',
          question_description: 'This is Baz.',
          variable: 'baz',
          default: 'Baby Doe',
          type: 'text',
        },
        {
          question_name: 'Foo',
          question_description: 'this is Foo.',
          variable: 'foo',
          default: 'John Doe',
          type: 'text',
        },
      ].forEach((spec, index) => {
        cy.getByDataCy(`row-${index}`).within(() => {
          cy.getByDataCy('name-column-cell').contains(spec.question_name);
          cy.getByDataCy('type-column-cell').contains(spec.type);
          cy.getByDataCy('default-column-cell').contains(spec.default);
        });
      });
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
