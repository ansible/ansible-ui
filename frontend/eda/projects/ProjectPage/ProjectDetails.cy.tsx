/* eslint-disable i18next/no-literal-string */
import { edaAPI } from '../../common/eda-utils';
import { ProjectDetails } from './ProjectDetails';

describe('ProjectDetails', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: edaAPI`/projects/1/`,
      },
      {
        fixture: 'edaProject.json',
      }
    );
  });

  it('Component renders and displays project', () => {
    it('Project details are displayed correctly', () => {
      cy.mount(<ProjectDetails />);
      cy.get('#name').should('have.text', 'Sample Project');
      cy.contains('dd#name>div', 'Sample Project').should('exist');
      cy.get('#description').should('have.text', 'Sample project description');
      cy.get('#organization').should('have.text', 'Organization 2');
      cy.get('#source-control-type').should('have.text', 'Git');
      cy.get('#source-control-url').should('have.text', 'https://github.com/ansible/ansible-ui');
      cy.get('#proxy').should('have.text', 'proxy.example.com');
      cy.get('#import-state').should('have.text', 'completed');
    });
  });
});
