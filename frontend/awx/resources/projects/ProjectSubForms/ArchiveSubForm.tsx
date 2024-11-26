import { PageFormTextInput } from '@ansible/ansible-ui-framework';
import { PageFormHidden } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormHidden';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { Trans, useTranslation } from 'react-i18next';
import { PageFormCredentialSelect } from '../../../access/credentials/components/PageFormCredentialSelect';
import { Project } from '../../../interfaces/Project';
import { ScmTypeOptions } from './ScmTypeOptions';

export function ArchiveSubForm() {
  const { t } = useTranslation();
  const archiveSourceControlUrlHelp = (
    <Trans i18nKey="archiveSourceControlUrlHelpKey">
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
          label={t('Source control URL')}
          placeholder={t('Enter source control URL')}
          labelHelpTitle={t('Source control URL')}
          labelHelp={archiveSourceControlUrlHelp}
          isRequired
        />
        <PageFormCredentialSelect<Project>
          name="credential"
          label={t('Source control credential')}
          placeholder={t('Select source control credential')}
          queryParams={{
            credential_type__namespace: 'scm',
          }}
        />
        <ScmTypeOptions />
      </PageFormSection>
    </PageFormHidden>
  );
}
