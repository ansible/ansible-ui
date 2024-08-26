import { JobTemplate } from '../../../../frontend/awx/interfaces/JobTemplate';
import { awxAPI } from '../../../support/formatApiPathForAwx';
import { WorkflowJobTemplate } from '../../../../frontend/awx/interfaces/WorkflowJobTemplate';
import { Spec } from '../../../../frontend/awx/interfaces/Survey';
import { Job } from '../../../../frontend/awx/interfaces/Job';

export class ReusableTemplateSurveyTestSuite {
  template: JobTemplate | WorkflowJobTemplate;
  templateType: string;

  constructor(template: JobTemplate | WorkflowJobTemplate) {
    this.template = template;
    this.templateType = `${template.type}s`;
  }

  navigateToTemplateDetails() {
    cy.navigateTo('awx', 'templates');
    cy.verifyPageTitle('Templates');
    cy.filterTableByMultiSelect('name', [this.template.name]);
    cy.get('[data-cy="name-column-cell"]').within(() => {
      cy.get('a').click();
    });
    cy.verifyPageTitle(this.template.name);
    cy.clickTab('Survey', true);
  }

  canCreateSurvey(question: Spec) {
    this.navigateToTemplateDetails();
    cy.contains(this.template.name);
    cy.get('[aria-selected="true"]').contains('Survey');
    cy.contains('There are currently no survey questions.');
    cy.contains('Create a survey question by clicking the button below.');
    cy.clickButton('Create survey question');
    cy.getByDataCy('question-name').type(question.question_name);
    cy.getByDataCy('question-description').type(question.question_description);
    cy.getByDataCy('question-variable').type(question.variable);
    cy.getByDataCy('question-default').type(question.default.toString());
    cy.intercept(
      'POST',
      awxAPI`/${this.templateType}/${this.template.id.toString()}/survey_spec/`
    ).as('createQuestion');
    cy.clickButton('Create survey question');
    cy.wait('@createQuestion');
    cy.contains('Survey disabled');
    cy.get('[for="survey-switch"]').click();
    cy.contains('Survey enabled');
    cy.getByDataCy('row-0').within(() => {
      cy.contains(question?.question_name);
      cy.contains(question?.type);
    });
  }

  canEditSurvey(question: Spec) {
    cy.createTemplateSurvey(this.template, 'Text', question);
    this.navigateToTemplateDetails();
    cy.getByDataCy('name-column-cell').contains(question?.question_name);
    cy.getByDataCy('type-column-cell').contains(question?.type);
    cy.getByDataCy('default-column-cell').contains(question?.default);
    cy.getByDataCy('edit-survey-question').click();
    cy.getByDataCy('question-name').clear().type('foo');
    cy.getByDataCy('question-description').clear();
    cy.selectDropdownOptionByResourceName('type', 'Integer');
    cy.getByDataCy('question-max').type('0');
    cy.getByDataCy('question-default').clear().type('1337');
    cy.clickButton('Save survey question');
    cy.getByDataCy('name-column-cell').contains('foo');
    cy.getByDataCy('type-column-cell').contains('integer');
    cy.getByDataCy('default-column-cell').contains('1337');
  }

  canDeleteSurvey(question: Spec) {
    cy.createTemplateSurvey(this.template, 'Text', question);
    this.navigateToTemplateDetails();
    cy.getByDataCy('row-0').within(() => {
      cy.contains(question.question_name);
      cy.contains(question.default);
      cy.contains('text');
      cy.clickKebabAction('actions-dropdown', 'delete-survey-question');
    });
    cy.clickModalConfirmCheckbox();
    cy.intercept(
      'DELETE',
      awxAPI`/${this.templateType}/${this.template.id.toString()}/survey_spec/`
    ).as('deleteSurveySpec');
    cy.clickModalButton('Delete');
    cy.wait('@deleteSurveySpec');
    cy.contains('There are currently no survey questions.');
    cy.contains('Create a survey question by clicking the button below.');
  }

  canCreateMultipleSurvey() {
    const specs = [
      {
        question_name: 'Foo',
        question_description: 'this is Foo.',
        variable: 'foo',
        default: 'John Doe',
        type: 'text',
        max: 1024,
        min: 0,
        new_question: true,
        required: true,
        choices: [],
      },
      {
        question_name: 'Bar',
        question_description: 'this is Bar.',
        variable: 'bar',
        default: 'Jane Doe',
        type: 'text',
        max: 1024,
        min: 0,
        new_question: true,
        required: true,
        choices: [],
      },
      {
        question_name: 'Baz',
        question_description: 'this is Baz.',
        variable: 'baz',
        default: 'Baby Doe',
        type: 'text',
        max: 1024,
        min: 0,
        new_question: true,
        required: true,
        choices: [],
      },
    ];
    const survey = {
      name: '',
      description: '',
      spec: specs,
    };
    cy.createAwxSurvey(survey, this.template).then(() => {
      this.navigateToTemplateDetails();
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
      ['Bar', 'Baz', 'Foo'].forEach((spec, index) => {
        cy.getByDataCy(`row-${index}`).within(() => {
          cy.getByDataCy('name-column-cell').contains(spec);
        });
      });
    });
  }

  canEnableSurvey(survey: Spec) {
    this.navigateToTemplateDetails();
    cy.getByDataCy('name-column-cell').contains(survey.question_name);
    cy.intercept('PATCH', awxAPI`/${this.templateType}/${this.template.id.toString()}/`).as(
      'enableSurvey'
    );
    cy.get('[for="survey-switch"]').click();
    cy.wait('@enableSurvey');
  }

  canLaunchSurvey(survey: Spec) {
    cy.intercept('GET', awxAPI`/${this.templateType}/${this.template.id.toString()}/launch/`).as(
      'launchTemplate'
    );
    cy.clickButton('Launch template');
    cy.wait('@launchTemplate');
    cy.contains('Prompt on Launch');
    const groupType = `survey-${survey.type}-answer-form-group`;
    cy.getByDataCy(groupType).within(() => {
      cy.contains(survey.question_name);
      cy.contains('*');
      cy.get('.pf-v5-c-icon').click();
    });
    cy.contains(survey.question_description);
    return groupType;
  }

  canFinishSurvey(survey: Spec) {
    cy.clickButton('Next');
    cy.getByDataCy('code-block-value').within(() => {
      cy.contains(survey.variable);
      if (survey.type === 'password') cy.contains('$encrypted$');
      else {
        survey.default
          .toString()
          .split('\n')
          .forEach((def: string) => {
            cy.contains(def);
          });
      }
    });
    cy.intercept('POST', awxAPI`/${this.templateType}/${this.template.id.toString()}/launch/`).as(
      'postLaunch'
    );
    cy.clickButton(/^Finish/);
    cy.wait('@postLaunch')
      .its('response.body')
      .then((job: Job) => {
        job.type === 'job'
          ? cy.waitForTemplateStatus(job.id.toString())
          : cy.waitForWorkflowJobStatus(job.id.toString());

        cy.navigateTo('awx', 'jobs');
        cy.verifyPageTitle('Jobs');
        cy.filterTableByMultiSelect('id', [job.id.toString()]);
        cy.clickTableRowLink('name', job.name, { disableFilter: true });
        cy.verifyPageTitle(job.name);
        cy.clickTab('Details', true);
        cy.contains(survey.variable);
        if (survey.type === 'password') {
          cy.contains('$encrypted$');
        } else {
          survey.default
            .toString()
            .split('\n')
            .forEach((def) => {
              cy.contains(def);
            });
        }
      });
  }
}
