import { edaAPI } from '../common/eda-utils';
import { CreateDecisionEnvironment, EditDecisionEnvironment } from './DecisionEnvironmentForm';

describe('Create decision environment ', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: edaAPI`/organizations/*` },
      {
        fixture: 'edaOrganizations.json',
      }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/eda-credentials/*` },
      {
        fixture: 'edaCredentials.json',
      }
    );
  });

  it('Create decision environment - Displays error message on internal server error', () => {
    cy.mount(<CreateDecisionEnvironment />);
    cy.get('[data-cy="name"]').type('Test');
  });

  it('Component renders', () => {
    cy.mount(<CreateDecisionEnvironment />);
    cy.verifyPageTitle('Create decision environment');
  });

  it('Validates properly', () => {
    cy.mount(<CreateDecisionEnvironment />);
    cy.clickButton(/^Create decision environment$/);
    ['Name', 'Image'].map((field) => cy.contains(`${field} is required.`).should('be.visible'));
  });

  it('Should update fields properly', () => {
    cy.mount(<CreateDecisionEnvironment />);
    cy.get('[data-cy="name"]').type('Test');
    cy.get('[data-cy="image-url"]').type('test.example.com');
    cy.get('[data-cy="organization_id"]').click();
    cy.get('#organization-2 > .pf-v5-c-menu__item-main > .pf-v5-c-menu__item-text').click();
    cy.clickButton('Create decision environment');

    cy.intercept('POST', edaAPI`/decision-environments/`, (req) => {
      expect(req.body).to.contain({
        name: 'Test',
        organization_id: 2,
        inputs: { image_url: 'test.example.com' },
      });
    });
  });
});

describe('Edit Decision Environment', () => {
  const de = {
    name: 'Sample Decision Environment',
    description: 'This is a sample decision environment',
    id: 1,
    organization: {
      id: 5,
      name: 'Organization 5',
    },
    image_url: 'some_image',
  };

  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: edaAPI`/decision-environments/*` },
      { statusCode: 200, body: de }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/organizations/5` },
      { id: 5, name: 'Organization 5', image_url: 'some_image' }
    );
  });

  it('should preload the form with current values', () => {
    cy.mount(<EditDecisionEnvironment />);
    cy.verifyPageTitle('Edit Sample Decision Environment');
    cy.get('[data-cy="name"]').should('have.value', 'Sample Decision Environment');
    cy.get('[data-cy="description"]').should('have.value', 'This is a sample decision environment');
    cy.getByDataCy('organization_id').should('have.text', 'Organization 5');
  });

  it('should edit the decision environment', () => {
    cy.mount(<EditDecisionEnvironment />);
    cy.get('[data-cy="name"]').should('have.value', 'Sample Decision Environment');
    cy.get('[data-cy="name"]').clear();
    cy.get('[data-cy="name"]').type('Modified Decision Environment');
    cy.get('[data-cy="Submit"]').clickButton(/^Save decision environment$/);
    cy.intercept('PATCH', edaAPI`/decision-environments/`, (req) => {
      expect(req.body).to.contain({
        name: 'Modified Decision Environment',
      });
    });
  });
});
