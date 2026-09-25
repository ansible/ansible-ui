import { apiTag } from '@ansible/hub-ui/common/api/formatPath';

export { getCopySourceName, hasCopyNamePattern } from '@ansible/common-ui/utils/copyResourceName';

export let edaApiPath = process.env.EDA_API_PREFIX;

export function setEdaApiPath(path: string) {
  edaApiPath = path;
}

export function edaAPI(strings: TemplateStringsArray, ...values: (string | number)[]) {
  return edaApiPath + apiTag(strings, ...values);
}
