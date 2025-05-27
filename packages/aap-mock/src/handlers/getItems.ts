import getValue from 'get-value';
import { klona } from 'klona/json';
import sift from 'sift';
import { MockContext } from '../context/context';
import { MockRequest, RouteHandler } from '../mock-router';
import { dotPath } from '../utils/dot-path';

export function getItems(
  relations?: (item: Record<string, unknown>, data: MockContext['data']) => void
): RouteHandler {
  return (request: MockRequest) => {
    const result = getValue(request.context.data, dotPath(request.url.pathname)) as unknown;
    switch (typeof result) {
      case 'object': {
        if (result === null) break;
        if (!Array.isArray(result)) {
          return {
            status: 200,
            body: result,
          };
        }

        let results = result;
        results = filterItems(results, request.url.searchParams);
        results = sortItems(results, request.url.searchParams);
        results = paginateItems(results, request.url.searchParams);
        if (relations) {
          results = klona(results);
          results.forEach((item) =>
            relations(item as Record<string, unknown>, request.context.data)
          );
        }
        return {
          status: 200,
          body: { count: results.length, next: null, previous: null, results },
        };
      }
    }
    return { status: 404 };
  };
}

export function filterItems(results: unknown[], searchParams: URLSearchParams) {
  let query: Record<string, unknown> = {};
  const orQueries: Record<string, unknown>[] = [];
  for (const [key, value] of searchParams) {
    switch (key) {
      case 'search':
        // query['$text'] = { $search: value };
        break;
      case 'page':
      case 'page_size':
      case 'order_by':
        break;
      default:
        if (key.startsWith('or__')) {
          // example: or__labels__name
          const parts = key.split('__');
          switch (parts.length) {
            case 2: {
              // or__name
              const orQuery: Record<string, unknown> = {};
              if (value.includes(',')) {
                orQuery[key] = { $in: value.split(',') };
              } else {
                orQuery[key] = value;
              }
              orQueries.push(orQuery);
              break;
            }
            case 3: {
              // exmaple: or__labels__name
              // in the above we need to filter the results by the result.summary_fields.labels.name
              const orQuery: Record<string, unknown> = {};
              const relatedField = parts[1];
              const field = parts[2];
              if (relatedField === 'labels') {
                if (value.includes(',')) {
                  orQuery[`summary_fields.${relatedField}.results`] = {
                    $elemMatch: { [field]: { $in: value.split(',') } },
                  };
                } else {
                  orQuery[`summary_fields.${relatedField}.results`] = {
                    $elemMatch: { [field]: value },
                  };
                }
              } else {
                if (value.includes(',')) {
                  orQuery[`summary_fields.${relatedField}`] = {
                    $elemMatch: { [field]: { $in: value.split(',') } },
                  };
                } else {
                  orQuery[`summary_fields.${relatedField}`] = {
                    $elemMatch: { [field]: value },
                  };
                }
              }
              orQueries.push(orQuery);
              break;
            }
          }
        } else {
          const parts = key.split('__');
          switch (parts.length) {
            case 1:
              if (value.includes(',')) {
                query[key] = { $in: value.split(',') };
              } else {
                query[key] = value;
              }
              break;
            case 2: {
              const field = parts[0];
              const operator = parts[1];
              switch (operator) {
                case 'icontains':
                  query[field] = { $regex: value, $options: 'i' };
                  break;
                case 'in':
                  query[field] = { $in: value.split(',') };
                  break;
                default:
                  query[field] = value;
                  break;
              }
            }
          }
        }
        break;
    }
  }

  if (orQueries.length > 0) {
    if (Object.keys(query).length === 0) {
      query = { $or: orQueries };
    } else {
      query = { $and: [query, { $or: orQueries }] };
    }
  }

  // if (Array.from(searchParams.values()).length > 0) {
  //   console.log('searchParams', searchParams);
  //   console.log('query', JSON.stringify(query, undefined, ' '));
  // }

  return results.filter(sift(query));
}

export function sortItems(results: unknown[], searchParams: URLSearchParams) {
  const orderBy = searchParams.get('order_by');
  if (!orderBy) return results;
  const order = orderBy.startsWith('-') ? -1 : 1;
  const field = orderBy.replace(/^-/, '');
  return results.sort((a, b) => {
    const aValue = getValue(a as object, field) as string;
    const bValue = getValue(b as object, field) as string;
    if (aValue === bValue) return 0;
    return aValue > bValue ? order : -order;
  });
}

export function paginateItems(results: unknown[], searchParams: URLSearchParams) {
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('page_size')) || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return results.slice(start, end);
}
