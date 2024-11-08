/* eslint-disable no-console */
import getValue from 'get-value';
import { RouteHandler, RouteOptions } from '../router/Router';

export function deleteItem(): RouteHandler {
  return ({ dotPath, data }: RouteOptions) => {
    const arrayPath = dotPath.split('.').slice(0, -1).join('.');
    const array = getValue(data, arrayPath) as { id: number }[];
    if (!Array.isArray(array)) return { status: 404 };
    const id = dotPath.split('.').pop();
    const itemIndex = array.findIndex((item) => item.id.toString() === id);
    if (itemIndex !== -1) {
      array.splice(itemIndex, 1);
      return { status: 204 };
    }
    return { status: 404 };
  };
}
