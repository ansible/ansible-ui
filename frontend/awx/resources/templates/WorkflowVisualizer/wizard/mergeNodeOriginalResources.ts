import type { WorkflowNode } from '../../../../interfaces/WorkflowNode';
import type { PromptFormValues } from '../types';

function hasOwnProperty(value: object, property: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(value, property);
}

export function mergeNodeOriginalResources(
  current: PromptFormValues['original'] | undefined,
  latest: PromptFormValues['original'] | undefined,
  resource: WorkflowNode
): PromptFormValues['original'] | undefined {
  if (!current && !latest) {
    return undefined;
  }

  const merged = { ...(current ?? latest) };

  // The current wizard values contain freshly fetched associations. Only the
  // fields reconciled by the save hook may come from the live graph snapshot.
  if (latest && hasOwnProperty(latest, 'extra_data')) {
    merged.extra_data = latest.extra_data;
  }
  if (latest && hasOwnProperty(latest, 'template_id')) {
    merged.template_id = latest.template_id;
  }

  const currentTemplateId = resource.summary_fields?.unified_job_template?.id;
  const originalTemplateId = merged.template_id ?? currentTemplateId;
  if (
    merged.isTemplateChange &&
    currentTemplateId !== undefined &&
    originalTemplateId === currentTemplateId
  ) {
    delete merged.isTemplateChange;
  }

  return merged;
}
