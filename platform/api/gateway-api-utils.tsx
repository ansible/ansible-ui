import { apiTag } from '../../frontend/hub/common/api/formatPath';

export function gatewayAPI(strings: TemplateStringsArray, ...values: string[]) {
  const base = process.env.GATEWAY_API_PREFIX ?? '/api/gateway';
  return base + apiTag(strings, ...values);
}
