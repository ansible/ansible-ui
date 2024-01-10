/**
 * This formatApiPathforEDA file allows access to the edaAPI util for building
 * API endpoints within Cypress.
 * The main difference from frontend/eda/api/eda-utils.tsx is that this file
 * references a Cypress env variable for EDA_API_PREFIX instead of a
 * process.env variable
 */
import { apiTag } from '../../frontend/hub/common/api/formatPath';

export function edaAPI(strings: TemplateStringsArray, ...values: string[]) {
  const base = (Cypress.env('EDA_API_PREFIX') as string) || '/api/eda/v1';
  return base + apiTag(strings, ...values);
}
