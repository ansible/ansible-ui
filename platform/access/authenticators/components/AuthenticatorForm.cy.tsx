import { AuthenticatorForm } from './AuthenticatorForm';
import plugins from '../../../../cypress/fixtures/platformAuthenticatorPlugins.json';
import { AuthenticatorPlugins } from '../../../interfaces/AuthenticatorPlugin';

describe('AuthenticatorForm', () => {
  const voidFn = async () => {};
  it('should render form wizard', () => {
    cy.mount(<AuthenticatorForm plugins={plugins as AuthenticatorPlugins} handleSubmit={voidFn} />);
    cy.selectDropdownOptionByResourceName('authentication-type-select', 'Local');
    cy.clickButton('Next');
    cy.contains(`Name`).should('be.visible');
  });

  it('should skip type step when editing', () => {
    const handleSubmit = async () => {};

    cy.mount(<AuthenticatorForm plugins={plugins as AuthenticatorPlugins} handleSubmit={voidFn} />);
    cy.selectDropdownOptionByResourceName('authentication-type-select', 'Local');
    cy.clickButton('Next');
    cy.contains(`Name`).should('be.visible');
  });

  it('should display schema fields', () => {
    const handleSubmit = async () => {};

    cy.mount(<AuthenticatorForm plugins={plugins as AuthenticatorPlugins} handleSubmit={voidFn} />);
    cy.selectDropdownOptionByResourceName('authentication-type-select', 'LDAP');

    // cy.get('').within(() => {

    // })
    cy.get('[data-cy="name"]').should('have.text', '');
  });
});
