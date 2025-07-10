import { AwxActiveUserProvider } from '@ansible/awx-ui/common/useAwxActiveUser';
import { HubActiveUserProvider } from '@ansible/hub-ui/common/useHubActiveUser';
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
});
