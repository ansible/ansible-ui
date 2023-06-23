function apiTag(strings: TemplateStringsArray, ...values: string[]) {
  if (strings[0]?.[0] !== '/') {
    throw 'Invalid URL';
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
  return process.env.HUB_API_BASE_PATH + apiTag(strings, ...values);
}

export function pulpAPI(strings: TemplateStringsArray, ...values: string[]) {
  return process.env.HUB_API_BASE_PATH + '/pulp/api/v3' + apiTag(strings, ...values);
}

export type QueryParams = {
  [key: string]: string;
};

export function getQueryString(queryParams: QueryParams) {
  return Object.entries(queryParams)
    .map(([key, value = '']) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

const UUIDRegEx = /\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/i;

export function parsePulpIDFromURL(url: string): string {
  for (const section of url.split('/')) {
    if (section.match(UUIDRegEx)) {
      return section;
    }
  }

  return null;
}

export function pulpIdKeyFn(item: { pulp_id: string }) {
  return item.pulp_id;
}

export function pulpHrefKeyFn(item: { pulp_href: string }) {
  return item.pulp_href;
}

export function nameKeyFn(item: { name: string }) {
  return item.name;
}

export function idKeyFn(item: { id: number | string }) {
  return item.id;
}
