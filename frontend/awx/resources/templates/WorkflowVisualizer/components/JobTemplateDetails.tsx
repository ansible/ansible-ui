import { PageDetail, TextCell, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { jsonToYaml } from '@ansible/ansible-ui-framework/utils/codeEditorUtils';
import { useGet, useGetItem } from '@ansible/common-ui/crud/useGet';
import { Content, ContentVariants, Label, LabelGroup } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { awxAPI } from '../../../../common/api/awx-utils';
import { AwxItemsResponse } from '../../../../common/AwxItemsResponse';
import { CredentialLabel } from '../../../../common/CredentialLabel';
import { useVerbosityString } from '../../../../common/useVerbosityString';
import { Credential } from '../../../../interfaces/Credential';
import { ExecutionEnvironment } from '../../../../interfaces/ExecutionEnvironment';
import { InstanceGroup } from '../../../../interfaces/InstanceGroup';
import { Inventory } from '../../../../interfaces/Inventory';
import { JobTemplate } from '../../../../interfaces/JobTemplate';
import { Label as ILabel } from '../../../../interfaces/Label';
import { AwxRoute } from '../../../../main/AwxRoutes';
import { WebhookService } from '../../components/WebhookService';
import { parseStringToTagArray } from '../../JobTemplateFormHelpers';
import { useGetTimeoutString } from '../hooks';
import { GraphNodeData, PromptFormValues } from '../types';
import { arrayIdsMatch } from './arrayUtils';
import { NodeCodeEditorDetail } from './NodeCodeEditorDetail';
import { NodeTagDetail } from './NodeTagDetail';
import { PromptDetail } from './PromptDetail';
import { resolveExtraVars } from './resolveExtraVars';
import { resolveArrayField, resolveScalarField, resolveTagField } from './resolveNodeFields';

function useAggregateJobTemplateDetails({
  template,
  node,
}: {
  template: JobTemplate;
  node: GraphNodeData;
}) {
  const { launch_data: promptValues, survey_data: surveyValues, resource: nodeValues } = node;
  const { data: nodeLabels } = useGet<AwxItemsResponse<ILabel>>(nodeValues?.related?.labels);
  const { data: webhookKey } = useGet<{ webhook_key: string }>(template?.related?.webhook_key);
  const { data: nodeInstanceGroups } = useGet<AwxItemsResponse<InstanceGroup>>(
    nodeValues?.related?.instance_groups
  );
  const { data: templateInstanceGroups } = useGet<AwxItemsResponse<InstanceGroup>>(
    template?.related?.instance_groups
  );
  const { data: nodeCredentials } = useGet<AwxItemsResponse<Credential>>(
    nodeValues?.related?.credentials
  );
  const { data: templateCredentials } = useGet<AwxItemsResponse<Credential>>(
    template?.related?.credentials
  );

  const { data: fetchedEE } = useGetItem<ExecutionEnvironment>(
    awxAPI`/execution_environments/`,
    String(promptValues?.execution_environment?.id)
  );

  const isTemplateChanged = Boolean(promptValues?.original?.isTemplateChange);
  const credentials = resolveArrayField(
    promptValues?.credentials,
    template.ask_credential_on_launch,
    isTemplateChanged,
    nodeCredentials?.results,
    templateCredentials?.results
  );

  const diffMode = resolveScalarField(
    promptValues?.diff_mode,
    isTemplateChanged,
    nodeValues?.diff_mode,
    template.diff_mode
  );
  let executionEnvironment: ExecutionEnvironment | undefined;

  if (promptValues?.execution_environment && fetchedEE) {
    executionEnvironment = fetchedEE;
  } else if (isTemplateChanged) {
    executionEnvironment = template.summary_fields.execution_environment as
      | ExecutionEnvironment
      | undefined;
  } else {
    executionEnvironment =
      nodeValues?.summary_fields?.execution_environment ??
      template.summary_fields.execution_environment;
  }

  const forks = Number(
    resolveScalarField(promptValues?.forks, isTemplateChanged, nodeValues?.forks, template.forks)
  );
  const instanceGroups = resolveArrayField(
    promptValues?.instance_groups,
    template.ask_instance_groups_on_launch,
    isTemplateChanged,
    nodeInstanceGroups?.results,
    templateInstanceGroups?.results
  );
  const inventory = resolveScalarField(
    promptValues?.inventory,
    isTemplateChanged,
    nodeValues.summary_fields.inventory,
    template.summary_fields.inventory
  );
  const jobSliceCount = resolveScalarField(
    promptValues?.job_slice_count,
    isTemplateChanged,
    nodeValues?.job_slice_count,
    template.job_slice_count
  );
  const jobTags = resolveTagField(
    promptValues?.job_tags,
    template.ask_tags_on_launch,
    isTemplateChanged,
    nodeValues?.job_tags,
    template.job_tags
  );
  const jobType = resolveScalarField(
    promptValues?.job_type,
    isTemplateChanged,
    nodeValues?.job_type,
    template.job_type
  );
  const labels = resolveArrayField(
    promptValues?.labels,
    template.ask_labels_on_launch,
    isTemplateChanged,
    nodeLabels?.results,
    template.summary_fields.labels?.results
  );
  const limit = resolveScalarField(
    promptValues?.limit,
    isTemplateChanged,
    nodeValues?.limit,
    template.limit
  );
  const scmBranch = resolveScalarField(
    promptValues?.scm_branch,
    isTemplateChanged,
    nodeValues?.scm_branch,
    template.scm_branch
  );
  const skipTags = resolveTagField(
    promptValues?.skip_tags,
    template.ask_skip_tags_on_launch,
    isTemplateChanged,
    nodeValues?.skip_tags,
    template.skip_tags
  );
  const timeout = Number(
    resolveScalarField(
      promptValues?.timeout,
      isTemplateChanged,
      nodeValues?.timeout,
      template.timeout
    )
  );
  const timeoutString = useGetTimeoutString(timeout);
  const templateTimeoutString = useGetTimeoutString(template.timeout);
  const verbosity = resolveScalarField(
    promptValues?.verbosity,
    isTemplateChanged,
    nodeValues?.verbosity,
    template.verbosity
  );
  const verbosityString = useVerbosityString(verbosity ?? template.verbosity);
  const templateVerbosityString = useVerbosityString(template.verbosity);
  let variables = resolveExtraVars(
    promptValues?.extra_vars,
    template.ask_variables_on_launch,
    isTemplateChanged,
    nodeValues?.extra_data,
    template.extra_vars
  );

  if (surveyValues) {
    const jsonObj: { [key: string]: string } = {};

    if (variables) {
      const lines = variables.split('\n');
      lines.forEach((line) => {
        const [key, value] = line.split(':').map((part) => part.trim());
        jsonObj[key] = value;
      });
    }

    const mergedData: { [key: string]: string | string[] | { name: string }[] } = {
      ...jsonObj,
      ...surveyValues,
    };

    variables = jsonToYaml(JSON.stringify(mergedData));
  }

  return {
    credentials,
    diffMode,
    executionEnvironment,
    forks,
    instanceGroups,
    inventory,
    jobSliceCount,
    jobTags,
    jobType,
    labels,
    limit,
    scmBranch,
    skipTags,
    templateCredentials,
    templateInstanceGroups,
    templateTimeoutString,
    templateVerbosityString,
    timeout,
    timeoutString,
    variables,
    verbosity,
    verbosityString,
    webhookKey,
  };
}

export function JobTemplateDetails({
  node,
  template,
}: Readonly<{
  node: GraphNodeData;
  template: JobTemplate;
}>) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const {
    credentials,
    diffMode,
    executionEnvironment,
    forks,
    instanceGroups,
    inventory,
    jobSliceCount,
    jobTags,
    jobType,
    labels,
    limit,
    scmBranch,
    skipTags,
    templateCredentials,
    templateInstanceGroups,
    templateTimeoutString,
    templateVerbosityString,
    timeout,
    timeoutString,
    variables,
    verbosity,
    verbosityString,
    webhookKey,
  } = useAggregateJobTemplateDetails({ template, node });

  const { data: inventoryData } = useGetItem<Inventory>(
    awxAPI`/inventories/`,
    inventory?.id?.toString()
  );

  return (
    <>
      <PromptDetail
        label={t('Job type')}
        isEmpty={!jobType}
        isOverridden={jobType !== template.job_type}
        overriddenValue={template.job_type}
      >
        {jobType}
      </PromptDetail>
      <PageDetail label={t('Organization')} isEmpty={!template.summary_fields.organization}>
        <TextCell
          text={template.summary_fields.organization?.name}
          to={getPageUrl(AwxRoute.OrganizationDetails, {
            params: { id: template.summary_fields.organization?.id },
          })}
        />
      </PageDetail>
      <PromptDetail
        label={t('Inventory')}
        isOverridden={inventory?.id !== template.summary_fields.inventory?.id}
        overriddenValue={inventoryData?.name ?? template.summary_fields.inventory?.name}
        isEmpty={!inventory}
      >
        <TextCell
          text={inventoryData?.name}
          to={getPageUrl(AwxRoute.InventoryDetails, {
            params: { id: inventory?.id },
          })}
        />
      </PromptDetail>
      <PageDetail label={t('Project')} isEmpty={!template.summary_fields.project}>
        <TextCell
          text={template.summary_fields.project?.name}
          to={getPageUrl(AwxRoute.ProjectDetails, {
            params: { id: template.summary_fields.project?.id },
          })}
        />
      </PageDetail>

      <PromptDetail
        isEmpty={!executionEnvironment}
        label={t('Execution environment')}
        overriddenValue={template.summary_fields?.execution_environment?.name}
        isOverridden={
          executionEnvironment?.id !== template.summary_fields?.execution_environment?.id
        }
      >
        <TextCell
          text={executionEnvironment?.name}
          to={getPageUrl(AwxRoute.ExecutionEnvironmentDetails, {
            params: {
              id: executionEnvironment?.id,
            },
          })}
        />
      </PromptDetail>
      <CredentialsDetail
        credentials={credentials || []}
        templateCredentials={templateCredentials?.results ?? []}
      />
      <InstanceGroupsDetail
        instanceGroups={instanceGroups ?? []}
        templateInstanceGroups={templateInstanceGroups?.results ?? []}
      />
      <PageDetail label={t('Playbook')}>{template.playbook}</PageDetail>
      <PromptDetail
        label={t('Source control branch')}
        isEmpty={!scmBranch}
        isOverridden={scmBranch !== template.scm_branch}
        overriddenValue={template.scm_branch}
      >
        {scmBranch}
      </PromptDetail>
      <PromptDetail
        label={t('Forks')}
        isEmpty={!forks}
        isOverridden={forks !== template.forks}
        overriddenValue={template.forks}
      >
        {forks}
      </PromptDetail>
      <PageDetail label={t('Policy enforcement')} isEmpty={!template.opa_query_path}>
        {template.opa_query_path}
      </PageDetail>
      <PromptDetail
        label={t('Limit')}
        isEmpty={!limit}
        isOverridden={limit !== template.limit}
        overriddenValue={template.limit}
      >
        {limit}
      </PromptDetail>
      <PromptDetail
        label={t('Verbosity')}
        isEmpty={!verbosity}
        isOverridden={verbosity !== template.verbosity}
        overriddenValue={templateVerbosityString}
      >
        {verbosityString}
      </PromptDetail>
      <PromptDetail
        label={t('Show changes')}
        isEmpty={!diffMode}
        isOverridden={diffMode !== template.diff_mode}
        overriddenValue={template.diff_mode ? t`On` : t`Off`}
      >
        {diffMode ? t`On` : t`Off`}
      </PromptDetail>
      <PromptDetail
        label={t('Job slicing')}
        isEmpty={!jobSliceCount}
        isOverridden={jobSliceCount !== template.job_slice_count}
        overriddenValue={template.job_slice_count}
      >
        {jobSliceCount}
      </PromptDetail>
      <PromptDetail
        label={t('Timeout')}
        isEmpty={!timeout}
        isOverridden={timeout !== template.timeout}
        overriddenValue={templateTimeoutString}
      >
        {timeoutString}
      </PromptDetail>
      <PageDetail label={t('Webhook service')} isEmpty={!template.webhook_service}>
        <WebhookService service={template.webhook_service} />
      </PageDetail>
      <PageDetail label={t('Webhook key')} isEmpty={!webhookKey?.webhook_key}>
        {webhookKey?.webhook_key}
      </PageDetail>
      <PageDetail label={t('Webhook url')} isEmpty={!webhookKey?.webhook_key}>
        {`${window.location.origin}${template.related.webhook_receiver}`}
      </PageDetail>
      <PageDetail
        label={t('Enabled options')}
        isEmpty={!(template.allow_simultaneous || template.webhook_service)}
      >
        <Content component={ContentVariants.ul}>
          {template.allow_simultaneous && (
            <Content component={ContentVariants.li}>{t`Concurrent jobs`}</Content>
          )}
          {template.webhook_service && (
            <Content component={ContentVariants.li}>{t`Webhooks`}</Content>
          )}
        </Content>
      </PageDetail>
      <NodeTagDetail
        label={t('Labels')}
        nodeTags={labels ?? []}
        templateTags={template.summary_fields.labels?.results}
      />
      <NodeTagDetail
        label={t('Job tags')}
        nodeTags={jobTags}
        templateTags={parseStringToTagArray(template.job_tags || '')}
      />
      <NodeTagDetail
        label={t('Skip tags')}
        nodeTags={skipTags}
        templateTags={parseStringToTagArray(template.skip_tags || '')}
      />
      <NodeCodeEditorDetail
        label={t('Variables')}
        nodeExtraVars={variables}
        templateExtraVars={template.extra_vars}
      />
    </>
  );
}

