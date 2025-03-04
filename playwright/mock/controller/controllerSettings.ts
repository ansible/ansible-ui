import { MockResponse } from '../router/MockResponse';
import { RouteOptions } from '../router/Router';

export function patchPolicySettings({ mockData: data, requestData }: RouteOptions): MockResponse {
  data.api.controller.v2.settings.all = {
    ...data.api.controller.v2.settings.all,
    ...requestData,
  };
  data.api.controller.v2.settings.policyascode = {
    ...data.api.controller.v2.settings.policyascode,
    ...requestData,
  };

  return {
    status: 200,
  };
}
