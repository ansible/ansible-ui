import { ItemsResponse } from '../../../../frontend/common/crud/Data';
import { Job } from '../../../../frontend/awx/interfaces/Job';
import { Project } from '../../../../frontend/awx/interfaces/Project';

describe('Dashboard: General UI tests - resources count and empty state check', () => {
  before(() => {
    cy.awxLogin();
  });

  it('welcome modal', () => {
    cy.visit(`/ui_next/dashboard`);
    cy.clickModalButton('Close');
    cy.reload();
    cy.getDialog().within(() => {
      cy.contains('Welcome to the new Ansible user interface').should('be.visible');
    });
    cy.getCheckboxByLabel('Do not show this message again.').click();
    cy.clickModalButton('Close');
  });

  it('checks inventories count', () => {
    cy.intercept('GET', 'api/v2/dashboard/').as('getInventories');
    cy.visit(`/ui_next/dashboard`);
    cy.contains('.pf-c-card__header', 'Inventories')
      .next()
      .within(() => {
        cy.get('text')
          .invoke('text')
          .then((text: string) => {
            cy.wait('@getInventories')
              .its('response.body.inventories.total')
              .then((total) => {
                expect(total).to.equal(parseInt(text));
              });
          });
      });
    cy.checkAnchorLinks('Go to Inventories');
  });

  it('checks hosts count', () => {
    cy.intercept('GET', 'api/v2/dashboard/').as('getHosts');
    cy.visit(`/ui_next/dashboard`);
    cy.contains('.pf-c-card__header', 'Hosts')
      .next()
      .within(() => {
        cy.get('text')
          .invoke('text')
          .then((text: string) => {
            cy.wait('@getHosts')
              .its('response.body.hosts.total')
              .then((total) => {
                expect(total).to.equal(parseInt(text));
              });
          });
      });
    cy.checkAnchorLinks('Go to Hosts');
  });

  it('checks projects count', () => {
    cy.intercept('GET', 'api/v2/dashboard/').as('getProjects');
    cy.visit(`/ui_next/dashboard`);
    cy.contains('.pf-c-card__header', 'Projects')
      .next()
      .within(() => {
        cy.get('text')
          .invoke('text')
          .then((text: string) => {
            cy.wait('@getProjects')
              .its('response.body.projects.total')
              .then((total) => {
                expect(total).to.equal(parseInt(text));
              });
          });
      });
    cy.checkAnchorLinks('Go to Projects');
  });

  it('checks jobs count and the max # of jobs in the table', () => {
    cy.intercept('GET', '/api/v2/unified_jobs/?order_by=-finished&page=1&page_size=10').as(
      'getJobs'
    );
    cy.visit(`/ui_next/dashboard`);
    cy.hasTitle(/^Jobs$/);
    cy.checkAnchorLinks('Go to Jobs');
    cy.wait('@getJobs')
      .its('response.body.results')
      .then((results: ItemsResponse<Job>) => {
        if (results.count === 0) {
          cy.log('empty state check');
          cy.hasTitle(/^There are currently no jobs$/).should('be.visible');
          cy.contains('div.pf-c-empty-state__body', 'Create a job by clicking the button below.');
          cy.clickButton(/^Create job$/);
          cy.hasTitle(/^Create Job Template$/).should('be.visible');
        } else if (results.count >= 1) {
          cy.log('non empty state check');
          cy.contains('h3', 'Jobs')
            .parents('article.pf-c-card')
            .within(() => {
              cy.get('tbody tr')
                .should('have.lengthOf.at.least', 1)
                .and('have.lengthOf.lessThan', 8);
            });
        }
      });
  });

  it('checks projects count and the max # of projects in the table', () => {
    cy.intercept('GET', 'api/v2/projects/?order_by=-modified&page=1&page_size=10').as(
      'getProjects'
    );
    cy.visit(`/ui_next/dashboard`);
    cy.hasTitle(/^Projects$/);
    cy.checkAnchorLinks('Go to Projects');
    cy.wait('@getProjects')
      .its('response.body.results')
      .then((results: ItemsResponse<Project>) => {
        if (results.count === 0) {
          cy.log('empty state check');
          cy.hasTitle(/^There are currently no projects$/).should('be.visible');
          cy.contains('div.pf-c-empty-state__body', 'Create a job by clicking the button below.');
          cy.clickButton(/^Create project$/);
          cy.hasTitle(/^Create Project$/).should('be.visible');
        } else if (results.count >= 1) {
          cy.log('non empty state check');
          cy.contains('small', 'Recently updated projects')
            .prev()
            .should('have.text', 'Projects')
            .scrollIntoView()
            .parents('article.pf-c-card')
            .within(() => {
              cy.get('tbody tr')
                .should('have.lengthOf.at.least', 1)
                .and('have.lengthOf.lessThan', 8);
            });
        }
      });
  });
});
