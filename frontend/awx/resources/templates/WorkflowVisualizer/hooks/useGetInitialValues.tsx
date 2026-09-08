import { jsonToYaml } from '@ansible/ansible-ui-framework/utils/codeEditorUtils';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { useCallback } from 'react';
import { getAggregateCredentials } from '../wizard/getAggregateCredentials';
import { awxAPI } from '../../../../common/api/awx-utils';
import { AwxItemsResponse } from '../../../../common/AwxItemsResponse';
import { stringIsUUID } from '../../../../common/util/strings';
import type { Credential } from '../../../../interfaces/Credential';
import type { InstanceGroup } from '../../../../interfaces/InstanceGroup';
import type { Label } from '../../../../interfaces/Label';
import type { LaunchConfiguration } from '../../../../interfaces/LaunchConfiguration';
import type { Survey } from '../../../../interfaces/Survey';
import type { WorkflowNode } from '../../../../interfaces/WorkflowNode';
import { parseStringToTagArray } from '../../JobTemplateFormHelpers';
import { RESOURCE_TYPE } from '../constants';
import { EdgeStatus, GraphNode, NodeResource, PromptFormValues, WizardFormValues } from '../types';
import { getConvergenceType, getValueBasedOnJobType, shouldHideOtherStep } from '../wizard/helpers';
import { resolvePromptField } from './resolvePromptField';

/**
 * Resolves job_tags or skip_tags with prompt-first precedence.
 * Prompt-first: prefer defined prompt (including empty array), fall back to parsing resource.
 *
 * The parseStringToTagArray output type includes label and value, while the prompt type
 * only has name. We return parseStringToTagArray's type since that's what the form expects.
 */
function resolveTagField(
  promptTags: { name: string }[] | undefined,
  resourceTags: string | null | undefined
): Array<{ name: string; label: string; value: string }> {
  if (promptTags !== undefined) {
    // Convert prompt format to full tag array format
    return promptTags.map((tag) => ({ name: tag.name, label: tag.name, value: tag.name }));
  }
  if (resourceTags !== undefined) {
    return parseStringToTagArray(resourceTags ?? '');
  }
  return parseStringToTagArray('');
}

interface WizardStepState {
  nodeTypeStep: Partial<WizardFormValues>;
  nodePromptsStep?: { prompt: Partial<PromptFormValues> };
  survey?: { survey: unknown };
}

export function useNodeTypeStepDefaults(): (node?: GraphNode) => CommonNodeValues {
  return useCallback((node?: GraphNode) => {
    if (!node) {
      return defaultMapper;
    }

    const nodeData = node?.getData();
    const { resource } = nodeData || {};
    const nodeUJT = resource?.summary_fields?.unified_job_template;
    const nodeType = nodeUJT?.unified_job_type;
    const nodeIdentifier = stringIsUUID(resource?.identifier || '') ? '' : resource?.identifier;
    const nodeConvergence = getConvergenceType(resource?.all_parents_must_converge);
    const nodeDaysToKeep = resource?.extra_data?.days;
    const approvalTimeout = nodeUJT?.timeout;
    const approvalName = nodeType ? getValueBasedOnJobType(nodeType, '', nodeUJT?.name ?? '') : '';
    const approvalDescription = nodeType
      ? getValueBasedOnJobType(nodeType, '', nodeUJT?.description ?? '')
      : '';

    return {
      approval_description: approvalDescription ?? defaultMapper.approval_description,
      approval_name: approvalName ?? defaultMapper.approval_name,
      approval_timeout: approvalTimeout ?? defaultMapper.approval_timeout,
      node_alias: nodeIdentifier ?? defaultMapper.node_alias,
      node_convergence: nodeConvergence ?? defaultMapper.node_convergence,
      node_days_to_keep: nodeDaysToKeep ?? defaultMapper.node_days_to_keep,
      resource: nodeUJT ?? defaultMapper.resource,
      resourceId: nodeUJT?.id ?? defaultMapper.resource?.id,
      node_type: nodeType || defaultMapper.node_type,
    };
  }, []);
}

type CommonNodeValues = Omit<WizardFormValues, 'prompt' | 'launch_config' | 'survey'>;
const defaultMapper: CommonNodeValues = {
  approval_description: '',
  approval_name: '',
  approval_timeout: 0,
  node_alias: '',
  node_convergence: 'any',
  node_days_to_keep: 30,
  resource: null,
  resourceId: undefined,
  node_type: RESOURCE_TYPE.job,
  node_status_type: EdgeStatus.info,
};

