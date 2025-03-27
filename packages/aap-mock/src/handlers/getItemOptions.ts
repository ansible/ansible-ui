import { RouteHandler } from '../mock-router';

export function getItemOptions(): RouteHandler {
  return () => {
    return { status: 200, body: { actions: { POST: {}, PUT: {}, DELETE: {} } } };
  };
}
