/// <reference types="Cypress" />

/**
 * This function is used to filter tests based on the TAGS environment variable.
 *
 * @example
 *   TAGS=smoke npm run e2e:run:awx
 *   TAGS='!flaky' npm run e2e:run:awx
 *   Tag to exclude tests for an AAAS (Ansible as a Service) test run: 'aaas-unsupported'
 */
export function tag(definedTags: string[], runTest: () => unknown) {
  if (Cypress.env('TAGS')) {
    const tagsEnv = Cypress.env('TAGS') as unknown;
    if (typeof tagsEnv !== 'string') return;
    const tags = tagsEnv.split(',').map((tag) => tag.trim());
    const isFound = definedTags.some((definedTag) => {
      if (definedTag.startsWith('!')) {
        return !tags.includes(definedTag.substring(1));
      }
      return tags.includes(definedTag);
    });
    if (isFound) {
      runTest();
    }
  }
}
