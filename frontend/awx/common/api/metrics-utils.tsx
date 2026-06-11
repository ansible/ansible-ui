import { apiTag } from '@ansible/hub-ui/common/api/formatPath';

export const metricsApiPath = process.env.METRICS_API_PREFIX || '/api/metrics/v1';

export function metricsAPI(strings: TemplateStringsArray, ...values: (string | number)[]) {
  return metricsApiPath + apiTag(strings, ...values);
}
