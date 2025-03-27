import { MockResponse } from '../mock-router';

export function getProjectPlaybooks(): MockResponse {
  return {
    status: 200,
    body: ['hello_world.yml'],
  };
}
