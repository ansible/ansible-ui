import { CredentialType } from '../../../../frontend/awx/interfaces/generated-from-swagger/api';

describe('Credential types', () => {
  let credentialType: CredentialType;

  before(() => {
    cy.awxLogin();

    cy.createAwxCredentialType().then((credType: CredentialType) => {
      credentialType = credType;
    });
  });

  after(() => {
    cy.deleteAwxCredentialType(credentialType);
  });

  it('render the credentials list page', () => {
    cy.navigateTo('awx', 'credential-types');
    cy.verifyPageTitle('Credential Types');
  });

  it('navigate to the details page for a credential type', () => {
    cy.navigateTo('awx', 'credential-types');
    cy.clickTableRow(credentialType.name as string);
    cy.url().then((currentUrl) => {
      expect(currentUrl.includes('details')).to.be.true;
    });
  });

  // TODO: Verification for credential type details UI

  it('create a new credential type', () => {
    cy.navigateTo('awx', 'credential-types');
    // Verify navigation to the Create Credential UI
    cy.get('a[data-cy="create-credential-type"').click();
    cy.verifyPageTitle('Create Credential Type');
    cy.url().then((currentUrl) => {
      expect(currentUrl.includes('/credential-types/create')).to.be.true;
    });
    // TODO: Verification using credential type creation form and cleanup of new credential type
  });

  it('edit a credential type from the list row action', () => {
    cy.navigateTo('awx', 'credential-types');
    // Verify navigation to the Edit Credential UI
    cy.clickTableRowPinnedAction(credentialType.name as string, 'edit-credential-type');
    cy.verifyPageTitle('Edit Credential Type');
    cy.url().then((currentUrl) => {
      expect(currentUrl.includes('edit')).to.be.true;
    });
    // TODO: Verification using credential type creation form
  });

  it('edit a credential type from the details page', () => {
    // cy.navigateTo('awx', 'credential-types');
    // cy.clickTableRow(credentialType.name);
    // TODO: Verification using edit button on details page
  });

  it('bulk deletion dialog shows warnings for managed credential types', () => {
    cy.navigateTo('awx', 'credential-types');
    cy.get('#select-all').click();
    cy.clickToolbarKebabAction(/^Delete selected credential types$/);
    cy.contains(
      'of the selected credential types cannot be deleted because they are read-only.'
    ).should('be.visible');
    cy.contains('button', 'Cancel').click();
  });

  it('delete a credential type from the list row action', () => {
    cy.createAwxCredentialType().then((credType: CredentialType) => {
      cy.navigateTo('awx', 'credential-types');
      cy.clickTableRowKebabAction(credType.name as string, /^Delete credential type$/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete credential type/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
    });
  });

  it('delete a credential type from the details page', () => {
    // cy.createAwxCredentialType().then((credType: CredentialType) => {
    //   cy.navigateTo('awx', 'credential-types');
    //   // TODO
    // });
  });
});
