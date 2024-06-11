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
import { useGet } from '../../../../../common/crud/useGet';
import { jsonToYaml } from '../../../../../../framework/utils/codeEditorUtils';
import { awxAPI } from '../../../../common/api/awx-utils';
import { WizardFormValues, UnifiedJobType, AllResources, NodeResource } from '../types';
import { Survey } from '../../../../interfaces/Survey';
import { hasDaysToKeep, getValueBasedOnJobType } from './helpers';
import { PromptReviewDetails } from './PromptReviewDetails';
import { RESOURCE_TYPE } from '../constants';
import { useGetNodeTypeDetail, useGetTimeoutString } from '../hooks';

const ResourceLink: Record<UnifiedJobType, AwxRoute> = {
  inventory_update: AwxRoute.InventorySourceDetail,
  job: AwxRoute.JobTemplateDetails,
  project_update: AwxRoute.ProjectDetails,
  system_job: AwxRoute.ManagementJobSchedules,
  workflow_approval: AwxRoute.WorkflowApprovalDetails,
  workflow_job: AwxRoute.WorkflowJobTemplateDetails,
};

function getSurveySpecUrl(template: AllResources | NodeResource | null) {
  if (!template) return '';

  const type = template?.type ?? template?.unified_job_type;
  switch (type) {
    case 'job_template':
    case 'job':
      return awxAPI`/job_templates/${template?.id.toString()}/survey_spec/`;
    case 'workflow_job_template':
    case 'workflow_job':
      return awxAPI`/workflow_job_templates/${template?.id.toString()}/survey_spec/`;
    default:
      return '';
  }
}

function maskPasswords(vars: { [key: string]: string | string[] }, passwordKeys: string[]) {
  const updated = { ...vars };
  passwordKeys.forEach((key) => {
    if (typeof updated[key] !== 'undefined') {
      updated[key] = '$encrypted$';
    }
  });
  return updated;
}

function processSurvey(
  survey: { [key: string]: string | string[] },
  surveyConfig: Survey | null
): string {
  const updatedSurvey: { [key: string]: string | string[] } = { ...survey };

  if (surveyConfig?.spec) {
    const passwordFields = surveyConfig.spec
      .filter((q) => q.type === 'password')
      .map((q) => q.variable);

    const maskedSurveyPasswords = maskPasswords(survey, passwordFields);
    Object.keys(maskedSurveyPasswords).forEach((passwordKey) => {
      updatedSurvey[passwordKey] = maskedSurveyPasswords[passwordKey];
    });
  }

  return jsonToYaml(JSON.stringify(updatedSurvey));
}

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
    survey,
  } = wizardData;

  const { data: surveyConfig } = useGet<Survey>(getSurveySpecUrl(resource ?? null));
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

  let surveyDetails = '{}';
  if (survey && surveyConfig) {
    surveyDetails = processSurvey(survey, surveyConfig ?? null);
  }

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
        {!hasPromptDetails && survey ? (
          <PageDetailCodeEditor label={t('Extra vars')} value={surveyDetails} />
        ) : null}
      </PageDetails>
    </>
  );
}
