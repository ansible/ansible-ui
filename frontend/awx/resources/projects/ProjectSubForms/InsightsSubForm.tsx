import { useTranslation } from 'react-i18next';
import { PageFormHidden } from '../../../../../framework/PageForm/Utils/PageFormHidden';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { PageFormCredentialSelect } from '../../../access/credentials/components/PageFormCredentialSelect';
import { Project } from '../../../interfaces/Project';
import { ScmTypeOptions } from './ScmTypeOptions';

export function InsightsSubForm() {
  const { t } = useTranslation();

  return (
    <PageFormHidden watch="scm_type" hidden={(type: string) => type !== 'insights'}>
      <PageFormSection title={t('Type Details')}>
        <PageFormCredentialSelect<Project>
          name="credential"
          label={t('Insights credential')}
          isRequired
          queryParams={{
            credential_type__namespace: 'insights',
          }}
        />
        <ScmTypeOptions hideAllowOverride />
      </PageFormSection>
    </PageFormHidden>
  );
}
