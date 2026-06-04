import { parseStringToTagArray } from '../../JobTemplateFormHelpers';

export function resolveArrayField<T>(
  promptValue: T[] | undefined,
  isPromptable: boolean,
  isTemplateChanged: boolean,
  nodeDbValue: T[] | undefined,
  templateDefault: T[] | undefined
): T[] | undefined {
  if (promptValue !== undefined && (promptValue.length > 0 || isPromptable)) {
    return promptValue;
  }
  if (isTemplateChanged) {
    return templateDefault;
  }
  if (nodeDbValue && nodeDbValue.length > 0) {
    return nodeDbValue;
  }
  return templateDefault;
}

export function resolveScalarField<T>(
  promptValue: T | undefined,
  isTemplateChanged: boolean,
  nodeValue: T | undefined,
  templateDefault: T
): T {
  return promptValue ?? (isTemplateChanged ? undefined : nodeValue) ?? templateDefault;
}

export function resolveTagField(
  promptTags: { name: string }[] | undefined,
  isPromptable: boolean,
  isTemplateChanged: boolean,
  nodeTagString: string | null | undefined,
  templateTagString: string
): { name: string }[] {
  if (promptTags !== undefined && (promptTags.length > 0 || isPromptable)) {
    return promptTags;
  }
  if (isTemplateChanged) {
    return parseStringToTagArray(templateTagString);
  }
  return parseStringToTagArray((nodeTagString ?? templateTagString) || '');
}
