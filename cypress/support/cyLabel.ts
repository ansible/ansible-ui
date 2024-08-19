/* eslint-disable no-console */
/// <reference types="cypress" />

/**
 * This function is used to filter tests based on the LABELS environment variable.
 *
 * @example
 *   LABELS=smoke npm run e2e:run:awx
 *   LABELS='!flaky' npm run e2e:run:awx
 */
export function cyLabel(testLabels: string[], runTest: () => unknown) {
  const cypressEnvLabel = Cypress.env('LABELS') as unknown;
  const envLabel = typeof cypressEnvLabel === 'string' ? cypressEnvLabel : '';
  const envLabels = envLabel
    .split(',')
    .map((envLabel) => envLabel.trim())
    .filter((envLabel) => !!envLabel);

  // Include Labels - If there are no include labels, all tests are included unless they are excluded
  const includeEnvLabels = envLabels.filter((envLabel) => !envLabel.startsWith('!'));

  // Exclude Labels
  const excludeEnvLabels = envLabels
    .filter((envLabel) => envLabel.startsWith('!'))
    .map((envLabel) => envLabel.substring(1));

  // Test to see if the test should be skipped based on excluded labels
  for (const testLabel of testLabels) {
    // If the label is excluded, skip the test
    if (excludeEnvLabels.includes(testLabel)) {
      return;
    }
  }

  // Test to see if the test should be skipped based on included labels
  // If there are no include labels, all tests are included unless they are excluded
  if (includeEnvLabels.length > 0) {
    let include = false;
    for (const testLabel of testLabels) {
      if (includeEnvLabels.includes(testLabel)) {
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
