import { AuthenticatorForm } from './AuthenticatorForm';
import plugins from '../../../../cypress/fixtures/platformAuthenticatorPlugins.json';
import authenticators from '../../../../cypress/fixtures/platformAuthenticators.json';
import { Authenticator } from '../../../interfaces/Authenticator';
import { AuthenticatorPlugins } from '../../../interfaces/AuthenticatorPlugin';

describe('AuthenticatorForm', () => {
  const voidFn = async () => {};
  it('should render form wizard', () => {
    cy.mount(<AuthenticatorForm plugins={plugins as AuthenticatorPlugins} handleSubmit={voidFn} />);
    cy.selectDropdownOptionByResourceName('authentication-type-select', 'Local');
    cy.clickButton('Next');
    cy.contains(`Name`).should('be.visible');
  });

  it('should not include type step when editing', () => {
    const ldapAuthenticator = authenticators.results[2] as unknown as Authenticator;
    cy.mount(
      <AuthenticatorForm
        plugins={plugins as AuthenticatorPlugins}
        handleSubmit={voidFn}
        authenticator={ldapAuthenticator}
        mappings={[]}
      />
    );
    cy.getByDataCy('wizard-nav-item-details').within(() => {
      cy.get('.pf-m-current').should('be.visible');
      cy.get('.pf-m-current').should('have.text', ' Authentication details');
    });
  });

  it('should display schema fields', () => {
    const ldapAuthenticator = authenticators.results[2] as unknown as Authenticator;
    cy.mount(
      <AuthenticatorForm
        plugins={plugins as AuthenticatorPlugins}
        handleSubmit={voidFn}
        authenticator={ldapAuthenticator}
        mappings={[]}
      />
    );

    cy.getByDataCy('name').should('have.value', 'Dev LDAP Container');
    cy.getByDataCy('configuration-input-SERVER_URI').should(
      'have.value',
      'ldap://host.docker.internal:389'
    );
    cy.getByDataCy('configuration-input-BIND_DN').should(
      'have.value',
      'cn=admin,dc=example,dc=org'
    );
    cy.getByDataCy('configuration-editor-CONNECTION_OPTIONS').within(() => {
      cy.get('textarea').should('have.value', '{"OPT_REFERRALS":0,"OPT_NETWORK_TIMEOUT":30}');
    });
    cy.getByDataCy('configuration-editor-GROUP_TYPE_PARAMS').within(() => {
      cy.get('textarea').should('have.value', '{"name_attr":"cn","member_attr":"member"}');
    });
    cy.getByDataCy('configuration-editor-GROUP_SEARCH').within(() => {
      cy.get('textarea').should(
        'have.value',
        '["ou=groups,dc=example,dc=org","SCOPE_SUBTREE","(objectClass=groupOfNames)"]'
      );
    });
  });

  it('should allow mapping creation', () => {
    cy.mount(<AuthenticatorForm plugins={plugins as AuthenticatorPlugins} handleSubmit={voidFn} />);
    cy.selectDropdownOptionByResourceName('authentication-type-select', 'Local');
    cy.clickButton('Next');
    cy.get('[data-cy="name"]').type('Local authenticator');
    cy.clickButton('Next');

    cy.get('#add-mapping').click();
    cy.get('[data-ouia-component-id="add-map-allow"]').click();

    cy.get('[data-cy="mappings-0-name"]').type('Map name');
  });

  it('should submit form data', () => {
    const handleSubmit = cy.spy();

    cy.mount(
      <AuthenticatorForm plugins={plugins as AuthenticatorPlugins} handleSubmit={handleSubmit} />
    );
    cy.selectDropdownOptionByResourceName('authentication-type-select', 'Local');
    cy.clickButton('Next');
    cy.get('[data-cy="name"]').type('Local authenticator');
    cy.clickButton('Next');

    cy.get('#add-mapping').click();
    cy.get('[data-ouia-component-id="add-map-allow"]').click();

    cy.get('[data-cy="mappings-0-name"]').type('Map name');
    cy.clickButton('Next');
    cy.clickButton('Next');

    cy.clickButton('Finish').then(() => {
      expect(handleSubmit).to.be.calledOnceWith({
        name: 'Local authenticator',
        type: 'ansible_base.authenticator_plugins.local',
        configuration: {
          ADDITIONAL_UNVERIFIED_ARGS: '',
        },
        mappings: [
          {
            name: 'Map name',
            map_type: 'allow',
            conditional: 'or',
            revoke: false,
            trigger: 'always',
          },
        ],
      });
    });
  });
});
