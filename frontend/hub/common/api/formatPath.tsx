import { hubQueryString, url2keys } from './query-string';

// used in awx, eda & cypress
export function apiTag(strings: TemplateStringsArray, ...values: string[]) {
  if (strings[0]?.[0] !== '/') {
    throw new Error(`Invalid URL - must start with a slash`);
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

function checkParam(url: string, good: string, bad: string) {
  if (url.includes(`?${bad}=`) || url.includes(`&${bad}=`)) {
    throw new Error(`Invalid param - use "${good}", not "${bad}" (url: ${url})`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hubApiTag(strings: TemplateStringsArray, ...values: any[]) {
  if (strings[0]?.[0] !== '/') {
    throw new Error(`Invalid URL - must start with a slash`);
  }

  let url = '';
  strings.forEach((fragment, index) => {
    url += fragment;
    if (index !== strings.length - 1) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const next = values.shift();
      if (next && typeof next === 'object' && fragment.endsWith('?')) {
        url += hubQueryString(url, next as Record<string, string | number | boolean>).slice(1);
      } else {
        url += encodeURIComponent(`${next ?? ''}`);
      }
    }
  });

  if (url.includes('//')) {
    throw new Error(`Invalid URL - must not contain a double slash (url: ${url})`);
  }

  if (!url.includes('/?') && !url.endsWith('/')) {
    throw new Error(
      url.includes('?')
        ? `Invalid URL - missing slash before "?" (url: ${url})`
        : `Invalid URL - must end with a slash (url: ${url})`
    );
  }

  if (url.indexOf('?') !== url.lastIndexOf('?')) {
    throw new Error(`Invalid URL - multiple "?" (url: ${url})`);
  }

  if (url.includes('?')) {
    const { pageKey, sortKey } = url2keys(url);

    if (pageKey === 'page') {
      checkParam(url, 'page', 'offset');
      checkParam(url, 'page_size', 'limit');
    }

    if (pageKey === 'offset') {
      checkParam(url, 'offset', 'page');
      checkParam(url, 'limit', 'page_size');
    }

    if (sortKey === 'sort') {
      checkParam(url, sortKey, 'ordering');
      checkParam(url, sortKey, 'order_by');
    }

    if (sortKey === 'ordering') {
      checkParam(url, sortKey, 'sort');
      checkParam(url, sortKey, 'order_by');
    }

    if (sortKey === 'order_by') {
      checkParam(url, sortKey, 'sort');
      checkParam(url, sortKey, 'ordering');
    }
  }

  return url;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function hubAPI(strings: TemplateStringsArray, ...values: any[]) {
  const base = process.env.HUB_API_PREFIX;
  if (base.endsWith('/')) {
    throw new Error(`Invalid HUB_API_PREFIX - must NOT end with a slash`);
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return base + hubApiTag(strings, ...values);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function pulpAPI(strings: TemplateStringsArray, ...values: any[]) {
  const base = process.env.HUB_API_PREFIX;
  if (base.endsWith('/')) {
    throw new Error(`Invalid HUB_API_PREFIX - must NOT end with a slash`);
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return base + '/pulp/api/v3' + hubApiTag(strings, ...values);
}
