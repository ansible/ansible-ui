import { Page } from '@playwright/test';

const featureFlagsResponse = {
  count: 5,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      url: '/api/gateway/v1/feature_flags/1/',
      related: {
        activity_stream: '/api/gateway/v1/activitystream/?content_type=29&object_id=1',
        created_by: '/api/gateway/v1/users/1/',
        modified_by: '/api/gateway/v1/users/2/',
      },
      summary_fields: {
        modified_by: { id: 2, username: 'admin', first_name: '', last_name: '' },
        created_by: { id: 1, username: '_system', first_name: '', last_name: '' },
        resource: {
          ansible_id: '2e880027-90a7-47b4-bfec-066af0c81440',
          resource_type: 'shared.aapflag',
        },
      },
      created: '2026-03-10T14:00:05.323834Z',
      created_by: 1,
      modified: '2026-03-10T18:38:58.952157Z',
      modified_by: 2,
      name: 'FEATURE_INDIRECT_NODE_COUNTING_ENABLED',
      ui_name: 'Indirect Node Counting',
      condition: 'boolean',
      value: 'True',
      required: false,
      support_level: 'TECHNOLOGY_PREVIEW',
      visibility: true,
      toggle_type: 'run-time',
      description:
        'Indirect Node Counting parses the event stream of all jobs to identify resources and stores these in the platform database. Example: Job automates VMware, the parser will report back the VMs, Hypervisors that were automated. This feature helps customers and partners report on the automations they are doing beyond an API endpoint.',
      support_url: 'https://access.redhat.com/articles/7109910',
      labels: ['controller'],
      state: true,
    },
    {
      id: 2,
      url: '/api/gateway/v1/feature_flags/2/',
      related: {
        activity_stream: '/api/gateway/v1/activitystream/?content_type=29&object_id=2',
        created_by: '/api/gateway/v1/users/1/',
        modified_by: '/api/gateway/v1/users/1/',
      },
      summary_fields: {
        modified_by: { id: 1, username: '_system', first_name: '', last_name: '' },
        created_by: { id: 1, username: '_system', first_name: '', last_name: '' },
        resource: {
          ansible_id: '05ff4eec-4f57-4a65-98c4-48aa7078a9d3',
          resource_type: 'shared.aapflag',
        },
      },
      created: '2026-03-10T14:00:05.329819Z',
      created_by: 1,
      modified: '2026-03-10T14:00:05.329810Z',
      modified_by: 1,
      name: 'FEATURE_EDA_ANALYTICS_ENABLED',
      ui_name: 'Event-Driven Ansible Analytics',
      condition: 'boolean',
      value: 'False',
      required: false,
      support_level: 'TECHNOLOGY_PREVIEW',
      visibility: false,
      toggle_type: 'install-time',
      description: 'Submit Event-Driven Ansible usage analytics to console.redhat.com.',
      support_url: 'https://access.redhat.com/solutions/7112810',
      labels: ['eda'],
      state: false,
    },
    {
      id: 3,
      url: '/api/gateway/v1/feature_flags/3/',
      related: {
        activity_stream: '/api/gateway/v1/activitystream/?content_type=29&object_id=3',
        created_by: '/api/gateway/v1/users/1/',
        modified_by: '/api/gateway/v1/users/1/',
      },
      summary_fields: {
        modified_by: { id: 1, username: '_system', first_name: '', last_name: '' },
        created_by: { id: 1, username: '_system', first_name: '', last_name: '' },
        resource: {
          ansible_id: '029efdea-9812-40d2-9c19-dd0bd8b6765c',
          resource_type: 'shared.aapflag',
        },
      },
      created: '2026-03-10T14:00:05.333607Z',
      created_by: 1,
      modified: '2026-03-10T14:00:05.333597Z',
      modified_by: 1,
      name: 'FEATURE_GATEWAY_CREATE_CRC_SERVICE_TYPE_ENABLED',
      ui_name: 'Dynamic Service Type Feature',
      condition: 'boolean',
      value: 'False',
      required: false,
      support_level: 'DEVELOPER_PREVIEW',
      visibility: false,
      toggle_type: 'install-time',
      description:
        'The Dynamic Service Type feature allows for the introduction of new platform services without requiring registration to the existing database. The new service can be enabled through the use of configuration.',
      support_url: 'https://access.redhat.com/articles/7122668',
      labels: ['gateway'],
      state: false,
    },
    {
      id: 4,
      url: '/api/gateway/v1/feature_flags/4/',
      related: {
        activity_stream: '/api/gateway/v1/activitystream/?content_type=29&object_id=4',
        created_by: '/api/gateway/v1/users/1/',
        modified_by: '/api/gateway/v1/users/2/',
      },
      summary_fields: {
        modified_by: { id: 2, username: 'admin', first_name: '', last_name: '' },
        created_by: { id: 1, username: '_system', first_name: '', last_name: '' },
        resource: {
          ansible_id: '081c1b12-dbe6-4d4c-80d5-755430ef150f',
          resource_type: 'shared.aapflag',
        },
      },
      created: '2026-03-10T14:00:05.337978Z',
      created_by: 1,
      modified: '2026-03-10T16:11:35.922146Z',
      modified_by: 2,
      name: 'FEATURE_CASE_INSENSITIVE_AUTH_MAPS_ENABLED',
      ui_name: 'Case Insensitive Authentication Maps',
      condition: 'boolean',
      value: 'True',
      required: false,
      support_level: 'DEVELOPER_PREVIEW',
      visibility: false,
      toggle_type: 'run-time',
      description:
        'Enable case-insensitive comparison for authentication mapping attributes and group names.',
      support_url: '',
      labels: ['platform'],
      state: true,
    },
    {
      id: 5,
      url: '/api/gateway/v1/feature_flags/5/',
      related: {
        activity_stream: '/api/gateway/v1/activitystream/?content_type=29&object_id=5',
        created_by: '/api/gateway/v1/users/1/',
        modified_by: '/api/gateway/v1/users/1/',
      },
      summary_fields: {
        modified_by: { id: 1, username: '_system', first_name: '', last_name: '' },
        created_by: { id: 1, username: '_system', first_name: '', last_name: '' },
        resource: {
          ansible_id: '16388462-261f-4735-81a6-e250951efd66',
          resource_type: 'shared.aapflag',
        },
      },
      created: '2026-03-10T14:00:05.342747Z',
      created_by: 1,
      modified: '2026-03-10T14:00:05.342737Z',
      modified_by: 1,
      name: 'FEATURE_OIDC_WORKLOAD_IDENTITY_ENABLED',
      ui_name: 'OIDC Workload Identity',
      condition: 'boolean',
      value: 'False',
      required: false,
      support_level: 'TECHNOLOGY_PREVIEW',
      visibility: false,
      toggle_type: 'install-time',
      description: 'Enable identity provision of workloads using OIDC',
      support_url: '',
      labels: ['platform'],
      state: false,
    },
  ],
};

