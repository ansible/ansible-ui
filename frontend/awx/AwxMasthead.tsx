import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';

import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { DropdownItem, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import { ExternalLinkAltIcon, QuestionCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { PageMasthead, usePageNavigate } from '../../framework';
import { PageNotificationsIcon } from '../../framework/PageMasthead/PageNotificationsIcon';
import { PageSettingsIcon } from '../../framework/PageMasthead/PageSettingsIcon';
import { PageThemeSwitcher } from '../../framework/PageMasthead/PageThemeSwitcher';
import { useAnsibleAboutModal } from '../common/AboutModal';
import { AccountDropdown, AppBarDropdown } from '../common/Masthead';
import { PageRefreshIcon } from '../common/PageRefreshIcon';
import '../common/i18n';
import AwxIcon from '../icons/favicon.svg';
import { AwxRoute } from './AwxRoutes';
import { useAwxConfig } from './common/useAwxConfig';
import getDocsBaseUrl from './common/util/getDocsBaseUrl';

export function AwxMasthead() {
  const { t } = useTranslation();
  const openAnsibleAboutModal = useAnsibleAboutModal();
  const config = useAwxConfig();
  const pageNavigate = usePageNavigate();
  return (
    <PageMasthead icon={<AwxIcon style={{ width: 56 }} />} title={t('AWX')}>
      <ToolbarItem style={{ flexGrow: 1 }} />
      <ToolbarGroup variant="icon-button-group">
        <ToolbarItem>
          <PageRefreshIcon />
        </ToolbarItem>
        <ToolbarItem>
          <PageThemeSwitcher />
        </ToolbarItem>
        <ToolbarItem>
          <PageSettingsIcon />
        </ToolbarItem>
        <ToolbarItem>
          <PageNotificationsIcon count={0} onClick={() => pageNavigate(AwxRoute.Notifications)} />
        </ToolbarItem>
        <ToolbarItem>
          <AppBarDropdown icon={<QuestionCircleIcon />}>
            <DropdownItem
              onClick={() => open(`${getDocsBaseUrl(config)}/html/userguide/index.html`, '_blank')}
              icon={<ExternalLinkAltIcon />}
            >
              {t('Documentation')}
            </DropdownItem>
            <DropdownItem onClick={() => openAnsibleAboutModal({})}>{t('About')}</DropdownItem>
          </AppBarDropdown>
        </ToolbarItem>
      </ToolbarGroup>
      <ToolbarItem>
        <AccountDropdown />
      </ToolbarItem>
    </PageMasthead>
  );
}
