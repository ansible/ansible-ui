import { useTranslation } from 'react-i18next';
import { PageFormHidden } from '../../../../../framework/PageForm/Utils/PageFormHidden';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { PageFormCredentialSelect } from '../../../access/credentials/components/PageFormCredentialSelect';
import { Project } from '../../../interfaces/Project';
import { useGetCredentialTypeIDs } from '../hooks/useGetCredentialTypeIDs';
import { ScmTypeOptions } from './ScmTypeOptions';

export function InsightsSubForm() {
  const { t } = useTranslation();
  const credentialTypeIDs = useGetCredentialTypeIDs();

  return (
    <PageFormHidden watch="scm_type" hidden={(type: string) => type !== 'insights'}>
      <PageFormSection title={t('Type Details')}>
        <PageFormCredentialSelect<Project>
          name="summary_fields.credential.name"
          credentialIdPath="credential"
          label={t('Insights Credential')}
          selectTitle={t('Select Insights Credential')}
          credentialType={credentialTypeIDs.insights}
          isRequired
        />
        <ScmTypeOptions hideAllowOverride />
      </PageFormSection>
    </PageFormHidden>
  );
}
