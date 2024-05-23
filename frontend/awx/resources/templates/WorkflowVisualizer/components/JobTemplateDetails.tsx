import { useTranslation } from 'react-i18next';
import {
  Label,
  LabelGroup,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
} from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import { PageDetail, useGetPageUrl, TextCell } from '../../../../../../framework';
import { useGet } from '../../../../../common/crud/useGet';
import { JobTemplate } from '../../../../interfaces/JobTemplate';
import { AwxRoute } from '../../../../main/AwxRoutes';
import { jsonToYaml } from '../../../../../../framework/utils/codeEditorUtils';
import { AwxItemsResponse } from '../../../../common/AwxItemsResponse';
import { useVerbosityString } from '../../../../common/useVerbosityString';
import { CredentialLabel } from '../../../../common/CredentialLabel';
import { Credential } from '../../../../interfaces/Credential';
import { InstanceGroup } from '../../../../interfaces/InstanceGroup';
import { Label as ILabel } from '../../../../interfaces/Label';
import { parseStringToTagArray } from '../../JobTemplateFormHelpers';
import { GraphNodeData, PromptFormValues } from '../types';
import { useGetTimeoutString } from '../hooks';
import { NodeCodeEditorDetail } from './NodeCodeEditorDetail';
import { NodeTagDetail } from './NodeTagDetail';
import { PromptDetail } from './PromptDetail';
import { WebhookService } from '../../components/WebhookService';

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

  const credentials =
    promptValues?.credentials ?? nodeCredentials?.results ?? templateCredentials?.results;
  const diffMode = promptValues?.diff_mode ?? nodeValues?.diff_mode ?? template.diff_mode;
  const executionEnvironment =
    promptValues?.execution_environment ??
    nodeValues?.summary_fields?.execution_environment ??
    template.summary_fields.execution_environment;
  const forks = Number(promptValues?.forks ?? nodeValues?.forks ?? template.forks);
  const instanceGroups =
    promptValues?.instance_groups ?? nodeInstanceGroups?.results ?? templateInstanceGroups?.results;
  const inventory =
    promptValues?.inventory ??
    nodeValues.summary_fields.inventory ??
    template.summary_fields.inventory;
  const jobSliceCount =
    promptValues?.job_slice_count ?? nodeValues?.job_slice_count ?? template.job_slice_count;
  const jobTags =
    promptValues?.job_tags ?? parseStringToTagArray(nodeValues?.job_tags || template.job_tags);
  const jobType = promptValues?.job_type ?? nodeValues?.job_type ?? template.job_type;
  const labels =
    promptValues?.labels ?? nodeLabels?.results ?? template.summary_fields.labels?.results;
  const limit = promptValues?.limit ?? nodeValues?.limit ?? template.limit;
  const scmBranch = promptValues?.scm_branch ?? nodeValues?.scm_branch ?? template.scm_branch;
  const skipTags =
    promptValues?.skip_tags ?? parseStringToTagArray(nodeValues?.skip_tags || template.skip_tags);
  const timeout = Number(promptValues?.timeout ?? nodeValues?.timeout ?? template.timeout);
  const timeoutString = useGetTimeoutString(timeout);
  const templateTimeoutString = useGetTimeoutString(template.timeout);
  const verbosity = promptValues?.verbosity ?? nodeValues?.verbosity ?? template.verbosity;
  const verbosityString = useVerbosityString(verbosity);
  const templateVerbosityString = useVerbosityString(template.verbosity);
  let variables =
    promptValues?.extra_vars ??
    (nodeValues?.extra_data ? jsonToYaml(JSON.stringify(nodeValues.extra_data)) : undefined) ??
    template.extra_vars;

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
}: {
  node: GraphNodeData;
  template: JobTemplate;
}) {
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
        overriddenValue={template.summary_fields.inventory?.name}
        isEmpty={!inventory}
      >
        <TextCell
          text={inventory?.name}
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
            params: { id: executionEnvironment?.id },
          })}
        />
      </PromptDetail>
      <CredentialsDetail
        credentials={credentials}
        templateCredentials={templateCredentials?.results ?? []}
      />
      <InstanceGroupsDetail
        instanceGroups={instanceGroups}
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
        <TextList component={TextListVariants.ul}>
          {template.allow_simultaneous && (
            <TextListItem component={TextListItemVariants.li}>{t`Concurrent jobs`}</TextListItem>
          )}
          {template.webhook_service && (
            <TextListItem component={TextListItemVariants.li}>{t`Webhooks`}</TextListItem>
          )}
        </TextList>
      </PageDetail>
      <NodeTagDetail
        label={t('Labels')}
        nodeTags={labels}
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
}: {
  credentials: Credential[] | PromptFormValues['credentials'];
  templateCredentials: Credential[];
}) {
  const { t } = useTranslation();
  const isMatch = arrayIdsMatch(credentials, templateCredentials);

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
}: {
  instanceGroups: InstanceGroup[] | { id: number; name: string }[];
  templateInstanceGroups: InstanceGroup[];
}) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const isMatch = arrayIdsMatch(instanceGroups, templateInstanceGroups);

  return (
    <PromptDetail
      label={t`Instance groups`}
      isEmpty={instanceGroups?.length === 0}
      isOverridden={!isMatch}
      overriddenValue={templateInstanceGroups.map((ig) => ig.name).join(', ')}
    >
      <LabelGroup>
        {instanceGroups?.map((ig) => (
          <Label color="blue" key={ig.id}>
            <Link
              to={getPageUrl(AwxRoute.InstanceGroupDetails, {
                params: {
                  id: ig.id,
                  instanceType:
                    'is_container_group' in ig && ig.is_container_group
                      ? 'container-group'
                      : 'instance-group',
                },
              })}
            >
              {ig.name}
            </Link>
          </Label>
        ))}
      </LabelGroup>
    </PromptDetail>
  );
}

function arrayIdsMatch(arr1: { id: number }[], arr2: { id: number }[]) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  const idSet1 = new Set(arr1.map((obj) => obj.id));
  const idSet2 = new Set(arr2.map((obj) => obj.id));

  if (idSet1.size !== idSet2.size) {
    return false;
  }
  for (const item of idSet1) {
    if (!idSet2.has(item)) {
      return false;
    }
  }
  return true;
}
