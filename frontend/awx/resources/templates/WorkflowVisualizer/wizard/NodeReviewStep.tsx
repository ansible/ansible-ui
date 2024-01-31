import { useTranslation } from 'react-i18next';
import { PageDetail, PageDetails } from '../../../../../../framework';
import { PageDetailCodeEditor } from '../../../../../../framework/PageDetails/PageDetailCodeEditor';
import { usePageWizard } from '../../../../../../framework/PageWizard/PageWizardProvider';
import { jsonToYaml } from '../../../../../../framework/utils/codeEditorUtils';
import { UnifiedJobType } from '../../../../interfaces/WorkflowNode';
import { WizardFormValues } from '../types';
import { hasDaysToKeep, getValueBasedOnJobType } from './helpers';

export function NodeReviewStep() {
  const { t } = useTranslation();
  const { wizardData } = usePageWizard() as { wizardData: WizardFormValues };
  const {
    approval_name,
    approval_description,
    node_type,
    node_resource,
    approval_timeout,
    node_alias,
    node_convergence,
    node_days_to_keep,
  } = wizardData;

  const nodeTypeDetail = useGetNodeTypeDetail(node_type);
  const nameDetail = getValueBasedOnJobType(node_type, node_resource?.name || '', approval_name);
  const descriptionDetail = getValueBasedOnJobType(
    node_type,
    node_resource?.description || '',
    approval_description
  );
  const convergenceDetail = node_convergence === 'all' ? t('All') : t('Any');
  const timeoutString = useGetTimeoutString(approval_timeout);
  const timeoutDetail = getValueBasedOnJobType(node_type, '', timeoutString);
  const showDaysToKeep = node_type === UnifiedJobType.system_job && hasDaysToKeep(node_resource);
  const extraVarsDetail = showDaysToKeep
    ? jsonToYaml(JSON.stringify({ days: node_days_to_keep }))
    : '';

  return (
    <PageDetails numberOfColumns="single">
      <PageDetail label={t('Type')}>{nodeTypeDetail}</PageDetail>
      <PageDetail label={t('Name')}>{nameDetail}</PageDetail>
      <PageDetail label={t('Description')}>{descriptionDetail}</PageDetail>
      <PageDetail label={t('Timeout')}>{timeoutDetail}</PageDetail>
      <PageDetail label={t('Convergence')}>{convergenceDetail}</PageDetail>
      <PageDetail label={t('Alias')}>{node_alias}</PageDetail>
      {showDaysToKeep ? (
        <PageDetailCodeEditor label={t('Extra vars')} value={extraVarsDetail} />
      ) : null}
    </PageDetails>
  );
}

function useGetNodeTypeDetail(type: UnifiedJobType) {
  const { t } = useTranslation();
  const typeMapping = {
    job: t('Job Template'),
    workflow_job: t('Workflow Job Template'),
    project_update: t('Project Update'),
    inventory_update: t('Inventory Update'),
    workflow_approval: t('Workflow Approval'),
    system_job: t('Management Job'),
  };
  return typeMapping[type];
}

function useGetTimeoutString(value: number) {
  const { t } = useTranslation();
  const timeout = value || 0;
  const minutes = Math.floor(timeout / 60);
  const seconds = Math.floor(timeout % 60);
  return t('{{minutes}} min {{seconds}} sec ', {
    minutes: minutes.toString(),
    seconds: seconds.toString(),
  });
}
