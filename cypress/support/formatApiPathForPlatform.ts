/**
 * This formatApiPathforPlatform file allows access to the gatewayAPI util for building
 * API endpoints within Cypress.
 */

import { apiTag } from '@ansible/hub-ui/common/api/formatPath';

export function gatewayAPI(strings: TemplateStringsArray, ...values: string[]) {
  return '/api/gateway/v1' + apiTag(strings, ...values);
}
