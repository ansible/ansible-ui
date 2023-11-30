import { apiTag } from '../../frontend/hub/api/formatPath';

export function edaAPI(strings: TemplateStringsArray, ...values: string[]) {
  const base = (Cypress.env('EDA_API_PREFIX') as string) || '/api/eda';
  return base + apiTag(strings, ...values);
}
