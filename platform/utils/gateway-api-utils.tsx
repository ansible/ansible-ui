import { apiTag } from '../../frontend/hub/common/api/formatPath';

export function gatewayAPI(strings: TemplateStringsArray, ...values: string[]) {
  return '/api/gateway/v1' + apiTag(strings, ...values);
}
