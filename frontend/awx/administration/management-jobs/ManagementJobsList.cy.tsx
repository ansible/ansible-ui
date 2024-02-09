import { ManagementJobs } from './ManagementJobsList';
import * as useOptions from '../../../common/crud/useOptions';

describe('ManagementJobs Empty State test', () => {
  before(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/system_job_templates/*',
      },
      {
        fixture: 'emptyList.json',
      }
    ).as('emptyList');
  });

  it('Empty state is displayed correctly when there are no management jobs', () => {
    cy.stub(useOptions, 'useOptions').callsFake(() => ({
      data: {
        actions: {
          POST: {
            name: {
              required: true,
              label: 'Name',
              max_length: 512,
              help_text: 'Name of this management job.',
              filterable: true,
            },
          },
        },
      },
    }));
    cy.mount(<ManagementJobs />);
    cy.contains('No management jobs yet').should('be.visible');
  });
});

describe('Non-empty ManagementJobs list', () => {
  before(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/system_job_templates/*',
      },
      {
        fixture: 'managementJobs.json',
      }
    ).as('nonEmptyList');
  });

  it('Management Jobs list renders', () => {
    cy.mount(<ManagementJobs />);
    cy.verifyPageTitle('Management Jobs');
    cy.get('[data-cy="row-id-2"] [data-cy="name-column-cell"]').should(
      'have.text',
      'Cleanup Activity Stream'
    );
    cy.get('[data-cy="row-id-4"] [data-cy="name-column-cell"]').should(
      'have.text',
      'Cleanup Expired Sessions'
    );
    cy.get('[data-cy="row-id-1"] [data-cy="name-column-cell"]').should(
      'have.text',
      'Cleanup Job Details'
    );
    cy.get('[data-cy="row-id-5"] [data-cy="name-column-cell"]').should(
      'have.text',
      'Cleanup Expired OAuth 2 Tokens'
    );
  });
});
