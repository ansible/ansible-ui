import { ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import { DropdownItem } from '@patternfly/react-core/deprecated';
import { QuestionCircleIcon, UserCircleIcon } from '@patternfly/react-icons';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageMasthead, useGetPageUrl } from '../../../framework';
import { PageMastheadDropdown } from '../../../framework/PageMasthead/PageMastheadDropdown';
import { PageNotificationsIcon } from '../../../framework/PageMasthead/PageNotificationsIcon';
import { PageThemeSwitcher } from '../../../framework/PageMasthead/PageThemeSwitcher';
import { usePageNotifications } from '../../../framework/PageNotifications/PageNotificationsProvider';
import GalaxyBrand from '../../assets/galaxy-logo.svg';
import { useAnsibleAboutModal } from '../../common/AboutModal';
import { PageRefreshIcon } from '../../common/PageRefreshIcon';
import { postRequest } from '../../common/crud/Data';
import { useGet } from '../../common/crud/useGet';
import { CollectionVersionSearch } from '../collections/Collection';
import { hubAPI } from '../common/api/formatPath';
import { useHubActiveUser } from '../common/useHubActiveUser';
import { useHubContext } from '../common/useHubContext';
import { HubItemsResponse } from '../common/useHubView';
import { HubRoute } from './HubRoutes';

export function HubMasthead() {
  const { t } = useTranslation();
  const openAnsibleAboutModal = useAnsibleAboutModal();
  useHubNotifications();
  const { activeHubUser, refreshActiveHubUser } = useHubActiveUser();
  const logout = useCallback(async () => {
    await postRequest(hubAPI`/_ui/v1/auth/logout/`, {});
    refreshActiveHubUser?.();
  }, [refreshActiveHubUser]);
  return (
    <PageMasthead brand={<GalaxyBrand style={{ height: 48, marginTop: -8 }} />}>
      <ToolbarGroup variant="icon-button-group" style={{ flexGrow: 1 }}>
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
            {/* <DropdownItem
              id="documentation"
              icon={<ExternalLinkAltIcon />}
              component="a"
              href={`${getDocsBaseUrl(config)}/html/userguide/index.html`}
              target="_blank"
              data-cy="masthead-documentation"
            >
              {t('Documentation')}
            </DropdownItem> */}
            <></>
            <DropdownItem
              id="about"
              onClick={() => openAnsibleAboutModal({ brandImageSrc: '/assets/galaxy-logo.svg' })}
              data-cy="masthead-about"
            >
              {t('About')}
            </DropdownItem>
          </PageMastheadDropdown>
        </ToolbarItem>
        <ToolbarItem>
          <PageMastheadDropdown
            id="account-menu"
            icon={<UserCircleIcon />}
            label={activeHubUser?.username}
          >
            {/* <DropdownItem
              id="user-details"
              label={t('User details')}
              onClick={() => pageNavigate(HubRoute.UserPage, { params: { id: activeUser?.id } })}
            /> */}
            <></>
            <DropdownItem id="logout" onClick={() => void logout()}>
              {t('Logout')}
            </DropdownItem>
          </PageMastheadDropdown>
        </ToolbarItem>
      </ToolbarGroup>
    </PageMasthead>
  );
}

export function useHubNotifications() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const { hasPermission } = useHubContext();

  const canApprove = hasPermission('ansible.modify_ansible_repo_content');

  const { data: result } = useGet<HubItemsResponse<CollectionVersionSearch>>(
    canApprove ? hubAPI`/v3/plugin/ansible/search/collection-versions/` : undefined,
    { page_size: 100, repository_label: 'pipeline=staging' }
  );

  const { setNotificationGroups } = usePageNotifications();
  useEffect(() => {
    setNotificationGroups((groups) => {
      groups['collection-approvals'] = {
        title: t('Collection Approvals'),
        notifications:
          result?.data.map((approval) => ({
            title: approval.collection_version?.name ?? '',
            description: t('Namespace: ') + approval.collection_version?.namespace ?? '',
            // timestamp: approval.created,
            variant: 'info',

            // TODO to should goto the specific approval page instead of the approvals page
            to: getPageUrl(HubRoute.Approvals, { query: { status: 'pipeline=staging' } }),
          })) ?? [],
      };
      return { ...groups };
    });
  }, [result, getPageUrl, setNotificationGroups, t]);

  return result?.data ?? 0;
}
