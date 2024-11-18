/* eslint-disable no-console */
import getValue from 'get-value';
import { RouteHandler, RouteOptions } from '../router/Router';

export function getOptions(): RouteHandler {
  return ({ dotPath, mockOptions: options }: RouteOptions) => {
    const result = getValue(options, dotPath) as unknown;
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
