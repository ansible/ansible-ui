import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';

import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { Button, DropdownItem, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import { CogIcon, ExternalLinkAltIcon, QuestionCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { PageMasthead, useSettingsDialog } from '../../framework';
import { PageThemeSwitcher } from '../../framework/PageThemeSwitcher';
import { useAnsibleAboutModal } from '../common/AboutModal';
import { AccountDropdown, AppBarDropdown } from '../common/Masthead';
import { PageRefreshIcon } from '../common/PageRefreshIcon';
import '../common/i18n';
import AwxIcon from '../icons/favicon.svg';
import { useAwxConfig } from './common/useAwxConfig';
import getDocsBaseUrl from './common/util/getDocsBaseUrl';

export function AwxMasthead() {
  const { t } = useTranslation();
  const openSettings = useSettingsDialog(t);
  const openAnsibleAboutModal = useAnsibleAboutModal();
  const config = useAwxConfig();
  return (
    <PageMasthead icon={<AwxIcon style={{ width: 56 }} />} title={t('AWX')}>
      <ToolbarItem style={{ flexGrow: 1 }} />
      <ToolbarGroup variant="icon-button-group">
        <ToolbarItem>
          <PageThemeSwitcher />
        </ToolbarItem>
        <ToolbarItem>
          <PageRefreshIcon />
        </ToolbarItem>
        <ToolbarItem>
          <Button icon={<CogIcon />} variant="plain" onClick={openSettings} />
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
