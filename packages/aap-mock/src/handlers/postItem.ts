/* eslint-disable @typescript-eslint/no-explicit-any */
import getValue from 'get-value';
import { klona } from 'klona/json';
import { MockContext } from '../context/context';
import { MockRequest, RouteHandler } from '../mock-router';
import { dotPath } from '../utils/dot-path';

export function postItem(options?: {
  relations?: (item: Record<string, unknown>, data: MockContext['data']) => void;
  process?: (item: any) => void;
}): RouteHandler {
  return (request: MockRequest) => {
    const array = getValue(request.context.data, dotPath(request.url.pathname)) as {
      id: number;
    }[];
    if (!Array.isArray(array)) return { status: 404 };
    let item = request.body as { id: number };
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
        options.relations(item, request.context.data);
      }
      return { status: 201, body: item };
    }
    return { status: 404 };
  };
}
