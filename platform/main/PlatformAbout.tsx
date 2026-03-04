import { PageSettingsContext, usePageDialog } from '@ansible/ansible-ui-framework';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { edaAPI } from '@ansible/eda-ui/common/eda-utils';
import { hubAPI } from '@ansible/hub-ui/common/api/formatPath';
import { AboutModal, Content } from '@patternfly/react-core';
import { t } from 'i18next';
import React, { useContext } from 'react';

export const PlatformAbout: React.FunctionComponent<{
  platformVersion?: string;
}> = ({ platformVersion }) => {
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
      trademark="Copyright 2025 Red Hat, Inc."
      brandImageAlt={t('Brand Logo')}
      brandImageSrc={
        settings?.activeTheme === 'dark'
          ? '/assets/platform-logo-white.svg'
          : '/assets/platform-logo.svg'
      }
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
