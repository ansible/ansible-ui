import platformSettings from '@ansible/cypress/fixtures/PlatformSettings.json';
import platformSettingsOptions from '@ansible/cypress/fixtures/PlatformSettingsOptions.json';
import { RenderRouteWithOutletContext } from '@ansible/cypress/support/componentUtils';
import { gatewayAPI } from '../utils/gateway-api-utils';
import { GatewaySettingsEdit } from './GatewaySettingsEdit';

describe('Gateway Settings Details', () => {
  it('Should render correct information', () => {
    cy.intercept(
      { method: 'GET', url: gatewayAPI`/settings/all` },
      { fixture: 'PlatformSettings.json' }
    );
    cy.intercept(
      { method: 'OPTIONS', url: gatewayAPI`/settings/all` },
      { fixture: 'PlatformSettingsOptions.json' }
    );

    cy.mount(
      <RenderRouteWithOutletContext<{
        options: object;
        settings: object;
        refresh: () => void;
      }>
        context={{
          options: platformSettingsOptions.actions.PUT,
          settings: platformSettings.data,
          refresh: () => {},
        }}
      >
        <GatewaySettingsEdit categoryId="platform" />
      </RenderRouteWithOutletContext>
    );
    cy.verifyPageTitle('Platform gateway settings');
    cy.get('input[data-cy="login-redirect-override"]').should(
      'have.value',
      'https://www.google.com'
    );
    cy.get('input[data-cy="login-redirect-override"]').clear().type('https://www.ansible.com');
    cy.get('input[data-cy="login-redirect-override"]').should(
      'have.value',
      'https://www.ansible.com'
    );
  });
  it('Should throw validation error when Login redirect override does not match Confirm login redirect override', () => {
    cy.intercept(
      { method: 'GET', url: gatewayAPI`/settings/all` },
      { fixture: 'PlatformSettings.json' }
    );
    cy.intercept(
      { method: 'OPTIONS', url: gatewayAPI`/settings/all` },
      { fixture: 'PlatformSettingsOptions.json' }
    );

    cy.mount(
      <RenderRouteWithOutletContext<{
        options: object;
        settings: object;
        refresh: () => void;
      }>
        context={{
          options: platformSettingsOptions.actions.PUT,
          settings: platformSettings.data,
          refresh: () => {},
        }}
      >
        <GatewaySettingsEdit categoryId="platform" />
      </RenderRouteWithOutletContext>
    );
    cy.verifyPageTitle('Platform gateway settings');
    cy.get('input[data-cy="login-redirect-override"]').should(
      'have.value',
      'https://www.google.com'
    );
    cy.get('input[data-cy="confirm-login-redirect-override"]').should(
      'have.value',
      'https://www.google.com'
    );
    cy.get('input[data-cy="login-redirect-override"]').clear().type('https://www.ansible.com');
    cy.get('input[data-cy="login-redirect-override"]').should(
      'have.value',
      'https://www.ansible.com'
    );
    cy.clickButton('Save platform gateway settings');
    cy.getByDataCy('confirm-login-redirect-override-form-group').within(() => {
      cy.get('span.pf-v5-c-helper-text__item-text').should(
        'have.text',
        'This field must match login redirect override.'
      );
    });
    cy.get('input[data-cy="confirm-login-redirect-override"]')
      .clear()
      .type('https://www.ansible.com');
    cy.clickButton('Save platform gateway settings');
    cy.getByDataCy('confirm-login-redirect-override-form-group').within(() => {
      cy.get('span.pf-v5-c-helper-text__item-text').should('not.exist');
    });
  });
});
