import { edaAPI } from '../../common/eda-utils';
import { CreateCredential, EditCredential } from './CredentialForm';

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
    cy.intercept(
      { method: 'GET', url: edaAPI`/credential-types/?name=Sample+Base+64+Binary*` },
      {
        fixture: 'edaCredentialBinaryType.json',
      }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/credential-types/?name=Source+Control*` },
      {
        fixture: 'edaCredentialType.json',
      }
    );
  });

  it('Create Credential - Displays error message on internal server error', () => {
    cy.mount(<CreateCredential />);
    cy.get('[data-cy="name"]').type('Test');
  });

  it('Component renders', () => {
    cy.mount(<CreateCredential />);
    cy.verifyPageTitle('Create credential');
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
    cy.getBy('[data-cy="credential_type_id"]').click();
    cy.clickButton('Browse');
    cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
      cy.get('table').should('exist');
      cy.getBy('[data-cy="text-input"] input').type('Source Control');
      cy.getBy('button[data-cy="apply-filter"]').click();
      cy.get('tbody tr input').click();
      cy.clickButton('Confirm');
    });
    cy.get('[data-cy="organization_id"]').click();
    cy.get('#organization-2 > .pf-v6-c-menu__item-main > .pf-v6-c-menu__item-text').click();
    cy.getByDataCy('inputs-ssh-key-data').within(() => {
      cy.contains('button', /^Browse/).should('be.visible');
    });
    cy.clickButton('Create credential');

    cy.intercept('POST', edaAPI`/eda-credentials/`, (req) => {
      expect(req.body).to.contain({
        name: 'Test',
        credential_type_id: 1,
        inputs: { username: '', password: '', ssh_key_data: '', ssh_key_unlock: '' },
      });
    });
  });

  it('Should create the binary file field', () => {
    cy.mount(<CreateCredential />);
    cy.get('[data-cy="name"]').type('Test');
    cy.getBy('[data-cy="credential_type_id"]').click();
    cy.clickButton('Browse');
    cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
      cy.get('table').should('exist');
      cy.getBy('[data-cy="text-input"] input').type('Sample Base 64 Binary');
      cy.getBy('button[data-cy="apply-filter"]').click();
      cy.get('tbody tr input').click();
      cy.clickButton('Confirm');
    });
    cy.get('[data-cy="organization_id"]').click();
    cy.get('#organization-2 > .pf-v6-c-menu__item-main > .pf-v6-c-menu__item-text').click();
    cy.get('#inputs-binary-file-filename').should('be.visible');
    cy.clickButton('Create credential');
    cy.intercept('POST', edaAPI`/eda-credentials/`, (req) => {
      expect(req.body).to.contain({
        name: 'Test',
        credential_type_id: 6,
        inputs: { username: '', binary_file: '' },
      });
    });
  });
});

describe('Edit Credential', () => {
  const credential = {
    name: 'Sample Credential',
    description: 'This is a sample credential',
    id: 1,
    organization: {
      id: 5,
      name: 'Organization 5',
    },
    credential_type: { id: 1, name: 'Source Control' },
  };

  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: edaAPI`/eda-credentials/*` },
      { statusCode: 200, body: credential }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/organizations/5` },
      { id: 5, name: 'Organization 5' }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/credential-types/*` },
      {
        fixture: 'edaCredentialTypes.json',
      }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/credential-types/?name=*` },
      {
        fixture: 'edaCredentialType.json',
      }
    );
  });

  it('should preload the form with current values', () => {
    cy.mount(<EditCredential />);
    cy.verifyPageTitle('Edit Sample Credential');
    cy.get('[data-cy="name"]').should('have.value', 'Sample Credential');
    cy.get('[data-cy="description"]').should('have.value', 'This is a sample credential');
    cy.getByDataCy('organization_id').should('have.text', 'Organization 5');
  });

  it('should edit credential type', () => {
    cy.mount(<EditCredential />);
    cy.get('[data-cy="name"]').should('have.value', 'Sample Credential');
    cy.get('[data-cy="name"]').clear();
    cy.get('[data-cy="name"]').type('Modified Credential');
    cy.get('[data-cy="Submit"]').clickButton(/^Save credential$/);
    cy.intercept('PATCH', edaAPI`/eda-credentials/`, (req) => {
      expect(req.body).to.contain({
        name: 'Modified Credential',
      });
    });
  });
});
