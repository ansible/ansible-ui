import plugins from '../../../../cypress/fixtures/platformAuthenticatorPlugins.json';
import authenticators from '../../../../cypress/fixtures/platformAuthenticators.json';
import { gatewayAPI } from '../../../api/gateway-api-utils';
import { Authenticator } from '../../../interfaces/Authenticator';
import { AuthenticatorPlugins } from '../../../interfaces/AuthenticatorPlugin';
import { AuthenticatorForm } from './AuthenticatorForm';

describe('AuthenticatorForm', () => {
  const voidFn = async () => {};
  beforeEach(() => {
    cy.intercept(
      {
        method: 'POST',
        url: gatewayAPI`/authenticators/?validate=True`,
      },
      {
        detail: 'Request would have been accepted',
      }
    );
  });

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
      cy.get('textarea').should('have.value', 'OPT_REFERRALS: 0\nOPT_NETWORK_TIMEOUT: 30');
    });
    cy.getByDataCy('configuration-editor-GROUP_TYPE_PARAMS').within(() => {
      cy.get('textarea').should('have.value', 'name_attr: cn\nmember_attr: member');
    });
    cy.getByDataCy('configuration-editor-GROUP_SEARCH').within(() => {
      cy.get('textarea').should(
        'have.value',
        '- ou=groups,dc=example,dc=org\n- SCOPE_SUBTREE\n- (objectClass=groupOfNames)'
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

  it.skip('should submit form data', () => {
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
      expect(handleSubmit).to.be.called;
      const args = handleSubmit.args[0];
      const data = (args[0] || {}) as { [key: string]: string | object[] };
      expect(data.name).to.equal('Local authenticator');
      expect(data.type).to.equal('ansible_base.authenticator_plugins.local');
      const map = data.mappings[0] as { [key: string]: string | boolean };
      expect(map).to.deep.equal({
        name: 'Map name',
        map_type: 'allow',
        trigger: 'always',
        conditional: 'or',
        revoke: false,
      });
    });
  });
});
