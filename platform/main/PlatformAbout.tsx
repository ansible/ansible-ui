import { usePageDialog } from '@ansible/ansible-ui-framework';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { edaAPI } from '@ansible/eda-ui/common/eda-utils';
import { hubAPI } from '@ansible/hub-ui/common/api/formatPath';
import { AboutModal, TextContent, TextList, TextListItem } from '@patternfly/react-core';
import { t } from 'i18next';
import React from 'react';

export const PlatformAbout: React.FunctionComponent = () => {
  const awxInfo = useGet<{ version: string }>(awxAPI`/ping/`);
  const hubInfo = useGet<{ galaxy_ng_version: string }>(hubAPI`/`);
  const edaInfo = useGet<{ version: string }>(edaAPI`/config/`);

  const awxVersion = awxInfo.data?.version;
  const hubVersion = hubInfo.data?.galaxy_ng_version;
  const edaVersion = edaInfo.data?.version;

  const [_, setPageDialog] = usePageDialog();
  return (
    <AboutModal
      isOpen={true}
      onClose={(_e: React.MouseEvent<Element, MouseEvent> | KeyboardEvent | MouseEvent) =>
        setPageDialog(undefined)
      }
      productName={t('Ansible Automation Platform 2.5')}
      trademark="Copyright 2025 Red Hat, Inc."
      brandImageAlt={t('Brand Logo')}
      brandImageSrc={'aap-logo.svg?react'}
    >
      <TextContent>
        <TextList component="dl">
          {awxVersion && (
            <>
              <TextListItem component="dt">{t('Automation Controller Version')}</TextListItem>
              <TextListItem component="dd">{awxVersion}</TextListItem>
            </>
          )}
          {edaVersion && (
            <>
              <TextListItem component="dt">{t('Event-Driven Ansible Version')}</TextListItem>
              <TextListItem component="dd">{edaVersion}</TextListItem>
            </>
          )}
          {hubVersion && (
            <>
              <TextListItem component="dt">{t('Automation Hub Version')}</TextListItem>
              <TextListItem component="dd">{hubVersion}</TextListItem>
            </>
          )}
        </TextList>
      </TextContent>
    </AboutModal>
  );
};