/**
 * Fetches node-level resources (credentials, labels, instance groups) for saved nodes.
 */
async function fetchNodeResources(nodeId: string, isNewNode: boolean) {
  if (isNewNode) {
    return {
      credentials: [],
      labels: [],
      instanceGroups: [],
    };
  }

  const [credentials, labels, instanceGroups] = await Promise.all([
    getCredentialData(nodeId),
    getLabelData(nodeId),
    getInstanceGroupData(nodeId),
  ]);

  return { credentials, labels, instanceGroups };
}

/**
 * Processes credentials for a job template node.
 */
async function processCredentials(
  ujt: NodeResource | undefined,
  nodeCredentials: Credential[],
  promptCredentials: PromptFormValues['credentials'] | undefined
) {
  if (!ujt?.id || ujt?.unified_job_type !== RESOURCE_TYPE.job) {
    return { templateCredentials: [], aggregateCredentials: undefined };
  }

  const templateCredentials = await getTemplateCredentialData(ujt.id.toString());
  const aggregateCredentials = getAggregateCredentials(
    nodeCredentials,
    promptCredentials,
    templateCredentials
  );

  return { templateCredentials, aggregateCredentials };
}

/**
 * Processes survey data if enabled.
 */
async function processSurveyData(
  launch: LaunchConfiguration | undefined,
  nodeData: ReturnType<GraphNode['getData']>,
  defaultExtraData: WorkflowNode['extra_data']
) {
  let extraVarsWithoutSurvey = { ...defaultExtraData };
  let surveyValues = nodeData?.resource?.extra_data;

  if (launch?.ask_variables_on_launch && launch.survey_enabled) {
    const surveySpec = await getSurveySpec(
      nodeData?.resource?.summary_fields?.unified_job_template
    );
    if (surveySpec?.spec) {
      const { extraVars, surveyData } = extractSurveyDataFromExtraVars(
        extraVarsWithoutSurvey,
        surveySpec
      );
      extraVarsWithoutSurvey = extraVars;
      surveyValues = surveyData;
    }
  }

  return { extraVarsWithoutSurvey, surveyValues };
}

export function useGetInitialValues(): (node: GraphNode) => Promise<WizardStepState> {
  const nodeTypeStepDefaults = useNodeTypeStepDefaults();
  return useCallback(
    async (node: GraphNode): Promise<WizardStepState> => {
      const nodeTypeStep = nodeTypeStepDefaults(node);
      const nodeData = node.getData();
      const nodeId = node.getId();
      const isNewNode = nodeId.includes('unsavedNode');

      const launch = await getLaunchData(node);
      const hidePromptStep = launch ? shouldHideOtherStep(launch) : true;
      const hideSurveyStep = launch?.survey_enabled === false;

      // Fetch node-level resources for saved nodes
      const {
        credentials: nodeCredentials,
        labels: nodeLabels,
        instanceGroups: nodeInstanceGroups,
      } = await fetchNodeResources(nodeId, isNewNode);

      const prompt = nodeData?.launch_data;
      const defaults = nodeData?.resource;
      const original = {
        credentials: nodeCredentials,
        instance_groups: nodeInstanceGroups,
        labels: nodeLabels,
      };

      // Process credentials for job templates
      const { templateCredentials, aggregateCredentials } = await processCredentials(
        defaults?.summary_fields?.unified_job_template,
        nodeCredentials,
        prompt?.credentials
      );

      // Process survey data if enabled
      const { extraVarsWithoutSurvey, surveyValues } = await processSurveyData(
        launch,
        nodeData,
        defaults?.extra_data || {}
      );

      const nodePromptsValues = {
        credentials: aggregateCredentials ?? (nodeCredentials || []),
        diff_mode: resolvePromptField(defaults?.diff_mode, prompt?.diff_mode, false),
        execution_environment:
          prompt?.execution_environment ?? (defaults?.execution_environment || undefined),
        extra_vars: prompt?.extra_vars ?? jsonToYaml(JSON.stringify(extraVarsWithoutSurvey)),
        forks: resolvePromptField(defaults?.forks, prompt?.forks, 0),
        instance_groups: prompt?.instance_groups ?? (nodeInstanceGroups || []),
        inventory: prompt?.inventory ?? (nodeData?.resource?.summary_fields?.inventory || null),
        job_slice_count: resolvePromptField(defaults?.job_slice_count, prompt?.job_slice_count, 0),
        job_tags: resolveTagField(prompt?.job_tags, defaults?.job_tags),
        job_type: resolvePromptField(defaults?.job_type, prompt?.job_type, 'run'),
        labels: prompt?.labels ?? (nodeLabels || []),
        limit: resolvePromptField(defaults?.limit, prompt?.limit, ''),
        scm_branch: resolvePromptField(defaults?.scm_branch, prompt?.scm_branch, ''),
        skip_tags: resolveTagField(prompt?.skip_tags, defaults?.skip_tags),
        timeout: resolvePromptField(defaults?.timeout, prompt?.timeout, 0),
        verbosity: resolvePromptField(defaults?.verbosity, prompt?.verbosity, 0),
        launch_config: launch,
        original,
        requiredCredentialTypes: templateCredentials.map((cred) => {
          return {
            id: cred.credential_type,
            name: cred.summary_fields?.credential_type.name,
          };
        }),
      };

      // nodePromptsStep is always included even when the prompt step is hidden.
      // When hidden, a minimal prompt is used so that handleSubmit can access
      // original.credentials/labels/instance_groups for disassociation cleanup when
      // switching to a template that does not accept those fields on launch.
      // Without this, original.* is undefined and processCredentials finds nothing
      // to remove, causing the PATCH to fail with "Field is not configured to prompt
      // on launch" because the node still has associated credentials in the DB.
      const nodePromptsStepPrompt = hidePromptStep
        ? {
            credentials: [] as typeof nodePromptsValues.credentials,
            labels: [] as typeof nodePromptsValues.labels,
            instance_groups: [] as typeof nodePromptsValues.instance_groups,
            original,
          }
        : nodePromptsValues;

      return {
        nodeTypeStep,
        nodePromptsStep: { prompt: nodePromptsStepPrompt },
        ...(hideSurveyStep ? {} : { survey: { survey: nodeData?.survey_data ?? surveyValues } }),
      };
    },
    [nodeTypeStepDefaults]
  );
}

