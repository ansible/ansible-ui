/* eslint-disable @typescript-eslint/no-explicit-any */
import getValue from 'get-value';
import { klona } from 'klona/json';
import { MockContext } from '../context/context';
import { MockRequest, RouteHandler } from '../mock-router';
import { dotPath } from '../utils/dot-path';

export function patchItem(options?: {
  relations?: (item: Record<string, unknown>, data: MockContext['data']) => void;
  process?: (item: any) => void;
}): RouteHandler {
  return (request: MockRequest) => {
    const arrayPath = dotPath(request.url.pathname).split('.').slice(0, -1).join('.');
    const array = getValue(request.context.data, arrayPath) as { id: number }[];
    if (Array.isArray(array)) {
      const id = dotPath(request.url.pathname).split('.').pop();
      const existingIndex = array.findIndex((item) => item.id.toString() === id);
      if (existingIndex === -1) {
        return { status: 404 };
      }
      let existing = array[existingIndex];
      const patchData = request.body as Record<string, unknown>;
      if (existing) {
        existing = { ...existing, ...patchData };
        if (options?.process) {
          options.process(existing);
        }
        array[existingIndex] = existing;
        const copy = klona(request.context.data);
        if (options?.relations) {
          options.relations(copy, request.context.data);
        }
        return { status: 200, body: copy };
      } else {
        return { status: 404 };
      }
    }
    return { status: 404 };
  };
}
