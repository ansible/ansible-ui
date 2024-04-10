import { randomString } from '../../../../framework/utils/random-string';
import { CredentialType } from '../../../../frontend/awx/interfaces/CredentialType';

describe('Credential Types', () => {
  let credentialType: CredentialType;
  let inputCredType: string;
  let injectorCredType: string;

  before(() => {
    cy.awxLogin();

    cy.createAwxCredentialType().then((credType: CredentialType) => {
      credentialType = credType;
    });

    cy.fixture('credTypes-input-config').then((credentialType: CredentialType) => {
      inputCredType = JSON.stringify(credentialType);
    });

    cy.fixture('credTypes-injector-config').then((credentialType: CredentialType) => {
      injectorCredType = JSON.stringify(credentialType);
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
    cy.get('span.pf-v5-c-label__text').should('contain', 'Read-only').and('not.have.length', 0);
  });

  it('navigate to the details page for a credential type', () => {
    cy.navigateTo('awx', 'credential-types');
    cy.filterTableByMultiSelect('name', [credentialType.name]);
    cy.clickTableRowLink('name', credentialType.name, { disableFilter: true });
    cy.url().then((currentUrl) => {
      expect(currentUrl.includes('details')).to.be.true;
      cy.verifyPageTitle(credentialType.name).should('be.visible');
    });
  });

  it('Filter credential types by name', () => {
    cy.navigateTo('awx', 'credential-types');
    cy.filterTableByMultiSelect('name', [credentialType.name]);
    cy.get('tr').should('have.length.greaterThan', 0);
    cy.contains(credentialType.name).should('be.visible');
    cy.clearAllFilters();
  });

  it('Filter credential types by description', () => {
    cy.navigateTo('awx', 'credential-types');
    cy.filterTableByTextFilter('description', credentialType.description);
    cy.get('tr').should('have.length.greaterThan', 0);
    cy.contains(credentialType.description).should('be.visible');
    cy.clearAllFilters();
  });

  it('Filter credential types by Created By', () => {
    cy.navigateTo('awx', 'credential-types');
    cy.filterTableByTextFilter('created-by', 'awx');
    cy.get('tr').should('have.length.greaterThan', 0);
    cy.clearAllFilters();
  });

  it('Filter credential types by Modified By', () => {
    cy.navigateTo('awx', 'credential-types');
    cy.filterTableByTextFilter('modified-by', 'awx');
    cy.get('tr').should('have.length.greaterThan', 0);
    cy.clearAllFilters();
  });

  it('create a new credential type with no configs', () => {
    const customCredentialTypeName = 'E2E Custom Credential Type' + randomString(4);
    cy.createAndDeleteCustomAWXCredentialTypeUI(customCredentialTypeName);
    cy.verifyPageTitle('Credential Types');
  });

  it('creates a custom credential type with input and injector configurations in JSON format in the Monaco editor', () => {
    const customCredentialTypeName = 'E2E Custom Credential Type' + randomString(4);
    cy.createAndDeleteCustomAWXCredentialTypeUI(
      customCredentialTypeName,
      inputCredType,
      injectorCredType,
      'json'
    );
    cy.verifyPageTitle('Credential Types');
  });

  it('creates a custom credential type with input and injector configurations in YAML format in the Monaco editor', () => {
    const customCredentialTypeName = 'E2E Custom Credential Type' + randomString(4);
    cy.createAndDeleteCustomAWXCredentialTypeUI(
      customCredentialTypeName,
      inputCredType,
      injectorCredType
    );
    cy.verifyPageTitle('Credential Types');
  });

  it('edit a credential type from the list row action and delete it using the list kebab menu', () => {
    cy.createAwxCredentialType().then((credType: CredentialType) => {
      cy.navigateTo('awx', 'credential-types');
      const newCredentialTypeName = (credType.name ?? '') + ' edited';
      cy.filterTableByMultiSelect('name', [credType.name]);
      cy.clickTableRowPinnedAction(credType.name, 'edit-credential-type', false);
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
      cy.filterTableByMultiSelect('name', [newCredentialTypeName]);
      cy.clickTableRowKebabAction(`${newCredentialTypeName}`, 'delete-credential-type', false);
      cy.get('#confirm').click();
      cy.intercept('DELETE', `api/v2/credential_types/${credType.id}/`).as('deleteCredType');
      cy.clickButton(/^Delete credential type/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.wait('@deleteCredType').then((deleteCredType) => {
        expect(deleteCredType?.response?.statusCode).to.eql(204);
      });
      cy.containsBy('.pf-v5-c-empty-state__title-text', 'No results found');
      cy.verifyPageTitle('Credential Types');
    });
  });

  it('edit and delete a credential type from the details page', () => {
    cy.createAwxCredentialType().then((credType: CredentialType) => {
      cy.navigateTo('awx', 'credential-types');
      const newCredentialTypeName = (credType.name ?? '') + ' edited';
      cy.filterTableByMultiSelect('name', [credType.name]);
      cy.clickTableRowLink('name', credType.name, { disableFilter: true });
      cy.clickButton('Edit credential type');
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
      cy.clickPageAction('delete-credential-type');
      cy.get('#confirm').click();
      cy.clickButton(/^Delete credential type/);
      cy.wait('@deleteCredType').then((deleteCredType) => {
        expect(deleteCredType?.response?.statusCode).to.eql(204);
      });
      cy.verifyPageTitle('Credential Types');
    });
  });

  it('bulk deletion dialog shows warnings for managed credential types', () => {
    cy.navigateTo('awx', 'credential-types');
    cy.get('#select-all').click();
    cy.clickToolbarKebabAction('delete-selected-credential-types');
    cy.contains(
      'of the selected credential types cannot be deleted because they are read-only.'
    ).should('be.visible');
    cy.contains('button', 'Cancel').click();
    cy.get('input[data-cy=select-all]').click();
    cy.reload();
  });

  it('delete a credential type from the list row action', () => {
    cy.createAwxCredentialType().then((credType: CredentialType) => {
      cy.navigateTo('awx', 'credential-types');
      cy.filterTableByMultiSelect('name', [credType.name]);
      cy.clickTableRowKebabAction(credType.name, 'delete-credential-type', false);
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
        cy.filterTableByMultiSelect('name', [credType1.name, credType2.name]);
        cy.selectTableRow(credType1.name, false);
        cy.selectTableRow(credType2.name, false);
        cy.clickToolbarKebabAction('delete-selected-credential-types');
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

  it.skip('checks that deleting a custom credential type which is being used by a credential is not allowed', () => {
    //Error received from API - "Credential types that are in use cannot be deleted"
  });

  it.skip('checks that editing a custom credential type which is being used by a credential and trying to add input/injector configs is not allowed ', () => {
    //Error received from API - "Modifications to inputs are not allowed  for credential types that are in use"
  });
});
