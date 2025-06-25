import { render, screen, waitFor, within } from '@testing-library/react';
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { PlatformAuthenticatorMappings } from './PlatformAuthenticatorMappings';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import mockMappings from './authenticatorMappings.fixture.json';

describe('PlatformAuthenticatorMappings', () => {
  const server = setupServer(
    http.get(gatewayAPI`/authenticators/1/authenticator_maps/`, () => {
      return HttpResponse.json(mockMappings);
    })
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());

  test('should list mappings', async () => {
    render(
      <MemoryRouter initialEntries={['/access/authenticators/1/mappings']}>
        <Routes>
          <Route
            path={'/access/authenticators/:id/mappings'}
            element={<PlatformAuthenticatorMappings />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows).to.have.length(6);

      mockMappings.results.forEach((map, index) => {
        expect(screen.getByRole('cell', { name: map.name })).toBeInTheDocument();
        if (map.organization) {
          expect(within(rows[index + 1]).getByText(map.organization)).toBeInTheDocument();
        }
        if (map.team) {
          expect(within(rows[index + 1]).getByText(map.team)).toBeInTheDocument();
        }
        if (map.role) {
          expect(within(rows[index + 1]).getByText(map.role)).toBeInTheDocument();
        }
      });
    });
  });
});
