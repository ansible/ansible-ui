import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';

import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { DropdownItem, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import { ExternalLinkAltIcon, QuestionCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { PageMasthead } from '../../framework';
import { PageSettingsIcon } from '../../framework/PageMasthead/PageSettingsIcon';
import { PageThemeSwitcher } from '../../framework/PageMasthead/PageThemeSwitcher';
import { useAnsibleAboutModal } from '../common/AboutModal';
import { AccountDropdown, AppBarDropdown } from '../common/Masthead';
import { PageRefreshIcon } from '../common/PageRefreshIcon';
import '../common/i18n';
import EdaIcon from './icons/eda-logo.svg';

export function EdaMasthead() {
  const { t } = useTranslation();
  const openAnsibleAboutModal = useAnsibleAboutModal();
  return (
    <PageMasthead icon={<EdaIcon style={{ height: 64 }} />} title={t('Event Driven Automation')}>
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
        {/* <ToolbarItem>
          <PageNotificationsIcon count={0} onClick={() => pageNavigate(EdaRoute.Notifications)} />
        </ToolbarItem> */}
        <ToolbarItem>
          <AppBarDropdown icon={<QuestionCircleIcon />}>
            <DropdownItem
              onClick={() =>
                open(
                  'https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.4/html/eda-getting-started-guide/index',
                  '_blank'
                )
              }
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
