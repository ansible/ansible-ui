import { PageDetail, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { PageDetailCodeEditor } from '@ansible/ansible-ui-framework/PageDetails/PageDetailCodeEditor';
import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { useGet, useGetItem } from '@ansible/common-ui/crud/useGet';
import { Label, LabelGroup } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { awxAPI } from '../../../../common/api/awx-utils';
import { useVerbosityString } from '../../../../common/useVerbosityString';
import { ExecutionEnvironment } from '../../../../interfaces/ExecutionEnvironment';
import type { JobTemplate } from '../../../../interfaces/JobTemplate';
import type { Survey } from '../../../../interfaces/Survey';
import type { WorkflowJobTemplate } from '../../../../interfaces/WorkflowJobTemplate';
import { AwxRoute } from '../../../../main/AwxRoutes';
import { parseStringToTagArray } from '../../JobTemplateFormHelpers';
import type { WizardFormValues } from '../types';
import { processSurvey } from './helpers';
import { CredentialDetail } from '../../TemplatePage/steps/TemplateLaunchReviewStep';

interface PromptWizardFormValues extends Omit<WizardFormValues, 'resource'> {
  resource: JobTemplate | WorkflowJobTemplate;
  survey: { [key: string]: string | string[] };
}

function getSurveySpecUrl(template: JobTemplate | WorkflowJobTemplate) {
  if (!template) return '';
  switch (template?.type) {
    case 'job_template':
      return awxAPI`/job_templates/${template?.id.toString()}/survey_spec/`;
    case 'workflow_job_template':
      return awxAPI`/workflow_job_templates/${template?.id.toString()}/survey_spec/`;
    default:
      return '';
  }
}

export function PromptReviewDetails() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const {
    wizardData: { prompt, resource: template, survey },
  } = usePageWizard() as {
    wizardData: PromptWizardFormValues;
  };

  const {
    inventory,
    credentials,
    instance_groups,
    execution_environment,
    diff_mode,
    scm_branch,
    extra_vars,
    forks,
    job_slice_count,
    job_tags,
    job_type,
    labels,
    limit,
    skip_tags,
    timeout,
    verbosity,
  } = prompt || {};

  const { data: surveyConfig } = useGet<Survey>(getSurveySpecUrl(template));
  const { data: ee } = useGetItem<ExecutionEnvironment>(
    awxAPI`/execution_environments/`,
    execution_environment?.id?.toString() ?? ''
  );
  const jobTags = typeof job_tags === 'string' ? parseStringToTagArray(job_tags) : job_tags;
  const skipTags = typeof skip_tags === 'string' ? parseStringToTagArray(skip_tags) : skip_tags;
  const verbosityString = useVerbosityString(Number(verbosity));
  const inventoryUrlPaths: { [key: string]: string } = {
    '': 'inventory',
    smart: 'smart_inventory',
    constructed: 'constructed_inventory',
  };

  let extraVarDetails = extra_vars || '{}';
  if (survey) {
    extraVarDetails = processSurvey(extra_vars ?? '', survey, surveyConfig ?? null);
  }

  if (!template) return null;
  const organization = template.summary_fields?.organization;

  return (
    <>
      <PageDetail label={t('Job type')}>{job_type}</PageDetail>
      <PageDetail label={t('Organization')} isEmpty={!organization}>
        <Link
          to={getPageUrl(AwxRoute.OrganizationDetails, {
            params: { id: organization?.id },
          })}
        >
          {organization?.name}
        </Link>
      </PageDetail>
      <PageDetail label={t`Inventory`} isEmpty={!inventory?.id}>
        <Link
          to={getPageUrl(AwxRoute.InventoryDetails, {
            params: {
              id: inventory?.id?.toString(),
              inventory_type: inventoryUrlPaths[inventory?.kind ?? ''],
            },
          })}
        >
          {inventory?.name}
        </Link>
      </PageDetail>
      {template.type === 'job_template' && (
        <PageDetail label={t`Project`} isEmpty={!template.summary_fields.project}>
          <Link
            to={getPageUrl(AwxRoute.ProjectDetails, {
              params: { id: template.summary_fields?.project?.id },
            })}
          >
            {template.summary_fields.project?.name}
          </Link>
        </PageDetail>
      )}
      <PageDetail label={t`Execution environment`} isEmpty={isEmpty(execution_environment)}>
        <Link
          to={getPageUrl(AwxRoute.ExecutionEnvironmentDetails, {
            params: { id: execution_environment ? execution_environment?.id?.toString() : '' },
          })}
        >
          {ee?.name}
        </Link>
      </PageDetail>
      <PageDetail label={t('Source control branch')}>{scm_branch}</PageDetail>
      {template.type === 'job_template' && (
        <PageDetail label={t('Playbook')}>{template?.playbook}</PageDetail>
      )}
      <PageDetail label={t('Credentials')} isEmpty={isEmpty(credentials)}>
        <LabelGroup>
          {Array.isArray(credentials) && credentials.length > 0
            ? credentials?.map((credential) => (
                <CredentialDetail credential={credential} key={credential.id} />
              ))
            : null}
        </LabelGroup>
      </PageDetail>
      <PageDetail
        label={t`Instance groups`}
        helpText={t`The instance groups for this job template to run on.`}
        isEmpty={isEmpty(instance_groups)}
      >
        <LabelGroup>
          {instance_groups?.map((ig) => (
            <Label color="blue" key={ig.id}>
              <Link
                to={getPageUrl(AwxRoute.InstanceGroupDetails, {
                  params: {
                    id: ig.id,
                  },
                })}
              >
                {ig.name}
              </Link>
            </Label>
          ))}
        </LabelGroup>
      </PageDetail>
      <PageDetail label={t('Forks')}>{forks || 0}</PageDetail>
      <PageDetail label={t('Limit')}>{limit}</PageDetail>
      <PageDetail label={t('Verbosity')}>{verbosityString}</PageDetail>
      <PageDetail label={t('Timeout')}>{timeout || 0}</PageDetail>
      <PageDetail label={t('Show changes')}>{diff_mode ? t`On` : t`Off`}</PageDetail>
      <PageDetail label={t('Job slicing')}>{job_slice_count}</PageDetail>
      <PageDetail label={t('Labels')} isEmpty={isEmpty(labels)}>
        <LabelGroup>
          {labels?.map((label) => <Label key={label.id}>{label.name}</Label>)}
        </LabelGroup>
      </PageDetail>
      <PageDetail label={t('Job tags')} isEmpty={isEmpty(jobTags)}>
        <LabelGroup>{jobTags?.map(({ name }) => <Label key={name}>{name}</Label>)}</LabelGroup>
      </PageDetail>
      <PageDetail label={t('Skip tags')} isEmpty={isEmpty(skipTags)}>
        <LabelGroup>{skipTags?.map(({ name }) => <Label key={name}>{name}</Label>)}</LabelGroup>
      </PageDetail>
      <PageDetailCodeEditor label={t('Extra vars')} value={extraVarDetails} />
    </>
  );
}

function isEmpty(value: undefined | null | object[] | object | number): boolean {
  if (value === undefined || value === null) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === 'object') {
    return Object.keys(value).length === 0 || Object.values(value).every(isEmpty);
  }
  return false;
}
