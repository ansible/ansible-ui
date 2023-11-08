function getBaseAPIPath() {
  return process.env.HUB_API_PREFIX;
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
