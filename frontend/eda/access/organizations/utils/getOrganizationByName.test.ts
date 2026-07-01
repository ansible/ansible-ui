/* eslint-disable i18next/no-literal-string */
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { edaAPI } from '../../../common/eda-utils';
import { getOrganizationByName } from './getOrganizationByName';

const mockOrganization = {
  id: 1,
  name: 'Default',
  description: 'The default org',
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-01T00:00:00Z',
};

const server = setupServer(
  http.get(edaAPI`/organizations/`, ({ request }) => {
    const url = new URL(request.url);
    const name = url.searchParams.get('name');
    if (name === 'Default') {
      return HttpResponse.json({ count: 1, results: [mockOrganization] });
    }
    return HttpResponse.json({ count: 0, results: [] });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('getOrganizationByName', () => {
  it('should return the organization when found', async () => {
    const result = await getOrganizationByName('Default');

    expect(result).toBeDefined();
    expect(result?.name).toBe('Default');
    expect(result?.id).toBe(1);
  });

  it('should return undefined when organization is not found', async () => {
    const result = await getOrganizationByName('NonExistent');

    expect(result).toBeUndefined();
  });

  it('should return the first result when multiple organizations match', async () => {
    server.use(
      http.get(edaAPI`/organizations/`, () =>
        HttpResponse.json({
          count: 2,
          results: [mockOrganization, { ...mockOrganization, id: 2, name: 'Default Copy' }],
        })
      )
    );

    const result = await getOrganizationByName('Default');

    expect(result).toBeDefined();
    expect(result?.id).toBe(1);
  });
});
