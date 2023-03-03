/* eslint-disable i18next/no-literal-string */
import { Project } from '../../../interfaces/Project';
import { ProjectDetails } from './ProjectDetails';
import { MemoryRouter } from 'react-router-dom';

describe('ProjectDetails', () => {
  it('Component renders and displays project', () => {
    cy.fixture('project').then((project: Project) => {
      cy.mount(
        <MemoryRouter initialEntries={['/projects']} initialIndex={0}>
          <ProjectDetails project={project} />
        </MemoryRouter>
      );
      cy.get('#name').should('have.text', 'Demo Project @ 10:44:51');
      cy.get('#organization').should('have.text', 'Default');
      cy.get('#last-job-status').should('have.text', 'Successful');
      cy.get('#source-control-type').should('have.text', 'Git');
      cy.get('.pf-c-truncate__start').should(
        'have.text',
        '347e44fea036c94d5f60e544de006453ee5c71ad'
      );
      cy.get('#source-control-url').should(
        'have.text',
        'https://github.com/ansible/ansible-tower-samples'
      );
      cy.get('#playbook-directory').should('have.text', '_9__demo_project_104451');
      cy.get(
        '#created > .pf-c-description-list__text > [style="white-space: nowrap;"] > .pf-c-button'
      ).should('have.text', 'awx');
      cy.get(
        '#last-modified > .pf-c-description-list__text > [style="white-space: nowrap;"] > .pf-c-button'
      ).should('have.text', 'awx');
    });
  });
  // user can view org details from project details page
  // user can view admin details from project details page
  // user can copy revision hash from project details page
});
