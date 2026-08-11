import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { InventorySourceDetails, LastJobTooltip } from './InventorySourceDetails';

vi.mock('../../../common/useAwxWebSocket', () => ({
  useAwxWebSocketSubscription: vi.fn(),
}));

const fullInventorySource = {
  id: 1,
  name: 'Test Inventory Source',
  description: 'Test source description',
  source: 'ec2',
  inventory: 1,
  update_on_launch: true,
  overwrite: true,
  overwrite_vars: true,
  source_path: 'inventory.yml',
  source_vars: 'plugin: aws_ec2',
  scm_branch: 'develop',
  update_cache_timeout: 120,
  host_filter: 'tag_env=prod',
  enabled_var: 'foo.bar',
  enabled_value: 'true',
  verbosity: 2,
  custom_virtualenv: '/venv/custom',
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-02T00:00:00Z',
  summary_fields: {
    inventory: { id: 1, name: 'Demo Inventory', kind: '' },
    organization: { id: 1, name: 'Default Org' },
    credential: {
      id: 5,
      name: 'AWS Credential',
      credential_type_id: 1,
      kind: 'cloud',
      cloud: true,
      description: '',
    },
    source_project: { id: 3, name: 'Source Project' },
    execution_environment: {
      id: 2,
      name: 'Custom EE',
      image: 'quay.io/custom-ee:latest',
      description: '',
    },
    created_by: { id: 1, username: 'admin', first_name: '', last_name: '' },
    modified_by: { id: 2, username: 'editor', first_name: '', last_name: '' },
    current_job: null,
    last_job: {
      id: 42,
      status: 'successful',
      finished: '2024-01-15T10:30:00Z',
    },
  },
};

const optionsResponse = {
  actions: {
    GET: {
      source: {
        choices: [
          ['ec2', 'Amazon EC2'],
          ['scm', 'Sourced from a Project'],
          ['gce', 'Google Compute Engine'],
        ],
      },
    },
  },
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('inventory_sources') && request.url.includes('/1'),
    () => HttpResponse.json(fullInventorySource)
  ),
  http.options(
    ({ request }) => request.url.includes('inventory_sources'),
    () => HttpResponse.json(optionsResponse)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderInventorySourceDetails(inventorySourceId?: string) {
  return render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MemoryRouter initialEntries={['/inventories/inventory/1/sources/1/details']}>
        <Routes>
          <Route
            path="/inventories/:inventory_type/:id/sources/:source_id/details"
            element={<InventorySourceDetails inventorySourceId={inventorySourceId} />}
          />
        </Routes>
      </MemoryRouter>
    </SWRConfig>
  );
}

