/// <reference types="cypress" />

/**
 * This function is used to filter tests based on the LABELS environment variable.
 *
 * @example
 *   LABELS=smoke npm run e2e:run:awx
 *   LABELS='!flaky' npm run e2e:run:awx
 */
export function cyLabel(labels: string[], runTest: () => unknown) {
  const envLabel = (Cypress.env('LABELS') as string) ?? '';
  const envLabels = envLabel.split(',').map((label) => label.trim());

  // Include Labels - If there are no include labels, all tests are included unless they are excluded
  const includeLabels = envLabels.filter((label) => !label.startsWith('!'));

  // Exclude Labels
  const excludeLabels = envLabels
    .filter((label) => label.startsWith('!'))
    .map((label) => label.substring(1));

  // Test labels
  for (const label of labels) {
    // If the label is excluded, skip the test
    if (excludeLabels.includes(label)) {
      return;
    }

    // If there are include labels, skip the test if it is not included
    if (includeLabels.length > 0 && !includeLabels.includes(label)) {
      return;
    }
  }

  runTest();
}
