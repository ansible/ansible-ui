import { LoadingPage, PageFormSelect, PageHeader, PageLayout } from '@ansible/ansible-ui-framework';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AwxError } from '../../common/AwxError';
import { AwxPageForm } from '../../common/AwxPageForm';
import { metricsAPI } from '../../common/api/metrics-utils';
import { IAutomationDashboardCollectionStatus } from './types';
import { useCollectionStatus } from './common/useCollectionStatus';
import { useAutomationLeaderboardHelpText } from './common/useAutomationLeaderboardHelpText';

type AutomationAnalyticsSettingsFormValues = Pick<
  IAutomationDashboardCollectionStatus,
  'show_leaderboard'
>;

export function AutomationAnalyticsSettingsEdit() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isLoading, error, data, mutate } = useCollectionStatus();
  const leaderboardHelpText = useAutomationLeaderboardHelpText();
  const postRequest = usePostRequest<
    AutomationAnalyticsSettingsFormValues,
    IAutomationDashboardCollectionStatus
  >();

  // The nav polls the same key; a failed poll must not replace the page (or an open form) while data exists
  if (error && !data) return <AwxError error={error} />;
  if (isLoading) return <LoadingPage />;

  const handleSubmit = async (values: AutomationAnalyticsSettingsFormValues) => {
    const showLeaderboard = !!values.show_leaderboard;
    await postRequest(metricsAPI`/dashboard_reports/collection_status/`, {
      show_leaderboard: showLeaderboard,
    });
    // usePostRequest only drops the cache entry; revalidate so mounted consumers (nav, leaderboard)
    // pick up the new value now instead of on their next poll
    void mutate();
    void navigate('..');
  };

  return (
    <PageLayout>
      <PageHeader title={t('Automation Analytics Settings')} />
      <AwxPageForm<AutomationAnalyticsSettingsFormValues>
        submitText={t('Save')}
        onSubmit={handleSubmit}
        onCancel={() => void navigate('..')}
        defaultValue={{ show_leaderboard: !!data?.show_leaderboard }}
      >
        <PageFormSelect<AutomationAnalyticsSettingsFormValues>
          name="show_leaderboard"
          label={t('Automation Leaderboards')}
          labelHelpTitle={t('Automation Leaderboards')}
          labelHelp={leaderboardHelpText}
          options={[
            { label: t('Enabled'), value: true },
            { label: t('Disabled'), value: false },
          ]}
          enableUndo
        />
      </AwxPageForm>
    </PageLayout>
  );
}
