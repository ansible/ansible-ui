import { jsonToYaml } from '@ansible/ansible-ui-framework/utils/codeEditorUtils';

export function resolveExtraVars(
  promptExtraVars: string | undefined,
  askVariablesOnLaunch: boolean,
  isTemplateChanged: boolean,
  nodeExtraData: Record<string, unknown> | undefined,
  templateExtraVars: string
): string {
  if (promptExtraVars !== undefined && (promptExtraVars !== '' || askVariablesOnLaunch)) {
    return promptExtraVars;
  }
  if (isTemplateChanged) {
    return templateExtraVars;
  }
  if (nodeExtraData && Object.keys(nodeExtraData).length > 0) {
    return jsonToYaml(JSON.stringify(nodeExtraData));
  }
  return templateExtraVars;
}
