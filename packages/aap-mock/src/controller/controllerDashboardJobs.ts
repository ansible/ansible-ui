import { MockResponse } from '../mock-router';

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
