import { MockResponse } from '../router/MockResponse';

export function controllerDashboardJobs(): MockResponse {
  return {
    status: 200,
    body: {
      jobs: {
        successful: [],
        failed: [],
        canceled: [],
        error: [],
      },
    },
  };
}
