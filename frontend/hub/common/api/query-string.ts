import { normalizeQueryString } from '../../../common/crud/normalizeQueryString';

const sortKeys = {
  '/pulp/api/v3/': 'ordering',
  '/pulp/api/v3/pulp_container/namespaces/': 'sort',
  '/v1/imports/': 'order_by',
  '/v1/roles/': 'order_by',
  '/_ui/v1/': 'sort',
  '/_ui/v2/': 'order_by',
  '/v3/plugin/ansible/search/collection-versions/': 'order_by',
};

const pageKeys = {
  '/v1/imports/': 'page',
  '/v1/namespaces/': 'page',
  '/v1/roles/': 'page',
  '/_ui/v1/': 'offset',
  '/_ui/v2/': 'page',
};

export function url2keys(url: string): { sortKey: string; pageKey: string } {
  let sortKey = 'sort';
  Object.entries(sortKeys).forEach(([k, v]) => {
    if (url.includes(k)) {
      sortKey = v;
    }
  });

  let pageKey = 'offset';
  Object.entries(pageKeys).forEach(([k, v]) => {
    if (url.includes(k)) {
      pageKey = v;
    }
  });

  return { pageKey, sortKey };
}

export function hubQueryString(url: string, params: Record<string, string | number | boolean>) {
  const { pageKey, sortKey } = url2keys(url);
  const newParams: Record<string, string> = {};
  const limitKey = { page: 'page_size', offset: 'limit' }[pageKey] as string;
  const limit = (params.page_size || params.limit || 10) as number;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Object.entries(params || {}).forEach(([k, v]: [string, any]) => {
    if (['page', 'offset'].includes(k) && pageKey !== k) {
      if (k === 'offset' && pageKey === 'page') {
        v = 1 + ~~(v / limit);
      }
      if (k === 'page' && pageKey === 'offset') {
        v = (v - 1) * limit;
      }
      k = pageKey;
    }

    if (['page_size', 'limit'].includes(k) && limitKey !== k) {
      k = limitKey;
    }

    if (['sort', 'ordering', 'order_by'].includes(k) && sortKey !== k) {
      k = sortKey;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    newParams[k] = encodeURIComponent(v);
  });

  return normalizeQueryString(newParams);
}
