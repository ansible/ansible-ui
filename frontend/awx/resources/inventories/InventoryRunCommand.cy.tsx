import { InventoryRunCommand } from './InventoryRunCommand';

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
    ).as('credentials');
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/credentials/*',
        hostname: 'localhost',
      },
      {
        fixture: 'credentials.json',
      }
    );
  });
  it('reveiw step has correct values', () => {
    cy.mount(<InventoryRunCommand />);
    cy.selectDropdownOptionByResourceName('module', 'shell');
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
    cy.getByDataCy('extra-vars-form-group').type('test: "test"');
    cy.clickButton(/^Next$/);
    cy.getByDataCy('credential-select-form-group').within(() => {
      cy.getBy('[aria-label="Options menu"]').click();
    });
    cy.selectTableRowByCheckbox('name', 'Demo Credential');
    cy.clickButton(/^Confirm$/);
    cy.clickButton(/^Next$/);
    cy.getByDataCy('module').should('contain', 'shell');
    cy.getByDataCy('arguments').should('contain', 'argument');
    cy.getByDataCy('verbosity').should('contain', '1');
    cy.getByDataCy('limit').should('contain', 'limit');
    cy.getByDataCy('forks').should('contain', '1');
    cy.getByDataCy('show-changes').should('contain', 'On');
    cy.getByDataCy('privilege-escalation').should('contain', 'On');
    cy.getByDataCy('code-block-value').should('contain', 'test: test');
    cy.getByDataCy('credentials').should('contain', 'Demo Credential');
  });
});
