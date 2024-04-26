import { Banner, Button, Flex, FlexItem } from '@patternfly/react-core';
import { t } from 'i18next';
import { useMemo } from 'react';
import useSWR from 'swr';
import { PageApp } from '../../framework';
import { useAwxConfig } from '../../frontend/awx/common/useAwxConfig';
import { postRequest, requestGet } from '../../frontend/common/crud/Data';
import { gatewayAPI } from '../api/gateway-api-utils';
import { PlatformMasthead } from './PlatformMasthead';
import { usePlatformNavigation } from './usePlatformNavigation';

export function PlatformApp() {
  const navigation = usePlatformNavigation();

  const sessionResponse = useSWR<{ expires_in_seconds: number }>(
    gatewayAPI`/session/`,
    requestGet,
    { refreshInterval: 10000 }
  );
  const session = sessionResponse.data;
  const refreshSession = useMemo(
    () => async () => {
      await postRequest(gatewayAPI`/session/`, {});
      void sessionResponse.mutate();
    },
    [sessionResponse]
  );
  const sessionBanner = useMemo(() => {
    if (!session) return null;
    if (session.expires_in_seconds < 5 * 60) {
      return (
        <Banner variant={session.expires_in_seconds < 2 * 60 ? 'red' : 'gold'}>
          <Flex spaceItems={{ default: 'spaceItemsMd' }}>
            <FlexItem>
              {t(`Your session will expires in {{count}} minutes.`, {
                count: Math.max(0, Math.round(session.expires_in_seconds / 60)),
              })}
            </FlexItem>
            <Button size="sm" onClick={() => void refreshSession()}>{t`Refresh session`}</Button>
          </Flex>
        </Banner>
      );
    }
    return null;
  }, [refreshSession, session]);

  const awxConfig = useAwxConfig();
  const subscriptionBanner = useMemo(() => {
    if (!awxConfig || !awxConfig.license_info) return null;
    if (!awxConfig.license_info.compliant) {
      if (awxConfig.license_info.grace_period_remaining) {
        return (
          <Banner variant="red">
            {t(`Your subscription is out of compliance. {{count}} days grace period remaining.`, {
              count: Math.max(
                Math.round(awxConfig.license_info.grace_period_remaining / 60 / 60 / 24),
                0
              ),
            })}
          </Banner>
        );
      }
      return <Banner variant="red">{t`Your subscription is out of compliance. `}</Banner>;
    }
    if (awxConfig.license_info.time_remaining < 15 * 24 * 60 * 60) {
      return (
        <Banner variant="gold">
          {t(`Your subscription will expire in {{count}} days.`, {
            count: Math.max(Math.round(awxConfig.license_info.time_remaining / 60 / 60 / 24), 0),
          })}
        </Banner>
      );
    }
    return null;
  }, [awxConfig]);

  return (
    <PageApp
      masthead={<PlatformMasthead />}
      navigation={navigation}
      basename={process.env.ROUTE_PREFIX}
      defaultRefreshInterval={10}
      banner={
        <>
          {subscriptionBanner}
          {sessionBanner}
        </>
      }
    />
  );
}
