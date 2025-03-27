import getValue from 'get-value';
import { klona } from 'klona/json';
import { MockContext } from '../context/context';
import { MockRequest, RouteHandler } from '../mock-router';
import { dotPath } from '../utils/dot-path';

export function getItem(
  relations?: (item: Record<string, unknown>, data: MockContext['data']) => void
): RouteHandler {
  return (request: MockRequest) => {
    const arrayPath = dotPath(request.url.pathname).split('.').slice(0, -1).join('.');
    const array = getValue(request.context.data, arrayPath) as { id: number }[];
    if (!Array.isArray(array)) return { status: 404 };
    const id = dotPath(request.url.pathname).split('.').pop();
    let item = array.find((item) => item.id.toString() === id);
    if (item) {
      item = klona(item);
      if (relations) relations(item, request.context.data);
      return { status: 200, body: item };
    }
    return { status: 404 };
  };
}
