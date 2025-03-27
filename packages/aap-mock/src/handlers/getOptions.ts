import getValue from 'get-value';
import { MockRequest, RouteHandler } from '../mock-router';
import { dotPath } from '../utils/dot-path';

export function getOptions(): RouteHandler {
  return (request: MockRequest) => {
    const result = getValue(request.context.options, dotPath(request.url.pathname)) as unknown;
    switch (typeof result) {
      case 'object':
        if (result === null) break;
        return {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
          body: result,
        };
    }
  };
}
