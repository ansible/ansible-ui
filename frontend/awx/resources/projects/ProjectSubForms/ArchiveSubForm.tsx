import { Trans, useTranslation } from 'react-i18next';
import { PageFormTextInput } from '../../../../../framework';
import { PageFormHidden } from '../../../../../framework/PageForm/Utils/PageFormHidden';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { PageFormCredentialSelect } from '../../../access/credentials/components/PageFormCredentialSelect';
import { Project } from '../../../interfaces/Project';
import { useGetCredentialTypeIDs } from '../hooks/useGetCredentialTypeIDs';
import { ScmTypeOptions } from './ScmTypeOptions';

export function ArchiveSubForm() {
  const { t } = useTranslation();
  const credentialTypeIDs = useGetCredentialTypeIDs();
  const archiveSourceControlUrlHelp = (
    <Trans i18nKey="archiveSourceControlUrlHelp">
      <span>
        Example URLs for Remote Archive Source Control include:
        <ul>
          <li>
            <code>https://github.com/username/project/archive/v0.0.1.tar.gz</code>
          </li>
          <li>
            <code>https://github.com/username/project/archive/v0.0.2.zip</code>
          </li>
        </ul>
      </span>
    </Trans>
  );

  return (
    <PageFormHidden watch="scm_type" hidden={(type: string) => type !== 'archive'}>
      <PageFormSection title={t('Type Details')}>
        <PageFormTextInput<Project>
          name="scm_url"
          label={t('Source Control URL')}
          labelHelpTitle={t('Source Control URL')}
          labelHelp={archiveSourceControlUrlHelp}
          isRequired
        />
        <PageFormCredentialSelect<Project>
          name="summary_fields.credential.name"
          credentialIdPath="credential"
          label={t('Source Control Credential')}
          selectTitle={t('Select Source Control Credential')}
          credentialType={credentialTypeIDs.scm}
        />
        <ScmTypeOptions />
      </PageFormSection>
    </PageFormHidden>
  );
}
