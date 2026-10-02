import { jsonToYaml } from '@ansible/ansible-ui-framework/utils/codeEditorUtils';

export function resolveExtraVars(
  promptExtraVars: string | undefined,
  askVariablesOnLaunch: boolean | undefined,
  nodeExtraData: Record<string, unknown> | undefined,
  templateExtraVars: string,
  isTemplateChanged: boolean
): string | undefined {
  if (promptExtraVars !== undefined && (promptExtraVars !== '' || askVariablesOnLaunch)) {
    return promptExtraVars;
  }
  if (isTemplateChanged) return templateExtraVars;
  if (nodeExtraData && Object.keys(nodeExtraData).length > 0) {
    return jsonToYaml(JSON.stringify(nodeExtraData));
  }
  return templateExtraVars;
}
