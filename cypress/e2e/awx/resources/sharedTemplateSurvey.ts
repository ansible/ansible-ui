import { JobTemplate } from '../../../../frontend/awx/interfaces/JobTemplate';
import { awxAPI } from '../../../support/formatApiPathForAwx';
import { WorkflowJobTemplate } from '../../../../frontend/awx/interfaces/WorkflowJobTemplate';
import { Spec } from '../../../../frontend/awx/interfaces/Survey';

export class ReusableTemplateSurveyTestSuite {
  template: JobTemplate | WorkflowJobTemplate;
  templateType: string;
  UIPath: string;

  constructor(template: JobTemplate | WorkflowJobTemplate) {
    this.template = template;
    this.templateType = `${template.type}s`;
    this.UIPath = this.templateType === 'job_templates' ? 'job-template' : 'workflow-job-template';
  }

  canCreateSurvey(question: Spec) {
    //Use the JT/WFJT created in the beforeEach block
    //Assert the empty state survey list
    //Assert creation of the survey and info showing on survey list
    cy.visit(`/templates/${this.UIPath}/${this.template.id}/survey`);

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
    cy.clickButton('Create question');
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
    //Use the JT/WFJT created in the beforeEach block
    //Assert survey creation and info showing on survey list
    //Assert info on survey list after editing
    cy.createTemplateSurvey(this.template, 'Text', question);
    cy.visit(`/templates/${this.UIPath}/${this.template.id}/survey`);

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
  }

  canDeleteSurvey(question: Spec) {
    //Use the JT/WFJT created in the beforeEach block
    //Create survey, assert existence
    //Delete and assert deletion
    cy.createTemplateSurvey(this.template, 'Text', question);
    cy.visit(`/templates/${this.UIPath}/${this.template.id}/survey`);

    cy.getByDataCy('row-0').within(() => {
      cy.contains(question.question_name);
      cy.contains(question.default);
      cy.contains('text');
      cy.getByDataCy('actions-dropdown').click();
      cy.contains('Delete question').click();
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
    //Use the JT/WFJT created in the beforeEach block
    //Create multiple surveys within the JT/WFJT, assert existence and order of surveys
    //Change order and assert new order
    //Bulk delete and assert deletion
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

    specs.forEach((spec) => {
      cy.createTemplateSurvey(this.template, 'Text', spec);
    });

    cy.visit(`/templates/${this.UIPath}/${this.template.id}/survey`);

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
  }

  canCreateAllSurveyTypes(surveyTypes: Spec[]) {
    surveyTypes.forEach((survey) => {
      cy.createTemplateSurvey(this.template, 'Text', survey);
      cy.getByDataCy('name-column-cell').contains(survey.question_name);
    });

    cy.intercept('PATCH', awxAPI`/${this.templateType}/${this.template.id.toString()}/`).as(
      'enableSurvey'
    );
    cy.get('[for="survey-switch"]').click();
    cy.wait('@enableSurvey');

    cy.intercept('GET', awxAPI`/${this.templateType}/${this.template.id.toString()}/launch/`).as(
      'launchTemplate'
    );

    cy.clickButton('Launch template');
    cy.wait('@launchTemplate');

    cy.contains('Prompt on Launch');

    surveyTypes.forEach((survey) => {
      const groupType = `survey-${survey.type}-answer-form-group`;

      cy.getByDataCy(groupType).within(() => {
        cy.contains(survey.question_name);
        cy.contains('*');
        cy.get('.pf-v5-c-icon').click();
      });
      cy.contains(survey.question_description);

      if (['multiplechoice', 'multiselect'].includes(survey.type)) {
        if (survey.type === 'multiplechoice') {
          cy.getByDataCy(groupType).within(() => {
            cy.contains(survey.default);
            cy.get('div[data-ouia-component-id="menu-select"]').click();
            (survey?.choices as string[])?.forEach((choice) => {
              cy.getByDataCy('survey-multiplechoice-answer').contains(choice);
            });
          });
        } else {
          cy.getByDataCy(groupType).within(() => {
            const defaults = (survey.default as string).split('\n');
            defaults.forEach((defaultValue) => {
              cy.contains(defaultValue);
            });
            cy.get('#survey-multiselect-answer').click();
          });

          cy.get('#survey-multiselect-answer-select').within(() => {
            (survey?.choices as string[])?.forEach((choice) => {
              cy.getByDataCy(choice);
            });
          });
        }
      } else if (survey.type === 'password') {
        cy.getByDataCy(groupType)
          .getByDataCy('survey-password-answer')
          .should('have.value', '$encrypted$');
      } else {
        cy.getByDataCy(groupType)
          .getByDataCy(`survey-${survey.type.toLowerCase()}-answer`)
          .should('have.value', survey.default);
      }
    });

    cy.clickButton('Next');

    cy.getByDataCy('code-block-value').within(() => {
      surveyTypes.forEach((survey) => {
        cy.contains(survey.variable);
        if (survey.type === 'password') cy.contains('$encrypted$');
        else {
          (survey.default as string).split('\n').forEach((def: string) => {
            cy.contains(def);
          });
        }
      });
    });

    cy.clickButton('Finish');

    cy.intercept('POST', awxAPI`/${this.templateType}/${this.template.id.toString()}/launch/`).as(
      'postLaunch'
    );
    cy.clickButton(/^Finish/);
    cy.wait('@postLaunch')
      .its('response.body.id')
      .then((jobId: string) => {
        if (this.templateType === 'workflow_job_templates') cy.waitForWorkflowJobStatus(jobId);
        else cy.waitForTemplateStatus(jobId);

        cy.log('job id', jobId);

        cy.contains('Success');

        const jobType = this.templateType === 'workflow_job_templates' ? 'workflow' : 'playbook';

        cy.visit(`/jobs/${jobType}/${jobId}/details`);

        surveyTypes.forEach((survey) => {
          cy.contains(survey.variable);
          if (survey.type === 'password') {
            cy.contains('$encrypted$');
          } else {
            (survey.default as string).split('\n').forEach((def) => {
              cy.contains(def);
            });
          }
        });
      });
  }
}
