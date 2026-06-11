import { apiTag } from '@ansible/hub-ui/common/api/formatPath';

export function gatewayAPI(strings: TemplateStringsArray, ...values: (string | number)[]) {
  return '/api/gateway/v1' + apiTag(strings, ...values);
}
