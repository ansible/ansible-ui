import { useCallback } from 'react';
import { awxAPI } from '../../../../common/api/awx-utils';
import { stringIsUUID } from '../../../../common/util/strings';
import { requestGet } from '../../../../../common/crud/Data';
import { AwxItemsResponse } from '../../../../common/AwxItemsResponse';
import { parseStringToTagArray } from '../../JobTemplateFormHelpers';
import type { Credential } from '../../../../interfaces/Credential';
import type { InstanceGroup } from '../../../../interfaces/InstanceGroup';
import type { Label } from '../../../../interfaces/Label';
import type { LaunchConfiguration } from '../../../../interfaces/LaunchConfiguration';
import {
  EdgeStatus,
  GraphNode,
  PromptFormValues,
  WizardFormValues,
  UnifiedJobType,
} from '../types';
import { getConvergenceType, getValueBasedOnJobType } from '../wizard/helpers';
import { shouldHideOtherStep } from '../../../../common/SharedWizard/helpers';
import { jsonToYaml } from '../../../../../../framework/utils/codeEditorUtils';
import { RESOURCE_TYPE } from '../constants';

interface WizardStepState {
  resourceSelectionStep?: Partial<WizardFormValues>;
  nodePromptsStep?: { prompt: Partial<PromptFormValues> };
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
      resource_type: nodeType || defaultMapper.resource_type,
    };
  }, []);
}

type CommonNodeValues = Omit<WizardFormValues, 'prompt' | 'launch_config'>;
const defaultMapper: CommonNodeValues = {
  approval_description: '',
  approval_name: '',
  approval_timeout: 0,
  node_alias: '',
  node_convergence: 'any',
  node_days_to_keep: 30,
  resource: null,
  resource_type: RESOURCE_TYPE.job,
  node_status_type: EdgeStatus.info,
};

export function useGetInitialValues(): (node: GraphNode) => Promise<WizardStepState> {
  const nodeTypeStepDefaults = useNodeTypeStepDefaults();
  return useCallback(
    async (node: GraphNode): Promise<WizardStepState> => {
      const resourceSelectionStep = nodeTypeStepDefaults(node);
      const nodeData = node.getData();
      const nodeId = node.getId();
      const isNewNode = nodeId.includes('unsavedNode');

      const launch = await getLaunchData(node);
      const hidePromptStep = launch ? shouldHideOtherStep(launch) : true;

      if (hidePromptStep) {
        return { resourceSelectionStep };
      }

      const nodeCredentials =
        launch?.ask_credential_on_launch && !isNewNode ? await getCredentialData(nodeId) : [];
      const nodeLabels =
        launch?.ask_labels_on_launch && !isNewNode ? await getLabelData(nodeId) : [];
      const nodeInstanceGroups =
        launch?.ask_instance_groups_on_launch && !isNewNode
          ? await getInstanceGroupData(nodeId)
          : [];

      const prompt = nodeData?.launch_data;
      const defaults = nodeData?.resource;
      const original = {
        credentials: nodeCredentials,
        instance_groups: nodeInstanceGroups,
        labels: nodeLabels,
      };

      let aggregateCredentials;

      const UJT = defaults?.summary_fields?.unified_job_template;
      if (UJT?.id && UJT?.unified_job_type) {
        const templateCredentials = await getTemplateCredentialData(
          UJT.id.toString(),
          UJT.unified_job_type
        );

        aggregateCredentials = getAggregateCredentials(
          nodeCredentials,
          prompt?.credentials,
          templateCredentials
        );
      }

      const nodePromptsValues = {
        credentials: aggregateCredentials ?? (nodeCredentials || []),
        diff_mode: prompt?.diff_mode ?? (defaults?.diff_mode || false),
        execution_environment:
          prompt?.execution_environment ?? (defaults?.execution_environment || null),
        extra_vars: prompt?.extra_vars ?? jsonToYaml(JSON.stringify(defaults?.extra_data)),
        forks: prompt?.forks ?? (defaults?.forks || 0),
        instance_groups: prompt?.instance_groups ?? (nodeInstanceGroups || []),
        inventory: prompt?.inventory ?? (nodeData?.resource?.summary_fields?.inventory || null),
        job_slice_count: prompt?.job_slice_count ?? (defaults?.job_slice_count || 0),
        job_tags: prompt?.job_tags ?? parseStringToTagArray(defaults?.job_tags || ''),
        job_type: prompt?.job_type ?? (defaults?.job_type || 'run'),
        labels: prompt?.labels ?? (nodeLabels || []),
        limit: prompt?.limit ?? (defaults?.limit || ''),
        scm_branch: prompt?.scm_branch ?? (defaults?.scm_branch || ''),
        skip_tags: prompt?.skip_tags ?? parseStringToTagArray(defaults?.skip_tags || ''),
        timeout: prompt?.timeout ?? (defaults?.timeout || 0),
        verbosity: prompt?.verbosity ?? (defaults?.verbosity || 0),
        launch_config: launch,
        original,
      };

      return { resourceSelectionStep, nodePromptsStep: { prompt: nodePromptsValues } };
    },
    [nodeTypeStepDefaults]
  );
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
async function getTemplateCredentialData(templateId: string, templateType: UnifiedJobType) {
  const endpoint =
    templateType === RESOURCE_TYPE.workflow_job
      ? awxAPI`/workflow_job_templates/${templateId}/credentials/`
      : templateType === RESOURCE_TYPE.job
        ? awxAPI`/job_templates/${templateId}/credentials/`
        : '';
  return endpoint ? getRelated<Credential>(endpoint) : [];
}

type AggregateCredential =
  | {
      id: number;
      name: string;
      credential_type: number;
      passwords_needed?: string[];
      vault_id?: string;
    }
  | Credential;
function getAggregateCredentials(
  nodeCredentials: AggregateCredential[] = [],
  promptCredentials: AggregateCredential[] = [],
  templateCredentials: AggregateCredential[] = []
) {
  // Step 1: Get the aggregate credentials from the template and node
  const aggregateCredentialsMap: Record<number, AggregateCredential> = {};
  templateCredentials.forEach((templateCredential) => {
    aggregateCredentialsMap[templateCredential.credential_type] = templateCredential;
  });

  // Step 2: Override template credential with node credential if their types match
  nodeCredentials.forEach((nodeCredential) => {
    const key = nodeCredential.credential_type;
    if (aggregateCredentialsMap[key]?.id !== nodeCredential.id) {
      aggregateCredentialsMap[key] = nodeCredential;
    }
  });

  // Step 3: Override aggregate credential with prompt credential if their types match
  promptCredentials.forEach((promptCredential) => {
    const key = promptCredential.credential_type;
    if (aggregateCredentialsMap[key]?.id !== promptCredential.id) {
      aggregateCredentialsMap[key] = promptCredential;
    }
  });

  return Object.values(aggregateCredentialsMap);
}
