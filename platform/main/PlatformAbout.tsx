import { PageSettingsContext, usePageDialog } from '@ansible/ansible-ui-framework';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { edaAPI } from '@ansible/eda-ui/common/eda-utils';
import { hubAPI } from '@ansible/hub-ui/common/api/formatPath';
import { AboutModal, Content } from '@patternfly/react-core';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import platformLogo from '../assets/platform-logo.svg?url';
import platformLogoWhite from '../assets/platform-logo-white.svg?url';

export const PlatformAbout: React.FunctionComponent<{
  platformVersion?: string;
}> = ({ platformVersion }) => {
  const { t } = useTranslation();
  const awxInfo = useGet<{ version: string }>(awxAPI`/ping/`);
  const hubInfo = useGet<{ galaxy_ng_version: string }>(hubAPI`/`);
  const edaInfo = useGet<{ version: string }>(edaAPI`/config/`);

  const awxVersion = awxInfo.data?.version;
  const hubVersion = hubInfo.data?.galaxy_ng_version;
  const edaVersion = edaInfo.data?.version;
  const [settings] = useContext(PageSettingsContext);

  const [_, setPageDialog] = usePageDialog();
  return (
    <AboutModal
      isOpen={true}
      onClose={(_e: React.MouseEvent<Element, MouseEvent> | KeyboardEvent | MouseEvent) =>
        setPageDialog(undefined)
      }
      productName={t('Ansible Automation Platform {{version}}', { version: platformVersion })}
      trademark={t(`Copyright {{fullYear}} Red Hat, Inc.`, {
        fullYear: new Date().getFullYear(),
      })}
      brandImageAlt={t('Brand Logo')}
      brandImageSrc={settings?.activeTheme === 'dark' ? platformLogoWhite : platformLogo}
    >
      <Content>
        <Content component="dl">
          {awxVersion && (
            <>
              <Content component="dt">{t('Automation Controller Version')}</Content>
              <Content component="dd">{awxVersion}</Content>
            </>
          )}
          {edaVersion && (
            <>
              <Content component="dt">{t('Event-Driven Ansible Version')}</Content>
              <Content component="dd">{edaVersion}</Content>
            </>
          )}
          {hubVersion && (
            <>
              <Content component="dt">{t('Automation Hub Version')}</Content>
              <Content component="dd">{hubVersion}</Content>
            </>
          )}
        </Content>
      </Content>
    </AboutModal>
  );
};
