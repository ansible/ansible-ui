import { Page } from '@patternfly/react-core';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingState } from '../../framework/components/LoadingState';
import { AwxError } from '../../frontend/awx/common/AwxError';
import { useAwxConfigState } from '../../frontend/awx/common/useAwxConfig';
import { SubscriptionWizard } from '../settings/SubscriptionWizard';
import { useHasAwxService } from './GatewayServices';

export function PlatformSubscription(props: { children: ReactNode }) {
  const { t } = useTranslation();
  const { awxConfig, awxConfigError, serviceDown, refreshAwxConfig } = useAwxConfigState();

  const hasAwxService = useHasAwxService(true);

  if (hasAwxService === undefined) {
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  }

  if (hasAwxService && !serviceDown) {
    if (awxConfig === undefined && !awxConfigError) {
      return (
        <Page>
          <LoadingState />
        </Page>
      );
    }

    if (awxConfigError) {
      return (
        <Page>
          <AwxError error={awxConfigError} handleRefresh={refreshAwxConfig} />
        </Page>
      );
    }

    if (!awxConfig) {
      return (
        <AwxError error={new Error(t`Subscription not found`)} handleRefresh={refreshAwxConfig} />
      );
    }

    if (!awxConfig.license_info || !Object.keys(awxConfig.license_info).length) {
      return (
        <Page>
          <SubscriptionWizard onSuccess={() => refreshAwxConfig?.()} />
        </Page>
      );
    }
  }

  return props.children;
}
