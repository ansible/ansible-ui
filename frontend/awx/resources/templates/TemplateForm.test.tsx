import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { CreateJobTemplate, EditJobTemplate } from './TemplateForm';

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
      data-testid={props.id as string}
    />
  ),
}));

const mockJobTemplate = {
  id: 42,
  name: 'My Job Template',
  description: 'A test template',
  job_type: 'run',
  inventory: 1,
  project: 1,
  playbook: 'hello_world.yml',
  scm_branch: '',
  forks: 5,
  limit: '',
  verbosity: 1,
  extra_vars: '---\n',
  job_tags: 'deploy,setup',
  skip_tags: '',
  timeout: 120,
  diff_mode: false,
  job_slice_count: 1,
  host_config_key: '',
  ask_scm_branch_on_launch: false,
  ask_diff_mode_on_launch: false,
  ask_variables_on_launch: false,
  ask_limit_on_launch: false,
  ask_tags_on_launch: false,
  ask_skip_tags_on_launch: false,
  ask_job_type_on_launch: false,
  ask_verbosity_on_launch: false,
  ask_inventory_on_launch: false,
  ask_credential_on_launch: false,
  ask_execution_environment_on_launch: false,
  ask_labels_on_launch: false,
  ask_forks_on_launch: false,
  ask_job_slice_count_on_launch: false,
  ask_timeout_on_launch: false,
  ask_instance_groups_on_launch: false,
  become_enabled: false,
  allow_simultaneous: false,
  use_fact_cache: false,
  prevent_instance_group_fallback: false,
  organization: 1,
  webhook_service: '',
  webhook_credential: null as number | null,
  opa_query_path: '',
  related: {
    webhook_receiver: '',
    callback: '',
    webhook_key: '',
  },
  summary_fields: {
    organization: { id: 1, name: 'Default', description: '' },
    project: { id: 1, name: 'Demo Project' },
    inventory: { id: 1, name: 'Demo Inventory', description: '', kind: '' },
    credentials: [],
    labels: { count: 0, results: [] },
    execution_environment: null,
    user_capabilities: { edit: true, delete: true, start: true, copy: true, schedule: true },
  },
};

const server = setupServer(
  http.options('*', () => HttpResponse.json({})),
  http.get(awxAPI`/projects/`, () =>
    HttpResponse.json({ count: 1, results: [{ id: 1, name: 'Demo Project', organization: 1 }] })
  ),
  http.get(awxAPI`/inventories/`, () =>
    HttpResponse.json({ count: 1, results: [{ id: 1, name: 'Demo Inventory' }] })
  ),
  http.get(
    ({ request }) => /\/projects\/\d+\/?$/.test(new URL(request.url).pathname),
    () => HttpResponse.json({ id: 1, name: 'Demo Project', organization: 1, allow_override: false })
  ),
  http.get(
    ({ request }) => request.url.includes('/playbooks'),
    () => HttpResponse.json(['hello_world.yml', 'test.yml'])
  ),
  http.get(awxAPI`/labels/`, () => HttpResponse.json({ count: 0, results: [] })),
  http.get(awxAPI`/credential_types/`, () => HttpResponse.json({ count: 0, results: [] })),
  http.get(awxAPI`/credentials/`, () => HttpResponse.json({ count: 0, results: [] })),
  http.get(awxAPI`/execution_environments/`, () => HttpResponse.json({ count: 0, results: [] })),
  http.get(awxAPI`/instance_groups/`, () => HttpResponse.json({ count: 0, results: [] })),
  http.get(awxAPI`/organizations/`, () =>
    HttpResponse.json({ count: 1, results: [{ id: 1, name: 'Default' }] })
  ),
  http.get(awxAPI`/job_templates/42/`, () => HttpResponse.json(mockJobTemplate)),
  http.get(awxAPI`/job_templates/42/instance_groups/`, () =>
    HttpResponse.json({ count: 0, results: [] })
  ),
  http.get(
    ({ request }) => request.url.includes('/webhook_key/'),
    () => HttpResponse.json({ webhook_key: 'test-key' })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('TemplateForm - CreateJobTemplate', () => {
  it('should render Create job template title', async () => {
    render(
      <MemoryRouter>
        <CreateJobTemplate />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent('Create job template');
    });
  });

  it('should render Create button and Cancel button', async () => {
    render(
      <MemoryRouter>
        <CreateJobTemplate />
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /create job template/i })).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  }, 15000);

  it('should render name and description fields', async () => {
    render(
      <MemoryRouter>
        <CreateJobTemplate />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter job template name/i)).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText(/enter description/i)).toBeInTheDocument();
  });

  it('should render job type selector', async () => {
    render(
      <MemoryRouter>
        <CreateJobTemplate />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Job type')).toBeInTheDocument();
    });
  });

  it('should render forks, timeout, and verbosity fields', async () => {
    render(
      <MemoryRouter>
        <CreateJobTemplate />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Forks')).toBeInTheDocument();
    });

    expect(screen.getByText('Timeout')).toBeInTheDocument();
    expect(screen.getByText('Verbosity')).toBeInTheDocument();
  });

  it('should render option checkboxes', async () => {
    render(
      <MemoryRouter>
        <CreateJobTemplate />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Privilege escalation')).toBeInTheDocument();
    });

    expect(screen.getByText('Provisioning callback')).toBeInTheDocument();
    expect(screen.getByText('Enable webhook')).toBeInTheDocument();
    expect(screen.getByText('Concurrent jobs')).toBeInTheDocument();
    expect(screen.getByText('Enable fact storage')).toBeInTheDocument();
    expect(screen.getByText('Prevent instance group fallback')).toBeInTheDocument();
  });

  it('should render extra variables editor', async () => {
    render(
      <MemoryRouter>
        <CreateJobTemplate />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Extra variables')).toBeInTheDocument();
    });
  });

  it('should render job tags and skip tags fields', async () => {
    render(
      <MemoryRouter>
        <CreateJobTemplate />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Job tags')).toBeInTheDocument();
    });

    expect(screen.getByText('Skip tags')).toBeInTheDocument();
  });
});

