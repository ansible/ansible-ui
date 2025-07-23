import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { Credential } from '@ansible/awx-ui/interfaces/Credential';
import { CredentialType } from '@ansible/awx-ui/interfaces/CredentialType';
import { Organization } from '@ansible/awx-ui/interfaces/Organization';
import { awxAPI } from '../../../../support/formatApiPathForAwx';

describe('Credential Types', () => {
  let credType1: CredentialType;
  let credTypeApple: CredentialType;
  let credTypeBanana: CredentialType;
  let credTypeOrange: CredentialType;
  let inputCredType: string;
  let injectorCredType: string;
  let credential: Credential;
  let awxOrganization: Organization;
  const credentialName = 'E2E Custom Credential ' + randomString(4);

  before(function () {
    cy.createAwxOrganization().then((org) => {
      awxOrganization = org;
    });
  });

  beforeEach(function () {
    cy.createAwxCredentialType().then((credentialType: CredentialType) => {
      credType1 = credentialType;
      cy.createAWXCredential(
        {
          name: credentialName,
          kind: 'gce',
          organization: awxOrganization.id,
        },
        credType1.name
      ).then((cred) => {
        credential = cred;
      });
    });
    cy.fixture('credTypes-input-config').then((credentialType: CredentialType) => {
      inputCredType = JSON.stringify(credentialType);
    });
    cy.fixture('credTypes-injector-config').then((credentialType: CredentialType) => {
      injectorCredType = JSON.stringify(credentialType);
    });
  });

  afterEach(() => {
    cy.deleteAwxCredential(credential, { failOnStatusCode: false });
    cy.deleteAwxCredentialType(credType1, { failOnStatusCode: false });
  });

  after(() => {
    cy.deleteAwxOrganization(awxOrganization, { failOnStatusCode: false });
  });

  describe('Credential Types- List Actions', () => {
    it('can navigate to the details page, then to the credentials tab and view a related credential', function () {
      cy.navigateTo('awx', 'credential-types');
      cy.verifyPageTitle('Credential Types');
      cy.filterTableBySearch(credType1.name);
      cy.clickTableRowLink('name', credType1.name, { disableFilter: true });
      cy.url().then((currentUrl) => {
        expect(currentUrl.includes('details')).to.be.true;
        cy.verifyPageTitle(credType1.name).should('be.visible');
      });
      cy.intercept(
        'GET',
        awxAPI`/credential_types/${credType1.id.toString()}/credentials/?order_by=name&page=1&page_size=10`
      ).as('credentialsList');
      cy.intercept('GET', awxAPI`/credential_types/?page=1&page_size=200`).as('credTypeList');
      cy.clickTab('Credentials', true);
      cy.wait('@credTypeList');
      cy.wait('@credentialsList');
      cy.getBy('tr').should('have.length', 2);
      cy.getByDataCy(`row-id-${credential.id}`).should('contain', credential.name);
      cy.contains(credential.name).click();
      cy.verifyPageTitle(credential.name);
      cy.getByDataCy('credential-type').should('be.visible').and('contain', credType1.name);
    });

    it('can filter credential types by name', () => {
      cy.navigateTo('awx', 'credential-types');
      cy.filterTableBySearch(credType1.name);
      cy.get('tr').should('have.length', 2);
      cy.contains(credType1.name).should('be.visible');
      cy.clearAllFilters();
    });

    it('can filter credential types by description', () => {
      cy.navigateTo('awx', 'credential-types');
      cy.filterTableBySearch(credType1.description);
      cy.get('tr').should('have.length.greaterThan', 0);
      cy.contains(credType1.description).should('be.visible');
      cy.clearAllFilters();
    });

    it('can filter credential types by Created By', () => {
      cy.navigateTo('awx', 'credential-types');
      cy.filterTableByTextFilter('created-by', 'awx');
      cy.get('tr').should('have.length.greaterThan', 0);
      cy.clearAllFilters();
    });

    it('can filter credential types by Modified By', () => {
      cy.navigateTo('awx', 'credential-types');
      cy.filterTableByTextFilter('modified-by', 'awx');
      cy.get('tr').should('have.length.greaterThan', 0);
      cy.clearAllFilters();
    });

    it('checks that editing a custom credential type which is being used by a credential and trying to add input/injector configs is not allowed ', () => {
      cy.navigateTo('awx', 'credential-types');
      cy.filterTableBySearch(credType1.name);
      cy.getByDataCy('edit-credential-type').click();
      cy.verifyPageTitle(`Edit ${credType1.name}`);
      cy.url().should('contain', `/credential-types/${credType1.id}/edit`);
      cy.getBy('[class*="view-lines monaco-mouse-cursor-text"]')
        .eq(0)
        .type(inputCredType, { parseSpecialCharSequences: false });
      cy.getByDataCy('Submit').click();
      cy.contains(
        'Modifications to inputs are not allowed for credential types that are in use'
      ).should('be.visible');
    });
  });

  describe('Credential Types: Create Actions', () => {
    const credTypeNameA = 'E2E Custom Credential Type' + randomString(4);
    const credTypeNameB = 'E2E Custom Credential Type' + randomString(4);
    const credTypeNameC = 'E2E Custom Credential Type' + randomString(4);
    it('can create a new credential type with no configs', () => {
      cy.createAndDeleteCustomAWXCredentialTypeUI(credTypeNameA);
      cy.verifyPageTitle('Credential Types');
    });

    it('creates a custom credential type with input and injector configurations in JSON format in the Monaco editor', () => {
      cy.createAndDeleteCustomAWXCredentialTypeUI(
        credTypeNameB,
        inputCredType,
        injectorCredType,
        'json'
      );
      cy.verifyPageTitle('Credential Types');
    });

    it('creates a custom credential type with input and injector configurations in YAML format in the Monaco editor', () => {
      cy.createAndDeleteCustomAWXCredentialTypeUI(credTypeNameC, inputCredType, injectorCredType);
      cy.verifyPageTitle('Credential Types');
    });
  });

  describe('Credential Types: Edit and Delete Actions', () => {
    it('checks that deleting a custom credential type which is being used by a credential is not allowed', () => {
      cy.navigateTo('awx', 'credential-types');
      cy.filterTableBySearch('Google Compute Engine');
      cy.selectTableRowByCheckbox('name', 'Google Compute Engine', { disableFilter: true });
      cy.clickToolbarKebabAction('delete-credential-types');
      cy.getModal().within(() => {
        cy.getByDataCy('alert-toaster')
          .should('be.visible')
          .and(
            'contain',
            '1 of the selected credential types cannot be deleted because it is read-only.'
          );
        cy.getBy(
          '[data-ouia-component-id="Permanently delete credential types-ModalBoxCloseButton"]'
        ).click();
      });
    });

    it('edit a credential type from the list row action and delete it using the list kebab menu', () => {
      cy.createAwxCredentialType().then((credentialType) => {
        credTypeOrange = credentialType;
        cy.navigateTo('awx', 'credential-types');
        const editedCredentialTypeName = (credTypeOrange.name ?? '') + ' edited';
        cy.filterTableBySearch(credTypeOrange.name);
        cy.clickTableRowPinnedAction(credTypeOrange.name, 'edit-credential-type', false);
        cy.verifyPageTitle(`Edit ${credTypeOrange.name}`);
        cy.url().then((currentUrl) => {
          expect(currentUrl.includes('edit')).to.be.true;
        });
        cy.get('[data-cy="name"]').clear().type(editedCredentialTypeName);
        cy.get('[data-cy="description"]').clear().type('this is a new description after editing');
        cy.intercept('PATCH', awxAPI`/credential_types/${credTypeOrange.id.toString()}/`).as(
          'editCredType'
        );
        cy.clickButton(/^Save credential type$/);
        cy.wait('@editCredType')
          .its('response.body.name')
          .then((name: string) => {
            expect(editedCredentialTypeName).to.be.equal(name);
            cy.verifyPageTitle(editedCredentialTypeName);
            cy.getByDataCy('description').should(
              'contain',
              'this is a new description after editing'
            );
          });
        cy.navigateTo('awx', 'credential-types');
        cy.filterTableBySearch(editedCredentialTypeName);
        cy.clickTableRowAction('name', editedCredentialTypeName, 'delete-credential-type', {
          disableFilter: true,
          inKebab: true,
        });
        cy.get('#confirm').click();
        cy.intercept('DELETE', awxAPI`/credential_types/${credTypeOrange.id.toString()}/`).as(
          'deleteCredType'
        );
        cy.clickButton(/^Delete credential type/);
        cy.contains(/^Success$/);
        cy.wait('@deleteCredType').then((deleteCredType) => {
          expect(deleteCredType?.response?.statusCode).to.eql(204);
        });
        cy.containsBy('.pf-v6-c-empty-state__title-text', 'No results found');
        cy.verifyPageTitle('Credential Types');
      });
    });

    it('can edit and delete a credential type from the details page', () => {
      cy.createAwxCredentialType().then((credentialType) => {
        credTypeOrange = credentialType;
        cy.navigateTo('awx', 'credential-types');
        const editedCredentialTypeName = (credTypeOrange.name ?? '') + ' edited';
        cy.filterTableBySearch(credTypeOrange.name);
        cy.clickTableRowLink('name', credTypeOrange.name, { disableFilter: true });
        cy.clickButton('Edit credential type');
        cy.verifyPageTitle(`Edit ${credTypeOrange.name}`);
        cy.get('[data-cy="name"]').clear().type(editedCredentialTypeName);
        cy.get('[data-cy="description"]').clear().type('this is a new description after editing');
        cy.intercept('PATCH', awxAPI`/credential_types/${credTypeOrange.id.toString()}/`).as(
          'editCredType'
        );
        cy.clickButton(/^Save credential type$/);
        cy.wait('@editCredType')
          .its('response.body.name')
          .then((name: string) => {
            expect(editedCredentialTypeName).to.be.equal(name);
            cy.verifyPageTitle(editedCredentialTypeName);
            cy.getByDataCy('description').should(
              'contain',
              'this is a new description after editing'
            );
            cy.intercept('DELETE', awxAPI`/credential_types/${credTypeOrange.id.toString()}/`).as(
              'deleteCredType'
            );
            cy.clickPageAction('delete-credential-type');
            cy.get('#confirm').click();
            cy.clickButton(/^Delete credential type/);
            cy.wait('@deleteCredType').then((deleteCredType) => {
              expect(deleteCredType?.response?.statusCode).to.eql(204);
            });
            cy.verifyPageTitle('Credential Types');
          });
      });
    });

    it('shows a bulk deletion dialog with warnings for managed credential types', () => {
      cy.navigateTo('awx', 'credential-types');
      cy.get('input[name="check-all"]').check();
      cy.clickToolbarKebabAction('delete-credential-types');
      cy.contains(
        'of the selected credential types cannot be deleted because they are read-only.'
      ).should('be.visible');
      cy.contains('button', 'Cancel').click();
      cy.get('input[name="check-all"]').check();
      cy.reload();
    });

    it('can delete a credential type from the list row action', () => {
      cy.createAwxCredentialType().then((credentialType) => {
        credTypeApple = credentialType;
        cy.navigateTo('awx', 'credential-types');
        cy.filterTableBySearch(credTypeApple.name);
        cy.clickTableRowAction('name', credTypeApple.name, 'delete-credential-type', {
          disableFilter: true,
          inKebab: true,
        });
        cy.get('#confirm').click();
        cy.clickButton(/^Delete credential type/);
        cy.contains(/^Success$/);
        cy.clickButton(/^Clear all filters$/);
      });
    });

    it('can bulk delete custom credentials from the list page', function () {
      cy.createAwxCredentialType().then((credentialType) => {
        credTypeApple = credentialType;
        cy.createAwxCredentialType().then((credentialType) => {
          credTypeBanana = credentialType;

          cy.navigateTo('awx', 'credential-types');
          cy.selectTableRow(credTypeApple.name);
          cy.selectTableRow(credTypeBanana.name);
          cy.clickButton('Clear all filters');
          cy.clickToolbarKebabAction('delete-credential-types');
          cy.intercept('DELETE', awxAPI`/credential_types/${credTypeApple.id.toString()}/`).as(
            'deleteCredType1'
          );
          cy.intercept('DELETE', awxAPI`/credential_types/${credTypeBanana.id.toString()}/`).as(
            'deleteCredType2'
          );
          cy.clickModalConfirmCheckbox();
          cy.clickModalButton('Delete credential types');
          cy.wait(['@deleteCredType1', '@deleteCredType2']).then((credTypeArray) => {
            expect(credTypeArray[0]?.response?.statusCode).to.eql(204);
            expect(credTypeArray[1]?.response?.statusCode).to.eql(204);
          });
          cy.assertModalSuccess();
        });
      });
    });
  });
});
