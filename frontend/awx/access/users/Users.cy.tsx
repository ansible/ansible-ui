import { AwxUser } from '../../interfaces/User';
import * as useOptions from '../../../common/crud/useOptions';
import { Users } from './Users';
import { ToolbarFilterType } from '../../../../framework';

describe('Users.cy.ts', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/users/*',
        hostname: 'localhost',
      },
      {
        fixture: 'users.json',
      }
    ).as('getUsers');
    cy.intercept(
      {
        method: 'OPTIONS',
        url: '/api/v2/users/',
      },
      {
        fixture: 'mock_options.json',
      }
    ).as('getOptions');
  });

  it('renders users list', () => {
    cy.mount(<Users />);
    cy.verifyPageTitle('Users');
    cy.get('table').find('tr').should('have.length', 10);
  });

  it('Create User button is disabled if the user does not have permission to create users', () => {
    cy.intercept({ method: 'GET', url: '/api/v2/users/*' }, { fixture: 'users.json' });
    cy.mount(<Users />);
    cy.contains('a', /^Create user$/).should('have.attr', 'aria-disabled', 'true');
  });

  it('create User button is enabled if user has permissions', () => {
    cy.stub(useOptions, 'useOptions').callsFake(() => ({
      data: {
        actions: {
          POST: {
            name: {
              type: ToolbarFilterType.MultiText,
              required: true,
              label: 'Name',
              max_length: 512,
              help_text: 'Name of this user.',
              filterable: true,
            },
          },
        },
      },
    }));
    cy.intercept({ method: 'GET', url: '/api/v2/users/*' }, { fixture: 'users.json' });
    cy.mount(<Users />);
    cy.contains('a', /^Create user$/).should('have.attr', 'aria-disabled', 'false');
  });

  it('deletes user from toolbar menu is enabled if user has permissions', () => {
    cy.mount(<Users />);
    cy.fixture('users.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: AwxUser[]) => {
        const user = results[0];
        cy.selectTableRow(user.username, false);
        cy.clickToolbarKebabAction('delete-selected-users');
        cy.contains('Permanently delete users').should('be.visible');
      });
  });

  /*  
  
  it('row action to delete job  is disabled if the user does not have permissions', () => {
    cy.mount(<Jobs />);
    cy.fixture('jobs.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: UnifiedJob[]) => {
        const job = results[4]; // job with summary_fields.user_capabilities.delete: false
        cy.contains('tr', job.id).within(() => {
          cy.get('button.toggle-kebab').click();
          cy.contains('.pf-v5-c-dropdown__menu-item', /^Delete job$/).should(
            'have.attr',
            'aria-disabled',
            'true'
          );
        });
      });
  });
  it('bulk deletion confirmation contains message about selected jobs that cannot be deleted', () => {
    cy.mount(<Jobs />);
    cy.fixture('jobs.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: UnifiedJob[]) => {
        const job = results[4]; // job with summary_fields.user_capabilities.delete: false
        cy.selectTableRow(job.id.toString(), false);
        cy.clickToolbarKebabAction('delete-selected-jobs');
        cy.contains(
          '1 of the selected jobs cannot be deleted due to insufficient permissions.'
        ).should('be.visible');
      });
  });
  it('row action to cancel job  is disabled if the selected job is not running', () => {
    cy.mount(<Jobs />);
    cy.fixture('jobs.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: UnifiedJob[]) => {
        const job = results[4]; // job with status "successful"
        cy.contains('tr', job.id).within(() => {
          cy.get('button.toggle-kebab').click();
          cy.contains('.pf-v5-c-dropdown__menu-item', /^Cancel job$/).should(
            'have.attr',
            'aria-disabled',
            'true'
          );
        });
      });
  });
  it('row action to cancel job  is disabled if the user does not have permissions', () => {
    cy.mount(<Jobs />);
    cy.fixture('jobs.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: UnifiedJob[]) => {
        const job = results[5]; // job with summary_fields.user_capabilities.start: false
        cy.contains('tr', job.id).within(() => {
          cy.get('button.toggle-kebab').click();
          cy.contains('.pf-v5-c-dropdown__menu-item', /^Cancel job$/).should(
            'have.attr',
            'aria-disabled',
            'true'
          );
        });
      });
  });

  it('cancels a running job from row action', () => {
    cy.fixture('jobs.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: UnifiedJob[]) => {
        const jobs: UnifiedJob[] = results;
        let job: UnifiedJob;
        if (jobs && jobs.length) {
          job = jobs[3]; // job with status "running"
          cy.mount(<Jobs />);
          cy.contains('tr', job.name).within(() => {
            cy.get('#cancel-job').should('be.visible');
            cy.get('#cancel-job').click();
          });
          cy.contains('Cancel jobs').should('be.visible');
        } else {
          throw new Error('Error retrieving jobs from fixture');
        }
      });
  });

  it('bulk cancellation confirmation contains message about selected jobs that cannot be canceled', () => {
    cy.mount(<Jobs />);
    cy.fixture('jobs.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: UnifiedJob[]) => {
        const job = results[0];
        cy.selectTableRow(job.id.toString(), false);
        cy.clickToolbarKebabAction('cancel-selected-jobs');
        cy.contains(
          '1 of the selected jobs cannot be canceled because they are not running.'
        ).should('be.visible');
      });
  });
  */
});
