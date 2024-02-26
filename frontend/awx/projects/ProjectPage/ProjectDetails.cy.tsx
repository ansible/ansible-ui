/* eslint-disable i18next/no-literal-string */

import { ProjectDetails } from './ProjectDetails';

describe('ProjectDetails', () => {
  it('Component renders and displays project', () => {
    cy.intercept({ method: 'GET', url: '/api/v2/projects/*' }, { fixture: 'project.json' });

    cy.mount(<ProjectDetails />);
    cy.get('#name').should('have.text', 'Demo Project @ 10:44:51');
    cy.get('#organization').should('have.text', 'Default');
    cy.get('#last-job-status').invoke('text').as('Success');
    cy.get('#source-control-type').should('have.text', 'Git');
    cy.get('#source-control-revision').should(
      'have.text',
      '347e44fea036c94d5f60e544de006453ee5c71ad'
    );
    cy.get('#source-control-url').should(
      'have.text',
      'https://github.com/ansible/ansible-tower-samples'
    );
    cy.get('#playbook-directory').should('have.text', '_9__demo_project_104451');
    cy.get('#created > .pf-v5-c-description-list__text > .date-time > .pf-v5-c-button').should(
      'have.text',
      'awx'
    );
    cy.get(
      '#last-modified > .pf-v5-c-description-list__text > .date-time > .pf-v5-c-button'
    ).should('have.text', 'awx');
  });
  // user can view org details from project details page
  // user can view admin details from project details page
  // user can copy revision hash from project details page
});
