import { AwxActiveUserProvider } from '@ansible/awx-ui/common/useAwxActiveUser';
import { HubActiveUserProvider } from '@ansible/hub-ui/common/useHubActiveUser';
import { awxAPI } from '../../cypress/support/formatApiPathForAwx';
import { hubAPI } from '../../cypress/support/formatApiPathForHub';
import { gatewayAPI } from '../utils/gateway-api-utils';
import { GatewayServicesProvider } from './GatewayServices';
import { GatewayUIAuthProvider } from './GatewayUIAuth';
import { PlatformActiveUserProvider } from './PlatformActiveUserProvider';
import { PlatformLogin } from './PlatformLogin';
import { PlatformMainInternal } from './PlatformMain';

describe('PlatformLogin', () => {
  beforeEach(() =>
    cy.mount(
      <PlatformActiveUserProvider>
        <AwxActiveUserProvider>
          <HubActiveUserProvider>
            <PlatformLogin>
              <GatewayUIAuthProvider>
                <GatewayServicesProvider>
                  <PlatformMainInternal />
                </GatewayServicesProvider>
              </GatewayUIAuthProvider>
            </PlatformLogin>
          </HubActiveUserProvider>
        </AwxActiveUserProvider>
      </PlatformActiveUserProvider>
    )
  );

  it('should render correct AAP SSO options', () => {
    cy.intercept(
      {
        method: 'GET',
        url: gatewayAPI`/ui_auth/`,
      },
      {
        fixture: 'uiAuth.json',
      }
    );
    cy.get('[data-cy="social-auth-ansible_base.authentication.authenticator_plugins.github"]').then(
      (el) => {
        expect(el).to.contain('Github OAuth');
      }
    );
  });

  it('should render hub login screen with SSO options', () => {
    cy.intercept(
      {
        method: 'GET',
        url: hubAPI`/_ui/v1/settings/`,
      },
      {
        fixture: 'hub_settings.json',
      }
    );
    cy.clickLink('I have an Automation Hub account');
    cy.contains('Log in to Automation Hub and migrate your account').should('be.visible');
    cy.get('[data-cy="social-auth-keycloak"]').then((el) => {
      expect(el).to.contain('Keycloak');
    });
  });

  it('should render controller login screen with SSO options', () => {
    cy.intercept(
      {
        method: 'GET',
        url: awxAPI`/auth/`,
      },
      {
        fixture: 'controllerAuth.json',
      }
    );
    cy.clickLink('I have an Automation Controller account');
    cy.contains('Log in to Automation Controller and migrate your account').should('be.visible');
    cy.get('[data-cy="social-auth-github"]').then((el) => {
      expect(el).to.contain('GitHub');
    });
  });

  it('should render AAP login screen after switching back from controller login screen', () => {
    cy.clickLink('I have an Automation Controller account');
    cy.contains('Log in to Automation Controller and migrate your account').should('be.visible');
    cy.clickLink('Switch to Ansible Automation Platform login');
    cy.contains('Log in to your account').should('be.visible');
  });
});
