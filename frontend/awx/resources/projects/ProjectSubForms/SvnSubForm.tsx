import { Trans, useTranslation } from 'react-i18next';
import { PageFormHidden } from '../../../../../framework/PageForm/Utils/PageFormHidden';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { PageFormTextInput } from '../../../../../framework';
import { ProjectFields } from '../ProjectPage/ProjectForm';
import { PageFormCredentialSelect } from '../../credentials/components/PageFormCredentialSelect';
import { useGetCredentialTypeIDs } from '../hooks/useGetCredentialTypeIDs';
import { ScmTypeOptions } from './ScmTypeOptions';

export function SvnSubForm() {
  const { t } = useTranslation();
  const credentialTypeIDs = useGetCredentialTypeIDs();
  const svnSourceControlUrlHelp = (
    <Trans i18nKey="svnSourceControlUrlHelp">
      <span>
        Example URLs for Subversion Source Control include:
        <ul>
          <li>
            <code>https://github.com/ansible/ansible</code>
          </li>
          <li>
            <code>svn://servername.example.com/path</code>
          </li>
          <li>
            <code>svn+ssh://servername.example.com/path</code>
          </li>
        </ul>
      </span>
    </Trans>
  );

  return (
    <PageFormHidden watch="project.scm_type" hidden={(type: string) => type !== 'svn'}>
      <PageFormSection title={t('Type Details')}>
        <PageFormTextInput<ProjectFields>
          name="project.scm_url"
          label={t('Source Control URL')}
          labelHelpTitle={t('Source Control URL')}
          labelHelp={svnSourceControlUrlHelp}
          isRequired
        />
        <PageFormTextInput
          name="project.scm_branch"
          label={t('Revision #')}
          labelHelp={t(
            'Branch to checkout. In addition to branches, you can input tags, commit hashes, and arbitrary refs. Some commit hashes and refs may not be available unless you also provide a custom refspec.'
          )}
        />
        <PageFormCredentialSelect<ProjectFields>
          name="project.summary_fields.credential.name"
          credentialIdPath="project.credential"
          label={t('Source Control Credential')}
          selectTitle={t('Select Source Control Credential')}
          credentialType={credentialTypeIDs.scm}
        />
        <ScmTypeOptions />
      </PageFormSection>
    </PageFormHidden>
  );
}
