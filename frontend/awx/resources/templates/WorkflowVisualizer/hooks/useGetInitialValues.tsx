import { jsonToYaml } from '@ansible/ansible-ui-framework/utils/codeEditorUtils';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { useCallback } from 'react';
import {
  getAggregateCredentials,
  type AggregateCredential,
} from '../wizard/getAggregateCredentials';
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

      // Always fetch node-level resources for saved nodes, regardless of whether the current
      // template's ask_*_on_launch flags are set. The node may have credentials, labels, or
      // instance groups from a previous template that accepted them. Tracking them here in
      // original.* ensures they can be properly cleaned up when switching to a template that
      // does not accept them — otherwise processCredentials/Labels/InstanceGroups find nothing
      // to remove and the PATCH fails with "Field is not configured to prompt on launch."
      const nodeCredentials = isNewNode ? [] : await getCredentialData(nodeId);
      const nodeLabels = isNewNode ? [] : await getLabelData(nodeId);
      const nodeInstanceGroups = isNewNode ? [] : await getInstanceGroupData(nodeId);

      // For scalar prompt fields, ALWAYS read from resource (API data), not launch_data.
      // launch_data becomes stale after save/refresh and causes cleared fields to revert
      // to template defaults. For relationship fields (credentials, labels, instance_groups),
      // use launch_data since resource doesn't contain them (they're fetched separately).
      const prompt = nodeData?.launch_data;
      const defaults = nodeData?.resource;
      const original = {
        credentials: nodeCredentials,
        instance_groups: nodeInstanceGroups,
        labels: nodeLabels,
      };

      // Process template credentials
      const UJT = defaults?.summary_fields?.unified_job_template;
      let aggregateCredentials: AggregateCredential[] | undefined;
      let templateCredentials: Credential[] = [];
      if (UJT?.id && UJT?.unified_job_type === RESOURCE_TYPE.job) {
        templateCredentials = await getTemplateCredentialData(UJT.id.toString());
        aggregateCredentials = getAggregateCredentials(
          nodeCredentials,
          prompt?.credentials,
          templateCredentials
        );
      }

      // Process survey data
      let extraVarsWithoutSurvey = { ...(defaults?.extra_data || {}) };
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

      // Build node prompts values
      const nodePromptsValues = {
        credentials: (aggregateCredentials ??
          (nodeCredentials || [])) as PromptFormValues['credentials'],
        // For saved nodes with resource data, prefer resource (fresh API data) over launch_data
        // (stale local state). For new nodes where resource fields are undefined, fall back
        // to launch_data (wizard local state).
        diff_mode:
          defaults?.diff_mode !== undefined
            ? (defaults.diff_mode ?? false)
            : (prompt?.diff_mode ?? false),
        execution_environment:
          prompt?.execution_environment ?? (defaults?.execution_environment || undefined),
        extra_vars: prompt?.extra_vars ?? jsonToYaml(JSON.stringify(extraVarsWithoutSurvey)),
        forks: defaults?.forks !== undefined ? (defaults.forks ?? 0) : (prompt?.forks ?? 0),
        instance_groups: prompt?.instance_groups ?? (nodeInstanceGroups || []),
        inventory: prompt?.inventory ?? (nodeData?.resource?.summary_fields?.inventory || null),
        job_slice_count:
          defaults?.job_slice_count !== undefined
            ? (defaults.job_slice_count ?? 0)
            : (prompt?.job_slice_count ?? 0),
        job_tags:
          defaults?.job_tags !== undefined
            ? parseStringToTagArray(defaults.job_tags ?? '')
            : (prompt?.job_tags ?? parseStringToTagArray('')),
        job_type:
          defaults?.job_type !== undefined
            ? (defaults.job_type ?? 'run')
            : (prompt?.job_type ?? 'run'),
        labels: prompt?.labels ?? (nodeLabels || []),
        limit: defaults?.limit !== undefined ? (defaults.limit ?? '') : (prompt?.limit ?? ''),
        scm_branch:
          defaults?.scm_branch !== undefined
            ? (defaults.scm_branch ?? '')
            : (prompt?.scm_branch ?? ''),
        skip_tags:
          defaults?.skip_tags !== undefined
            ? parseStringToTagArray(defaults.skip_tags ?? '')
            : (prompt?.skip_tags ?? parseStringToTagArray('')),
        timeout: defaults?.timeout !== undefined ? (defaults.timeout ?? 0) : (prompt?.timeout ?? 0),
        verbosity:
          defaults?.verbosity !== undefined ? (defaults.verbosity ?? 0) : (prompt?.verbosity ?? 0),
        launch_config: launch ?? undefined,
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
            credentials: [],
            labels: [],
            instance_groups: [],
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
