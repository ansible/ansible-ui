/**
 * This formatApiPathforLightspeed file allows access to the lightspeedAPI util for building
 * API endpoints within Cypress.
 * The main difference from frontend/awx/api/awx-utils.tsx is that this file
 * references a Cypress env variable for LIGHTSPEED_API_PREFIX instead of a
 * process.env variable
 */

import { apiTag } from '@ansible/hub-ui/common/api/formatPath';

export function lightspeedAPI(strings: TemplateStringsArray, ...values: string[]) {
  const base = (Cypress.env('LIGHTSPEED_API_PREFIX') as string) || '/api/lightspeed/v1';
  return base + apiTag(strings, ...values);
}
