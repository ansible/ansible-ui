import jsyaml from 'js-yaml';

export function yamlToJson(yamlString: string) {
  const value: object = jsyaml.load(yamlString) as object;
  if (!value) {
    return '{}';
  }
  if (typeof value !== 'object') {
    throw new Error('yaml is not in object format');
  }
  return JSON.stringify(value, null, 2);
}

export function jsonToYaml(jsonString: string) {
  if (jsonString.trim() === '') {
    return '---\n';
  }
  const value = JSON.parse(jsonString) as object;
  if (Object.entries(value).length === 0) {
    return '---\n';
  }
  return jsyaml.dump(value);
}

export function isJsonObject(value: unknown) {
  return typeof value === 'object' && value !== null;
}

export function isJsonString(jsonString: unknown) {
  if (typeof jsonString !== 'string') {
    return false;
  }
  let value;
  try {
    value = JSON.parse(jsonString) as object;
  } catch (e) {
    return false;
  }

  return typeof value === 'object' && value !== null;
}

export function parseVariableField(variableField: string) {
  if (variableField === '---' || variableField === '{}') {
    return {};
  }
  if (!isJsonString(variableField)) {
    variableField = yamlToJson(variableField);
  }

  return JSON.parse(variableField) as object;
}
