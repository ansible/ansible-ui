import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { edaAPI } from './eda-utils';
import {
  InUseResourceRefs,
  InUseResources,
  ResourceInUse,
  ResourceRefInUse,
} from './EdaResourcesCommon';

const server = setupServer();

describe('EdaResourcesCommon', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should return resources that are currently in use', async () => {
    server.use(
      http.get(edaAPI`/activations/`, ({ request }) => {
        const url = new URL(request.url);
        const id = url.searchParams.get('decision_environment_id');
        return HttpResponse.json({
          count: id === '1' ? 2 : 0,
          results: id === '1' ? [{ id: 9, name: 'activation' }] : [],
        });
      })
    );

    const inUse = await ResourceInUse(
      { id: 1, name: 'DE 1' },
      edaAPI`/activations/?decision_environment_id=`
    );
    expect(inUse.count).toBe(2);

    const names = await InUseResources(
      [
        { id: 1, name: 'DE 1' },
        { id: 2, name: 'DE 2' },
      ],
      edaAPI`/activations/?decision_environment_id=`
    );
    expect(names).toEqual(['DE 1']);
  });

  it('should return resources that have references', async () => {
    server.use(
      http.get(edaAPI`/eda-credentials/1/`, () =>
        HttpResponse.json({
          id: 1,
          name: 'Cred 1',
          references: [{ type: 'decisionenvironment', id: 4 }],
        })
      ),
      http.get(edaAPI`/eda-credentials/2/`, () =>
        HttpResponse.json({
          id: 2,
          name: 'Cred 2',
          references: [],
        })
      )
    );

    const inUse = await ResourceRefInUse({ id: 1, name: 'Cred 1' }, edaAPI`/eda-credentials`);
    expect(inUse.references?.length).toBe(1);

    const names = await InUseResourceRefs(
      [
        { id: 1, name: 'Cred 1' },
        { id: 2, name: 'Cred 2' },
      ],
      edaAPI`/eda-credentials`
    );
    expect(names).toEqual(['Cred 1']);
  });
});
