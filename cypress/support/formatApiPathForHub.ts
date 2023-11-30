/**
 * This formatApiPathforHub file allows access to the pulpAPI and hubAPI utils for building
 * API endpoints within Cypress.
 * The main difference from frontend/hub/api/formatPath.tsx is that this file
 * references a Cypress env variable for the HUB_API_PREFIX instead of
 * process.env variables
 */

function getBaseAPIPath() {
  return (Cypress.env('HUB_API_PREFIX') as string) || '/api/galaxy';
}

export function apiTag(strings: TemplateStringsArray, ...values: string[]) {
  if (strings[0]?.[0] !== '/') {
    throw new Error('Invalid URL');
  }

  let url = '';
  strings.forEach((fragment, index) => {
    url += fragment;
    if (index !== strings.length - 1) {
      url += encodeURIComponent(`${values.shift() ?? ''}`);
    }
  });

  return url;
}

export function hubAPI(strings: TemplateStringsArray, ...values: string[]) {
  const base = getBaseAPIPath();
  return base + apiTag(strings, ...values);
}

export function pulpAPI(strings: TemplateStringsArray, ...values: string[]) {
  const base = getBaseAPIPath();
  return base + '/pulp/api/v3' + apiTag(strings, ...values);
}
