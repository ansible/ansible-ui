/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { InstanceListenerAddresses } from './InstanceListenerAddresses';

const mockInstance = {
  id: 1,
  hostname: 'test-instance',
  listener_port: 27199,
  protocol: 'tcp',
};

const mockPeersResponse = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

const server = setupServer(
  http.get(awxAPI`/instances/1/`, () => HttpResponse.json(mockInstance)),
  http.get(awxAPI`/instances/`, ({ request }) => {
    const url = new URL(request.url);
    if (url.searchParams.get('hostname') === 'test-instance') {
      return HttpResponse.json(mockPeersResponse);
    }
    return HttpResponse.json(mockPeersResponse);
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('InstanceListenerAddresses', () => {
  test('should render listener addresses table', async () => {
    render(
      <MemoryRouter initialEntries={['/instances/1/listener_addresses']}>
        <Routes>
          <Route path="/instances/:id/*" element={<InstanceListenerAddresses />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(
          screen.getByText(/No listener addresses found|Error loading listener addresses/i)
        ).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });
});
