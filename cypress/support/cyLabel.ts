/// <reference types="cypress" />

/**
 * This function is used to filter tests based on the LABELS environment variable.
 *
 * @example
 *   LABELS=smoke npm run e2e:run:awx
 *   LABELS='!flaky' npm run e2e:run:awx
 */
export function cyLabel(labels: string[], runTest: () => unknown) {
  const envLabel = Cypress.env('LABELS') as string;
  if (typeof envLabel === 'string' && envLabel) {
    const envLabels = envLabel.split(',').map((label) => label.trim());
    const isFound = labels.some((label) => {
      if (label.startsWith('!')) {
        return !envLabels.includes(label.substring(1));
      }
      return envLabels.includes(label);
    });
    if (isFound) {
      runTest();
    }
  }
}
