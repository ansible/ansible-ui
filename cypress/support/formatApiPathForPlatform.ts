/**
 * This formatApiPathforPlatform file allows access to the gatewayAPI util for building
 * API endpoints within Cypress.
 * The main difference from platform/api/gateway-api-utils.tsx is that this file
 * references a Cypress env variable for GATEWAY_API_PREFIX instead of a
 * process.env variable
 */

import { apiTag } from '../../frontend/hub/common/api/formatPath';

export function gatewayAPI(strings: TemplateStringsArray, ...values: string[]) {
  const base = (Cypress.env('GATEWAY_API_PREFIX') as string) ?? '/api/gateway';
  return base + apiTag(strings, ...values);
}

export function gatewayV1API(strings: TemplateStringsArray, ...values: string[]) {
  const base = (Cypress.env('GATEWAY_API_PREFIX') as string) ?? '/api/gateway/v1';
  return base + apiTag(strings, ...values);
}
