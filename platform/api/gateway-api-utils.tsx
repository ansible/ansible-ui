import { apiTag } from '../../frontend/hub/common/api/formatPath';

export function gatewayAPI(strings: TemplateStringsArray, ...values: string[]) {
  const base = process.env.GATEWAY_API_PREFIX ?? '/api/gateway';
  return base + apiTag(strings, ...values);
}

export function gatewayV1API(strings: TemplateStringsArray, ...values: string[]) {
  const base = process.env.GATEWAY_API_PREFIX ?? '/api/gateway/v1';
  return base + apiTag(strings, ...values);
}
