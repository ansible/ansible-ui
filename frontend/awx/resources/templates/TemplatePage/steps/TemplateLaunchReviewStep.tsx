import { PageDetail, PageDetails, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { PageDetailCodeEditor } from '@ansible/ansible-ui-framework/PageDetails/PageDetailCodeEditor';
import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { jsonToYaml, yamlToJson } from '@ansible/ansible-ui-framework/utils/codeEditorUtils';
import { useGet, useGetItem } from '@ansible/common-ui/crud/useGet';
import { Label, LabelGroup } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { awxAPI } from '../../../../common/api/awx-utils';
import { useVerbosityString } from '../../../../common/useVerbosityString';
import type { Credential } from '../../../../interfaces/Credential';
import { ExecutionEnvironment } from '../../../../interfaces/ExecutionEnvironment';
import { Inventory } from '../../../../interfaces/Inventory';
import type { JobTemplate } from '../../../../interfaces/JobTemplate';
import { Survey } from '../../../../interfaces/Survey';
import { WorkflowJobTemplate } from '../../../../interfaces/WorkflowJobTemplate';
import { AwxRoute } from '../../../../main/AwxRoutes';
import type { TemplateLaunch } from '../TemplateLaunchWizard';
import { SummaryFieldCredential } from '../../../../interfaces/summary-fields/summary-fields';
import { CredentialLabel } from '../../../../common/CredentialLabel';
import { LaunchConfigCredential } from '../../../../interfaces/LaunchConfiguration';

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
  extra_vars: string | null,
  survey: { [key: string]: string | string[] },
  surveyConfig: Survey | null
): string {
  const extraVarsObj = extra_vars ? (JSON.parse(yamlToJson(extra_vars)) as object) : {};
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

  const mergedData: { [key: string]: string | string[] | { name: string }[] } = {
    ...extraVarsObj,
    ...updatedSurvey,
  };

  return jsonToYaml(JSON.stringify(mergedData));
}

export function TemplateLaunchReviewStep(props: Readonly<{ template: JobTemplate }>) {
  const { template } = props;
  const { t } = useTranslation();
  const { wizardData } = usePageWizard();
  const getPageUrl = useGetPageUrl();
  const { prompt = undefined, survey } = wizardData as TemplateLaunch;
  const { data: surveyConfig } = useGet<Survey>(getSurveySpecUrl(template));

  const { data: ee } = useGetItem<ExecutionEnvironment>(
    awxAPI`/execution_environments/`,
    prompt?.execution_environment?.id ?? ''
  );
  const { data: fullInventory } = useGetItem<Inventory>(
    awxAPI`/inventories/`,
    prompt?.inventory?.id ?? ''
  );

  let extraVarDetails = prompt?.extra_vars ?? '{}';
  if (survey) {
    extraVarDetails = processSurvey(prompt?.extra_vars ?? '', survey, surveyConfig ?? null);
  }

  const verbosityString = useVerbosityString(prompt?.verbosity);

  const inventoryUrlPaths: { [key: string]: string } = {
    '': 'inventory',
    smart: 'smart_inventory',
    constructed: 'constructed_inventory',
  };
  return (
    <PageDetails numberOfColumns="multiple">
      <PageDetail label={t('Name')}>{template.name}</PageDetail>
      <PageDetail label={t('Job type')}>{prompt?.job_type}</PageDetail>
      <PageDetail label={t('Organization')} isEmpty={!template.summary_fields.organization}>
        <Link
          to={getPageUrl(AwxRoute.OrganizationDetails, {
            params: { id: template.summary_fields?.organization?.id },
          })}
        >
          {template.summary_fields?.organization?.name}
        </Link>
      </PageDetail>
      <PageDetail
        label={t`Inventory`}
        isEmpty={!fullInventory?.id && !template?.summary_fields?.inventory?.id}
      >
        <Link
          to={getPageUrl(AwxRoute.InventoryDetails, {
            params: {
              id: fullInventory?.id,
              inventory_type: inventoryUrlPaths[fullInventory?.kind as string],
            },
          })}
        >
          {fullInventory?.name ?? template?.summary_fields?.inventory?.name}
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
      <PageDetail label={t`Execution environment`} isEmpty={isEmpty(prompt?.execution_environment)}>
        <Link
          to={getPageUrl(AwxRoute.ExecutionEnvironmentDetails, {
            params: prompt?.execution_environment ? { id: prompt?.execution_environment.id } : {},
          })}
        >
          {ee?.name}
        </Link>
      </PageDetail>
      <PageDetail label={t('Source control branch')}>{prompt?.scm_branch}</PageDetail>
      {template.type === 'job_template' && (
        <PageDetail label={t('Playbook')}>{template?.playbook}</PageDetail>
      )}
      <PageDetail label={t('Credentials')} isEmpty={isEmpty(prompt?.credentials)}>
        <LabelGroup>
          {prompt?.credentials?.map((credential) => {
            return <CredentialDetail credential={credential} key={credential.id} />;
          })}
        </LabelGroup>
      </PageDetail>
      <PageDetail
        label={t`Instance groups`}
        helpText={t`The instance groups for this job template to run on.`}
        isEmpty={isEmpty(prompt?.instance_groups)}
      >
        <LabelGroup>
          {prompt?.instance_groups?.map((ig) => (
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
      <PageDetail label={t('Forks')}>{prompt?.forks ?? 0}</PageDetail>
      <PageDetail label={t('Limit')}>{prompt?.limit}</PageDetail>
      <PageDetail label={t('Verbosity')}>{verbosityString}</PageDetail>
      <PageDetail label={t('Timeout')}>{prompt?.timeout ?? 0}</PageDetail>
      <PageDetail label={t('Show changes')}>{prompt?.diff_mode ? t`On` : t`Off`}</PageDetail>
      <PageDetail label={t('Job slicing')}>{prompt?.job_slice_count}</PageDetail>
      <PageDetail label={t('Labels')} isEmpty={isEmpty(prompt?.labels)}>
        <LabelGroup>
          {prompt?.labels?.map((label) => <Label key={label.id}>{label.name}</Label>)}
        </LabelGroup>
      </PageDetail>
      <PageDetail label={t('Job tags')} isEmpty={isEmpty(prompt?.job_tags)}>
        <LabelGroup>
          {prompt?.job_tags?.map(({ name }) => <Label key={name}>{name}</Label>)}
        </LabelGroup>
      </PageDetail>
      <PageDetail label={t('Skip tags')} isEmpty={isEmpty(prompt?.skip_tags)}>
        <LabelGroup>
          {prompt?.skip_tags?.map(({ name }) => <Label key={name}>{name}</Label>)}
        </LabelGroup>
      </PageDetail>
      <PageDetailCodeEditor label={t('Extra vars')} value={extraVarDetails} />
    </PageDetails>
  );
}

export function CredentialDetail({
  credential,
}: Readonly<{
  credential: Credential | SummaryFieldCredential | LaunchConfigCredential;
}>) {
  if (!credential) return null;
  if ('kind' in credential) {
    return <CredentialLabel credential={credential as Credential} key={credential.id} />;
  }
  return (
    <Label color="blue" key={credential.id}>
      {credential.name}
    </Label>
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
