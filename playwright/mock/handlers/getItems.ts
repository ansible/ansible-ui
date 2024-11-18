/* eslint-disable no-console */
import getValue from 'get-value';
import { klona } from 'klona/json';
import { IApiData } from '../mockData';
import { RouteHandler, RouteOptions } from '../router/Router';

export function getItems(
  relations?: (item: Record<string, unknown>, data: IApiData) => void
): RouteHandler {
  return ({ dotPath, mockData: data }: RouteOptions) => {
    const result = getValue(data, dotPath) as unknown;
    switch (typeof result) {
      case 'object': {
        if (result === null) break;
        if (!Array.isArray(result)) break;
        let results = result;
        if (relations) {
          results = klona(results);
          results.forEach((item) => relations(item as Record<string, unknown>, data));
        }
        return {
          status: 200,
          body: { count: result.length, next: null, previous: null, results },
        };
      }
    }
    return { status: 404 };
  };
}
