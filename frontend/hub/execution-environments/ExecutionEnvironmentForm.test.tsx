/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { hubAPI, pulpAPI } from '../common/api/formatPath';
import { mockExecutionEnvironment } from './test/mockExecutionEnvironment';
import { CreateExecutionEnvironment, EditExecutionEnvironment } from './ExecutionEnvironmentForm';

const mockNavigate = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageNavigate: () => mockNavigate,
  };
});

vi.mock('../common/PageFormSingleSelectHubResource', () => ({
  PageFormSingleSelectHubResource: function MockRegistrySelect({
    label,
    name,
  }: {
    label: string;
    name: string;
  }) {
    const { setValue } = useFormContext();
    useEffect(() => {
      setValue(name, { id: 'test-registry-id', name: 'test-registry' });
    }, [name, setValue]);
    return <div data-testid="registry-select">{label}</div>;
  },
}));

const mockRegistryList = {
  meta: { count: 1 },
  data: [{ id: 'test-registry-id', name: 'test-registry' }],
  links: {},
};

const mockSingleRegistry = { id: 'test-registry-id', name: 'test-registry' };

const server = setupServer(
  http.get(hubAPI`/_ui/v1/execution-environments/registries/`, () =>
    HttpResponse.json(mockRegistryList)
  ),
  http.get(hubAPI`/_ui/v1/execution-environments/registries/${mockSingleRegistry.id}/`, () =>
    HttpResponse.json(mockSingleRegistry)
  ),
  http.options(hubAPI`/_ui/v1/execution-environments/remotes/`, () =>
    HttpResponse.json({ actions: { POST: {} } })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  server.resetHandlers();
  mockNavigate.mockClear();
});
afterAll(() => server.close());

describe('CreateExecutionEnvironment', () => {
  it('renders create execution environment form', () => {
    render(
      <MemoryRouter>
        <CreateExecutionEnvironment />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('button', { name: /Create execution environment/i })
    ).toBeInTheDocument();
  });

  it('renders upstream name field on create form', async () => {
    render(
      <MemoryRouter>
        <CreateExecutionEnvironment />
      </MemoryRouter>
    );

    expect(await screen.findByRole('textbox', { name: 'Upstream name' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument();
  });
});

describe('ExecutionEnvironmentForm - OPTIONS-driven validation wiring', () => {
  it('fetches field patterns from the _ui/v1/execution-environments/remotes/ endpoint and validates on blur', async () => {
    server.use(
      http.options(hubAPI`/_ui/v1/execution-environments/remotes/`, () =>
        HttpResponse.json({
          actions: {
            POST: {
              upstream_name: {
                pattern: '^[a-zA-Z0-9_-]+$',
                patternDescription: 'Upstream name must contain only letters, numbers, - and _.',
              },
            },
          },
        })
      )
    );

    const user = userEvent.setup({ delay: null });
    render(
      <MemoryRouter>
        <CreateExecutionEnvironment />
      </MemoryRouter>
    );

    const upstreamNameInput = await screen.findByRole('textbox', { name: 'Upstream name' });
    await user.type(upstreamNameInput, 'invalid name!');
    await user.click(document.body);

    await waitFor(() => {
      expect(
        screen.getByText('Upstream name must contain only letters, numbers, - and _.')
      ).toBeInTheDocument();
    });
  }, 15000);
});

describe('ExecutionEnvironmentForm validation and tags', () => {
  it('shows name validation error for invalid container name', async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <MemoryRouter>
        <CreateExecutionEnvironment />
      </MemoryRouter>
    );

    const nameInput = await screen.findByRole('textbox', { name: 'Name' });
    await user.type(nameInput, 'bad name!');
    await user.click(screen.getByRole('button', { name: 'Create execution environment' }));

    await waitFor(() => {
      expect(
        screen.getByText(/Container names can only contain alphanumeric characters/i)
      ).toBeInTheDocument();
    });
  });

  it('accepts valid container names', async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <MemoryRouter>
        <CreateExecutionEnvironment />
      </MemoryRouter>
    );

    const nameInput = await screen.findByRole('textbox', { name: 'Name' });
    await user.type(nameInput, 'namespace/valid-ee');
    await user.click(screen.getByRole('button', { name: 'Create execution environment' }));

    expect(
      screen.queryByText(/Container names can only contain alphanumeric characters/i)
    ).not.toBeInTheDocument();
  });

  it('adds include and exclude tags from tag selectors', async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <MemoryRouter>
        <CreateExecutionEnvironment />
      </MemoryRouter>
    );

    await screen.findByRole('textbox', { name: 'Upstream name' });

    const includeInput = document.getElementById('addTags-include') as HTMLInputElement;
    await user.type(includeInput, 'latest, stable');
    await user.click(screen.getAllByRole('button', { name: 'Add' })[0]);

    expect(screen.getByText('latest')).toBeInTheDocument();
    expect(screen.getByText('stable')).toBeInTheDocument();

    const excludeInput = document.getElementById('addTags-exclude') as HTMLInputElement;
    await user.type(excludeInput, 'dev');
    await user.keyboard('{Enter}');
    expect(screen.getByText('dev')).toBeInTheDocument();

    const includeRemove = screen.getByText('latest').closest('.pf-v6-c-label') as HTMLElement;
    await user.click(within(includeRemove).getByRole('button'));
    expect(screen.queryByText('latest')).not.toBeInTheDocument();
  });

  it('ignores empty tag input submissions', async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <MemoryRouter>
        <CreateExecutionEnvironment />
      </MemoryRouter>
    );

    await screen.findByRole('textbox', { name: 'Upstream name' });
    await user.click(screen.getAllByRole('button', { name: 'Add' })[0]);
    expect(screen.queryByRole('button', { name: 'latest' })).not.toBeInTheDocument();
  });
});

