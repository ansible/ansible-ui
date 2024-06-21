import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { WorkflowJobTemplate } from '../../../../frontend/awx/interfaces/WorkflowJobTemplate';
import { ReusableTemplateSurveyTestSuite } from './sharedTemplateSurvey';
import { randomE2Ename } from '../../../support/utils';

describe('Workflow Job Templates Surveys', function () {
  let inventory: Inventory;
  let workflowJobTemplate: WorkflowJobTemplate;
  let organization: Organization;
  let reusableTemplateSurveyTestSuite: ReusableTemplateSurveyTestSuite;

  before(function () {
    cy.awxLogin();
  });
  // FLAKY_06_20_2024
  describe.skip('WFJT Surveys: Create, Edit and Delete', function () {
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

    before(function () {
      cy.createAwxOrganization(randomE2Ename()).then((org) => {
        organization = org;
      });
    });

    after(() => {
      cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
    });

    beforeEach(() => {
      cy.createAwxInventory({ organization: organization.id }).then((inv) => {
        inventory = inv;

        cy.createAwxWorkflowJobTemplate({
          organization: organization.id,
          inventory: inventory.id,
        }).then((wfjt) => {
          workflowJobTemplate = wfjt;
          reusableTemplateSurveyTestSuite = new ReusableTemplateSurveyTestSuite(
            workflowJobTemplate
          );
        });
      });
    });

    afterEach(function () {
      cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate, { failOnStatusCode: false });
      cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    });

    it('can create a required survey from surveys tab list of a WFJT, toggle survey on, and assert info on surveys list view', () =>
      reusableTemplateSurveyTestSuite.canCreateSurvey(question));

    it('can edit a WFJT survey from surveys list view and assert info on surveys list view', () =>
      reusableTemplateSurveyTestSuite.canEditSurvey(question));

    it('can delete a WFJT survey from the surveys list view and assert deletion', () =>
      reusableTemplateSurveyTestSuite.canDeleteSurvey(question));

    it('can create multiple surveys, assert order, change order, and assert new order, then bulk delete all surveys', () =>
      reusableTemplateSurveyTestSuite.canCreateMultipleSurvey());
  });

  // describe.skip('WFJT Surveys: Launch WFJT with Survey Enabled', function () {
  //   before(function () {
  //     cy.createAwxInventory({ organization: (this.globalAwxOrganization as Organization).id }).then(
  //       (inv) => {
  //         inventory = inv;

  //         cy.createAwxWorkflowJobTemplate({
  //           organization: (this.globalAwxOrganization as Organization).id,
  //           inventory: inventory.id,
  //         }).then((wfjt) => {
  //           workflowJobTemplate = wfjt;
  //           reusableTemplateSurveyTestSuite = new ReusableTemplateSurveyTestSuite(
  //             workflowJobTemplate
  //           );

  //           cy.visit(`/templates/workflow-job-template/${workflowJobTemplate.id}/survey`);
  //         });
  //       }
  //     );
  //   });

  //   after(function () {
  //     cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate, { failOnStatusCode: false });
  //     cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
  //   });

  //   const surveyTypes = [
  //     {
  //       type: 'text',
  //       label: 'Text',
  //       question_name: 'Text Answer',
  //       question_description: 'Text description.',
  //       variable: 'text_answer',
  //       default: 'default text answer',
  //     },
  //     {
  //       type: 'textarea',
  //       label: 'Textarea',
  //       question_name: 'Textarea Answer',
  //       question_description: 'Textarea description.',
  //       variable: 'textarea_answer',
  //       default: 'default textarea answer',
  //     },
  //     {
  //       type: 'password',
  //       label: 'Password',
  //       question_name: 'Password Answer',
  //       question_description: 'Password description.',
  //       variable: 'password_answer',
  //       default: 'default password answer',
  //     },
  //     {
  //       type: 'integer',
  //       label: 'Integer',
  //       question_name: 'Integer Answer',
  //       question_description: 'Integer description.',
  //       variable: 'integer_answer',
  //       max: 1338,
  //       default: '1337',
  //     },
  //     {
  //       type: 'float',
  //       label: 'Float',
  //       question_name: 'Float Answer',
  //       question_description: 'Float description.',
  //       variable: 'float_answer',
  //       default: '13.37',
  //     },
  //     {
  //       type: 'multiplechoice',
  //       label: 'Multiple Choice (single select)',
  //       question_name: 'Multiplechoice Answer',
  //       question_description: 'multiplechoice description.',
  //       variable: 'multiplechoice_answer',
  //       choices: ['foo', 'bar', 'baz'],
  //       default: 'bar',
  //     },
  //     {
  //       type: 'multiselect',
  //       label: 'Multiple Choice (multiple select)',
  //       question_name: 'Multiselect Answer',
  //       question_description: 'Multiselect description.',
  //       variable: 'multiselect_answer',
  //       choices: ['foo', 'bar', 'baz'],
  //       default: 'foo\nbar',
  //     },
  //   ];
  //   it('can create all 7 types of survey types, enable survey, launch WFJT, view default survey answer, complete launch, and assert survey answer on completed job', () =>
  //     reusableTemplateSurveyTestSuite.canCreateAllSurveyTypes(surveyTypes));
  // });
});
