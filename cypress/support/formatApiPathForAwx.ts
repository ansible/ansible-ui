/**
 * This formatApiPathforAwx file allows access to the awxAPI util for building
 * API endpoints within Cypress.
 * The main difference from frontend/awx/api/awx-utils.tsx is that this file
 * references a Cypress env variable for AWX_API_PREFIX instead of a
 * process.env variable
 */

import { apiTag } from '../../frontend/hub/common/api/formatPath';

export function awxAPI(strings: TemplateStringsArray, ...values: string[]) {
  const base = (Cypress.env('AWX_API_PREFIX') as string) || '/api/v2';
  return base + apiTag(strings, ...values);
}
