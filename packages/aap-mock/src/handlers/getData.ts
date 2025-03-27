import getValue from 'get-value';
import { MockRequest, RouteHandler } from '../mock-router';
import { dotPath } from '../utils/dot-path';

/** gets the data in the mock data at the url path */
export function getData(): RouteHandler {
  return (request: MockRequest) => {
    const body = getValue(request.context.data, dotPath(request.url.pathname)) as unknown;
    // console.log('getData', dotPath, result);
    switch (typeof body) {
      case 'object':
        if (body === null) break;
        return { status: 200, body };
    }
    return { status: 501 };
  };
}
