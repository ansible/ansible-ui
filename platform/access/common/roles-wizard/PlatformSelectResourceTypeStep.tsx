import { LoadingPage } from '@ansible/ansible-ui-framework';
import { FormGroupSingleSelectTypeAhead } from '@ansible/ansible-ui-framework/PageForm/Inputs/FormGroupSingleSelectTypeAhead';
import { AwxError } from '@ansible/awx-ui/common/AwxError';
import { Title } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useResourceTypeOptions } from './useResourceTypeOptions';
import { useResourceTypeWizard } from './useResourceTypeWizard';

export function PlatformSelectResourceTypeStep() {
  const { t } = useTranslation();
  const { options, isLoading, error } = useResourceTypeOptions();
  const { resourceType, handleResourceTypeSelection, handleClearSelection } =
    useResourceTypeWizard();

  if (isLoading) return <LoadingPage />;
  if (error) return <AwxError error={error} />;

  return (
    <div className="pf-v6-u-max-width-lg">
      <Title headingLevel="h3" className="pf-v6-u-mb-lg">
        {t('Select a resource type')}
      </Title>
      <FormGroupSingleSelectTypeAhead
        label={t('Resource type')}
        labelHelpTitle={t('Resource type')}
        labelHelp={t('Select the resource type to assign roles for.')}
        placeholderText={t('Select a resource type')}
        value={resourceType ?? null}
        id="resourceType"
        isRequired
        allowCreate={false}
        onHandleSelection={({ name }) => handleResourceTypeSelection(name)}
        onHandleClear={handleClearSelection}
        options={options}
      />
    </div>
  );
}
