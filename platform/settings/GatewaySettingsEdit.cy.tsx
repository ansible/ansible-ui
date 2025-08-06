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
      cy.contains('This field must match login redirect override.').should('be.visible');
    });
    cy.get('input[data-cy="confirm-login-redirect-override"]')
      .clear()
      .type('https://www.ansible.com');
    cy.clickButton('Save platform gateway settings');
    cy.getByDataCy('confirm-login-redirect-override-form-group').within(() => {
      cy.get('span.pf-v6-c-helper-text__item-text').should('not.exist');
    });
  });
  it('Should have a CSRF trusted origins field', () => {
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

    // Should have CSRF trusted origins section
    cy.contains('CSRF trusted origins list').should('be.visible');

    // Should have one initial input field
    cy.get('input[data-cy="link-url-0"]').should('exist');

    // Should have add button
    cy.get('button[aria-label="Add CSRF trusted origin"]').should('be.visible');

    // Should have remove button (disabled for single field)
    cy.get('button[aria-label="Remove trusted origin"]').should('be.visible').and('be.disabled');
  });

  it('Should add an input for each CSRF trusted origin', () => {
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

    // Start with one field
    cy.get('input[data-cy="link-url-0"]').should('exist').type('https://www.trusted.com');
    cy.get('input[data-cy="link-url-1"]').should('not.exist');

    // Add second field
    cy.get('button[data-cy="add-trusted-origin-0"]').click();
    cy.get('input[data-cy="link-url-1"]').should('exist');

    cy.get('input[placeholder="Enter trusted origin URL"]').should('have.length', 2);
  });

  it('should remove an input for each CSRF trusted origin', () => {
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

    cy.get('input[data-cy="link-url-0"]').should('exist').type('https://www.trusted.com');
    cy.get('input[data-cy="link-url-1"]').should('not.exist');
    cy.get('button[data-cy="add-trusted-origin-0"]').click();
    cy.get('input[data-cy="link-url-1"]').should('exist');

    // Remove buttons should be enabled (not disabled) when more than one field
    cy.get('button[data-cy="add-trusted-origin-0"]').should('not.be.disabled');

    // Remove the last field
    cy.get('button[data-cy="add-trusted-origin-1"]').last().click();

    // Remove another field
    cy.get('button[aria-label="Remove trusted origin"]').last().click();
    cy.get('input[placeholder="Enter trusted origin URL"]').should('have.length', 1);

    cy.get('button[aria-label="Remove trusted origin"]').should('be.disabled');
  });

  it('should validate the CSRF trusted origins', () => {
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

    // Test valid URL
    cy.get('input[data-cy="link-url-0"]').clear().type('https://example.com');
    cy.get('input[data-cy="link-url-0"]').blur();
    cy.clickButton('Save platform gateway settings');
    cy.get('input[data-cy="link-url-0"]')
      .parent()
      .within(() => {
        cy.get('.pf-v6-c-helper-text__item--error').should('not.exist');
      });

    // Test invalid URL with trailing slash
    cy.get('input[data-cy="link-url-0"]').clear().type('https://example.com/');
    cy.get('input[data-cy="link-url-0"]').blur();
    cy.get('input[data-cy="link-url-0"]')
      .parent()
      .parent()
      .within(() => {
        cy.contains(
          'Trusted origins must be http protocol and host name only: https://example.com/'
        ).should('be.visible');
      });

    // Test invalid URL format
    cy.get('input[data-cy="link-url-0"]').clear().type('not-a-url');
    cy.get('input[data-cy="link-url-0"]').blur();
    cy.get('input[data-cy="link-url-0"]')
      .parent()
      .parent()
      .within(() => {
        cy.contains('Invalid URL format - please check the URL syntax').should('be.visible');
      });

    // Test empty URL (should be valid since it's optional)
    cy.get('input[data-cy="link-url-0"]').clear().blur();
    cy.get('input[data-cy="link-url-0"]')
      .parent()
      .within(() => {
        cy.get('.pf-v6-c-helper-text__item--error').should('not.exist');
      });
  });
});
