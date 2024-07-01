import { edaAPI } from '../common/eda-utils';
import { CreateProject, EditProject } from './EditProject';

describe('Create project ', () => {
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

  it('Create Project - Displays error message on internal server error', () => {
    cy.mount(<CreateProject />);
    cy.get('[data-cy="name"]').type('Test');
  });

  it('Component renders', () => {
    cy.mount(<CreateProject />);
    cy.verifyPageTitle('Create project');
  });

  it('Validates properly', () => {
    cy.mount(<CreateProject />);
    cy.clickButton(/^Create project$/);
    ['Name', 'Source control url'].map((field) =>
      cy.contains(`${field} is required.`).should('be.visible')
    );
  });

  it('Should update fields properly', () => {
    cy.mount(<CreateProject />);
    cy.get('[data-cy="name"]').type('Test');
    cy.get('[data-cy="url"]').type('test.example.com');
    cy.get('[data-cy="organization_id"]').click();
    cy.get('#organization-2 > .pf-v5-c-menu__item-main > .pf-v5-c-menu__item-text').click();
    cy.clickButton('Create project');

    cy.intercept('POST', edaAPI`/projects/`, (req) => {
      expect(req.body).to.contain({
        name: 'Test',
        organization_id: 2,
        inputs: { url: 'test.example.com' },
      });
    });
  });
});

describe('Edit Project', () => {
  const project = {
    name: 'Sample Project',
    description: 'This is a sample project',
    id: 1,
    organization: {
      id: 5,
      name: 'Organization 5',
    },
    project_type: { id: 1, name: 'Source control' },
  };

  beforeEach(() => {
    cy.intercept({ method: 'GET', url: edaAPI`/projects/*` }, { statusCode: 200, body: project });
    cy.intercept(
      { method: 'GET', url: edaAPI`/organizations/5` },
      { id: 5, name: 'Organization 5' }
    );
  });

  it('should preload the form with current values', () => {
    cy.mount(<EditProject />);
    cy.verifyPageTitle('Edit Sample Project');
    cy.get('[data-cy="name"]').should('have.value', 'Sample Project');
    cy.get('[data-cy="description"]').should('have.value', 'This is a sample project');
    cy.getByDataCy('organization_id').should('have.text', 'Organization 5');
  });

  it('should edit project type', () => {
    cy.mount(<EditProject />);
    cy.get('[data-cy="name"]').should('have.value', 'Sample Project');
    cy.get('[data-cy="name"]').clear();
    cy.get('[data-cy="name"]').type('Modified Project');
    cy.get('[data-cy="Submit"]').clickButton(/^Save project$/);
    cy.intercept('PATCH', edaAPI`/projects/`, (req) => {
      expect(req.body).to.contain({
        name: 'Modified Project',
      });
    });
  });
});
