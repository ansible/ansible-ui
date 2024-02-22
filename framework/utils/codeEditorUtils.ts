import jsyaml from 'js-yaml';

export function jsonToYaml(jsonString: string) {
  if (jsonString.trim() === '') {
    return '';
  }
  const value = JSON.parse(jsonString) as object;
  if (Object.entries(value).length === 0) {
    return '';
  }
  return jsyaml.dump(value);
}
