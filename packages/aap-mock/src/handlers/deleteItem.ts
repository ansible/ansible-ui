import getValue from 'get-value';
import { MockRequest, RouteHandler } from '../mock-router';
import { dotPath } from '../utils/dot-path';

export function deleteItem(): RouteHandler {
  return (request: MockRequest) => {
    const arrayPath = dotPath(request.url.pathname).split('.').slice(0, -1).join('.');
    const array = getValue(request.context.data, arrayPath) as { id: number }[];
    if (!Array.isArray(array)) {
      return { status: 404 };
    }

    const id = dotPath(request.url.pathname).split('.').pop();
    const itemIndex = array.findIndex((item) => item.id.toString() === id);
    if (itemIndex !== -1) {
      array.splice(itemIndex, 1);
      return { status: 204 };
    }

    return { status: 404 };
  };
}
