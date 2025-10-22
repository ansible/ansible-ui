import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { InventoryHostFacts } from './InventoryHostFacts';

const mockAnsibleFacts = {
  ansible_dns: {
    search: ['dev-ui.svc.cluster.local', 'svc.cluster.local', 'cluster.local'],
    options: {
      ndots: '5',
    },
    nameservers: ['10.43.0.10'],
  },
  ansible_distribution: 'Ubuntu',
  ansible_distribution_version: '20.04',
  ansible_hostname: 'test-host',
};

describe('InventoryHostFacts Component', () => {
  const server = setupServer(
    http.get(awxAPI`/hosts/:id/ansible_facts/`, () => {
      return HttpResponse.json(mockAnsibleFacts);
    })
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('should render host facts in code editor when API returns facts', async () => {
    render(
      <MemoryRouter initialEntries={['/inventories/1/hosts/1/facts']}>
        <Routes>
          <Route
            path="/inventories/:id/hosts/:host_id/facts"
            element={<InventoryHostFacts page="inventory_host" />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Facts')).toBeInTheDocument();
    });

    await waitFor(() => {
      // Check if the code editor is rendering facts data
      const yamlToggle = screen.getByRole('button', { name: /toggle to yaml/i });
      expect(yamlToggle).toBeInTheDocument();
      expect(yamlToggle).toHaveAttribute('aria-pressed', 'true');

      // Check if facts data is present in the document
      expect(screen.getByText(/ansible_dns|Ubuntu|20\.04/i, { exact: false })).toBeInTheDocument();
    });
  });

  test('should render empty object when no facts are available', async () => {
    server.use(
      http.get(awxAPI`/hosts/:id/ansible_facts/`, () => {
        return HttpResponse.json({});
      })
    );

    render(
      <MemoryRouter initialEntries={['/inventories/1/hosts/1/facts']}>
        <Routes>
          <Route
            path="/inventories/:id/hosts/:host_id/facts"
            element={<InventoryHostFacts page="inventory_host" />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Facts')).toBeInTheDocument();
    });
  });

  test('should render facts for standalone host page', async () => {
    render(
      <MemoryRouter initialEntries={['/hosts/123/facts']}>
        <Routes>
          <Route path="/hosts/:id/facts" element={<InventoryHostFacts page="host" />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Facts')).toBeInTheDocument();
    });

    await waitFor(() => {
      // Check if the code editor is rendering facts data
      const yamlToggle = screen.getByRole('button', { name: /toggle to yaml/i });
      expect(yamlToggle).toBeInTheDocument();

      // Check if facts data is present in the document
      expect(screen.getByText(/ansible_dns/i, { exact: false })).toBeInTheDocument();
    });
  });
});
