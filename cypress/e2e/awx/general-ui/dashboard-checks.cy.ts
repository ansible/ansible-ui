import { AwxItemsResponse } from '../../../../frontend/awx/common/AwxItemsResponse';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
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

  it('clicking on Cog icon opens the Manage Dashboard modal', () => {
    cy.visit(`/ui_next/dashboard`);
    cy.clickButton('Manage view');
    cy.get('.pf-c-modal-box__title-text').should('contain', 'Manage Dashboard');
    cy.get('[aria-label="Close"]').click();
  });

  it('within the Manage Dashboard modal, unchecking a resource should hide the resource', () => {
    cy.visit(`/ui_next/dashboard`);
    cy.clickButton('Manage view');
    cy.get('.pf-c-modal-box__title-text').should('contain', 'Manage Dashboard');
    cy.contains('tr', 'Resource Counts').find('input').uncheck();
    cy.clickModalButton('Apply');
    cy.contains('.pf-c-title', 'Hosts').should('not.exist');
    cy.clickButton('Manage view');
    cy.get('.pf-c-modal-box__title-text').should('contain', 'Manage Dashboard');
    cy.contains('tr', 'Resource Counts').find('input').check();
    cy.clickModalButton('Apply');
    cy.contains('.pf-c-title', 'Hosts').should('be.visible');
  });

  it('within the Manage Dashboard modal, clicking the Cancel button should revert any changes', () => {
    cy.visit(`/ui_next/dashboard`);
    cy.clickButton('Manage view');
    cy.get('.pf-c-modal-box__title-text').should('contain', 'Manage Dashboard');
    cy.contains('tr', 'Resource Counts').find('input').uncheck();
    cy.clickModalButton('Cancel');
    cy.contains('.pf-c-title', 'Hosts').should('be.visible');
  });

  it('within the Manage Dashboard modal, clicking the Close button should revert any changes', () => {
    cy.visit(`/ui_next/dashboard`);
    cy.clickButton('Manage view');
    cy.get('.pf-c-modal-box__title-text').should('contain', 'Manage Dashboard');
    cy.contains('tr', 'Resource Counts').find('input').uncheck();
    cy.get('[aria-label="Close"]').click();
    cy.contains('.pf-c-title', 'Hosts').should('be.visible');
  });

  // Manage Dashboard modal table does not currently support keyboard input to reorder items, use drag & drop
  it('within the Manage Dashboard modal, dragging a resource should reorder the resource', () => {
    let initialArray: string[];
    let editedArray: string[];
    cy.visit(`/ui_next/dashboard`);

    cy.get('.pf-c-card__header').then((headers) => {
      initialArray = Array.from(headers, (title) => title.innerText.split('\n')[0]);
      cy.clickButton('Manage view');
      cy.get('.pf-c-modal-box__title-text').should('contain', 'Manage Dashboard');
      cy.get('#draggable-row-recent_jobs').drag('#draggable-row-recent_job_activity');
      cy.clickModalButton('Apply');
    });
    cy.get('.pf-c-card__header').then((headers) => {
      editedArray = Array.from(headers, (title) => title.innerText.split('\n')[0]);
      expect(initialArray).to.not.eql(editedArray);
    });
  });

  it('checks inventories count', () => {
    cy.intercept('GET', 'api/v2/dashboard/').as('getInventories');
    cy.visit(`/ui_next/dashboard`);
    cy.contains('.pf-c-card__header', 'Inventories')
      .next()
      .within(() => {
        cy.contains('tspan', 'Ready')
          .invoke('text')
          .then((text: string) => {
            cy.wait('@getInventories')
              .its('response.body.inventories.total')
              .then((total) => {
                expect(total).to.equal(parseInt(text.split(':')[1]));
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
        cy.contains('tspan', 'Ready')
          .invoke('text')
          .then((text: string) => {
            cy.wait('@getHosts')
              .its('response.body.hosts.total')
              .then((total) => {
                expect(total).to.equal(parseInt(text.split(':')[1]));
              });
          });
      });
    cy.checkAnchorLinks('Go to Hosts');
  });

  // JT Disabling invalid test. Ready count does not always match the total count.
  // it('checks projects count', () => {
  //   cy.intercept('GET', 'api/v2/dashboard/').as('getProjects');
  //   cy.visit(`/ui_next/dashboard`);
  //   cy.contains('.pf-c-card__header', 'Projects')
  //     .next()
  //     .within(() => {
  //       cy.contains('tspan', 'Ready')
  //         .invoke('text')
  //         .then((text: string) => {
  //           cy.wait('@getProjects')
  //             .its('response.body.projects.total')
  //             .then((total) => {
  //               expect(total).to.equal(parseInt(text.split(':')[1]));
  //             });
  //         });
  //     });
  //   cy.checkAnchorLinks('Go to Projects');
  // });

  it('checks jobs count and the max # of jobs in the table', () => {
    cy.intercept('GET', '/api/v2/unified_jobs/?order_by=-finished&page=1&page_size=10').as(
      'getJobs'
    );
    cy.visit(`/ui_next/dashboard`);
    cy.hasTitle(/^Recent Jobs$/);
    cy.checkAnchorLinks('Go to Jobs');
    cy.wait('@getJobs')
      .its('response.body.results')
      .then((results: AwxItemsResponse<Job>) => {
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
    cy.hasTitle(/^Recent Projects$/);
    cy.checkAnchorLinks('Go to Projects');
    cy.wait('@getProjects')
      .its('response.body.results')
      .then((results: AwxItemsResponse<Project>) => {
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

  it('checks inventories count and the max # of inventories in the table', () => {
    cy.intercept('GET', 'api/v2/inventories/?order_by=-modified&page=1&page_size=10').as(
      'getInventories'
    );
    cy.visit(`/ui_next/dashboard`);
    cy.hasTitle(/^Recent Inventories$/);
    cy.checkAnchorLinks('Go to Inventories');
    cy.wait('@getInventories')
      .its('response.body.results')
      .then((results: AwxItemsResponse<Inventory>) => {
        if (results.count === 0) {
          cy.log('empty state check');
          cy.hasTitle(/^There are currently no inventories$/).should('be.visible');
          cy.contains(
            'div.pf-c-empty-state__body',
            'Create an inventory by clicking the button below.'
          );
          cy.clickButton(/^Create inventory$/);
          cy.hasTitle(/^Create Inventory$/).should('be.visible');
        } else if (results.count >= 1) {
          cy.log('non empty state check');
          cy.contains('h3', 'Inventories')
            .parents('article.pf-c-card')
            .within(() => {
              cy.get('tbody tr')
                .should('have.lengthOf.at.least', 1)
                .and('have.lengthOf.lessThan', 8);
            });
        }
      });
  });

  it('admin users see default empty state with Create {resource} button', () => {
    cy.visit(`/ui_next/dashboard`);
    cy.intercept({ method: 'GET', url: '/api/v2/projects/*' }, { fixture: 'emptyList.json' });
    cy.intercept({ method: 'GET', url: '/api/v2/inventories/*' }, { fixture: 'emptyList.json' });
    cy.intercept({ method: 'GET', url: '/api/v2/unified_jobs/*' }, { fixture: 'emptyList.json' });
    cy.hasTitle('There are currently no jobs').should('exist');
    cy.hasTitle('There are currently no projects').should('exist');
    cy.hasTitle('There are currently no inventories').should('exist');
    cy.contains('button', 'Create job').should('exist');
    cy.contains('button', 'Create project').should('exist');
    cy.contains('button', 'Create inventory').should('exist');
  });

  it('non-admin users see default empty state without Create {resource} button', () => {
    cy.visit(`/ui_next/dashboard`);
    cy.intercept({ method: 'GET', url: '/api/v2/projects/*' }, { fixture: 'emptyList.json' });
    cy.intercept({ method: 'GET', url: '/api/v2/inventories/*' }, { fixture: 'emptyList.json' });
    cy.intercept({ method: 'GET', url: '/api/v2/unified_jobs/*' }, { fixture: 'emptyList.json' });
    cy.intercept({ method: 'GET', url: '/api/v2/me' }, { fixture: 'normalUser.json' });
    cy.hasTitle('There are currently no jobs').should('exist');
    cy.hasTitle('There are currently no projects').should('exist');
    cy.hasTitle('There are currently no inventories').should('exist');
    cy.contains('button', 'Create job').should('not.exist');
    cy.contains('button', 'Create project').should('not.exist');
    cy.contains('button', 'Create inventory').should('not.exist');
  });
});
