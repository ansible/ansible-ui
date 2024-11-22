import { gatewayAPI } from '../utils/gateway-api-utils';
import { GatewaySettingsDetails } from './GatewaySettingsDetails';
import platformSettings from '../../cypress/fixtures/PlatformSettings.json';
import platformSettingsOptions from '../../cypress/fixtures/PlatformSettingsOptions.json';
import { RenderRouteWithOutletContext } from '../../cypress/support/componentUtils';

describe('Gateway Settings Details', () => {
  it('Should render correct information', () => {
    cy.intercept(
      { method: 'GET', url: gatewayAPI`/settings/all` },
      { fixture: 'PlatformSettings.json' }
    ).as('getSettings');
    cy.intercept(
      { method: 'OPTIONS', url: gatewayAPI`/settings/all` },
      { fixture: 'PlatformSettingsOptions.json' }
    ).as('getOptions');

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
        <GatewaySettingsDetails categoryId="platform" />
      </RenderRouteWithOutletContext>
    );
    cy.verifyPageTitle('Platform gateway settings');
    cy.get('dd[data-cy="login-redirect-override"]').should('contain', 'https://www.google.com');
  });
});