describe('EditExecutionEnvironment', () => {
  it('loads edit form with description and tag chips from remote', async () => {
    server.use(
      http.get(
        hubAPI`/v3/plugin/execution-environments/repositories/${mockExecutionEnvironment.name}/`,
        () => HttpResponse.json(mockExecutionEnvironment)
      )
    );

    render(
      <MemoryRouter
        initialEntries={[`/execution-environments/${mockExecutionEnvironment.name}/edit`]}
      >
        <Routes>
          <Route path="/execution-environments/:id/edit" element={<EditExecutionEnvironment />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByRole('heading', {
        name: `Edit ${mockExecutionEnvironment.name}`,
      })
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Description' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save execution environment' })).toBeInTheDocument();
  });

  it('shows namespace field for local execution environments without remotes', async () => {
    const localEE = {
      ...mockExecutionEnvironment,
      pulp: {
        ...mockExecutionEnvironment.pulp!,
        repository: {
          ...mockExecutionEnvironment.pulp!.repository!,
          remote: undefined,
        },
      },
    };

    server.use(
      http.get(
        hubAPI`/v3/plugin/execution-environments/repositories/${mockExecutionEnvironment.name}/`,
        () => HttpResponse.json(localEE)
      )
    );

    render(
      <MemoryRouter
        initialEntries={[`/execution-environments/${mockExecutionEnvironment.name}/edit`]}
      >
        <Routes>
          <Route path="/execution-environments/:id/edit" element={<EditExecutionEnvironment />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole('textbox', { name: 'Namespace' })).toHaveValue(
      mockExecutionEnvironment.namespace!.name
    );
    expect(screen.queryByRole('textbox', { name: 'Upstream name' })).not.toBeInTheDocument();
  });

  it('submits edit form with remote and description updates', async () => {
    let putCalled = false;
    let patchCalled = false;

    server.use(
      http.get(
        hubAPI`/v3/plugin/execution-environments/repositories/${mockExecutionEnvironment.name}/`,
        () => HttpResponse.json(mockExecutionEnvironment)
      ),
      http.put(hubAPI`/_ui/v1/execution-environments/remotes/test-remote-id/`, () => {
        putCalled = true;
        return HttpResponse.json({});
      }),
      http.patch(
        pulpAPI`/distributions/container/container/${mockExecutionEnvironment.pulp!.distribution!.id}/`,
        () => {
          patchCalled = true;
          return HttpResponse.json({});
        }
      )
    );

    const user = userEvent.setup({ delay: null });
    render(
      <MemoryRouter
        initialEntries={[`/execution-environments/${mockExecutionEnvironment.name}/edit`]}
      >
        <Routes>
          <Route path="/execution-environments/:id/edit" element={<EditExecutionEnvironment />} />
        </Routes>
      </MemoryRouter>
    );

    const description = await screen.findByRole('textbox', { name: 'Description' });
    await user.clear(description);
    await user.type(description, 'Updated description');
    await user.click(screen.getByRole('button', { name: 'Save execution environment' }));

    await waitFor(() => {
      expect(putCalled).toBe(true);
      expect(patchCalled).toBe(true);
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  it('creates remote execution environment on submit', async () => {
    let postCalled = false;
    server.use(
      http.post(hubAPI`/_ui/v1/execution-environments/remotes/`, () => {
        postCalled = true;
        return HttpResponse.json({});
      })
    );

    const user = userEvent.setup({ delay: null });
    render(
      <MemoryRouter>
        <CreateExecutionEnvironment />
      </MemoryRouter>
    );

    await user.type(await screen.findByRole('textbox', { name: 'Name' }), 'new-ee');
    await user.type(
      screen.getByRole('textbox', { name: 'Upstream name' }),
      'docker.io/library/busybox'
    );
    await user.click(screen.getByRole('button', { name: 'Create execution environment' }));

    await waitFor(() => {
      expect(postCalled).toBe(true);
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  it('shows registry error state', async () => {
    server.use(
      http.get(hubAPI`/_ui/v1/execution-environments/registries/`, () =>
        HttpResponse.json({ detail: 'Registry error' }, { status: 500 })
      )
    );

    render(
      <MemoryRouter>
        <CreateExecutionEnvironment />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Registry error|Something went wrong/i)).toBeInTheDocument();
  });

  it('navigates back when cancel is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <MemoryRouter>
        <CreateExecutionEnvironment />
      </MemoryRouter>
    );

    await user.click(await screen.findByRole('button', { name: 'Cancel' }));
    expect(mockNavigate).toHaveBeenCalled();
  });
});
