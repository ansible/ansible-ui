import { Survey, Spec } from '../../../interfaces/Survey';
import { AddTemplateSurveyForm, TemplateSurveyForm } from './TemplateSurveyForm';

const verifyRequestBody = (
  request: ({ spec, body }: { spec: Spec; body: Survey }) => void,
  variable: string | undefined = undefined
) => {
  cy.intercept('POST', '/api/v2/job_templates/*/survey_spec/').as('newQuestion');

  if (variable) cy.contains('Save question').click();
  else cy.contains('Create question').click();

  cy.wait('@newQuestion').then((intercept) => {
    const body = intercept.request.body as Survey;
    const spec = variable
      ? (body.spec.find((s) => s.variable === variable) as Spec)
      : body.spec[body.spec.length - 1];

    request({ spec, body });
  });
};

describe('TemplateSurveyForm', () => {
  describe('Add Template Survey Form', () => {
    beforeEach(() => {
      cy.intercept(
        { method: 'GET', url: '/api/v2/job_templates/*/survey_spec/' },
        { fixture: 'survey.json' }
      );
      cy.mount(<AddTemplateSurveyForm resourceType="job_templates" />);
    });

    it('should test default values', () => {
      const formFields = ['name', 'description', 'variable'];

      formFields.map((field) => {
        cy.getByDataCy(`question-${field}`).should('have.value', '');
      });
      cy.getByDataCy('question-required').should('have.attr', 'checked');

      ['Text', 'Textarea', 'Password', 'Float', 'Integer', 'Float'].forEach((type) => {
        cy.selectDropdownOptionByResourceName('type', type);
        cy.getByDataCy('question-min').should('have.value', 0);
        cy.getByDataCy('question-max').should('have.value', 1024);
        cy.getByDataCy('question-default').should('have.value', '');
      });
    });

    it('should test form validation', () => {
      cy.contains('Create question').click();
      cy.getByDataCy('question-name-form-group').contains('Question is required.');
      cy.getByDataCy('question-variable-form-group').contains('Answer variable name is required.');

      cy.getByDataCy('question-name').type('example question');
      cy.getByDataCy('question-description').type('example desc');
      cy.getByDataCy('question-variable').type('example variable');

      // Default answer type: Text
      cy.contains('Create question').click();
      cy.getByDataCy('question-name-form-group')
        .contains('Question is required.')
        .should('not.exist');
      cy.getByDataCy('question-type-form-group')
        .contains('Answer type is required.')
        .should('not.exist');
      cy.getByDataCy('question-variable-form-group').contains(
        'This field must not contain spaces.'
      );

      cy.getByDataCy('question-variable').clear().type('example_variable');
      cy.getByDataCy('question-variable-form-group')
        .contains('This field must not contain spaces.')
        .should('not.exist');

      cy.getByDataCy('question-max').clear().type('4');
      cy.getByDataCy('question-default').type('foobar');
      cy.getByDataCy('question-default-form-group').contains(
        'Default answer cannot be greater than 4 characters.'
      );

      cy.getByDataCy('question-default').clear().type('foo');
      cy.getByDataCy('question-default-form-group')
        .contains('Default answer cannot be greater than 4 characters.')
        .should('not.exist');

      cy.getByDataCy('question-min').clear().type('4');
      cy.getByDataCy('question-max').clear().type('8');
      cy.getByDataCy('question-default').clear().type('foo');
      cy.getByDataCy('question-default-form-group').contains(
        'Default answer must be at least 4 characters.'
      );

      cy.getByDataCy('question-default').clear().type('foobar');
      cy.getByDataCy('question-default-form-group')
        .contains('Default answer cannot be greater than 4 characters.')
        .should('not.exist');
      cy.getByDataCy('question-default-form-group')
        .contains('Default answer must be at least 4 characters.')
        .should('not.exist');

      // Answer type: Password
      cy.selectDropdownOptionByResourceName('type', 'Password');
      cy.getByDataCy('question-default').should('have.value', 'foobar');
      cy.getByDataCy('question-default').type('foo');
      cy.getByDataCy('question-default').should('have.attr', 'type', 'password');

      // Answer type: Integer
      cy.selectDropdownOptionByResourceName('type', 'Integer');
      cy.getByDataCy('question-default').should('have.value', '');
      cy.getByDataCy('question-default').type('3.14');
      cy.contains('Create question').click();
      cy.getByDataCy('question-default-form-group').contains('This field must be an integer.');

      cy.getByDataCy('question-default').clear().type('314');
      cy.getByDataCy('question-default')
        .contains('This field must be an integer.')
        .should('not.exist');

      // Answer type: Multiple Choice (single select)
      cy.selectDropdownOptionByResourceName('type', 'Multiple Choice (single select)');

      cy.getByDataCy('add-choice-input').type('{enter}');
      cy.contains('Choice option cannot be empty.');

      cy.getByDataCy('add-choice-input').type('choice 1{enter}');
      cy.getByDataCy('add-choice-input').type('choice 2{enter}');
      cy.getByDataCy('add-choice-input').type('choice 3{enter}');

      cy.getByDataCy('add-choice-input').type('choice 3{enter}');

      cy.contains('Choice option already exists.');

      cy.getByDataCy('add-choice-input').clear().type('choice 4{enter}');
      cy.contains('Choice option already exists.').should('not.exist');

      cy.getByDataCy('choice-option-3').clear().type('choice 1');
      cy.contains('Create question').click();
      cy.contains('Choice option already exists.');

      cy.getByDataCy('remove-choice-3').click();

      cy.intercept('POST', '/api/v2/job_templates/*/survey_spec/').as('createQuestion');

      cy.contains('Create question').click();
      cy.contains('Failed to create new survey question.');
    });

    it('should test requst body for each answer type', () => {
      cy.getByDataCy('question-name').type('test question');
      cy.getByDataCy('question-variable').type('test_question');
      cy.getByDataCy('question-default').type('test answer');

      verifyRequestBody(({ body, spec }) => {
        expect(body.name).to.be.eq('Simple');
        expect(body.description).to.be.eq('Description');

        expect(spec).deep.equal({
          default: 'test answer',
          max: 1024,
          min: 0,
          new_question: true,
          question_description: '',
          question_name: 'test question',
          required: true,
          type: 'text',
          variable: 'test_question',
          choices: [],
        });
      });

      cy.selectDropdownOptionByResourceName('type', 'Integer');
      cy.getByDataCy('question-max').type('1337');
      cy.getByDataCy('question-default').type('1337');

      verifyRequestBody(({ spec }) => {
        expect(spec.default).to.be.eq(1337);
        expect(typeof spec.default).to.be.eq('number');
      });

      cy.selectDropdownOptionByResourceName('type', 'Multiple Choice (single select)');
      cy.getByDataCy('add-choice-input').type('choice 1{enter}');
      cy.getByDataCy('add-choice-input').type('choice 2{enter}');
      cy.getByDataCy('add-choice-input').type('choice 3{enter}');

      cy.getByDataCy('choice-radio-1').click();
      verifyRequestBody(({ spec }) => {
        expect(spec).deep.equal({
          default: 'choice 2',
          max: 1024,
          min: 0,
          new_question: true,
          question_description: '',
          question_name: 'test question',
          required: true,
          type: 'multiplechoice',
          variable: 'test_question',
          choices: ['choice 1', 'choice 2', 'choice 3'],
        });
      });

      cy.selectDropdownOptionByResourceName('type', 'Multiple Choice (multiple select)');
      cy.getByDataCy('choice-checkbox-0').click();
      cy.getByDataCy('choice-checkbox-2').click();

      verifyRequestBody(({ spec }) => {
        expect(spec).deep.equal({
          default: 'choice 1\nchoice 2\nchoice 3',
          max: 1024,
          min: 0,
          new_question: true,
          question_description: '',
          question_name: 'test question',
          required: true,
          type: 'multiselect',
          variable: 'test_question',
          choices: ['choice 1', 'choice 2', 'choice 3'],
        });
      });
    });

    it('should not create new question if already exists', () => {
      cy.getByDataCy('question-name').type('long_answer');
      cy.getByDataCy('question-variable').type('long_answer');

      cy.contains('Create question').click();
      cy.contains('Survey already contains a question with variable named "long_answer"');
    });
  });

  describe('Edit Survey Form', () => {
    beforeEach(() => {
      cy.intercept(
        { method: 'GET', url: '/api/v2/job_templates/*/survey_spec/' },
        { fixture: 'survey.json' }
      );
      cy.mount(
        <TemplateSurveyForm
          mode="edit"
          resourceType="job_templates"
          questionVariable="multi_choice"
        />
      );
    });

    it('should test default values', () => {
      cy.getByDataCy('question-name').should('have.value', 'mchoice');
      cy.getByDataCy('question-description').should('have.value', 'Can have multiples of these');
      cy.getByDataCy('question-variable').should('have.value', 'multi_choice');
      cy.getByDataCy('question-type-form-group').contains('Multiple Choice (multiple select)');

      cy.getByDataCy('question-required').should('not.be.checked');

      cy.getByDataCy('choice-option-0').should('have.value', 'one');
      cy.getByDataCy('choice-option-1').should('have.value', 'two');
      cy.getByDataCy('choice-option-2').should('have.value', 'three');
      cy.getByDataCy('choice-checkbox-0').should('have.attr', 'checked');
      cy.getByDataCy('choice-checkbox-2').should('have.attr', 'checked');

      cy.getByDataCy('add-choice-input').type('four{enter}');

      cy.selectDropdownOptionByResourceName('type', 'Multiple Choice (single select)');
      cy.getByDataCy('choice-option-0').should('have.value', 'one');
      cy.getByDataCy('choice-option-1').should('have.value', 'two');
      cy.getByDataCy('choice-option-2').should('have.value', 'three');
      cy.getByDataCy('choice-option-3').should('have.value', 'four');

      [0, 1, 2].forEach((num) => {
        cy.getByDataCy(`choice-radio-${num}`).should('not.be.checked');
      });

      cy.getByDataCy('choice-radio-1').click();
      cy.getByDataCy('question-required').check();

      verifyRequestBody(({ spec, body }) => {
        cy.log('spec and body', spec, body);
        expect(spec).deep.equal({
          choices: ['one', 'two', 'three', 'four'],
          default: 'two',
          max: 1024,
          min: 0,
          new_question: false,
          question_description: 'Can have multiples of these',
          question_name: 'mchoice',
          required: true,
          type: 'multiplechoice',
          variable: 'multi_choice',
        });
      }, 'multi_choice');
    });
  });
});
