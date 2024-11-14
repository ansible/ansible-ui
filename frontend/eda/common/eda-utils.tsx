import { apiTag } from '@ansible/hub-ui/common/api/formatPath';

export let edaApiPath = process.env.EDA_API_PREFIX;

export function setEdaApiPath(path: string) {
  edaApiPath = path;
}

export function edaAPI(strings: TemplateStringsArray, ...values: string[]) {
  return edaApiPath + apiTag(strings, ...values);
}
