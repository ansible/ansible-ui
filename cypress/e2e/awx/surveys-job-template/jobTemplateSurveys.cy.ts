import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { JobTemplate } from '../../../../frontend/awx/interfaces/JobTemplate';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { ReusableTemplateSurveyTestSuite } from '../job-templates/sharedTemplateSurvey';

describe('Job Templates Surveys', function () {
  let inventory: Inventory;
  let jobTemplate: JobTemplate;
  let awxOrganization: Organization;
  let project: Project;
  let reusableTemplateSurveyTestSuite: ReusableTemplateSurveyTestSuite;

  before(() => {
    cy.createAwxOrganization().then((org) => {
      awxOrganization = org;
      cy.createAwxProject(awxOrganization).then((proj) => {
        project = proj;
      });
    });
  });

  after(() => {
    cy.deleteAwxProject(project, { failOnStatusCode: false });
    cy.deleteAwxOrganization(awxOrganization, { failOnStatusCode: false });
  });

  describe('JT Surveys: Create, Edit and Delete', function () {
    const question = {
      question_name: "Who's that?",
      question_description: 'The person behind this.',
      variable: 'who_is_that',
      default: 'John Doe',
      type: 'text',
      max: 1024,
      min: 0,
      new_question: true,
      required: true,
      choices: [],
    };

    beforeEach(() => {
      cy.createAwxInventory(awxOrganization).then((inv) => {
        inventory = inv;

        cy.createAwxJobTemplate({
          organization: awxOrganization.id,
          project: project.id,
          inventory: inventory.id,
        }).then((jT) => {
          jobTemplate = jT;
          reusableTemplateSurveyTestSuite = new ReusableTemplateSurveyTestSuite(jobTemplate);
        });
      });
    });

    afterEach(function () {
      cy.deleteAwxJobTemplate(jobTemplate, { failOnStatusCode: false });
      cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    });

    it('can create a required survey from surveys tab list of a JT, toggle survey on, and assert info on surveys list view', () =>
      reusableTemplateSurveyTestSuite.canCreateSurvey(question));

    it('can edit a JT survey from surveys list view and assert info on surveys list view', () =>
      reusableTemplateSurveyTestSuite.canEditSurvey(question));

    it('can delete a JT survey from the surveys list view and assert deletion', () =>
      reusableTemplateSurveyTestSuite.canDeleteSurvey(question));

    it('can create multiple surveys, assert order, change order, and assert new order, then bulk delete all surveys', () =>
      reusableTemplateSurveyTestSuite.canCreateMultipleSurvey());
  });

  describe('JT Surveys: Launch JT with Survey Enabled', function () {
    beforeEach(() => {
      cy.createAwxInventory(awxOrganization).then((inv) => {
        inventory = inv;

        cy.createAwxJobTemplate({
          organization: awxOrganization.id,
          project: project.id,
          inventory: inventory.id,
        }).then((jt) => {
          jobTemplate = jt;
          reusableTemplateSurveyTestSuite = new ReusableTemplateSurveyTestSuite(jobTemplate);
        });
      });
    });

    afterEach(() => {
      cy.deleteAwxJobTemplate(jobTemplate, { failOnStatusCode: false });
      cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    });

    describe('can create all 7 types of survey types, enable survey, launch WFJT, view default survey answer, complete launch, and assert survey answer on completed job', () => {
      it('Text survey type', () => {
        const question = {
          question_name: 'Text answer',
          question_description: 'Text description.',
          variable: 'text_answer',
          default: 'default text answer',
          type: 'text',
          max: 1024,
          min: 0,
          new_question: true,
          required: true,
          choices: [],
        };
        cy.createTemplateSurvey(jobTemplate, 'Text', question);
        reusableTemplateSurveyTestSuite.canEnableSurvey(question);
        const groupType = reusableTemplateSurveyTestSuite.canLaunchSurvey(question);
        cy.getByDataCy(groupType)
          .getByDataCy(`survey-${question.type.toLowerCase()}-answer`)
          .should('have.value', question.default);
        reusableTemplateSurveyTestSuite.canFinishSurvey(question);
      });

      it('Textarea survey type', () => {
        const question = {
          question_name: 'Textarea answer',
          question_description: 'Textarea description.',
          variable: 'textarea_answer',
          default: 'default textarea answer',
          type: 'textarea',
          max: 1024,
          min: 0,
          new_question: true,
          required: true,
          choices: [],
        };
        cy.createTemplateSurvey(jobTemplate, 'Textarea', question);
        reusableTemplateSurveyTestSuite.canEnableSurvey(question);
        const groupType = reusableTemplateSurveyTestSuite.canLaunchSurvey(question);
        cy.getByDataCy(groupType)
          .getByDataCy(`survey-${question.type.toLowerCase()}-answer`)
          .should('have.value', question.default);
        reusableTemplateSurveyTestSuite.canFinishSurvey(question);
      });

      it('Password survey type', () => {
        const question = {
          question_name: 'Password answer',
          question_description: 'Password description.',
          variable: 'password_answer',
          default: 'default password answer',
          type: 'password',
          max: 1024,
          min: 0,
          new_question: true,
          required: true,
          choices: [],
        };
        cy.createTemplateSurvey(jobTemplate, 'Password', question);
        reusableTemplateSurveyTestSuite.canEnableSurvey(question);
        const groupType = reusableTemplateSurveyTestSuite.canLaunchSurvey(question);
        cy.getByDataCy(groupType)
          .getByDataCy(`survey-${question.type.toLowerCase()}-answer`)
          .should('have.value', '$encrypted$');
        reusableTemplateSurveyTestSuite.canFinishSurvey(question);
      });

      it('Integer survey type', () => {
        const question = {
          question_name: 'Integer answer',
          question_description: 'Integer description.',
          variable: 'integer_answer',
          default: 1337,
          type: 'integer',
          max: 1338,
          min: 0,
          new_question: true,
          required: true,
          choices: [],
        };
        cy.createTemplateSurvey(jobTemplate, 'Integer', question);
        reusableTemplateSurveyTestSuite.canEnableSurvey(question);
        const groupType = reusableTemplateSurveyTestSuite.canLaunchSurvey(question);
        cy.getByDataCy(groupType)
          .getByDataCy(`survey-${question.type.toLowerCase()}-answer`)
          .should('have.value', question.default);
        reusableTemplateSurveyTestSuite.canFinishSurvey(question);
      });

      it('Float survey type', () => {
        const question = {
          question_name: 'Float answer',
          question_description: 'Float description.',
          variable: 'float_answer',
          default: '13.37',
          type: 'float',
          max: 1024,
          min: 0,
          new_question: true,
          required: true,
          choices: [],
        };
        cy.createTemplateSurvey(jobTemplate, 'Float', question);
        reusableTemplateSurveyTestSuite.canEnableSurvey(question);
        const groupType = reusableTemplateSurveyTestSuite.canLaunchSurvey(question);
        cy.getByDataCy(groupType)
          .getByDataCy(`survey-${question.type.toLowerCase()}-answer`)
          .should('have.value', question.default);
        reusableTemplateSurveyTestSuite.canFinishSurvey(question);
      });

      it('Multiple choice (single select) survey type', () => {
        const question = {
          question_name: 'Multiplechoice answer',
          question_description: 'multiplechoice description.',
          variable: 'multiplechoice_answer',
          default: 'bar',
          type: 'multiplechoice',
          max: 1024,
          min: 0,
          new_question: true,
          required: true,
          choices: ['foo', 'bar', 'baz'],
        };
        cy.createTemplateSurvey(jobTemplate, 'Multiple Choice (single select)', question);
        reusableTemplateSurveyTestSuite.canEnableSurvey(question);
        const groupType = reusableTemplateSurveyTestSuite.canLaunchSurvey(question);
        cy.getByDataCy(groupType).within(() => {
          cy.contains(question.default);
          cy.get('div[data-ouia-component-id="menu-select"]').click();
          question?.choices?.forEach((choice) => {
            cy.getByDataCy('survey-multiplechoice-answer').contains(choice);
          });
        });
        reusableTemplateSurveyTestSuite.canFinishSurvey(question);
      });

      it('Multiple Choice (multiple select) survey type', () => {
        const question = {
          question_name: 'Multiselect answer',
          question_description: 'Multiselect description.',
          variable: 'multiselect_answer',
          default: 'foo\nbar',
          type: 'multiselect',
          max: 1024,
          min: 0,
          new_question: true,
          required: true,
          choices: ['foo', 'bar', 'baz'],
        };
        cy.createTemplateSurvey(jobTemplate, 'Multiple Choice (multiple select)', question);
        reusableTemplateSurveyTestSuite.canEnableSurvey(question);
        const groupType = reusableTemplateSurveyTestSuite.canLaunchSurvey(question);
        cy.getByDataCy(groupType).within(() => {
          const defaults = question.default.toString().split('\n');
          defaults.forEach((defaultValue) => {
            cy.contains(defaultValue);
          });
          cy.get('#survey-multiselect-answer').click();
        });
        cy.get('#survey-multiselect-answer-select').within(() => {
          question?.choices?.forEach((choice) => {
            cy.getByDataCy(choice);
          });
        });
        reusableTemplateSurveyTestSuite.canFinishSurvey(question);
      });
    });
  });
});
