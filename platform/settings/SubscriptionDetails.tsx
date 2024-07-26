import { Label } from '@patternfly/react-core';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { CheckIcon, ExclamationCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  LoadingPage,
  PageActionSelection,
  PageActionType,
  PageActions,
  PageDetail,
  PageDetails,
  PageHeader,
  PageLayout,
  usePageNavigate,
} from '../../framework';
import { awxAPI } from '../../frontend/awx/common/api/awx-utils';
import { useAwxConfig } from '../../frontend/awx/common/useAwxConfig';
import { CredentialType } from '../../frontend/awx/interfaces/CredentialType';
import { SystemSettings } from '../../frontend/awx/interfaces/SystemSettings';
import { useGet } from '../../frontend/common/crud/useGet';
import { usePlatformActiveUser } from '../main/PlatformActiveUserProvider';
import { PlatformRoute } from '../main/PlatformRoutes';

export function SubscriptionDetails() {
  const { t } = useTranslation();
  const awxConfig = useAwxConfig();
  const pageNavigate = usePageNavigate();
  const { activePlatformUser } = usePlatformActiveUser();
  const systemConfig = useGet<SystemSettings>(awxAPI`/settings/system/`);

  const actions = useMemo<IPageAction<object>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        label: t('Edit subscription'),
        onClick: () => pageNavigate(PlatformRoute.SubscriptionWizard),
        isPinned: true,
        isDisabled: !activePlatformUser?.is_superuser
          ? t('Only system admins can edit subscription')
          : undefined,
      },
    ],
    [activePlatformUser?.is_superuser, pageNavigate, t]
  );

  if (!awxConfig || systemConfig.isLoading) {
    return <LoadingPage />;
  }

  const license_info = awxConfig.license_info;

  let license_type = license_info.license_type;
  switch (license_type) {
    case 'enterprise':
      license_type = t('Enterprise');
      break;
    case 'trial':
      license_type = t('Trial');
      break;
  }

  return (
    <PageLayout>
      <PageHeader
        title={t('Subscription Settings')}
        headerActions={
          <PageActions<CredentialType> actions={actions} position={DropdownPosition.right} />
        }
      />
      <PageDetails>
        <PageDetail label={t('Subscription')}>{license_info.subscription_name}</PageDetail>
        <PageDetail
          label={t('Status')}
          helpText={
            license_info.compliant
              ? t`The number of hosts you have automated against is below your subscription count.`
              : t`You have automated against more hosts than your subscription allows.`
          }
          isEmpty={systemConfig.data?.SUBSCRIPTION_USAGE_MODEL !== 'unique_managed_hosts'}
        >
          {license_info.compliant ? (
            <Label color="green" icon={<CheckIcon />}>
              {t`Compliant`}
            </Label>
          ) : (
            <Label color="red" icon={<ExclamationCircleIcon />}>
              {t`Out of compliance`}
            </Label>
          )}
        </PageDetail>
        <PageDetail
          label={t('Hosts automated')}
          isEmpty={systemConfig.data?.SUBSCRIPTION_USAGE_MODEL !== 'unique_managed_hosts'}
        >
          {license_info.automated_instances}
        </PageDetail>
        <PageDetail
          label={t('Hosts imported')}
          isEmpty={systemConfig.data?.SUBSCRIPTION_USAGE_MODEL !== 'unique_managed_hosts'}
        >
          {license_info.current_instances}
        </PageDetail>
        <PageDetail
          label={t('Hosts remaining')}
          isEmpty={systemConfig.data?.SUBSCRIPTION_USAGE_MODEL !== 'unique_managed_hosts'}
        >
          {license_info.free_instances}
        </PageDetail>
        <PageDetail
          label={t('Hosts deleted')}
          isEmpty={systemConfig.data?.SUBSCRIPTION_USAGE_MODEL !== 'unique_managed_hosts'}
        >
          {license_info.deleted_instances}
        </PageDetail>
        <PageDetail
          label={t('Active hosts previously deleted')}
          isEmpty={systemConfig.data?.SUBSCRIPTION_USAGE_MODEL !== 'unique_managed_hosts'}
        >
          {license_info.reactivated_instances}
        </PageDetail>
        <PageDetail label={t('Subscription type')}>{license_type}</PageDetail>
        <PageDetail label={t('Trial')}>{license_info.trial ? t('Yes') : t('No')}</PageDetail>
        <PageDetail label={t('Days remaining')}>
          {Math.floor(license_info.time_remaining / (24 * 60 * 60))}
        </PageDetail>
        <PageDetail label={t('Expires on')}>
          {new Date(Date.now() + license_info.time_remaining * 1000).toLocaleDateString()}
        </PageDetail>
      </PageDetails>
    </PageLayout>
  );
}
