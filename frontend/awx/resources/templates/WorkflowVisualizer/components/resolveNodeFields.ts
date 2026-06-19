import type { ExecutionEnvironment } from '../../../../interfaces/ExecutionEnvironment';
import { jsonToYaml } from '@ansible/ansible-ui-framework/utils/codeEditorUtils';
import { parseStringToTagArray } from '../../JobTemplateFormHelpers';
import type { PromptFormValues } from '../types';

export function resolveScalar<T>(
  promptValue: T | undefined | null,
  nodeValue: T | undefined | null,
  templateValue: T,
  isTemplateChanged: boolean
): T {
  if (promptValue !== undefined && promptValue !== null) return promptValue;
  if (!isTemplateChanged && nodeValue !== undefined && nodeValue !== null) return nodeValue;
  return templateValue;
}

export function resolveArrayField<T>(
  promptValue: T[] | undefined,
  acceptsOnLaunch: boolean | undefined,
  nodeResults: T[] | undefined,
  templateResults: T[] | undefined,
  isTemplateChanged: boolean
): T[] | undefined {
  if (promptValue !== undefined && (promptValue.length > 0 || acceptsOnLaunch)) {
    return promptValue;
  }
  if (isTemplateChanged) {
    return templateResults;
  }
  return (nodeResults?.length ? nodeResults : undefined) ?? templateResults;
}

export function resolveExecutionEnvironment(
  promptEE: PromptFormValues['execution_environment'] | undefined,
  fetchedEE: ExecutionEnvironment | undefined,
  nodeEE: ExecutionEnvironment | undefined,
  templateEE: ExecutionEnvironment | undefined,
  isTemplateChanged: boolean
): ExecutionEnvironment | undefined {
  if (promptEE && fetchedEE) return fetchedEE;
  if (isTemplateChanged) return templateEE;
  return nodeEE ?? templateEE;
}

export function resolveTagField(
  promptTags: { name: string }[] | undefined,
  acceptsOnLaunch: boolean | undefined,
  nodeTagString: string | null | undefined,
  templateTagString: string,
  isTemplateChanged: boolean
): { name: string }[] {
  if (promptTags !== undefined && (promptTags.length > 0 || acceptsOnLaunch)) {
    return promptTags;
  }
  if (isTemplateChanged) return parseStringToTagArray(templateTagString);
  return parseStringToTagArray(nodeTagString ?? templateTagString);
}

export function mergeSurveyIntoVariables(
  variables: string | undefined,
  surveyValues: Record<string, unknown>
): string {
  const jsonObj: { [key: string]: string } = {};

  if (variables) {
    const lines = variables.split('\n');
    lines.forEach((line) => {
      const [key, value] = line.split(':').map((part) => part.trim());
      jsonObj[key] = value;
    });
  }

  const mergedData = {
    ...jsonObj,
    ...surveyValues,
  };

  return jsonToYaml(JSON.stringify(mergedData));
}

export function arrayIdsMatch(arr1: { id: number }[], arr2: { id: number }[]): boolean {
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