describe('InventorySourceDetails', () => {
  it('should render source name', async () => {
    renderInventorySourceDetails();
    await waitFor(() => {
      expect(screen.getByText('Test Inventory Source')).toBeInTheDocument();
    });
  });

  it('should render description', async () => {
    renderInventorySourceDetails();
    await waitFor(() => {
      expect(screen.getByText('Test source description')).toBeInTheDocument();
    });
  });

  it('should render source type from options', async () => {
    renderInventorySourceDetails();
    await waitFor(() => {
      expect(screen.getByText('Amazon EC2')).toBeInTheDocument();
    });
  });

  it('should render organization', async () => {
    renderInventorySourceDetails();
    await waitFor(() => {
      expect(screen.getByText('Default Org')).toBeInTheDocument();
    });
  });

  it('should render execution environment', async () => {
    renderInventorySourceDetails();
    await waitFor(() => {
      expect(screen.getByText('Custom EE')).toBeInTheDocument();
    });
  });

  it('should render source project', async () => {
    renderInventorySourceDetails();
    await waitFor(() => {
      expect(screen.getByText('Source Project')).toBeInTheDocument();
    });
  });

  it('should render inventory file path', async () => {
    renderInventorySourceDetails();
    await waitFor(() => {
      expect(screen.getByText('inventory.yml')).toBeInTheDocument();
    });
  });

  it('should render verbosity string', async () => {
    renderInventorySourceDetails();
    await waitFor(() => {
      expect(screen.getByText('2 (More Verbose)')).toBeInTheDocument();
    });
  });

  it('should render source control branch', async () => {
    renderInventorySourceDetails();
    await waitFor(() => {
      expect(screen.getByText('develop')).toBeInTheDocument();
    });
  });

  it('should render cache timeout', async () => {
    renderInventorySourceDetails();
    await waitFor(() => {
      expect(screen.getByText('120 seconds')).toBeInTheDocument();
    });
  });

  it('should render host filter', async () => {
    renderInventorySourceDetails();
    await waitFor(() => {
      expect(screen.getByText('tag_env=prod')).toBeInTheDocument();
    });
  });

  it('should render enabled variable', async () => {
    renderInventorySourceDetails();
    await waitFor(() => {
      expect(screen.getByText('foo.bar')).toBeInTheDocument();
    });
  });

  it('should render enabled value', async () => {
    renderInventorySourceDetails();
    await waitFor(() => {
      expect(screen.getByText('true')).toBeInTheDocument();
    });
  });

  it('should render credential', async () => {
    renderInventorySourceDetails();
    await waitFor(() => {
      expect(screen.getByText('AWS Credential')).toBeInTheDocument();
    });
  });

  it('should render all enabled options', async () => {
    renderInventorySourceDetails();
    await waitFor(() => {
      expect(screen.getByText('Overwrite')).toBeInTheDocument();
    });
    expect(screen.getByText('Overwrite variables')).toBeInTheDocument();
    expect(screen.getByText('Update on launch')).toBeInTheDocument();
  });

  it('should render created date with author', async () => {
    renderInventorySourceDetails();
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument();
    });
  });

  it('should render modified author', async () => {
    renderInventorySourceDetails();
    await waitFor(() => {
      expect(screen.getByText('editor')).toBeInTheDocument();
    });
  });

  it('should render name as link when inventorySourceId prop is provided', async () => {
    renderInventorySourceDetails('1');
    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Test Inventory Source' })).toBeInTheDocument();
    });
  });

  it('should render project root when source_path is empty', async () => {
    server.use(
      http.get(
        ({ request }) => request.url.includes('inventory_sources') && request.url.includes('/1'),
        () => HttpResponse.json({ ...fullInventorySource, source_path: '' })
      )
    );
    renderInventorySourceDetails();
    await waitFor(() => {
      expect(screen.getByText('. (project root)')).toBeInTheDocument();
    });
  });

  it('should not render enabled options when none are set', async () => {
    server.use(
      http.get(
        ({ request }) => request.url.includes('inventory_sources') && request.url.includes('/1'),
        () =>
          HttpResponse.json({
            ...fullInventorySource,
            overwrite: false,
            overwrite_vars: false,
            update_on_launch: false,
          })
      )
    );
    renderInventorySourceDetails();
    await waitFor(() => {
      expect(screen.getByText('Test Inventory Source')).toBeInTheDocument();
    });
    expect(screen.queryByText('Overwrite')).not.toBeInTheDocument();
    expect(screen.queryByText('Update on launch')).not.toBeInTheDocument();
  });

  it('should not render last job status when no job exists', async () => {
    server.use(
      http.get(
        ({ request }) => request.url.includes('inventory_sources') && request.url.includes('/1'),
        () =>
          HttpResponse.json({
            ...fullInventorySource,
            summary_fields: {
              ...fullInventorySource.summary_fields,
              current_job: null,
              last_job: null,
            },
          })
      )
    );
    renderInventorySourceDetails();
    await waitFor(() => {
      expect(screen.getByText('Test Inventory Source')).toBeInTheDocument();
    });
  });

  it('should not render execution environment when absent', async () => {
    server.use(
      http.get(
        ({ request }) => request.url.includes('inventory_sources') && request.url.includes('/1'),
        () =>
          HttpResponse.json({
            ...fullInventorySource,
            summary_fields: {
              ...fullInventorySource.summary_fields,
              execution_environment: null,
            },
          })
      )
    );
    renderInventorySourceDetails();
    await waitFor(() => {
      expect(screen.getByText('Test Inventory Source')).toBeInTheDocument();
    });
    expect(screen.queryByText('Custom EE')).not.toBeInTheDocument();
  });
});

describe('LastJobTooltip', () => {
  it('should render job id, status, and finish date', () => {
    render(
      <LastJobTooltip job={{ id: 42, status: 'successful', finished: '2024-01-15T10:30:00Z' }} />
    );
    expect(screen.getByText(/MOST RECENT SYNC/)).toBeInTheDocument();
    expect(screen.getByText(/42/)).toBeInTheDocument();
    expect(screen.getByText(/SUCCESSFUL/)).toBeInTheDocument();
  });

  it('should not render finished date when not provided', () => {
    render(<LastJobTooltip job={{ id: 10, status: 'running', finished: '' }} />);
    expect(screen.getByText(/RUNNING/)).toBeInTheDocument();
    expect(screen.queryByText(/FINISHED/)).not.toBeInTheDocument();
  });
});
