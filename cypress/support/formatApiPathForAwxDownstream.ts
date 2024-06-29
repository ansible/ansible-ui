/**
 * This formats the api prefix for Controller resources that change
 * the utilized API when they are created downstream.
 */

import { apiTag } from '../../frontend/hub/common/api/formatPath';

export function awxGWAPI(strings: TemplateStringsArray, ...values: string[]) {
  const base = (Cypress.env('AWX_GW_API_PREFIX') as string) || '/api/v2';
  return base + apiTag(strings, ...values);
}
