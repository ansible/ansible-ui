import { AwxItemsResponse } from '../../../../frontend/awx/common/AwxItemsResponse';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Job } from '../../../../frontend/awx/interfaces/Job';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { awxAPI } from '../../../support/formatApiPathForAwx';

describe('AWX Overview', () => {
  it('clicking on Cog icon opens the Manage Dashboard modal', () => {
    cy.navigateTo('awx', 'overview');
    cy.clickButton('Manage view');
    cy.get('.pf-v5-c-modal-box__title-text').should('contain', 'Manage view');
    cy.get('[aria-label="Close"]').click();
  });

  it('within the Manage Dashboard modal, unchecking a resource should hide the resource', () => {
    cy.navigateTo('awx', 'overview');
    cy.clickButton('Manage view');
    cy.get('.pf-v5-c-modal-box__title-text').should('contain', 'Manage view');
    cy.contains('tr', 'Resource counts').find('input').uncheck();
    cy.clickModalButton('Apply');
    cy.contains('.pf-v5-c-title', 'Hosts').should('not.exist');
    cy.clickButton('Manage view');
    cy.get('.pf-v5-c-modal-box__title-text').should('contain', 'Manage view');
    cy.contains('tr', 'Resource counts').find('input').check();
    cy.clickModalButton('Apply');
    cy.contains('.pf-v5-c-title', 'Hosts').should('be.visible');
  });

  it('within the Manage Dashboard modal, clicking the Cancel button should revert any changes', () => {
    cy.navigateTo('awx', 'overview');
    cy.clickButton('Manage view');
    cy.get('.pf-v5-c-modal-box__title-text').should('contain', 'Manage view');
    cy.contains('tr', 'Resource counts').find('input').uncheck();
    cy.clickModalButton('Cancel');
    cy.contains('.pf-v5-c-title', 'Hosts').should('be.visible');
  });

  it('within the Manage Dashboard modal, clicking the Close button should revert any changes', () => {
    cy.navigateTo('awx', 'overview');
    cy.clickButton('Manage view');
    cy.get('.pf-v5-c-modal-box__title-text').should('contain', 'Manage view');
    cy.contains('tr', 'Resource counts').find('input').uncheck();
    cy.get('[aria-label="Close"]').click();
    cy.contains('.pf-v5-c-title', 'Hosts').should('be.visible');
  });

  // Manage Dashboard modal table does not currently support keyboard input to reorder items, use drag & drop
  it('within the Manage Dashboard modal, dragging a resource should reorder the resource', () => {
    let initialArray: string[];
    let editedArray: string[];
    cy.navigateTo('awx', 'overview');

    cy.get('.pf-v5-c-card__header').then((headers) => {
      initialArray = Array.from(headers, (title) => title.innerText.split('\n')[0]);
      cy.clickButton('Manage view');
      cy.get('.pf-v5-c-modal-box__title-text').should('contain', 'Manage view');
      cy.get('#draggable-row-recent_jobs').drag('#draggable-row-recent_job_activity');
      cy.clickModalButton('Apply');
    });
    cy.get('.pf-v5-c-card__header').then((headers) => {
      editedArray = Array.from(headers, (title) => title.innerText.split('\n')[0]);
      expect(initialArray).to.not.eql(editedArray);
    });
  });

  it('checks jobs count and the max # of jobs in the table', () => {
    cy.intercept('GET', awxAPI`/unified_jobs/?order_by=-finished&page=1&page_size=10`).as(
      'getJobs'
    );
    cy.navigateTo('awx', 'overview');
    cy.get('[data-cy="jobs"]').should('contain', 'Jobs');
    cy.checkAnchorLinks('View all Jobs');
    cy.wait('@getJobs')
      .its('response.body.results')
      .then((results: AwxItemsResponse<Job>) => {
        if (results.count === 0) {
          cy.log('empty state check');
          cy.get('[data-cy="There are currently no jobs"]').should(
            'contain',
            'There are currently no jobs'
          );
          cy.contains(
            'div.pf-v5-c-empty-state__body',
            'Create a job by clicking the button below.'
          );
          cy.clickButton(/^Create job$/);
          cy.get('[data-cy="Create Job Template"]').should('contain', 'Create Job Template');
        } else if (results.count >= 1) {
          cy.log('non empty state check');
          cy.contains('h3', 'Jobs')
            .parents('.pf-v5-c-card')
            .within(() => {
              cy.get('tbody tr')
                .should('have.lengthOf.at.least', 1)
                .and('have.lengthOf.lessThan', 8);
            });
        }
      });
  });

  it('checks projects count and the max # of projects in the table', () => {
    cy.intercept('GET', awxAPI`/projects/?order_by=-modified&page=1&page_size=10`).as(
      'getProjects'
    );
    cy.navigateTo('awx', 'overview');
    cy.get('[data-cy="projects"]').should('contain', 'Projects');
    cy.checkAnchorLinks('View all Projects');
    cy.wait('@getProjects')
      .its('response.body.results')
      .then((results: AwxItemsResponse<Project>) => {
        if (results.count === 0) {
          cy.log('empty state check');
          cy.get('[data-cy="There are currently no projects"]').should(
            'contain',
            'There are currently no projects'
          );
          cy.contains(
            'div.pf-v5-c-empty-state__body',
            'Create a job by clicking the button below.'
          );
          cy.clickButton(/^Create project$/);
          cy.verifyPageTitle('Create Project');
        } else if (results.count >= 1) {
          cy.log('non empty state check');
          cy.contains('small', 'Recently updated projects')
            .prev()
            .should('have.text', 'Projects')
            .scrollIntoView()
            .parents('.pf-v5-c-card')
            .within(() => {
              cy.get('tbody tr')
                .should('have.lengthOf.at.least', 1)
                .and('have.lengthOf.lessThan', 8);
            });
        }
      });
  });

  it('checks inventories count and the max # of inventories in the table', () => {
    cy.intercept('GET', awxAPI`/inventories/?order_by=-modified&page=1&page_size=10`).as(
      'getInventories'
    );
    cy.navigateTo('awx', 'overview');
    cy.get('[data-cy="inventories"]').should('contain', 'Inventories');
    cy.checkAnchorLinks('View all Inventories');
    cy.wait('@getInventories')
      .its('response.body.results')
      .then((results: AwxItemsResponse<Inventory>) => {
        if (results.count === 0) {
          cy.log('empty state check');
          cy.get('[data-cy="There are currently no inventories"]').should(
            'contain',
            'There are currently no inventories'
          );
          cy.contains(
            'div.pf-v5-c-empty-state__body',
            'Create an inventory by clicking the button below.'
          );
          cy.clickButton(/^Create inventory$/);
          cy.verifyPageTitle('Create Inventory$');
        } else if (results.count >= 1) {
          cy.log('non empty state check');
          cy.contains('h3', 'Inventories')
            .parents('.pf-v5-c-card')
            .within(() => {
              cy.get('tbody tr')
                .should('have.lengthOf.at.least', 1)
                .and('have.lengthOf.lessThan', 8);
            });
        }
      });
  });
});
