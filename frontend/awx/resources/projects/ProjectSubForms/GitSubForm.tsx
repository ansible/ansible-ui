import { Trans, useTranslation } from 'react-i18next';
import { PageFormTextInput } from '../../../../../framework';
import { PageFormHidden } from '../../../../../framework/PageForm/Utils/PageFormHidden';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { PageFormCredentialSelect } from '../../../access/credentials/components/PageFormCredentialSelect';
import { useAwxConfig } from '../../../common/useAwxConfig';
import { getDocsBaseUrl } from '../../../common/util/getDocsBaseUrl';
import { Project } from '../../../interfaces/Project';
import { ScmTypeOptions } from './ScmTypeOptions';

export function GitSubForm() {
  const { t } = useTranslation();
  const config = useAwxConfig();

  const gitSourceControlUrlHelp = (
    <Trans i18nKey="gitSourceControlUrlHelp">
      <span>
        Example URLs for GIT Source Control include:
        <ul>
          <li>
            <code>https://github.com/ansible/ansible.git</code>
          </li>
          <li>
            <code>git@github.com:ansible/ansible.git</code>
          </li>
          <li>
            <code>git://servername.example.com/ansible.git</code>
          </li>
        </ul>
        Note: When using SSH protocol for GitHub or Bitbucket, enter an SSH key only, do not enter a
        username (other than git). Additionally, GitHub and Bitbucket do not support password
        authentication when using SSH. GIT read only protocol (git://) does not use username or
        password information.
      </span>
    </Trans>
  );
  const sourceControlRefspecHelp = (
    <Trans i18nKey="sourceControlRefspecHelp">
      <span>
        A refspec to fetch (passed to the Ansible git module). This parameter allows access to
        references via the branch field not otherwise available.
        <br />
        <br />
        Note: This field assumes the remote name is &quot;origin&quot;.
        <br />
        <br />
        Examples include:
        <ul style={{ margin: '10px 0 10px 20px' }}>
          <li>
            <code>refs/*:refs/remotes/origin/*</code>
          </li>
          <li>
            <code>refs/pull/62/head:refs/remotes/origin/pull/62/head</code>
          </li>
        </ul>
        The first fetches all references. The second fetches the Github pull request number 62, in
        this example the branch needs to be &quot;pull/62/head&quot;.
        <br />
        <br />
        {t`For more information, refer to the`}{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={getDocsBaseUrl(config, 'managePlaybooksSC')}
        >
          {t`Documentation.`}
        </a>
      </span>
    </Trans>
  );

  return (
    <PageFormHidden watch="scm_type" hidden={(type: string) => type !== 'git'}>
      <PageFormSection title={t('Type Details')}>
        <PageFormTextInput<Project>
          name="scm_url"
          label={t('Source Control URL')}
          labelHelpTitle={t('Source Control URL')}
          labelHelp={gitSourceControlUrlHelp}
          isRequired
        />
        <PageFormTextInput<Project>
          name="scm_branch"
          label={t('Source Control Branch/Tag/Commit')}
          labelHelpTitle={t('Source Control Branch/Tag/Commit')}
          labelHelp={t(
            'Branch to checkout. In addition to branches, you can input tags, commit hashes, and arbitrary refs. Some commit hashes and refs may not be available unless you also provide a custom refspec.'
          )}
        />
        <PageFormTextInput<Project>
          name="scm_refspec"
          label={t('Source Control Refspec')}
          labelHelpTitle={t('Source Control Refspec')}
          labelHelp={sourceControlRefspecHelp}
        />
        <PageFormCredentialSelect<Project>
          name="credential"
          label={t('Source Control Credential')}
          queryParams={{
            credential_type__namespace: 'scm',
          }}
        />
        <ScmTypeOptions />
      </PageFormSection>
    </PageFormHidden>
  );
}
