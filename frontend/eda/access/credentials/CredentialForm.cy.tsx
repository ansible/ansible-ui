import { edaAPI } from '../../common/eda-utils';
import { CreateCredential } from './CredentialForm';

describe('Create credential ', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: edaAPI`/organizations/*` },
      {
        fixture: 'edaOrganizations.json',
      }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/credential-types/*` },
      {
        fixture: 'edaCredentialTypes.json',
      }
    );
  });

  it('Create Credential - Displays error message on internal server error', () => {
    cy.mount(<CreateCredential />);
    cy.get('[data-cy="name"]').type('Test');
  });

  it('Component renders', () => {
    cy.mount(<CreateCredential />);
    cy.verifyPageTitle('Create Credential');
  });

  it('Validates properly', () => {
    cy.mount(<CreateCredential />);
    cy.clickButton(/^Create credential$/);
    ['Name', 'Credential type'].map((field) =>
      cy.contains(`${field} is required.`).should('be.visible')
    );
  });

  it('Should update fields properly', () => {
    cy.mount(<CreateCredential />);
    cy.get('[data-cy="name"]').type('Test');
    cy.selectDropdownOptionByResourceName('credential-type-id', 'Source Control');
    cy.get('[data-cy="organization_id"]').click();
    cy.get('#organization-2 > .pf-v5-c-menu__item-main > .pf-v5-c-menu__item-text').click();
    cy.get('[id="inputs-ssh-key-data-browse-button"]').should('be.visible');
    cy.clickButton('Create credential');

    cy.intercept('POST', edaAPI`/eda-credentials/`, (req) => {
      expect(req.body).to.contain({
        name: 'Test',
        credential_type_id: 1,
        inputs: { username: '', password: '', ssh_key_data: '', ssh_key_unlock: '' },
      });
    });
  });
});
