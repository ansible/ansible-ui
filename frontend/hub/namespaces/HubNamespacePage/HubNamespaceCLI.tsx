import { useParams } from 'react-router-dom';
import React from 'react';
import { LoadingPage } from '../../../../framework';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';
import { Trans } from 'react-i18next';
import { ClipboardCopy } from '@patternfly/react-core';
import { useGet } from '../../../common/crud/useGet';
import { HubItemsResponse } from '../../useHubView';
import { HubNamespace } from '../HubNamespace';
import { hubAPI } from '../../api/formatPath';
import { HubError } from '../../common/HubError';
import { getRepoURL } from '../../api/utils';

export function HubNamespaceCLI() {
  const repositoryUrl = getRepoURL('published');
  const params = useParams<{ id: string }>();
  const {
    data: response,
    error,
    refresh,
  } = useGet<HubItemsResponse<HubNamespace>>(
    hubAPI`/_ui/v1/namespaces/?limit=1&name=${params.id ?? ''}`
  );

  if (!response || !response.data || (response.data.length === 0 && !error)) {
    return <LoadingPage />;
  }

  if (error) {
    return <HubError error={error} handleRefresh={refresh} />;
  }

  return (
    <div style={{ padding: '24px' }}>
      <ClipboardCopy isReadOnly>{repositoryUrl}</ClipboardCopy>
      <div style={{ paddingTop: '12px' }}>
        <Trans>
          <b>Note:</b> Use this URL to configure ansible-galaxy to upload collections to this
          namespace. More information on ansible-galaxy configurations can be found{' '}
          <a
            href="https://docs.ansible.com/ansible/latest/galaxy/user_guide.html#configuring-the-ansible-galaxy-client"
            target="_blank"
            rel="noreferrer"
          >
            here
          </a>
          <span>&nbsp;</span>
          <ExternalLinkAltIcon />.
        </Trans>
      </div>
    </div>
  );
}
