import { PageApp } from '@ansible/ansible-ui-framework';
import { useAwxConfigState } from '@ansible/awx-ui/common/useAwxConfig';
import { postRequest, requestGet } from '@ansible/common-ui/crud/Data';
import { Banner, Button, Flex, FlexItem } from '@patternfly/react-core';
import { t } from 'i18next';
import { useMemo } from 'react';
import useSWR from 'swr';
import { useUserInteraction } from '../hooks/useUserInteraction';
import { UIFlag } from '../settings/ui-flags/IUIFlag';
import { useUIFlag } from '../settings/ui-flags/useUIFlag';
import { gatewayAPI } from '../utils/gateway-api-utils';
import { useIsManagedCloudInstall } from './GatewayUIAuth';
import { PersonaViewSwitcher } from './persona-view/PersonaViewSwitcher';
import { PlatformMasthead } from './PlatformMasthead';
import { usePlatformNavigation } from './usePlatformNavigation';
import { PageTitleProvider } from '@ansible/ansible-ui-framework/PageTitle/PageTitle';

export function PlatformApp() {
  const navigation = usePlatformNavigation();
  const sessionResponse = useSWR<{ expires_in_seconds: number }>(
    gatewayAPI`/session/`,
    requestGet,
    { refreshInterval: 10000 }
  );
  const session = sessionResponse.data;
  const { mutate } = sessionResponse;
  const refreshSession = useMemo(
    () => async () => {
      await postRequest(gatewayAPI`/session/`, {});
      void mutate();
    },
    [mutate]
  );
  const sessionBanner = useMemo(() => {
    if (!session) return null;
    if (session.expires_in_seconds < 5 * 60) {
      return (
        <Banner
          data-cy="session-banner"
          data-testid="session-banner"
          color={session.expires_in_seconds < 2 * 60 ? 'red' : 'yellow'}
        >
          <Flex spaceItems={{ default: 'spaceItemsMd' }}>
            <FlexItem>
              {t(`Your session will expire in {{count}} minutes.`, {
                count: Math.max(0, Math.round(session.expires_in_seconds / 60)),
              })}
            </FlexItem>
            <Button
              data-cy="refresh-session-btn"
              data-testid="refresh-session-btn"
              size="sm"
              onClick={() => void refreshSession()}
            >{t`Refresh session`}</Button>
          </Flex>
        </Banner>
      );
    }
    return null;
  }, [refreshSession, session]);

  useUserInteraction(60000, () => {
    refreshSession().catch(() => {
      // Ignore errors as the user may have logged out
      // and this is just a passive attempt to refresh the session
    });
  });

  const { awxConfig, serviceDown } = useAwxConfigState();
  const managedCloudInstall = useIsManagedCloudInstall() ?? false;
  const subscriptionBanner = useMemo(() => {
    if (!awxConfig?.license_info || managedCloudInstall) return null;
    if (!awxConfig.license_info.compliant) {
      if (awxConfig.license_info.grace_period_remaining) {
        return (
          <Banner
            data-cy="subscription-grace-period-banner"
            data-testid="subscription-grace-period-banner"
            color="red"
          >
            {t(`Your subscription is out of compliance. {{count}} days grace period remaining.`, {
              count: Math.max(
                Math.round(awxConfig.license_info.grace_period_remaining / 60 / 60 / 24),
                0
              ),
            })}
          </Banner>
        );
      }
      return (
        <Banner
          data-cy="subscription-out-of-compliance-banner"
          data-testid="subscription-out-of-compliance-banner"
          color="red"
        >{t`Your subscription is out of compliance. `}</Banner>
      );
    }
    if (awxConfig.license_info.time_remaining < 15 * 24 * 60 * 60) {
      return (
        <Banner
          data-cy="subscription-time-remaining-banner"
          data-testid="subscription-time-remaining-banner"
          color="yellow"
        >
          {t(`Your subscription will expire in {{count}} days.`, {
            count: Math.max(Math.round(awxConfig.license_info.time_remaining / 60 / 60 / 24), 0),
          })}
        </Banner>
      );
    }
    return null;
  }, [awxConfig, managedCloudInstall]);

  const controllerDownBanner = useMemo(() => {
    if (serviceDown) {
      return (
        <Banner data-cy="controller-down-banner" data-testid="controller-down-banner" color="red">
          {t('Error connecting to Controller API')}
        </Banner>
      );
    }
    return null;
  }, [serviceDown]);

  const personaViewSwitcherFlag = useUIFlag(UIFlag.PersonaViewSwitcher);

  return (
    <PageTitleProvider navigation={navigation}>
      <PageApp
        masthead={<PlatformMasthead />}
        navigation={navigation}
        basename={process.env.ROUTE_PREFIX ?? '/'}
        defaultRefreshInterval={10}
        banner={
          <>
            {controllerDownBanner}
            {subscriptionBanner}
            {sessionBanner}
          </>
        }
        contextSwitcher={personaViewSwitcherFlag?.enabled ? <PersonaViewSwitcher /> : undefined}
      />
    </PageTitleProvider>
  );
}
