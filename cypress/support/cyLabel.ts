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
  if (!envLabel) {
    runTest();
    return;
  }

  const envLabels = envLabel.split(',').map((label) => label.trim());
  const includeLabels = envLabels.filter((label) => !label.startsWith('!'));
  const excludeLabels = envLabels
    .filter((label) => label.startsWith('!'))
    .map((label) => label.substring(1));

  for (const label of labels) {
    if (excludeLabels.includes(label)) {
      return;
    }
    if (includeLabels.length > 0 && !includeLabels.includes(label)) {
      return;
    }
  }

  runTest();
}
