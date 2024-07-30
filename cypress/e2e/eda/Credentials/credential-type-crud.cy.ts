//Tests a user's ability to create, edit, and delete a Credential in the EDA UI.
//Do we want to add create tests for all credential types now or wait until next release cycle?
import { randomString } from '../../../../framework/utils/random-string';
import { EdaCredentialCreate } from '../../../../frontend/eda/interfaces/EdaCredential';
import { edaAPI } from '../../../support/formatApiPathForEDA';

describe('EDA Credentials Type - Create, Edit, Delete', () => {
  it('can create a Credential Type', () => {
    const name = 'E2E Credential Type' + randomString(4);
    cy.navigateTo('eda', 'credential-types');
    cy.get('h1').should('contain', 'Credential Types');
    cy.clickButton(/^Create credential type$/);
    cy.get('[data-cy="name"]').type(name);
    cy.get('[data-cy="description"]').type('This is a custom Credential Type.');
    cy.get('[data-cy="inputs-form-group"]').within(() => {
      cy.get('[data-cy="toggle-json"]').click();
    });
    cy.get('[data-cy="inputs-form-group"]').type(
      `{selectAll}{del}	{{}	"fields": [{{}	"id": "username","type": "string","label": "Username"}]}`
    );
    cy.clickButton(/^Generate extra vars$/);
    cy.clickButton(/^Create credential type$/);
    cy.hasDetail('Name', name);
    cy.hasDetail('Description', 'This is a custom Credential Type.');
    cy.getEdaCredentialTypeByName(name).then((credentialtype) => {
      cy.wrap(credentialtype).should('not.be.undefined');
      if (credentialtype) {
        cy.deleteEdaCredentialType(credentialtype);
      }
    });
  });

  it('verify error message on invalid input field', () => {
    const name = 'E2E Credential Type' + randomString(4);
    cy.navigateTo('eda', 'credential-types');
    cy.get('h1').should('contain', 'Credential Types');
    cy.clickButton(/^Create credential type$/);
    cy.get('[data-cy="name"]').type(name);
    cy.get('[data-cy="description"]').type('This is a custom Credential Type.');
    cy.get('[data-cy="inputs-form-group"]').type('random');
    cy.clickButton(/^Generate extra vars$/);
    cy.clickButton(/^Create credential type$/);
    cy.contains('schema must be in dict format');
  });

  it('can edit a credential type', () => {
    cy.createEdaCredentialType().then((edaCredentialType) => {
      cy.navigateTo('eda', 'credential-types');
      cy.get('h1').should('contain', 'Credential Types');
      cy.filterTableByText(edaCredentialType.name, 'MultiText');
      cy.clickTableRow(edaCredentialType.name, false);
      cy.clickButton(/^Edit credential type$/);
      cy.verifyPageTitle(`Edit ${edaCredentialType.name}`);
      cy.get('[data-cy="name"]').type(' Extra Text');
      cy.get('[data-cy="description"]').type('this credential type has been changed');
      cy.clickButton(/^Save credential type$/);
      cy.hasDetail('Name', edaCredentialType.name + ' Extra Text');
      cy.hasDetail('Description', 'this credential type has been changed');
      cy.deleteEdaCredentialType(edaCredentialType);
    });
  });

  it('can delete a credential type', () => {
    cy.createEdaCredentialType().then((edaCredentialType) => {
      cy.navigateTo('eda', 'credential-types');
      cy.get('h1').should('contain', 'Credential Types');
      cy.filterTableByText(edaCredentialType.name, 'MultiText');
      cy.clickTableRow(edaCredentialType.name, false);
      cy.verifyPageTitle(edaCredentialType.name);
      cy.intercept('DELETE', edaAPI`/credential-types/${edaCredentialType.id.toString()}/`).as(
        'deleted'
      );
      cy.clickPageAction('delete-credential-type');
      cy.clickModalConfirmCheckbox();
      cy.clickModalButton('Delete credential type');
      cy.wait('@deleted').then((deleted) => {
        expect(deleted?.response?.statusCode).to.eql(204);
      });
    });
  });

  it('cannot delete a credential type if already in use', () => {
    cy.createEdaCredentialType().then((credtype) => {
      cy.requestPost<EdaCredentialCreate>(edaAPI`/eda-credentials/`, {
        name: 'E2E Credential ' + randomString(4),
        credential_type_id: credtype.id,
        description: 'This is a Credential with custom credential type',
        inputs: {
          username: 'test_username',
        },
      }).then((cred) => {
        cy.navigateTo('eda', 'credential-types');
        cy.get('h1').should('contain', 'Credential Types');
        cy.filterTableByText(credtype.name, 'MultiText');
        cy.clickTableRow(credtype.name, false);
        cy.verifyPageTitle(credtype.name);
        cy.intercept('DELETE', edaAPI`/credential-types/${credtype.id.toString()}/`).as('deleted');
        cy.clickPageAction('delete-credential-type');
        cy.clickModalConfirmCheckbox();
        cy.clickModalButton('Delete credential type');
        cy.wait('@deleted').then((deleted) => {
          expect(deleted?.response?.statusCode).to.eql(409);
          cy.clickModalButton('Close');
        });
        cy.getEdaCredentialByName(cred.name).then((credential) => {
          cy.wrap(credential).should('not.be.undefined');
          if (credential) {
            cy.deleteEdaCredential(credential).then(() => {
              cy.deleteEdaCredentialType(credtype);
            });
            cy.navigateTo('eda', 'credential-types');
          }
        });
        cy.deleteEdaCredentialType(credtype);
      });
    });
  });

  it('cannot edit a credential type if already in use', () => {
    cy.createEdaCredentialType().then((credtype) => {
      cy.requestPost<EdaCredentialCreate>(edaAPI`/eda-credentials/`, {
        name: 'E2E Credential ' + randomString(4),
        credential_type_id: credtype.id,
        description: 'This is a Credential with custom credential type',
        inputs: {
          username: 'test_username',
        },
      }).then((cred) => {
        cy.navigateTo('eda', 'credential-types');
        cy.get('h1').should('contain', 'Credential Types');
        cy.filterTableByText(credtype.name, 'MultiText');
        cy.clickTableRow(credtype.name, false);
        cy.verifyPageTitle(credtype.name);
        cy.intercept('PATCH', edaAPI`/credential-types/${credtype.id.toString()}/`).as('edit');
        cy.clickButton(/^Edit credential type$/);
        cy.get('[data-cy="name"]').type(' Extra Text');
        cy.get('[data-cy="description"]').type('this credential type has been changed');
        cy.clickButton(/^Save credential type$/);
        cy.wait('@edit').then((edit) => {
          expect(edit?.response?.statusCode).to.eql(400);
          cy.clickButton('Cancel');
        });
        cy.getEdaCredentialByName(cred.name).then((credential) => {
          cy.wrap(credential).should('not.be.undefined');
          if (credential) {
            cy.deleteEdaCredential(credential).then(() => {
              cy.deleteEdaCredentialType(credtype);
            });
          }
        });
        cy.deleteEdaCredentialType(credtype);
      });
    });
  });

  it('can bulk delete credential types', () => {
    cy.createEdaCredentialType().then((credtype) => {
      cy.navigateTo('eda', 'credential-types');
      cy.get('h1').should('contain', 'Credential Types');
      cy.filterTableByText(credtype.name, 'MultiText');
      cy.selectTableRow(credtype.name, false);
      cy.clickToolbarKebabAction('delete-credential-types');
      cy.intercept('DELETE', edaAPI`/credential-types/${credtype.id.toString()}/`).as('credtype');
      cy.clickModalConfirmCheckbox();
      cy.clickModalButton('Delete credential type');
      cy.wait('@credtype').then((credtyperesponse) => {
        expect(credtyperesponse?.response?.statusCode).to.eql(204);
      });
      cy.assertModalSuccess();
      cy.clickButton(/^Close$/);
    });
  });
});

