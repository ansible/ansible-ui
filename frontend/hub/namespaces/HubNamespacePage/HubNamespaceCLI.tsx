import { Trans } from 'react-i18next';
import { CopyCell } from '../../../../framework';
import { ExternalLink } from '../../common/ExternalLink';
import { getRepoURL } from '../../common/api/hub-api-utils';

export function HubNamespaceCLI() {
  const repositoryUrl = getRepoURL('published');

  return (
    <div style={{ padding: '24px' }}>
      <CopyCell text={repositoryUrl} />
      <div style={{ paddingTop: '12px' }}>
        <Trans>
          <b>Note:</b> Use this URL to configure ansible-galaxy to upload collections to this
          namespace. More information on ansible-galaxy configurations can be found{' '}
          <ExternalLink
            href="https://docs.ansible.com/ansible/latest/galaxy/user_guide.html#configuring-the-ansible-galaxy-client"
            target="_blank"
            rel="noreferrer"
          >
            here.
          </ExternalLink>
        </Trans>
      </div>
    </div>
  );
}
