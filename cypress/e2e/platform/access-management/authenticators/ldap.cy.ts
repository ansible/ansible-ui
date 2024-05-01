import { randomE2Ename } from '../../../../support/utils';
import { Ldap } from '../../../../../platform/interfaces/LdapAuthenticator';

describe('LDAP Authentication form - create, edit, update and delete', () => {
  it('creates an LDAP authenticator', () => {
    const ldapAuthenticator = randomE2Ename();
    cy.platformLogin();

    cy.fixture('platform-authenticators/ldap').then((ldapData: Ldap) => {
      const { CONNECTION_OPTIONS, GROUP_TYPE_PARAMS, GROUP_SEARCH, USER_ATTR_MAP, USER_SEARCH } =
        ldapData;

      // This function converts an object into a JSON string

      const toJson = (obj: object) => JSON.stringify(obj);

      // Convert each object into a JSON string
      const CONNECTION_OPTIONS_Json = toJson(CONNECTION_OPTIONS);
      const GROUP_TYPE_PARAMS_Json = toJson(GROUP_TYPE_PARAMS);
      const GROUP_SEARCH_Json = toJson(GROUP_SEARCH);
      const USER_ATTR_MAP_Json = toJson(USER_ATTR_MAP);
      const USER_SEARCH_Json = toJson(USER_SEARCH);

      // Authentication List Page
      cy.navigateTo('platform', 'authenticators');
      // creates a new LDAP authenticator
      cy.verifyPageTitle('Authentication Methods');

      // Click on the Create Authentication button
      cy.containsBy('a', 'Create authentication').click();

      // Authentication Wizard - Authentication Type Step
      cy.verifyPageTitle('Create Authentication');
      cy.selectAuthenticationType('ldap');
      cy.clickButton('Next');

      // Authentication Wizard - Authentication Details Step
      cy.get('[data-cy="name"]').type(ldapAuthenticator);
      cy.get('[data-cy="configuration-input-SERVER_URI"]').type(ldapData.SERVER_URI[0]);
      cy.get('[data-cy="configuration-input-BIND_DN"]').type(ldapData.BIND_DN);
      cy.get('[data-cy="configuration-input-BIND_PASSWORD"]').type(ldapData.BIND_PASSWORD);
      cy.selectResourceFromDropDown(ldapData.GROUP_TYPE.toLowerCase());
      cy.get('[data-cy="configuration-input-USER_DN_TEMPLATE"]').type(ldapData.USER_DN_TEMPLATE);

      function setEditorContent(editorId: string, jsonData: string) {
        cy.dataEditorSetFormat(`configuration-editor-${editorId}`);
        cy.get(`[data-cy="configuration-editor-${editorId}"]`)
          .find('textarea:not(:disabled)')
          .focus()
          .clear()
          .type('{selectAll}{backspace}')
          .type(jsonData, {
            delay: 0,
            parseSpecialCharSequences: false,
          })
          .type('{esc}');
      }

      setEditorContent('CONNECTION_OPTIONS', CONNECTION_OPTIONS_Json);
      setEditorContent('GROUP_TYPE_PARAMS', GROUP_TYPE_PARAMS_Json);
      setEditorContent('GROUP_SEARCH', GROUP_SEARCH_Json);
      setEditorContent('USER_ATTR_MAP', USER_ATTR_MAP_Json);
      setEditorContent('USER_SEARCH', USER_SEARCH_Json);
      cy.clickButton('Next');
      cy.clickButton('Next');
      cy.clickButton('Finish');

      //Authentication Details Page
      cy.verifyPageTitle(ldapAuthenticator);
      // Authentication List Page
      cy.navigateTo('platform', 'authenticators');

      // Enables the LDAP authenticator
      cy.getTableRow('name', ldapAuthenticator).within(() => {
        cy.get('[data-cy=toggle-switch]').click();
      });

      // Authentication List Page
      cy.navigateTo('platform', 'authenticators');
      cy.verifyPageTitle('Authentication');

      // Edit the LDAP authenticator
      cy.clickTableRowAction('name', ldapAuthenticator, 'edit-authenticator');

      // Authentication Wizard
      cy.get('[data-cy="name"]')
        .clear()
        .type(ldapAuthenticator + '_edited');
      cy.clickButton('Next');
      cy.clickButton('Next');
      cy.clickButton('Finish');

      // Authentication Details Page
      // Verify the edited LDAP authenticator
      cy.verifyPageTitle(ldapAuthenticator + '_edited');
      cy.get('[data-cy="name"]').should('have.text', ldapAuthenticator + '_edited');

      // Authentication List Page
      cy.navigateTo('platform', 'authenticators');
      cy.verifyPageTitle('Authentication');

      // Delete the LDAP authenticator
      cy.clickTableRowAction('name', ldapAuthenticator + '_edited', 'delete-authentication', {
        inKebab: true,
      });
      cy.getModal().within(() => {
        cy.get('#confirm').click();
        cy.get('#submit').click();
        cy.contains(/^Success$/).should('be.visible');
        cy.containsBy('button', /^Close$/).click();
      });
      cy.getModal().should('not.exist');
    });
  });
});
