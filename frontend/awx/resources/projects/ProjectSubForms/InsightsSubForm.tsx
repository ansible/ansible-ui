import { useTranslation } from 'react-i18next';
import { PageFormHidden } from '../../../../../framework/PageForm/Utils/PageFormHidden';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { PageFormCredentialSelect } from '../../../access/credentials/components/PageFormCredentialSelect';
import { ProjectFields } from '../ProjectPage/ProjectForm';
import { useGetCredentialTypeIDs } from '../hooks/useGetCredentialTypeIDs';
import { ScmTypeOptions } from './ScmTypeOptions';

export function InsightsSubForm() {
  const { t } = useTranslation();
  const credentialTypeIDs = useGetCredentialTypeIDs();

  return (
    <PageFormHidden watch="project.scm_type" hidden={(type: string) => type !== 'insights'}>
      <PageFormSection title={t('Type Details')}>
        <PageFormCredentialSelect<ProjectFields>
          name="project.summary_fields.credential.name"
          credentialIdPath="project.credential"
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
