import { InventoryRunCommand } from './InventoryRunCommand';
import { AwxItemsResponse } from '../../common/AwxItemsResponse';
import { ExecutionEnvironment } from '../../interfaces/ExecutionEnvironment';

describe('Run command wizard', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/credential_types/*',
      },
      {
        fixture: 'machine_credential_type.json',
      }
    ).as('credential-types');
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/credentials/*',
        hostname: 'localhost',
      },
      {
        fixture: 'credentials.json',
      }
    ).as('credentials');
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/credentials/1/',
      },
      {
        id: 1,
        name: 'Demo Credential',
      }
    ).as('getCredential');
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/execution_environments/*',
        hostname: 'localhost',
      },
      {
        fixture: 'execution_environments.json',
      }
    );
    cy.fixture('execution_environments.json').then(
      (eeResponse: AwxItemsResponse<ExecutionEnvironment>) => {
        const ee = eeResponse.results.find((ee) => ee.id === 1);
        cy.intercept(
          {
            method: 'GET',
            url: `/api/v2/execution_environments/1/`,
            hostname: 'localhost',
          },
          {
            body: ee,
          }
        ).as('getEE');
      }
    );
  });
  it('review step has correct values', () => {
    cy.mount(<InventoryRunCommand />);
    cy.selectDropdownOptionByResourceName('module-name', 'shell');
    cy.getByDataCy('module-args-form-group').type('argument');
    cy.selectDropdownOptionByResourceName('verbosity', '1 (Verbose)');
    cy.getByDataCy('limit-form-group').within(() => {
      cy.get('input').clear().type('limit');
    });
    cy.getByDataCy('forks-form-group').within(() => {
      cy.get('input').clear().type('1');
    });
    cy.getByDataCy('diff-mode-form-group').within(() => {
      cy.get('.pf-v5-c-form__group-control > label').click();
    });
    cy.getByDataCy('become_enabled').click();
    cy.get('.view-line').type('test: "test"');
    cy.clickButton(/^Next$/);
    cy.singleSelectByDataCy('executionEnvironment', 'AWX EE (latest)');
    cy.clickButton(/^Next$/);
    cy.selectSingleSelectOption('[data-cy="credential"]', 'Demo Credential');

    cy.clickButton(/^Next$/);
    cy.wait('@getCredential');
    cy.wait('@getEE');
    cy.getByDataCy('module').should('contain', 'shell');
    cy.getByDataCy('arguments').should('contain', 'argument');
    cy.getByDataCy('verbosity').should('contain', '1');
    cy.getByDataCy('limit').should('contain', 'limit');
    cy.getByDataCy('forks').should('contain', '1');
    cy.getByDataCy('show-changes').should('contain', 'On');
    cy.getByDataCy('privilege-escalation').should('contain', 'On');
    cy.getByDataCy('code-block-value').should('contain', 'test: test');
    cy.getByDataCy('credentials').should('contain', 'Demo Credential');
    cy.getByDataCy('execution-environment').should('contain', 'AWX EE (latest)');
  });
});