function CredentialsDetail({
  credentials = [],
  templateCredentials = [],
}: Readonly<{
  credentials: PromptFormValues['credentials'];
  templateCredentials: Credential[];
}>) {
  const { t } = useTranslation();
  const isMatch = arrayIdsMatch(
    credentials.map(({ id }) => ({ id })),
    templateCredentials
  );

  return (
    <PromptDetail
      label={t`Credentials`}
      isEmpty={credentials?.length === 0}
      isOverridden={!isMatch}
      overriddenValue={templateCredentials.map((ig) => ig.name).join(', ')}
    >
      <LabelGroup>
        {credentials?.map((credential) => (
          <CredentialLabel credential={credential as Credential} key={credential.id} />
        ))}
      </LabelGroup>
    </PromptDetail>
  );
}

function InstanceGroupsDetail({
  instanceGroups = [],
  templateInstanceGroups = [],
}: Readonly<{
  instanceGroups: InstanceGroup[];
  templateInstanceGroups: InstanceGroup[];
}>) {
  const { t } = useTranslation();
  const isMatch = arrayIdsMatch(
    instanceGroups.map(({ id }) => ({
      id,
    })),
    templateInstanceGroups
  );
  const getPageUrl = useGetPageUrl();
  return (
    <PromptDetail
      label={t`Instance groups`}
      isEmpty={instanceGroups?.length === 0}
      isOverridden={!isMatch}
      overriddenValue={templateInstanceGroups.map((ig) => ig.name).join(', ')}
    >
      <LabelGroup>
        {instanceGroups?.map((ig) => (
          <Label
            color="blue"
            key={ig.id}
            isClickable
            render={({ content, className }) => (
              <Link
                className={className}
                to={getPageUrl(AwxRoute.InstanceGroupDetails, {
                  params: {
                    id: ig.id,
                  },
                })}
              >
                {content}
              </Link>
            )}
          >
            {ig.name}
          </Label>
        ))}
      </LabelGroup>
    </PromptDetail>
  );
}
