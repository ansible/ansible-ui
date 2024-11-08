import { MockResponse } from '../router/MockResponse';

export function getProjectPlaybooks(): MockResponse {
  return {
    status: 200,
    body: ['hello_world.yml'],
  };
}
