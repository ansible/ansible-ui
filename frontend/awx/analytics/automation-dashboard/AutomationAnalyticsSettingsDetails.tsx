import {
  IPageAction,
  LoadingPage,
  PageActions,
  PageActionSelection,
  PageActionType,
  PageDetail,
  PageDetails,
  PageHeader,
  PageLayout,
} from '@ansible/ansible-ui-framework';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';
import { useNavigate } from 'react-router-dom';
import { usePlatformActiveUser } from '@ansible/platform-ui/main/PlatformActiveUserProvider';
import { useCollectionStatus } from './common/useCollectionStatus';
import { useAutomationLeaderboardHelpText } from './common/useAutomationLeaderboardHelpText';
import { AwxError } from '../../common/AwxError';

export function AutomationAnalyticsSettingsDetails() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isLoading, error, data } = useCollectionStatus();
  const { activePlatformUser } = usePlatformActiveUser();
  // The metrics API lets platform auditors change this setting too, same as the nav visibility
  const canEdit = !!(activePlatformUser?.is_superuser || activePlatformUser?.is_platform_auditor);
  const leaderboardHelpText = useAutomationLeaderboardHelpText();
  const actions = useMemo<IPageAction<object>[]>(() => {
    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        icon: PencilAltIcon,
        label: t('Edit automation analytics settings'),
        onClick: () => void navigate('./edit'),
        isPinned: true,
        isHidden: () => !canEdit,
      },
    ];
  }, [canEdit, navigate, t]);

  // The nav polls the same key; a failed poll must not replace the page (or an open form) while data exists
  if (error && !data) return <AwxError error={error} />;
  if (isLoading) return <LoadingPage />;

  return (
    <PageLayout>
      <PageHeader
        title={t('Automation Analytics Settings')}
        headerActions={<PageActions actions={actions} position={'right'} />}
      />
      <PageDetails>
        <PageDetail label={t('Automation Leaderboards')} helpText={leaderboardHelpText}>
          {data?.show_leaderboard ? t('Enabled') : t('Disabled')}
        </PageDetail>
      </PageDetails>
    </PageLayout>
  );
}
