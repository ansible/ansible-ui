/* eslint-disable no-console */
import { RouteHandler } from '../router/Router';

export function getItemOptions(): RouteHandler {
  return () => {
    return { status: 200, body: { actions: { POST: {}, PUT: {}, DELETE: {} } } };
  };
}
