import { apiTag } from '../../../hub/common/api/formatPath';

export function awxAPI(strings: TemplateStringsArray, ...values: string[]) {
  const base = process.env.AWX_API_PREFIX || '/api/v2';
  return base + apiTag(strings, ...values);
}
