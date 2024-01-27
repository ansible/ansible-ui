export function apiTag(strings: TemplateStringsArray, ...values: string[]) {
  if (strings[0]?.[0] !== '/') {
    throw new Error('Invalid URL - must start with a slash');
  }

  let url = '';
  strings.forEach((fragment, index) => {
    url += fragment;
    if (index !== strings.length - 1) {
      url += encodeURIComponent(`${values.shift() ?? ''}`);
    }
  });

  if (url.includes('//')) {
    throw new Error('Invalid URL - must not contain a double slash');
  }

  if (!url.includes('/?') && !url.endsWith('/')) {
    throw new Error(
      url.includes('?')
        ? 'Invalid URL - missing slash before "?"'
        : 'Invalid URL - must end with a slash'
    );
  }

  if (url.indexOf('?') !== url.lastIndexOf('?')) {
    throw new Error('Invalid URL - multiple "?"');
  }

  return url;
}

const base = process.env.HUB_API_PREFIX;
if (base.endsWith('/')) {
  throw new Error('Invalid HUB_API_PREFIX - must NOT end with a slash');
}

export function hubAPI(strings: TemplateStringsArray, ...values: string[]) {
  return base + apiTag(strings, ...values);
}

export function pulpAPI(strings: TemplateStringsArray, ...values: string[]) {
  return base + '/pulp/api/v3' + apiTag(strings, ...values);
}
