import { EmptyStateCustom } from '../../../../framework/components/EmptyStateCustom';
import { useTranslation } from 'react-i18next';
import { useActiveUser } from '../../../common/useActiveUser';
import { KeyIcon, MonitoringIcon } from '@patternfly/react-icons';
import { Button } from '@patternfly/react-core';
import Picture from '../../assets/images/ansible_analytics_screenshot.png';
import React, { ReactElement } from 'react';

export function AnalyticsErrorState(props: { error?: string }) {
  const { t } = useTranslation();
  const activeUser = useActiveUser();
  const { error } = props;

  interface errorTextsType {
    title: string;
    description: string;
    button?: ReactElement | undefined;
  }

  const errorTexts: Record<string, errorTextsType> = {
    'analytics-upload-not-enabled': {
      title: t('Missing Gather data for Automation Analytics.'),
      description: t(
        "Please contact your organization's administrator to enable Gather data for Automation Analytics."
      ),
    },
    'missing-user': {
      title: t('Missing User for Automation Analytics.'),
      description: t(
        "Please contact your organization's administrator to add User for Automation Analytics."
      ),
    },
    'missing-password': {
      title: t('Missing Password for Automation Analytics.'),
      description: t(
        "Please contact your organization's administrator to add Password for Automation Analytics."
      ),
    },
    'missing-url': {
      title: t('Missing URL for Automation Analytics.'),
      description: t(
        "Please contact your organization's administrator to add URL for Automation Analytics."
      ),
    },
    unauthorized: {
      title: t('Missing Authentication for Automation Analytics.'),
      description: t("Please contact your organization's administrator to add credentials."),
    },
    'no-data-or-entitlement': {
      title: t("You have no entitlement available. Or there's no data."),
      description: t("Please contact your organization's administrator to add entitlements."),
    },
    'not-found': {
      title: t('Not Found'),
      description: t('Not Found'),
    },
    unknown: {
      title: t('There was an error on the server.'),
      description: t("Please contact your organization's administrator."),
    },
  };

  function ErrorState(propsState: { error: string }) {
    const { error: errorState } = propsState;
    if (errorState && errorTexts[errorState]) {
      return (
        <EmptyStateCustom
          title={errorTexts[errorState]?.title}
          description={errorTexts[errorState]?.description}
          icon={KeyIcon}
          button={errorTexts[errorState]?.button}
        />
      );
    }
    return (
      <EmptyStateCustom
        title={t('ERROR')}
        description={t('WHO KNOWS WHAT HAPPENED')}
        icon={KeyIcon}
      />
    );
  }
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

  return (activeUser?.is_superuser || activeUser?.is_system_auditor) && !!error ? (
    <ErrorState error={error} />
  ) : (
    <DisabledState />
  );
}
