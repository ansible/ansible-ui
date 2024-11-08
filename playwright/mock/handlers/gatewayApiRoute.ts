import { MockResponse } from '../router/MockResponse';

export function gatewayApiRoute(): MockResponse {
  return {
    status: 200,
    body: {
      apis: {
        gateway: '/api/gateway/',
        controller: '/api/controller/',
        eda: '/api/eda/',
        galaxy: '/api/galaxy/',
      },
    },
  };
}
