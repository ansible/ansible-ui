import { CredentialType } from '../../../../frontend/awx/interfaces/CredentialType';
import { randomString } from '../../../../framework/utils/random-string';

describe('Credential Types', () => {
  let credentialType: CredentialType;

  before(() => {
    cy.awxLogin();

    cy.createAwxCredentialType().then((credType: CredentialType) => {
      credentialType = credType;
    });
  });

  after(() => {
    cy.deleteAwxCredentialType(credentialType, { failOnStatusCode: false });
  });

  it('render the credential types list page', () => {
    cy.navigateTo('awx', 'credential-types');
    cy.verifyPageTitle('Credential Types');
  });

  it('verify the count of managed credential types on the list page', () => {
    cy.navigateTo('awx', 'credential-types');
    cy.verifyPageTitle('Credential Types');
    cy.setTablePageSize('50');
    cy.get('span.pf-v5-c-label__content').should('have.length', 28);
  });

  it('navigate to the details page for a credential type', () => {
    cy.navigateTo('awx', 'credential-types');
    cy.clickTableRow(credentialType.name);
    cy.url().then((currentUrl) => {
      expect(currentUrl.includes('details')).to.be.true;
      cy.verifyPageTitle(credentialType.name).should('be.visible');
    });
  });

  it('create a new credential type', () => {
    const credentialTypeName = 'E2E Credential Type' + randomString(4);
    const credentialTypeDesc = 'This is a custom credential type that is not managed';
    cy.navigateTo('awx', 'credential-types');
    // Verify navigation to the Create Credential UI
    cy.get('a[data-cy="create-credential-type"').click();
    cy.verifyPageTitle('Create Credential Type');
    cy.url().then((currentUrl) => {
      expect(currentUrl.includes('/credential-types/create')).to.be.true;
    });
    cy.get('[data-cy="name"]').type(`${credentialTypeName}`);
    cy.get('[data-cy="description"]').type(`${credentialTypeDesc}`);
    cy.clickButton(/^Create credential type$/);
    cy.verifyPageTitle(credentialTypeName);
    cy.hasDetail(/^Name$/, `${credentialTypeName}`);
    cy.hasDetail(/^Description$/, `${credentialTypeDesc}`);
    cy.clickPageAction(/^Delete credential type/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete credential type/);
    cy.clickButton(/^Close/);
    // uncomment below after it is fixed
    //Assert page redirects to list page
    //cy.verifyPageTitle('Credential Types');
  });

  it('edit a credential type from the list row action and delete it using the list kebab menu', () => {
    cy.createAwxCredentialType().then((credType: CredentialType) => {
      cy.navigateTo('awx', 'credential-types');
      const newCredentialTypeName = (credType.name ?? '') + ' edited';
      cy.clickTableRowPinnedAction(credType.name, 'edit-credential-type');
      cy.verifyPageTitle('Edit Credential Type');
      cy.url().then((currentUrl) => {
        expect(currentUrl.includes('edit')).to.be.true;
      });
      cy.get('[data-cy="name"]').clear().type(newCredentialTypeName);
      cy.get('[data-cy="description"]').clear().type('this is a new description after editing');
      cy.intercept('PATCH', `api/v2/credential_types/${credType.id}/`).as('editCredType');
      cy.clickButton(/^Save credential type$/);
      cy.wait('@editCredType')
        .its('response.body.name')
        .then((name: string) => {
          expect(newCredentialTypeName).to.be.equal(name);
        });
      cy.verifyPageTitle(newCredentialTypeName);
      cy.navigateTo('awx', 'credential-types');
      cy.clickTableRowKebabAction(`${newCredentialTypeName}`, /^Delete credential type$/);
      cy.get('#confirm').click();
      cy.intercept('DELETE', `api/v2/credential_types/${credType.id}/`).as('deleteCredType');
      cy.clickButton(/^Delete credential type/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.wait('@deleteCredType').then((deleteCredType) => {
        expect(deleteCredType?.response?.statusCode).to.eql(204);
      });
      cy.clickButton(/^Clear all filters$/);
      cy.getTableRowByText(`${newCredentialTypeName}`).should('not.exist');
      cy.clickButton(/^Clear all filters$/);
      //Assert page redirects to list page
      //cy.verifyPageTitle('Credential Types');
    });
  });

  it('edit and delete a credential type from the details page', () => {
    cy.createAwxCredentialType().then((credType: CredentialType) => {
      cy.navigateTo('awx', 'credential-types');
      const newCredentialTypeName = (credType.name ?? '') + ' edited';
      cy.getTableRowByText(credType.name).should('be.visible');
      cy.get('[data-cy="edit-credential-type"]').click();
      cy.verifyPageTitle('Edit Credential Type');
      cy.get('[data-cy="name"]').clear().type(newCredentialTypeName);
      cy.get('[data-cy="description"]').clear().type('this is a new description after editing');
      cy.intercept('PATCH', `api/v2/credential_types/${credType.id}/`).as('editCredType');
      cy.clickButton(/^Save credential type$/);
      cy.wait('@editCredType')
        .its('response.body.name')
        .then((name: string) => {
          expect(newCredentialTypeName).to.be.equal(name);
        });
      cy.verifyPageTitle(newCredentialTypeName);
      cy.intercept('DELETE', `api/v2/credential_types/${credType.id}/`).as('deleteCredType');
      cy.clickPageAction(/^Delete credential type/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete credential type/);
      cy.clickButton(/^Close/);
      cy.wait('@deleteCredType').then((deleteCredType) => {
        expect(deleteCredType?.response?.statusCode).to.eql(204);
      });
      //Assert page redirects to list page
      //cy.verifyPageTitle('Credential Types');
    });
  });

  it('bulk deletion dialog shows warnings for managed credential types', () => {
    cy.navigateTo('awx', 'credential-types');
    cy.get('#select-all').click();
    cy.clickToolbarKebabAction(/^Delete selected credential types$/);
    cy.contains(
      'of the selected credential types cannot be deleted because they are read-only.'
    ).should('be.visible');
    cy.contains('button', 'Cancel').click();
    cy.get('input[data-cy=select-all]').click();
  });

  it('delete a credential type from the list row action', () => {
    cy.createAwxCredentialType().then((credType: CredentialType) => {
      cy.navigateTo('awx', 'credential-types');
      cy.clickTableRowKebabAction(credType.name, /^Delete credential type$/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete credential type/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
    });
  });

  it('should bulk delete custom credentials from the list page', function () {
    cy.createAwxCredentialType().then((credType1: CredentialType) => {
      cy.createAwxCredentialType().then((credType2: CredentialType) => {
        cy.navigateTo('awx', 'credential-types');
        cy.selectTableRow(credType1.name);
        cy.selectTableRow(credType2.name);
        cy.clickToolbarKebabAction(/^Delete selected credential types$/);
        cy.intercept('DELETE', `api/v2/credential_types/${credType1.id}/`).as('deleteCredType1');
        cy.intercept('DELETE', `api/v2/credential_types/${credType2.id}/`).as('deleteCredType2');
        cy.clickModalConfirmCheckbox();
        cy.clickModalButton('Delete credential types');
        cy.wait(['@deleteCredType1', '@deleteCredType2']).then((credTypeArray) => {
          expect(credTypeArray[0]?.response?.statusCode).to.eql(204);
          expect(credTypeArray[1]?.response?.statusCode).to.eql(204);
        });
        cy.assertModalSuccess();
        cy.clickButton(/^Close$/);
        cy.clickButton(/^Clear all filters$/);
      });
    });
  });
});