export const FeatureFlags = {
  mock: {
    /**
     * Mock the feature flags list endpoint.
     * Used in tests to provide a controlled set of feature flags.
     */
    list: async (page: Page): Promise<void> => {
      await page.route(
        '**/api/gateway/v1/feature_flags/',
        async (route) =>
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(featureFlagsResponse),
          })
      );
    },

    /**
     * Mock the feature flag PATCH (toggle) endpoint.
     * Returns a 200 with the updated flag data. Captures the request body
     * so tests can assert on the PATCH payload.
     */
    toggle: async (
      page: Page
    ): Promise<{ getLastPatchBody: () => Record<string, unknown> | undefined }> => {
      let lastPatchBody: Record<string, unknown> | undefined;

      await page.route(/\/api\/gateway\/v1\/feature_flags\/\d+\//, async (route) => {
        if (route.request().method() === 'PATCH') {
          lastPatchBody = route.request().postDataJSON() as Record<string, unknown>;
          const url = route.request().url();
          const idMatch = url.match(/feature_flags\/(\d+)\//);
          const id = idMatch ? Number(idMatch[1]) : 1;
          const flag = featureFlagsResponse.results.find((f) => f.id === id);
          const newState = lastPatchBody?.value === 'True';

          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              ...(flag ?? featureFlagsResponse.results[0]),
              value: newState ? 'True' : 'False',
              state: newState,
            }),
          });
        } else {
          await route.continue();
        }
      });

      return {
        getLastPatchBody: () => lastPatchBody,
      };
    },
  },
} as const;
