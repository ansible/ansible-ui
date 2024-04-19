import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AwxRoute } from '../../../../main/AwxRoutes';
import {
  PageDetail,
  PageDetails,
  PageWizardStep,
  useGetPageUrl,
} from '../../../../../../framework';
import { PageDetailCodeEditor } from '../../../../../../framework/PageDetails/PageDetailCodeEditor';
import { usePageWizard } from '../../../../../../framework/PageWizard/PageWizardProvider';
import { jsonToYaml } from '../../../../../../framework/utils/codeEditorUtils';
import { WizardFormValues, UnifiedJobType } from '../types';
import { hasDaysToKeep, getValueBasedOnJobType } from './helpers';
import { PromptReviewDetails } from './PromptReviewDetails';
import { RESOURCE_TYPE } from '../constants';

const ResourceLink: Record<UnifiedJobType, AwxRoute> = {
  inventory_update: AwxRoute.InventorySourceDetail,
  job: AwxRoute.JobTemplateDetails,
  project_update: AwxRoute.ProjectDetails,
  system_job: AwxRoute.ManagementJobDetails,
  workflow_approval: AwxRoute.WorkflowApprovalDetails,
  workflow_job: AwxRoute.WorkflowJobTemplateDetails,
};

export function NodeReviewStep() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const { wizardData, visibleSteps } = usePageWizard() as {
    wizardData: WizardFormValues;
    visibleSteps: PageWizardStep[];
  };
  const {
    approval_name,
    approval_description,
    node_type,
    resource,
    approval_timeout,
    node_alias,
    node_convergence,
    node_days_to_keep,
  } = wizardData;

  const hasPromptDetails = Boolean(visibleSteps.find((step) => step.id === 'nodePromptsStep'));
  const nodeTypeDetail = useGetNodeTypeDetail(node_type);
  const nameDetail = getValueBasedOnJobType(node_type, resource?.name || '', approval_name);
  const descriptionDetail = getValueBasedOnJobType(
    node_type,
    resource?.description || '',
    approval_description
  );
  const convergenceDetail = node_convergence === 'all' ? t('All') : t('Any');
  const timeoutString = useGetTimeoutString(approval_timeout);
  const timeoutDetail = getValueBasedOnJobType(node_type, '', timeoutString);
  const showDaysToKeep = node_type === RESOURCE_TYPE.system_job && hasDaysToKeep(resource);
  const extraVarsDetail = showDaysToKeep
    ? jsonToYaml(JSON.stringify({ days: node_days_to_keep }))
    : '';

  let resourceDetailsLink = getPageUrl(ResourceLink[node_type], {
    params: { id: resource?.id },
  });

  if (resource && 'type' in resource && resource.type === 'inventory_source') {
    resourceDetailsLink = getPageUrl(AwxRoute.InventorySourceDetail, {
      params: {
        source_id: resource?.id,
        id: resource?.inventory,
        inventory_type:
          resource?.summary_fields?.inventory.kind === ''
            ? 'inventory'
            : resource?.summary_fields?.inventory.kind,
      },
    });
  }
  return (
    <>
      <PageDetails numberOfColumns="single">
        <PageDetail label={t('Type')}>{nodeTypeDetail}</PageDetail>
        <PageDetail label={t('Name')}>
          <Link to={resourceDetailsLink}>{nameDetail}</Link>
        </PageDetail>
        <PageDetail label={t('Description')}>{descriptionDetail}</PageDetail>
        <PageDetail label={t('Timeout')}>{timeoutDetail}</PageDetail>
        <PageDetail label={t('Convergence')}>{convergenceDetail}</PageDetail>
        <PageDetail label={t('Alias')}>{node_alias}</PageDetail>
        {showDaysToKeep ? (
          <PageDetailCodeEditor label={t('Extra vars')} value={extraVarsDetail} />
        ) : null}
        {hasPromptDetails ? <PromptReviewDetails /> : null}
      </PageDetails>
    </>
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
