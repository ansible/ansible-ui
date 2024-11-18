/* eslint-disable no-console */
import getValue from 'get-value';
import { RouteHandler, RouteOptions } from '../router/Router';

/** gets the data in the mock data at the url path */
export function getData(): RouteHandler {
  return ({ dotPath, mockData: data }: RouteOptions) => {
    const body = getValue(data, dotPath) as unknown;
    // console.log('getData', dotPath, result);
    switch (typeof body) {
      case 'object':
        if (body === null) break;
        return { status: 200, body };
    }
    return { status: 501 };
  };
}
