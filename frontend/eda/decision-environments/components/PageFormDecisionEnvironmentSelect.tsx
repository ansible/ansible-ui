import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormSingleSelectEdaResource } from '../../common/PageFormSingleSelectEdaResource';

import { edaAPI } from '../../common/eda-utils';
import { EdaDecisionEnvironmentRead } from '../../interfaces/EdaDecisionEnvironment';
import { useDecisionEnvironmentColumns } from '../hooks/useDecisionEnvironmentColumns';
import { useDecisionEnvironmentFilters } from '../hooks/useDecisionEnvironmentFilters';

export function PageFormDecisionEnvironmentSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: { name: TFieldName; isRequired?: boolean; isDisabled?: string }) {
  const { t } = useTranslation();
  const decisionEnvironmentColumns = useDecisionEnvironmentColumns();
  const decisionEnvironmentFilters = useDecisionEnvironmentFilters();
  return (
    <PageFormSingleSelectEdaResource<EdaDecisionEnvironmentRead, TFieldValues, TFieldName>
      name={props.name}
      id="decision_environment_id"
      label={t('Decision environment')}
      placeholder={t('Select decision environment')}
      queryPlaceholder={t('Loading decision environments...')}
      queryErrorText={t('Error loading decision environments')}
      isRequired={props.isRequired}
      isDisabled={props.isDisabled}
      url={edaAPI`/decision-environments/`}
      tableColumns={decisionEnvironmentColumns}
      toolbarFilters={decisionEnvironmentFilters}
      labelHelp={t('Decision environments are a container image to run Ansible rulebooks.')}
    />
  );
}
