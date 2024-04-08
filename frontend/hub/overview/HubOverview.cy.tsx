import { HubContextProvider } from '../common/useHubContext';
import { HubUser } from '../interfaces/expanded/HubUser';
import { HubOverview } from './HubOverview';

describe('HubOverview', () => {
  it('"Manage view" is displayed to admins', () => {
    cy.intercept('**/_ui/v1/me/', { fixture: 'hub_admin.json' });
    cy.intercept('**/_ui/v1/settings/', { fixture: 'hub_settings.json' });
    cy.intercept('**/_ui/v1/feature-flags/', { fixture: 'hub_feature_flags.json' });
    cy.mount(
      <HubContextProvider>
        <HubOverview />
      </HubContextProvider>
    );
    cy.contains('button', 'Manage view').should('be.visible');
  });

  it('"Manage view" is displayed to non-admin users too', () => {
    cy.fixture('hub_admin').then((user: HubUser) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      cy.intercept('**/_ui/v1/me/', { ...user, is_superuser: false });
    });
    cy.intercept('**/_ui/v1/settings/', { fixture: 'hub_settings.json' });
    cy.intercept('**/_ui/v1/feature-flags/', { fixture: 'hub_feature_flags.json' });
    cy.mount(
      <HubContextProvider>
        <HubOverview />
      </HubContextProvider>
    );
    cy.contains('button', 'Manage view').should('be.visible');
  });
});