describe('TemplateForm - EditJobTemplate', () => {
  it('should render edit title with template name', async () => {
    render(
      <MemoryRouter initialEntries={['/templates/job_template/42/edit']}>
        <Routes>
          <Route path="/templates/job_template/:id/edit" element={<EditJobTemplate />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent('Edit My Job Template');
    });
  });

  it('should render save button and cancel button in edit mode', async () => {
    render(
      <MemoryRouter initialEntries={['/templates/job_template/42/edit']}>
        <Routes>
          <Route path="/templates/job_template/:id/edit" element={<EditJobTemplate />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /save job template/i })).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  }, 15000);

  it('should preload name and description from template data', async () => {
    render(
      <MemoryRouter initialEntries={['/templates/job_template/42/edit']}>
        <Routes>
          <Route path="/templates/job_template/:id/edit" element={<EditJobTemplate />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByDisplayValue('My Job Template')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    expect(screen.getByDisplayValue('A test template')).toBeInTheDocument();
  }, 15000);

  it('should render error when template fetch fails', async () => {
    server.use(
      http.get(awxAPI`/job_templates/42/`, () =>
        HttpResponse.json({ detail: 'Not Found' }, { status: 404 })
      )
    );

    render(
      <MemoryRouter initialEntries={['/templates/job_template/42/edit']}>
        <Routes>
          <Route path="/templates/job_template/:id/edit" element={<EditJobTemplate />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Not Found')).toBeInTheDocument();
    });
  });

  it('should preload forks and timeout values', async () => {
    render(
      <MemoryRouter initialEntries={['/templates/job_template/42/edit']}>
        <Routes>
          <Route path="/templates/job_template/:id/edit" element={<EditJobTemplate />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByDisplayValue('My Job Template')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    expect(screen.getByDisplayValue('120')).toBeInTheDocument();
  }, 15000);

  it(
    'should fetch /organizations/ and create label when template has no org and a label is added',
    { timeout: 30000 },
    async () => {
      const templateWithoutOrg = {
        ...mockJobTemplate,
        id: 1,
        name: 'No Org Template',
        summary_fields: {
          ...mockJobTemplate.summary_fields,
          organization: undefined,
          labels: { count: 0, results: [] },
        },
      };
      let orgFetched = false;
      let labelPostBody: Record<string, unknown> | null = null;
      server.use(
        http.get(awxAPI`/job_templates/1/`, () => HttpResponse.json(templateWithoutOrg)),
        http.get(awxAPI`/job_templates/1/instance_groups/`, () =>
          HttpResponse.json({ count: 0, results: [] })
        ),
        http.patch(awxAPI`/job_templates/1/`, () => HttpResponse.json(templateWithoutOrg)),
        http.get(awxAPI`/organizations/`, () => {
          orgFetched = true;
          return HttpResponse.json({ count: 1, results: [{ id: 10, name: 'Default' }] });
        }),
        http.post(awxAPI`/job_templates/1/labels/`, async ({ request }) => {
          labelPostBody = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json(labelPostBody);
        })
      );

      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/templates/job_template/1/edit']}>
          <Routes>
            <Route path="/templates/job_template/:id/edit" element={<EditJobTemplate />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(
        () => {
          expect(screen.getByDisplayValue('No Org Template')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      const labelsInput = screen.getByTestId('labels-input');
      await user.click(labelsInput);
      await user.type(labelsInput, 'new-label');
      await user.keyboard('{Enter}');

      await user.click(screen.getByRole('button', { name: /save job template/i }));

      await waitFor(() => {
        expect(orgFetched).toBe(true);
      });
      expect(labelPostBody).toMatchObject({ name: 'new-label', organization: 10 });
    }
  );

  it(
    'should not set orgId when /organizations/ returns empty results',
    { timeout: 30000 },
    async () => {
      const templateWithoutOrg = {
        ...mockJobTemplate,
        id: 1,
        name: 'No Org Template',
        summary_fields: {
          ...mockJobTemplate.summary_fields,
          organization: undefined,
          labels: { count: 0, results: [] },
        },
      };
      let orgFetched = false;
      let labelPostBody: Record<string, unknown> | null = null;
      server.use(
        http.get(awxAPI`/job_templates/1/`, () => HttpResponse.json(templateWithoutOrg)),
        http.get(awxAPI`/job_templates/1/instance_groups/`, () =>
          HttpResponse.json({ count: 0, results: [] })
        ),
        http.patch(awxAPI`/job_templates/1/`, () => HttpResponse.json(templateWithoutOrg)),
        http.get(awxAPI`/organizations/`, () => {
          orgFetched = true;
          return HttpResponse.json({ count: 0, results: [] });
        }),
        http.post(awxAPI`/job_templates/1/labels/`, async ({ request }) => {
          labelPostBody = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json(labelPostBody);
        })
      );

      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/templates/job_template/1/edit']}>
          <Routes>
            <Route path="/templates/job_template/:id/edit" element={<EditJobTemplate />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(
        () => {
          expect(screen.getByDisplayValue('No Org Template')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      const labelsInput = screen.getByTestId('labels-input');
      await user.click(labelsInput);
      await user.type(labelsInput, 'new-label');
      await user.keyboard('{Enter}');

      await user.click(screen.getByRole('button', { name: /save job template/i }));

      await waitFor(() => {
        expect(orgFetched).toBe(true);
      });
      expect(labelPostBody).toMatchObject({ name: 'new-label' });
    }
  );

  it('should render error and use instanceGroupRefresh when instance groups fetch fails', async () => {
    server.use(
      http.get(awxAPI`/job_templates/42/instance_groups/`, () =>
        HttpResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
      )
    );

    render(
      <MemoryRouter initialEntries={['/templates/job_template/42/edit']}>
        <Routes>
          <Route path="/templates/job_template/:id/edit" element={<EditJobTemplate />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Internal Server Error')).toBeInTheDocument();
    });
  });

  it('should render fallback title when template has no name', async () => {
    server.use(
      http.get(awxAPI`/job_templates/42/`, () =>
        HttpResponse.json({ ...mockJobTemplate, name: '' })
      )
    );

    render(
      <MemoryRouter initialEntries={['/templates/job_template/42/edit']}>
        <Routes>
          <Route path="/templates/job_template/:id/edit" element={<EditJobTemplate />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Job Template');
      },
      { timeout: 10000 }
    );
  }, 15000);

  it('should navigate when cancel is clicked in edit mode', { timeout: 15000 }, async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/templates/job_template/42/edit']}>
        <Routes>
          <Route path="/templates/job_template/:id/edit" element={<EditJobTemplate />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    await user.click(screen.getByRole('button', { name: /cancel/i }));
  });

  it('should submit edit form with non-empty skip_tags', { timeout: 30000 }, async () => {
    const templateWithSkipTags = {
      ...mockJobTemplate,
      id: 100,
      name: 'Skip Tags Template',
      skip_tags: 'tag1,tag2',
      summary_fields: {
        ...mockJobTemplate.summary_fields,
        labels: { count: 0, results: [] },
      },
    };
    let patchPayload: Record<string, unknown> | null = null;

    server.use(
      http.get(awxAPI`/job_templates/100/`, () => HttpResponse.json(templateWithSkipTags)),
      http.get(awxAPI`/job_templates/100/instance_groups/`, () =>
        HttpResponse.json({ count: 0, results: [] })
      ),
      http.patch(awxAPI`/job_templates/100/`, async ({ request }) => {
        patchPayload = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(templateWithSkipTags);
      })
    );

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/templates/job_template/100/edit']}>
        <Routes>
          <Route path="/templates/job_template/:id/edit" element={<EditJobTemplate />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByDisplayValue('Skip Tags Template')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    await user.click(screen.getByRole('button', { name: /save job template/i }));

    await waitFor(() => {
      expect(patchPayload).not.toBeNull();
      expect(patchPayload?.skip_tags).toBe('tag1,tag2');
    });
  });

  it('should submit edit form with webhook_credential set', { timeout: 30000 }, async () => {
    const templateWithWebhookCred = {
      ...mockJobTemplate,
      id: 101,
      name: 'Webhook Cred Template',
      webhook_credential: 99,
      summary_fields: {
        ...mockJobTemplate.summary_fields,
        labels: { count: 0, results: [] },
      },
    };
    let patchPayload: Record<string, unknown> | null = null;

    server.use(
      http.get(awxAPI`/job_templates/101/`, () => HttpResponse.json(templateWithWebhookCred)),
      http.get(awxAPI`/job_templates/101/instance_groups/`, () =>
        HttpResponse.json({ count: 0, results: [] })
      ),
      http.patch(awxAPI`/job_templates/101/`, async ({ request }) => {
        patchPayload = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(templateWithWebhookCred);
      })
    );

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/templates/job_template/101/edit']}>
        <Routes>
          <Route path="/templates/job_template/:id/edit" element={<EditJobTemplate />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByDisplayValue('Webhook Cred Template')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    await user.click(screen.getByRole('button', { name: /save job template/i }));

    await waitFor(() => {
      expect(patchPayload?.webhook_credential).toBe(99);
    });
  });

  it(
    'should submit edit form with webhook_service when webhook is enabled',
    { timeout: 30000 },
    async () => {
      const templateWithWebhook = {
        ...mockJobTemplate,
        id: 102,
        name: 'Webhook Template',
        webhook_service: 'github',
        related: {
          ...mockJobTemplate.related,
          webhook_receiver: '/api/v2/job_templates/102/github/',
        },
        summary_fields: {
          ...mockJobTemplate.summary_fields,
          labels: { count: 0, results: [] },
        },
      };
      let patchPayload: Record<string, unknown> | null = null;

      server.use(
        http.get(awxAPI`/job_templates/102/`, () => HttpResponse.json(templateWithWebhook)),
        http.get(awxAPI`/job_templates/102/instance_groups/`, () =>
          HttpResponse.json({ count: 0, results: [] })
        ),
        http.patch(awxAPI`/job_templates/102/`, async ({ request }) => {
          patchPayload = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json(templateWithWebhook);
        })
      );

      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/templates/job_template/102/edit']}>
          <Routes>
            <Route path="/templates/job_template/:id/edit" element={<EditJobTemplate />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(
        () => {
          expect(screen.getByDisplayValue('Webhook Template')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      await user.click(screen.getByRole('button', { name: /save job template/i }));

      await waitFor(() => {
        expect(patchPayload?.webhook_service).toBe('github');
      });
    }
  );

  it(
    'should submit edit form with host_config_key when provisioning callback is enabled',
    { timeout: 30000 },
    async () => {
      const templateWithCallback = {
        ...mockJobTemplate,
        id: 103,
        name: 'Callback Template',
        host_config_key: 'my-key-123',
        related: {
          ...mockJobTemplate.related,
          callback: '/api/v2/job_templates/103/callback/',
        },
        summary_fields: {
          ...mockJobTemplate.summary_fields,
          labels: { count: 0, results: [] },
        },
      };
      let patchPayload: Record<string, unknown> | null = null;

      server.use(
        http.get(awxAPI`/job_templates/103/`, () => HttpResponse.json(templateWithCallback)),
        http.get(awxAPI`/job_templates/103/instance_groups/`, () =>
          HttpResponse.json({ count: 0, results: [] })
        ),
        http.patch(awxAPI`/job_templates/103/`, async ({ request }) => {
          patchPayload = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json(templateWithCallback);
        })
      );

      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/templates/job_template/103/edit']}>
          <Routes>
            <Route path="/templates/job_template/:id/edit" element={<EditJobTemplate />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(
        () => {
          expect(screen.getByDisplayValue('Callback Template')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      await user.click(screen.getByRole('button', { name: /save job template/i }));

      await waitFor(() => {
        expect(patchPayload?.host_config_key).toBe('my-key-123');
      });
    }
  );

  it('should submit edit form with execution_environment id', { timeout: 30000 }, async () => {
    const templateWithEE = {
      ...mockJobTemplate,
      id: 104,
      name: 'EE Template',
      summary_fields: {
        ...mockJobTemplate.summary_fields,
        execution_environment: { id: 3, name: 'Default EE', description: '' },
        labels: { count: 0, results: [] },
      },
    };
    let patchPayload: Record<string, unknown> | null = null;

    server.use(
      http.get(awxAPI`/job_templates/104/`, () => HttpResponse.json(templateWithEE)),
      http.get(awxAPI`/job_templates/104/instance_groups/`, () =>
        HttpResponse.json({ count: 0, results: [] })
      ),
      http.patch(awxAPI`/job_templates/104/`, async ({ request }) => {
        patchPayload = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(templateWithEE);
      })
    );

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/templates/job_template/104/edit']}>
        <Routes>
          <Route path="/templates/job_template/:id/edit" element={<EditJobTemplate />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByDisplayValue('EE Template')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    await user.click(screen.getByRole('button', { name: /save job template/i }));

    await waitFor(() => {
      expect(patchPayload?.execution_environment).toBe(3);
    });
  });

  it(
    'should disassociate original and associate new instance groups when they differ',
    { timeout: 30000 },
    async () => {
      const templateId = 105;
      let instanceGroupsCallCount = 0;
      const disassociateRequests: number[] = [];
      const associateRequests: number[] = [];

      server.use(
        http.get(awxAPI`/job_templates/105/`, () =>
          HttpResponse.json({ ...mockJobTemplate, id: templateId, name: 'IG Template' })
        ),
        http.get(awxAPI`/job_templates/105/instance_groups/`, () => {
          instanceGroupsCallCount++;
          if (instanceGroupsCallCount === 1) {
            return HttpResponse.json({ count: 1, results: [{ id: 5, name: 'original-group' }] });
          }
          return HttpResponse.json({ count: 1, results: [{ id: 6, name: 'different-group' }] });
        }),
        http.patch(awxAPI`/job_templates/105/`, () =>
          HttpResponse.json({ ...mockJobTemplate, id: templateId })
        ),
        http.post(awxAPI`/job_templates/105/instance_groups/`, async ({ request }) => {
          const body = (await request.json()) as { id: number; disassociate?: boolean };
          if (body.disassociate) {
            disassociateRequests.push(body.id);
          } else {
            associateRequests.push(body.id);
          }
          return HttpResponse.json({});
        })
      );

      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/templates/job_template/105/edit']}>
          <Routes>
            <Route path="/templates/job_template/:id/edit" element={<EditJobTemplate />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(
        () => {
          expect(screen.getByDisplayValue('IG Template')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      await user.click(screen.getByRole('button', { name: /save job template/i }));

      await waitFor(() => {
        expect(disassociateRequests).toContain(6);
        expect(associateRequests).toContain(5);
      });
    }
  );

  it(
    'should handle submitCredentials when template has no credentials in summary_fields',
    { timeout: 30000 },
    async () => {
      const templateWithoutCredentials = {
        ...mockJobTemplate,
        id: 106,
        name: 'No Cred Template',
        summary_fields: {
          ...mockJobTemplate.summary_fields,
          credentials: undefined as unknown as [],
          labels: { count: 0, results: [] },
        },
      };

      server.use(
        http.get(awxAPI`/job_templates/106/`, () => HttpResponse.json(templateWithoutCredentials)),
        http.get(awxAPI`/job_templates/106/instance_groups/`, () =>
          HttpResponse.json({ count: 0, results: [] })
        ),
        http.patch(awxAPI`/job_templates/106/`, () => HttpResponse.json(templateWithoutCredentials))
      );

      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/templates/job_template/106/edit']}>
          <Routes>
            <Route path="/templates/job_template/:id/edit" element={<EditJobTemplate />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(
        () => {
          expect(screen.getByDisplayValue('No Cred Template')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      await user.click(screen.getByRole('button', { name: /save job template/i }));

      await waitFor(() => {
        expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
      });
    }
  );
});

describe('TemplateForm - CreateJobTemplate cancel', () => {
  it('should go back when cancel is clicked in create mode', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/templates/job_template/create']}>
        <CreateJobTemplate />
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    await user.click(screen.getByRole('button', { name: /cancel/i }));
  }, 15000);
});
