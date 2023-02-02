import { EmptyStateCustom } from '../../../../framework/components/EmptyStateCustom';
import { useTranslation } from 'react-i18next';
import { useActiveUser } from '../../../common/useActiveUser';
import { KeyIcon, MonitoringIcon } from '@patternfly/react-icons';
import { Button } from '@patternfly/react-core';
import Picture from '../../assets/images/ansible_analytics_screenshot.png';
import React, { ReactElement } from 'react';

export function AnalyticsErrorState(props: { error: string }) {
  const { t } = useTranslation();
  const activeUser = useActiveUser();
  const { error } = props;

  interface errorTextsType {
    title: string;
    description: string;
    button?: ReactElement | undefined;
  }

  const errorTexts: Record<string, errorTextsType> = {
    no_credentials: {
      title: t('You have no credentials available.'),
      description: activeUser?.is_superuser
        ? t('Please click the button below to visit the settings page to set your credentials.')
        : t("Please contact your organization's administrator to add credentials."),
      button: activeUser?.is_superuser ? (
        <Button onClick={() => null}>{t('Go to Settings')}</Button>
      ) : undefined,
    },
    incorrect_credentials: {
      title: t('You do not have correct credentials to view this area.'),
      description: activeUser?.is_superuser
        ? t('Please click the button below to visit the settings page to fix your credentials.')
        : t("Please contact your organization's administrator to add the correct credentials."),
      button: activeUser?.is_superuser ? (
        <Button onClick={() => null}>{t('Go to Settings')}</Button>
      ) : undefined,
    },
    no_entitlements: {
      title: t('You do not have entitlements available.'),
      description: t("Please contact your organization's administrator to add entitlements."),
    },
    no_subscription: {
      title: t('You do not have Ansible Automation Platform subscription.'),
      description: t("Please contact your organization's administrator to add a subscription."),
    },
  };
  function DisabledState() {
    return (
      <>
        <EmptyStateCustom
          title={t('Automation Analytics is currently not enabled to send data.')}
          description={
            activeUser?.is_superuser
              ? t(
                  'Please click the button below to visit the settings page to set your credentials.'
                )
              : t("Please contact your organization's administrator to add credentials.")
          }
          icon={MonitoringIcon}
          button={
            activeUser?.is_superuser ? (
              <Button onClick={() => null}>{t('Go to Settings')}</Button>
            ) : undefined
          }
          footNote={t(
            'Gain insights into your deployments through visual dashboards and organization statistics, calculate your return on investment, explore automation processes details.'
          )}
          image={<img width="50%" height="50%" src={Picture} alt={''} />}
        />
      </>
    );
  }

  return !activeUser?.is_superuser ? (
    <EmptyStateCustom
      title={errorTexts[error]?.title}
      description={errorTexts[error]?.description}
      icon={KeyIcon}
      button={errorTexts[error]?.button}
    />
  ) : (
    <DisabledState />
  );
}