describe('EDA Credentials Type - Input Configuration', () => {
  it('verify error message on invalid input field', () => {
    const name = 'E2E Credential Type' + randomString(4);
    cy.navigateTo('eda', 'credential-types');
    cy.get('h1').should('contain', 'Credential Types');
    cy.clickButton(/^Create credential type$/);
    cy.get('[data-cy="name"]').type(name);
    cy.get('[data-cy="description"]').type('This is a custom Credential Type.');
    cy.get('[data-cy="inputs-form-group"]').type('random');
    cy.clickButton(/^Generate extra vars$/);
    cy.clickButton(/^Create credential type$/);
    cy.contains('schema must be in dict format');
  });

  it('verify boolean field can show up as checkbox', () => {
    const name = 'E2E Credential Type' + randomString(4);
    cy.navigateTo('eda', 'credential-types');
    cy.get('h1').should('contain', 'Credential Types');
    cy.clickButton(/^Create credential type$/);
    cy.get('[data-cy="name"]').type(name);
    cy.get('[data-cy="description"]').type('This is a custom Credential Type.');
    cy.get('[data-cy="inputs-form-group"]').within(() => {
      cy.get('[data-cy="toggle-json"]').click();
    });
    cy.get('[data-cy="inputs-form-group"]').type(
      `{selectAll}{del}	{{}	"fields": [{{}	"id": "checkbox","type": "boolean","label": "Checkbox"}]}`
    );
    cy.clickButton(/^Generate extra vars$/);
    cy.clickButton(/^Create credential type$/);
    cy.hasDetail('Name', name);
    cy.navigateTo('eda', 'credentials');
    cy.get('h1').should('contain', 'Credentials');
    cy.clickButton(/^Create credential$/);
    cy.selectDropdownOptionByResourceName('credential-type-id', name);
    cy.get('[data-cy="inputs-checkbox"]').invoke('attr', 'type').should('eq', 'checkbox');
    cy.getEdaCredentialTypeByName(name).then((credentialtype) => {
      cy.wrap(credentialtype).should('not.be.undefined');
      if (credentialtype) {
        cy.deleteEdaCredentialType(credentialtype);
      }
    });
  });

  it('verify default value of a field shows up', () => {
    const name = 'E2E Credential Type' + randomString(4);
    cy.navigateTo('eda', 'credential-types');
    cy.get('h1').should('contain', 'Credential Types');
    cy.clickButton(/^Create credential type$/);
    cy.get('[data-cy="name"]').type(name);
    cy.get('[data-cy="description"]').type('This is a custom Credential Type.');
    cy.get('[data-cy="inputs-form-group"]').within(() => {
      cy.get('[data-cy="toggle-json"]').click();
    });
    cy.get('[data-cy="inputs-form-group"]').type(
      `{selectAll}{del}	{{}	"fields": [{{}	"id": "username","default": "default_value","type": "string","label": "username"}]}`
    );
    cy.clickButton(/^Generate extra vars$/);
    cy.clickButton(/^Create credential type$/);
    cy.hasDetail('Name', name);
    cy.navigateTo('eda', 'credentials');
    cy.get('h1').should('contain', 'Credentials');
    cy.clickButton(/^Create credential$/);
    cy.selectDropdownOptionByResourceName('credential-type-id', name);
    cy.get('input[data-cy="inputs-username"]').should('have.value', 'default_value');
    cy.getEdaCredentialTypeByName(name).then((credentialtype) => {
      cy.wrap(credentialtype).should('not.be.undefined');
      if (credentialtype) {
        cy.deleteEdaCredentialType(credentialtype);
      }
    });
  });

  it('verify cannot create credential without required field', () => {
    const name = 'E2E Credential Type' + randomString(4);
    cy.navigateTo('eda', 'credential-types');
    cy.get('h1').should('contain', 'Credential Types');
    cy.clickButton(/^Create credential type$/);
    cy.get('[data-cy="name"]').type(name);
    cy.get('[data-cy="description"]').type('This is a custom Credential Type.');
    cy.get('[data-cy="inputs-form-group"]').within(() => {
      cy.get('[data-cy="toggle-json"]').click();
    });
    cy.get('[data-cy="inputs-form-group"]').type(
      `{selectAll}{del}	{{}	"fields": [{{}	"id": "username","type": "string","label": "username"}],"required":["username"]}`
    );
    cy.clickButton(/^Generate extra vars$/);
    cy.clickButton(/^Create credential type$/);
    cy.hasDetail('Name', name);
    cy.navigateTo('eda', 'credentials');
    cy.get('h1').should('contain', 'Credentials');
    cy.clickButton(/^Create credential$/);
    cy.get('[data-cy="name"]').type(name);
    cy.selectDropdownOptionByResourceName('credential-type-id', name);
    cy.clickButton(/^Create credential$/);
    cy.contains('Username is required.');
    cy.getEdaCredentialTypeByName(name).then((credentialtype) => {
      cy.wrap(credentialtype).should('not.be.undefined');
      if (credentialtype) {
        cy.deleteEdaCredentialType(credentialtype);
      }
    });
  });
});
