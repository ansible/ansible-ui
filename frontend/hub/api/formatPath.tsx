export function getBaseAPIPath() {
  return process.env.HUB_API_PREFIX;
}

export function getAPIHost() {
  return process.env.HUB_SERVER;
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

export function getRepoURL(distribution_base_path: string, view_published = false) {
  // If the api is hosted on another URL, use API_HOST as the host part of the URL.
  // Otherwise use the host that the UI is served from
  const host = getAPIHost() ? getAPIHost() : window.location.origin;

  // repo/distro "published" is special; not related to repo pipeline type
  if (distribution_base_path === 'published' && view_published === false) {
    return `${host}${getBaseAPIPath()}`;
  }

  return `${host}${getBaseAPIPath()}content/${distribution_base_path}/`;
}
