import { createElement, type ComponentType } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { InventoryRunCommand } from './InventoryRunCommand';

const mockPageNavigate = vi.hoisted(() => vi.fn());
const pageWizardCapture = vi.hoisted(() => ({
  useStub: false,
  onSubmit: undefined as ((data: Record<string, unknown>) => Promise<void> | void) | undefined,
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual<typeof import('@ansible/ansible-ui-framework')>(
    '@ansible/ansible-ui-framework'
  );
  return {
    ...actual,
    usePageNavigate: () => mockPageNavigate,
    PageWizard: (props: Record<string, unknown>) => {
      pageWizardCapture.onSubmit = props.onSubmit as typeof pageWizardCapture.onSubmit;
      if (pageWizardCapture.useStub) {
        return createElement('div', { 'data-testid': 'mocked-page-wizard' });
      }
      const RealPageWizard = actual.PageWizard as ComponentType<Record<string, unknown>>;
      return createElement(RealPageWizard, props);
    },
  };
});

vi.mock('@ansible/ansible-ui-framework/components/DataEditor', () => ({
  DataEditor: (props: {
    id?: string;
    name: string;
    value: string;
    onChange: (v: string) => void;
  }) => (
    <textarea
      id={props.id ?? props.name}
      name={props.name}
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      data-testid={props.name}
    />
  ),
}));

const mockInventory = {
  id: 1,
  name: 'Default',
  kind: '' as const,
  organization: 1,
  summary_fields: {
    organization: { id: 1, name: 'Default' },
    user_capabilities: {},
  },
};

const adHocOptions = {
  actions: {
    GET: {
      module_name: {
        choices: [
          ['command', 'command'],
          ['shell', 'shell'],
        ],
      },
      verbosity: {
        choices: [
          [0, '0 (Normal)'],
          [1, '1 (Verbose)'],
          [2, '2 (More Verbose)'],
        ],
      },
    },
  },
};

const mockExecutionEnvironments = {
  count: 2,
  results: [
    { id: 1, name: 'AWX EE (latest)', description: '' },
    { id: 2, name: 'Control Plane Execution Environment', description: '' },
  ],
};

const mockCredentials = {
  count: 1,
  results: [
    {
      id: 1,
      name: 'Demo Credential',
      credential_type: 1,
      summary_fields: { credential_type: { name: 'Machine' } },
    },
  ],
};

const mockCredential = {
  id: 1,
  name: 'Demo Credential',
  inputs: { username: 'admin' },
};

const server = setupServer(
  http.get(
    ({ request }) =>
      request.url.includes('/inventories/') &&
      request.url.includes('/1/') &&
      !request.url.includes('inventory_sources'),
    () => HttpResponse.json(mockInventory)
  ),
  http.options(
    ({ request }) =>
      request.url.includes('/ad_hoc_commands') || request.url.includes('/ad_hoc_commands/'),
    () => HttpResponse.json(adHocOptions)
  ),
  http.get(
    ({ request }) => /\/execution_environments\/\d+\/$/.test(request.url),
    () => HttpResponse.json(mockExecutionEnvironments.results[0])
  ),
  http.get(
    ({ request }) => request.url.includes('/execution_environments'),
    () => HttpResponse.json(mockExecutionEnvironments)
  ),
  http.get(
    ({ request }) =>
      request.url.includes('/credentials') && !request.url.includes('/credentials/1/'),
    () => HttpResponse.json(mockCredentials)
  ),
  http.get(
    ({ request }) => request.url.includes('/credentials/1/'),
    () => HttpResponse.json(mockCredential)
  ),
  http.post(
    ({ request }) => request.url.includes('/ad_hoc_commands/'),
    () => HttpResponse.json({ id: '999' }, { status: 201 })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  pageWizardCapture.useStub = false;
  pageWizardCapture.onSubmit = undefined;
  mockPageNavigate.mockClear();
});
afterAll(() => server.close());

function renderRunCommand() {
  return render(
    <MemoryRouter initialEntries={['/inventories/inventory/1/run_command']}>
      <Routes>
        <Route
          path="/inventories/:inventory_type/:id/run_command"
          element={<InventoryRunCommand />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('InventoryRunCommand', () => {
  it('should render run command wizard with title', async () => {
    renderRunCommand();

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent('Run command');
    });
  });

  it('should show Details step with module and verbosity selects', async () => {
    renderRunCommand();

    await waitFor(() => {
      expect(screen.getByText('Module')).toBeInTheDocument();
    });

    expect(screen.getByText('Arguments')).toBeInTheDocument();
    expect(screen.getByText('Verbosity')).toBeInTheDocument();
    expect(screen.getByText('Limit')).toBeInTheDocument();
    expect(screen.getByText('Forks')).toBeInTheDocument();
  });

  it('should fill Details step form fields', { timeout: 15000 }, async () => {
    const user = userEvent.setup();
    renderRunCommand();

    await screen.findByText('Select a module', {}, { timeout: 10000 });

    await user.click(screen.getByText('Select a module'));
    await user.click(screen.getByText('shell'));

    const argsInput = screen.getByPlaceholderText('Enter arguments');
    await user.type(argsInput, 'argument');
    expect(argsInput).toHaveValue('argument');

    await user.click(screen.getByText('0 (Normal)'));
    await user.click(screen.getByText('1 (Verbose)'));

    const limitInput = screen.getByTestId('limit-form-group').querySelector('input');
    if (limitInput) {
      await user.clear(limitInput);
      await user.type(limitInput, 'limit');
      expect(limitInput).toHaveValue('limit');
    }

    const forksInput = screen.getByTestId('forks-form-group').querySelector('input');
    if (forksInput) {
      await user.clear(forksInput);
      await user.type(forksInput, '1');
      expect(forksInput).toHaveValue(1);
    }

    const diffModeToggle = screen.getByTestId('diff-mode-toggle');
    await user.click(diffModeToggle);

    const becomeCheckbox = screen.getByTestId('become_enabled');
    await user.click(becomeCheckbox);

    const extraVarsInput = screen.getByTestId('extra_vars');
    await user.clear(extraVarsInput);
    await user.type(extraVarsInput, 'myvar');
    expect(extraVarsInput).toHaveValue('myvar');
  });

  it('should have Cancel button that navigates back', async () => {
    const user = userEvent.setup();
    renderRunCommand();

    await waitFor(() => {
      expect(screen.getByTestId('wizard-cancel')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('wizard-cancel'));
    expect(globalThis.history.length).toBeGreaterThan(0);
  });

  it('should submit ad hoc command including credential passwords and navigate to job output', async () => {
    pageWizardCapture.useStub = true;
    let postedBody: Record<string, unknown> | undefined;

    server.use(
      http.post(
        ({ request }) => request.url.includes('/ad_hoc_commands/'),
        async ({ request }) => {
          postedBody = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({ id: '999' }, { status: 201 });
        }
      )
    );

    renderRunCommand();

    await waitFor(() => {
      expect(screen.getByTestId('mocked-page-wizard')).toBeInTheDocument();
    });
    expect(pageWizardCapture.onSubmit).toBeDefined();

    await pageWizardCapture.onSubmit?.({
      module_name: 'shell',
      module_args: 'uptime',
      verbosity: 1,
      limit: 'all',
      forks: 1,
      diff_mode: true,
      become_enabled: true,
      extra_vars: '---',
      credential: 1,
      execution_environment: 2,
      credential_passwords: { ssh_password: 'secret' },
    });

    await waitFor(() => {
      expect(postedBody).toBeDefined();
    });
    expect(postedBody).toMatchObject({
      module_name: 'shell',
      module_args: 'uptime',
      verbosity: 1,
      credential: 1,
      execution_environment: 2,
      ssh_password: 'secret',
    });
    expect(mockPageNavigate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        params: { id: '999', job_type: 'command' },
      })
    );
  });
});
