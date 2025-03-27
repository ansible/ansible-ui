/* eslint-disable @typescript-eslint/no-explicit-any */
import getValue from 'get-value';
import { klona } from 'klona/json';
import setValue from 'set-value';
import { MockContext } from '../context/context';
import { MockRequest, RouteHandler } from '../mock-router';
import { dotPath } from '../utils/dot-path';

export function patchData(options?: {
  relations?: (item: Record<string, unknown>, data: MockContext['data']) => void;
  process?: (item: any) => void;
}): RouteHandler {
  return (request: MockRequest) => {
    const dataValue = getValue(request.context.data, dotPath(request.url.pathname)) as unknown;
    if (typeof dataValue === 'object') {
      const patched = { ...dataValue, ...request.body };
      if (options?.process) {
        options.process(patched);
      }
      setValue(request.context.data, dotPath(request.url.pathname), patched);
      const copy = klona(patched);
      if (options?.relations) {
        options.relations(copy, request.context.data);
      }
      return { status: 200, body: copy };
    }
    return { status: 404 };
  };
}
