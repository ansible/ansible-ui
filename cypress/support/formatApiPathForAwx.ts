import { apiTag } from '../../frontend/hub/api/formatPath';

export function awxAPI(strings: TemplateStringsArray, ...values: string[]) {
  const base = (Cypress.env('AWX_API_PREFIX') as string) || '/api/v2';
  return base + apiTag(strings, ...values);
}
