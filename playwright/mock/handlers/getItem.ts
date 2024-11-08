/* eslint-disable no-console */
import getValue from 'get-value';
import { klona } from 'klona/json';
import { IApiData } from '../mockData';
import { RouteHandler, RouteOptions } from '../router/Router';

export function getItem(
  relations?: (item: Record<string, unknown>, data: IApiData) => void
): RouteHandler {
  return ({ dotPath, data }: RouteOptions) => {
    const arrayPath = dotPath.split('.').slice(0, -1).join('.');
    const array = getValue(data, arrayPath) as { id: number }[];
    if (!Array.isArray(array)) return { status: 404 };
    const id = dotPath.split('.').pop();
    let item = array.find((item) => item.id.toString() === id);
    if (item) {
      item = klona(item);
      if (relations) relations(item, data);
      return { status: 200, body: item };
    }
    return { status: 404 };
  };
}
