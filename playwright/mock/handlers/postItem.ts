/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import getValue from 'get-value';
import { klona } from 'klona/json';
import { IApiData } from '../mockData';
import { RouteHandler, RouteOptions } from '../router/Router';

export function postItem(options?: {
  relations?: (item: Record<string, unknown>, data: IApiData) => void;
  process?: (item: any) => void;
}): RouteHandler {
  return ({ dotPath, mockData: data, route }: RouteOptions) => {
    const array = getValue(data, dotPath) as { id: number }[];
    if (!Array.isArray(array)) return { status: 404 };
    let item = route.request().postDataJSON() as { id: number };
    if (item) {
      item.id = 1;
      while (array.find((i) => i.id === item.id)) {
        item.id++;
      }
      array.push(item);
      if (options?.process) {
        options.process(item);
      }
      if (options?.relations) {
        item = klona(item);
        options.relations(item, data);
      }
      return { status: 201, body: item };
    }
    return { status: 404 };
  };
}
