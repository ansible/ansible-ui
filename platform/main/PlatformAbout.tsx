import { AboutModal, TextContent, TextList, TextListItem } from '@patternfly/react-core';
import { t } from 'i18next';
import React from 'react';
import { usePageDialog } from '../../framework';
import { awxAPI } from '../../frontend/awx/common/api/awx-utils';
import { useGet } from '../../frontend/common/crud/useGet';
import { edaAPI } from '../../frontend/eda/common/eda-utils';
import { hubAPI } from '../../frontend/hub/common/api/formatPath';

export const PlatformAbout: React.FunctionComponent = () => {
  const awxInfo = useGet<{ version: string }>(awxAPI`/ping/`);
  const hubInfo = useGet<{ galaxy_ng_version: string }>(hubAPI`/`);
  const edaInfo = useGet<{ version: string }>(edaAPI`/ping/`);
  // const gatewayPing = useGet<{
  //   pong: string;
  //   status: string;
  //   db_connected: boolean;
  //   proxy_exception: string;
  //   proxy_connected: boolean;
  // }>(gatewayV1API`/ping/`);

  const awxVersion = awxInfo.data?.version
    ? awxInfo.data?.version
    : awxInfo.isLoading
      ? ''
      : t('Unknown');

  const hubVersion = hubInfo.data?.galaxy_ng_version
    ? hubInfo.data?.galaxy_ng_version
    : hubInfo.isLoading
      ? ''
      : t('Unknown');

  const edaVersion = edaInfo.data?.version
    ? edaInfo.data?.version
    : edaInfo.isLoading
      ? ''
      : t('Unknown');

  const [_, setPageDialog] = usePageDialog();
  return (
    <AboutModal
      isOpen={true}
      onClose={(_e: React.MouseEvent<Element, MouseEvent> | KeyboardEvent | MouseEvent) =>
        setPageDialog(undefined)
      }
      productName={t('Ansible Automation Platform 2.5')}
      trademark="Copyright 2024 Red Hat, Inc."
      brandImageAlt={t('Brand Logo')}
      brandImageSrc={'/assets/aap-logo.svg'}
    >
      <TextContent>
        <TextList component="dl">
          <TextListItem component="dt">{t('Automation Controller Version')}</TextListItem>
          <TextListItem component="dd">{awxVersion}</TextListItem>
          <TextListItem component="dt">{t('Automation Hub Version')}</TextListItem>
          <TextListItem component="dd">{hubVersion}</TextListItem>
          <TextListItem component="dt">{t('Event Driven Automation Version')}</TextListItem>
          <TextListItem component="dd">{edaVersion}</TextListItem>
        </TextList>
      </TextContent>
    </AboutModal>
  );
};
