import type { LaunchConfiguration } from '../../../../interfaces/LaunchConfiguration';
import type { WorkflowNode } from '../../../../interfaces/WorkflowNode';
import type { PromptFormValues } from '../types';

const INHERITED_SCALAR_PROMPT_FIELDS = [
  'diff_mode',
  'forks',
  'job_slice_count',
  'job_type',
  'limit',
  'scm_branch',
  'timeout',
  'verbosity',
] as const;

type InheritedScalarPromptField = (typeof INHERITED_SCALAR_PROMPT_FIELDS)[number];

export type ResourcePromptSnapshot = Partial<Pick<WorkflowNode, InheritedScalarPromptField>>;

/**
 * Removes prompt fields that only reflect job-template launch defaults in the UI.
 * When the API stored `null` (no node override), matching template defaults should
 * not be written into launch_data so save keeps inherit semantics.
 */
export function unsetInheritedPromptDefaults(
  effectivePrompt: Partial<PromptFormValues>,
  launchConfig: LaunchConfiguration | null | undefined,
  resourceNode: ResourcePromptSnapshot | null | undefined
): void {
  const defaults = launchConfig?.defaults;
  if (!defaults || !resourceNode) {
    return;
  }

  for (const key of INHERITED_SCALAR_PROMPT_FIELDS) {
    if (resourceNode[key] !== null) {
      continue;
    }
    if (!(key in effectivePrompt)) {
      continue;
    }
    const templateDefault = defaults[key as keyof typeof defaults];
    if (templateDefault === undefined) {
      continue;
    }
    if (effectivePrompt[key] === templateDefault) {
      delete effectivePrompt[key];
    }
  }
}
