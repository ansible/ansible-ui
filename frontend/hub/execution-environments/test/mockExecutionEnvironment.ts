import { hubAPI, pulpAPI } from '../../common/api/formatPath';
import { ExecutionEnvironment } from '../ExecutionEnvironment';

export const mockExecutionEnvironment: ExecutionEnvironment = {
  id: 'test-ee-id',
  pulp_href: hubAPI`/v3/repositories/container/container/test-ee-id/`,
  name: 'test-execution-environment',
  description: 'Test EE description',
  registry: 'test-registry-id',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  namespace: {
    id: 'namespace-uuid-1',
    pulp_href: hubAPI`/v3/pulp/namespaces/1/`,
    name: 'test-execution-environment',
    my_permissions: ['galaxy.change_containernamespace'],
    owners: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  pulp: {
    repository: {
      id: 'test-ee-id',
      pulp_type: 'container.container',
      version: 1,
      name: 'test-execution-environment',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      pulp_labels: {},
      sign_state: 'unsigned',
      remote: {
        id: 'test-remote-id',
        pulp_href: pulpAPI`/remotes/container/container/test-remote-id/`,
        name: 'test-remote',
        upstream_name: 'docker.io/testimage',
        registry: 'test-registry-id',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        include_tags: [],
        exclude_tags: [],
        include_foreign_layers: false,
        last_sync_task: {
          state: 'completed',
          started_at: '2024-01-01T00:00:00Z',
          finished_at: '2024-01-01T00:01:00Z',
          error: {
            traceback: '',
            description: '',
          },
        },
      },
    },
    distribution: {
      id: 'test-dist-id',
      name: 'test-execution-environment',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      base_path: 'test-execution-environment',
      pulp_labels: {},
    },
  },
};

export const mockExecutionEnvironmentImage = {
  id: 'image-1',
  pulp_href: hubAPI`/v3/content/1/`,
  digest: 'sha256:abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  schema_version: 2,
  media_type: 'application/vnd.docker.container.image.v1+json',
  config_blob: {
    data: {
      history: [{ created: '2024-01-01T00:00:00Z', created_by: '/bin/sh -c #(nop)  CMD ["sh"]' }],
      config: { Env: ['PATH=/usr/local/bin'] },
    },
  },
  tags: ['latest'],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  layers: [{ digest: 'sha256:layer1', size: 1024 }],
  image_manifests: [],
};
