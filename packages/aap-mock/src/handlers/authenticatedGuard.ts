import { MockRequest, MockResponse } from '../mock-router';

/**
 * Guards a mock request by checking if the user is authenticated.
 *
 * This function inspects the `me` property in the mock data context to determine
 * if the user is authenticated. If the user is not authenticated, it returns a
 * response with a 401 status code. Otherwise, it allows the request to proceed
 * to the next handler by returning `undefined`.
 *
 * @param request - The mock request object containing context and mock data.
 * @returns A mock response with a 401 status code if the user is not authenticated,
 *          or `undefined` to allow the request to continue.
 */
export function authenticatedGuard(request: MockRequest): MockResponse | undefined {
  const me = request.context.data.api.gateway.v1.me;

  if (!me || !me.length) {
    return { status: 401 };
  }

  return undefined;
}
