import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { JobTemplate } from '../../../../frontend/awx/interfaces/JobTemplate';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { ReusableTemplateSurveyTestSuite } from './sharedTemplateSurvey';
import { randomE2Ename } from '../../../support/utils';

describe('Job Templates Surveys', function () {
  let inventory: Inventory;
  let jobTemplate: JobTemplate;
  let organization: Organization;
  let project: Project;
  let reusableTemplateSurveyTestSuite: ReusableTemplateSurveyTestSuite;

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

    before(function () {
      cy.createAwxOrganization(randomE2Ename()).then((org) => {
        organization = org;
        cy.createAwxProject({ organization: organization.id }).then((proj) => {
          project = proj;
        });
      });
    });

    after(() => {
      cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
      cy.deleteAwxProject(project, { failOnStatusCode: false });
    });

    beforeEach(() => {
      cy.createAwxInventory({ organization: organization.id }).then((inv) => {
        inventory = inv;

        cy.createAwxJobTemplate({
          organization: organization.id,
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

  // describe.skip('JT Surveys: Launch JT with Survey Enabled', function () {
  //   before(function () {
  //     cy.createAwxInventory({ organization: (this.globalAwxOrganization as Organization).id }).then(
  //       (inv) => {
  //         inventory = inv;

  //         cy.createAwxJobTemplate({
  //           organization: (this.globalAwxOrganization as Organization).id,
  //           project: (this.globalProject as Project).id,
  //           inventory: inventory.id,
  //         }).then((jT) => {
  //           jobTemplate = jT;
  //           reusableTemplateSurveyTestSuite = new ReusableTemplateSurveyTestSuite(jobTemplate);

  //           cy.visit(`/templates/job-template/${jobTemplate.id}/survey`);
  //         });
  //       }
  //     );
  //   });

  //   after(function () {
  //     cy.deleteAwxJobTemplate(jobTemplate, { failOnStatusCode: false });
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

  //   // FLAKY_06_19_2024
  //   it.skip('can create all 7 types of survey types, enable survey, launch JT, view default survey answer, complete launch, and assert survey answer on completed job', () =>
  //     reusableTemplateSurveyTestSuite.canCreateAllSurveyTypes(surveyTypes));
  // });
});
