import { Page } from '@patternfly/react-core';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingState } from '../../framework/components/LoadingState';
import { AwxError } from '../../frontend/awx/common/AwxError';
import { useAwxConfigState } from '../../frontend/awx/common/useAwxConfig';
import { SubscriptionWizard } from '../settings/SubscriptionWizard';

export function PlatformSubscription(props: { children: ReactNode }) {
  const { t } = useTranslation();
  const { awxConfig, awxConfigIsLoading, awxConfigError, refreshAwxConfig } = useAwxConfigState();
  if (awxConfigIsLoading) {
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  }
  if (awxConfigError) {
    return <AwxError error={awxConfigError} handleRefresh={refreshAwxConfig} />;
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

  return props.children;
}
