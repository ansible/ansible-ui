import type { LaunchConfiguration } from '../../../../interfaces/LaunchConfiguration';
import type { PromptFormValues } from '../types';

export interface BuildEffectivePromptParams {
  originalTemplateId: number | undefined;
  newResourceId: number | undefined;
  prompt: Partial<PromptFormValues> | undefined;
  launchConfig: LaunchConfiguration | null | undefined;
  nodeOriginalResources: PromptFormValues['original'];
  resourceOrganization: number | null | undefined;
}

function clearUnpromptedFields(
  effectivePrompt: Partial<PromptFormValues>,
  launchConfig: LaunchConfiguration | null | undefined
): void {
  if (!launchConfig?.ask_credential_on_launch) effectivePrompt.credentials = [];
  if (!launchConfig?.ask_labels_on_launch) effectivePrompt.labels = [];
  if (!launchConfig?.ask_instance_groups_on_launch) effectivePrompt.instance_groups = [];
  if (!launchConfig?.ask_skip_tags_on_launch) effectivePrompt.skip_tags = [];
  if (!launchConfig?.ask_tags_on_launch) effectivePrompt.job_tags = [];
  if (!launchConfig?.ask_variables_on_launch) effectivePrompt.extra_vars = '';
}

export function buildEffectivePrompt({
  originalTemplateId,
  newResourceId,
  prompt,
  launchConfig,
  nodeOriginalResources,
  resourceOrganization,
}: Readonly<BuildEffectivePromptParams>): {
  isTemplateChange: boolean;
  effectivePrompt: Partial<PromptFormValues>;
} {
  const isTemplateChange =
    originalTemplateId !== undefined && Number(newResourceId) !== originalTemplateId;

  const effectivePrompt: Partial<PromptFormValues> = prompt ?? {};

  if (resourceOrganization !== undefined) {
    effectivePrompt.organization = resourceOrganization;
  }

  if (isTemplateChange) {
    clearUnpromptedFields(effectivePrompt, launchConfig);
  }

  effectivePrompt.original = {
    ...(launchConfig ? { launch_config: launchConfig } : {}),
    ...nodeOriginalResources,
    ...(isTemplateChange ? { isTemplateChange: true } : {}),
  };

  return { isTemplateChange, effectivePrompt };
}
