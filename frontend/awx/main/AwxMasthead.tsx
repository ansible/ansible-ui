import { PageMasthead, useGetPageUrl, usePageNavigate } from '@ansible/ansible-ui-framework';
import { PageMastheadDropdown } from '@ansible/ansible-ui-framework/PageMasthead/PageMastheadDropdown';
import { PageNotificationsIcon } from '@ansible/ansible-ui-framework/PageMasthead/PageNotificationsIcon';
import { PageThemeSwitcher } from '@ansible/ansible-ui-framework/PageMasthead/PageThemeSwitcher';
import { usePageNotifications } from '@ansible/ansible-ui-framework/PageNotifications/usePageNotifications';
import { useAnsibleAboutModal } from '@ansible/common-ui/AboutModal';
import { PageRefreshIcon } from '@ansible/common-ui/PageRefreshIcon';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useGetDocsUrl } from '@ansible/common-ui/utils/useGetDocsUrl';
import { DropdownItem, Icon, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import { QuestionCircleIcon, UserCircleIcon } from '@patternfly/react-icons';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AwxBrand from '../../assets/awx-logo.svg?react';
import { AwxItemsResponse } from '../common/AwxItemsResponse';
import { awxAPI } from '../common/api/awx-utils';
import { useAwxActiveUser } from '../common/useAwxActiveUser';
import { useAwxConfig } from '../common/useAwxConfig';
import { useAwxWebSocketSubscription } from '../common/useAwxWebSocket';
import { WorkflowApproval } from '../interfaces/WorkflowApproval';
import { AwxRoute } from './AwxRoutes';

export function AwxMasthead() {
  const { t } = useTranslation();
  const openAnsibleAboutModal = useAnsibleAboutModal();
  const config = useAwxConfig();
  const pageNavigate = usePageNavigate();
  const { activeAwxUser, refreshActiveAwxUser } = useAwxActiveUser();
  useAwxNotifications();
  const logout = useCallback(async () => {
    await fetch('/api/logout/');
    refreshActiveAwxUser?.();
    pageNavigate(AwxRoute.Login);
  }, [pageNavigate, refreshActiveAwxUser]);
  return (
    <PageMasthead brand={<AwxBrand style={{ height: 60 }} />}>
      <ToolbarGroup variant="action-group-plain" style={{ flexGrow: 1 }}>
        <ToolbarItem style={{ marginLeft: 'auto' }}>
          <PageRefreshIcon />
        </ToolbarItem>
        <ToolbarItem>
          <PageThemeSwitcher />
        </ToolbarItem>
        <ToolbarItem>
          <PageNotificationsIcon />
        </ToolbarItem>
        <ToolbarItem>
          <PageMastheadDropdown id="help-menu" icon={<QuestionCircleIcon />}>
            <DropdownItem
              id="documentation"
              isExternalLink
              component="a"
              to={useGetDocsUrl(config, 'index')}
              data-cy="masthead-documentation"
            >
              {t('Documentation')}
            </DropdownItem>
            <DropdownItem
              id="about"
              onClick={() => openAnsibleAboutModal({ brandImageSrc: '/assets/awx-logo.svg' })}
              data-cy="masthead-about"
            >
              {t('About')}
            </DropdownItem>
          </PageMastheadDropdown>
        </ToolbarItem>
        <ToolbarItem>
          <PageMastheadDropdown
            id="account-menu"
            icon={
              <Icon size="lg">
                <UserCircleIcon />
              </Icon>
            }
            label={activeAwxUser?.username}
          >
            <DropdownItem
              id="user-details"
              label={t('User details')}
              onClick={() =>
                pageNavigate(AwxRoute.UserDetails, { params: { id: activeAwxUser?.id } })
              }
            >
              {t('User details')}
            </DropdownItem>
            <DropdownItem id="logout" label={t('Logout')} onClick={() => void logout()}>
              {t('Logout')}
            </DropdownItem>
          </PageMastheadDropdown>
        </ToolbarItem>
      </ToolbarGroup>
    </PageMasthead>
  );
}

export function useAwxNotifications() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const { data, refresh } = useGet<AwxItemsResponse<WorkflowApproval>>(
    awxAPI`/workflow_approvals/`,
    { page_size: 200, status: 'pending' }
  );

  const handleWebSocketMessage = useCallback(
    (message?: { group_name?: string; type?: string }) => {
      switch (message?.group_name) {
        case 'jobs':
          switch (message?.type) {
            case 'workflow_approval':
              void refresh();
              break;
          }
          break;
      }
    },
    [refresh]
  );

  useAwxWebSocketSubscription(
    { control: ['limit_reached_1'], jobs: ['status_changed'] },
    handleWebSocketMessage as (data: unknown) => void
  );

  const { setNotificationGroups } = usePageNotifications();
  useEffect(() => {
    setNotificationGroups((groups) => {
      groups['workflow-approvals'] = {
        title: t('Workflow Approvals'),
        notifications:
          data?.results.map((workflow_approval) => ({
            title: workflow_approval.name,
            description: workflow_approval.summary_fields.workflow_job?.name,
            timestamp: workflow_approval.created,
            variant: 'info',
            to: getPageUrl(AwxRoute.WorkflowApprovalDetails, {
              params: { id: workflow_approval.id },
            }),
          })) ?? [],
      };
      return { ...groups };
    });
  }, [data, getPageUrl, setNotificationGroups, t]);

  return data?.count ?? 0;
}
