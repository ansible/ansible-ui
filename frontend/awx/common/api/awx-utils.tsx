import { apiTag } from '../../../hub/common/api/formatPath';

export let awxApiPath = process.env.AWX_API_PREFIX || '/api/v2';

export function setAwxApiPath(path: string) {
  awxApiPath = path;
}

export function awxAPI(strings: TemplateStringsArray, ...values: string[]) {
  return awxApiPath + apiTag(strings, ...values);
}