function extractSurveyDataFromExtraVars(extraData: WorkflowNode['extra_data'], survey: Survey) {
  const extraVars: WorkflowNode['extra_data'] = { ...extraData };
  const surveyData: { [key: string]: string | number | undefined } = {};

  survey.spec.forEach((question) => {
    const { variable } = question;
    if (variable in extraData) {
      surveyData[variable] = extraData[variable];
      delete extraVars[variable];
    }
  });

  return { extraVars, surveyData };
}

async function getSurveySpec(template?: NodeResource) {
  if (!template) return;

  if (template.unified_job_type === RESOURCE_TYPE.job) {
    return await requestGet<Survey>(awxAPI`/job_templates/${template.id.toString()}/survey_spec/`);
  }
  if (template.unified_job_type === RESOURCE_TYPE.workflow_job) {
    return await requestGet<Survey>(
      awxAPI`/workflow_job_templates/${template.id.toString()}/survey_spec/`
    );
  }
}

export async function getLaunchData(node: GraphNode) {
  const unifiedJobTemplate = node?.getData()?.resource?.summary_fields?.unified_job_template;
  if (!unifiedJobTemplate) return;

  const { unified_job_type, id } = unifiedJobTemplate;

  if (unified_job_type === RESOURCE_TYPE.workflow_job) {
    return await requestGet<LaunchConfiguration>(
      awxAPI`/workflow_job_templates/${id.toString()}/launch/`
    );
  } else if (unified_job_type === RESOURCE_TYPE.job) {
    return await requestGet<LaunchConfiguration>(awxAPI`/job_templates/${id.toString()}/launch/`);
  }
}

async function getRelated<T>(endpoint: string): Promise<T[]> {
  const itemsResponse = await requestGet<AwxItemsResponse<T>>(endpoint);
  if (itemsResponse.results.length >= 1) {
    return itemsResponse.results;
  }
  return [];
}
async function getCredentialData(nodeId: string) {
  return getRelated<Credential>(awxAPI`/workflow_job_template_nodes/${nodeId}/credentials/`);
}
async function getLabelData(nodeId: string) {
  return getRelated<Label>(awxAPI`/workflow_job_template_nodes/${nodeId}/labels/`);
}
async function getInstanceGroupData(nodeId: string) {
  return getRelated<InstanceGroup>(awxAPI`/workflow_job_template_nodes/${nodeId}/instance_groups/`);
}
async function getTemplateCredentialData(templateId: string) {
  return getRelated<Credential>(awxAPI`/job_templates/${templateId}/credentials/`);
}
