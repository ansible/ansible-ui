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

  cy.log('LABELS: ', labels);
  cy.log('ENV LABELS: ', envLabels);
  cy.log('Include LABELS: ', includeLabels);
  cy.log('Exclude LABELS: ', excludeLabels);

  // Test to see if the test should be skipped based on exluded labels
  for (const label of labels) {
    // If the label is excluded, skip the test
    if (excludeLabels.includes(label)) {
      return;
    }
  }

  // Test to see if the test should be skipped based on included labels
  // If there are no include labels, all tests are included unless they are excluded
  if (includeLabels.length > 0) {
    let include = false;
    for (const label of labels) {
      if (includeLabels.includes(label)) {
        include = true;
        break;
      }
    }

    if (!include) {
      return;
    }
  }

  runTest();
}
