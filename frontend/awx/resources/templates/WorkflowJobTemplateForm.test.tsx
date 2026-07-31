import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { parseStringToTagArray, stringifyTags } from './JobTemplateFormHelpers';
import { CreateWorkflowJobTemplate, EditWorkflowJobTemplate } from './WorkflowJobTemplateForm';

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

const mockWfjt = {
  id: 10,
  name: 'My Workflow',
  description: 'A test workflow',
  type: 'workflow_job_template' as const,
  organization: 1,
  inventory: null,
  extra_vars: '---\n',
  job_tags: 'deploy',
  skip_tags: 'cleanup',
  limit: '',
  scm_branch: '',
  allow_simultaneous: true,
  webhook_service: '',
  webhook_credential: null,
  ask_inventory_on_launch: false,
  ask_labels_on_launch: false,
  ask_limit_on_launch: false,
  ask_scm_branch_on_launch: false,
  ask_skip_tags_on_launch: false,
  ask_tags_on_launch: false,
  ask_variables_on_launch: false,
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-01T00:00:00Z',
  last_job_run: null,
  last_job_failed: false,
  next_job_run: null,
  status: 'never updated',
  related: {
    schedules: '/api/v2/workflow_job_templates/10/schedules/',
    survey_spec: '/api/v2/workflow_job_templates/10/survey_spec/',
    webhook_receiver: '',
    webhook_key: '/api/v2/workflow_job_templates/10/webhook_key/',
    labels: '/api/v2/workflow_job_templates/10/labels/',
    launch: '/api/v2/workflow_job_templates/10/launch/',
  },
  summary_fields: {
    organization: { id: 1, name: 'Default', description: '' },
    inventory: null as { id: number; name: string } | null,
    project: { id: 1, name: 'Demo Project' },
    labels: { count: 0, results: [] as { id: number; name: string }[] },
    recent_jobs: [],
    created_by: { id: 1, username: 'admin', first_name: '', last_name: '' },
    modified_by: { id: 1, username: 'admin', first_name: '', last_name: '' },
    object_roles: {
      execute_role: { description: '', name: 'Execute', id: 1 },
      read_role: { description: '', name: 'Read', id: 2 },
      approval_role: { description: '', name: 'Approve', id: 3 },
      admin_role: { description: '', name: 'Admin', id: 4 },
    },
    user_capabilities: { edit: true, delete: true, start: true, schedule: true, copy: true },
    credentials: [],
  },
};

const server = setupServer(
  http.options('*', () => HttpResponse.json({})),
  http.get(awxAPI`/organizations/`, () =>
    HttpResponse.json({ count: 1, results: [{ id: 1, name: 'Default' }] })
  ),
  http.get(awxAPI`/inventories/`, () => HttpResponse.json({ count: 0, results: [] })),
  http.get(awxAPI`/labels/`, () => HttpResponse.json({ count: 0, results: [] })),
  http.get(awxAPI`/credentials/`, () => HttpResponse.json({ count: 0, results: [] })),
  http.get(awxAPI`/credential_types/`, () => HttpResponse.json({ count: 0, results: [] })),
  http.get(awxAPI`/workflow_job_templates/10/`, () => HttpResponse.json(mockWfjt))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('WorkflowJobTemplateForm', () => {
  describe('WorkflowJobTemplate helper functions', () => {
    it('should parse comma-separated string to tag array', () => {
      const result = parseStringToTagArray('tag1, tag2, tag3');
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('tag1');
      expect(result[1].name).toBe(' tag2');
      expect(result[2].name).toBe(' tag3');
    });

    it('should handle empty string when parsing tags', () => {
      const result = parseStringToTagArray('');
      expect(result).toEqual([]);
    });

    it('should handle null when parsing tags', () => {
      const result = parseStringToTagArray(null);
      expect(result).toEqual([]);
    });

    it('should stringify tag array to comma-separated string', () => {
      const tags = [{ name: 'tag1' }, { name: 'tag2' }];
      const result = stringifyTags(tags);
      expect(result).toBe('tag1,tag2');
    });

    it('should handle empty array when stringifying tags', () => {
      const result = stringifyTags([]);
      expect(result).toBe('');
    });

    it('should filter empty name tags when stringifying', () => {
      const tags = [{ name: 'tag1' }, { name: '' }, { name: 'tag2' }];
      const result = stringifyTags(tags);
      expect(result).toBe('tag1,tag2');
    });
  });

  describe('CreateWorkflowJobTemplate', () => {
    it('should render create title', async () => {
      render(
        <MemoryRouter>
          <CreateWorkflowJobTemplate />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Create workflow job template');
      });
    });

    it('should render create and cancel buttons', async () => {
      render(
        <MemoryRouter>
          <CreateWorkflowJobTemplate />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /create workflow job template/i })
        ).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should render name and description fields', async () => {
      render(
        <MemoryRouter>
          <CreateWorkflowJobTemplate />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter workflow job template name/i)
        ).toBeInTheDocument();
      });

      expect(screen.getByPlaceholderText(/enter description/i)).toBeInTheDocument();
    });

    it('should render limit and scm branch fields', async () => {
      render(
        <MemoryRouter>
          <CreateWorkflowJobTemplate />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Limit')).toBeInTheDocument();
      });

      expect(screen.getByText('Source control branch')).toBeInTheDocument();
    });

    it('should render job tags and skip tags fields', async () => {
      render(
        <MemoryRouter>
          <CreateWorkflowJobTemplate />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Job tags')).toBeInTheDocument();
      });

      expect(screen.getByText('Skip tags')).toBeInTheDocument();
    });

    it('should render enable webhook and concurrent jobs checkboxes', async () => {
      render(
        <MemoryRouter>
          <CreateWorkflowJobTemplate />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Enable webhook')).toBeInTheDocument();
      });

      expect(screen.getByText('Enable concurrent jobs')).toBeInTheDocument();
    });

    it('should render extra variables editor', async () => {
      render(
        <MemoryRouter>
          <CreateWorkflowJobTemplate />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Extra variables')).toBeInTheDocument();
      });
    });

    it('should POST to /workflow_job_templates/ with null for empty job_tags, skip_tags, and webhook_credential', async () => {
      let postBody: Record<string, unknown> | null = null;
      server.use(
        http.post(awxAPI`/workflow_job_templates/`, async ({ request }) => {
          postBody = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({ id: 99, name: 'New Template', organization: 1 });
        })
      );

      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <CreateWorkflowJobTemplate />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter workflow job template name/i)
        ).toBeInTheDocument();
      });

      await user.type(
        screen.getByPlaceholderText(/enter workflow job template name/i),
        'New Template'
      );
      await user.click(screen.getByRole('button', { name: /create workflow job template/i }));

      await waitFor(() => {
        expect(postBody).not.toBeNull();
      });

      // Default job_tags/skip_tags are [] → stringifyTags([]) = '' → null
      expect(postBody).toMatchObject({
        name: 'New Template',
        job_tags: null,
        skip_tags: null,
        webhook_credential: null,
      });
    });
  });

  describe('EditWorkflowJobTemplate', () => {
    it('should render edit title with template name', async () => {
      render(
        <MemoryRouter initialEntries={['/templates/workflow_job_template/10/edit']}>
          <Routes>
            <Route
              path="/templates/workflow_job_template/:id/edit"
              element={<EditWorkflowJobTemplate />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(
        () => {
          expect(screen.getByTestId('page-title')).toHaveTextContent('Edit My Workflow');
        },
        { timeout: 10000 }
      );
    });

    it('should render save button in edit mode', async () => {
      render(
        <MemoryRouter initialEntries={['/templates/workflow_job_template/10/edit']}>
          <Routes>
            <Route
              path="/templates/workflow_job_template/:id/edit"
              element={<EditWorkflowJobTemplate />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(
        () => {
          expect(
            screen.getByRole('button', { name: /save workflow job template/i })
          ).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    }, 15000);

    it('should preload name and description from template data', async () => {
      render(
        <MemoryRouter initialEntries={['/templates/workflow_job_template/10/edit']}>
          <Routes>
            <Route
              path="/templates/workflow_job_template/:id/edit"
              element={<EditWorkflowJobTemplate />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(
        () => {
          expect(screen.getByDisplayValue('My Workflow')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      expect(screen.getByDisplayValue('A test workflow')).toBeInTheDocument();
    }, 15000);

    it('should render error when template fetch fails', async () => {
      server.use(
        http.get(awxAPI`/workflow_job_templates/10/`, () =>
          HttpResponse.json({ detail: 'Not Found' }, { status: 404 })
        )
      );

      render(
        <MemoryRouter initialEntries={['/templates/workflow_job_template/10/edit']}>
          <Routes>
            <Route
              path="/templates/workflow_job_template/:id/edit"
              element={<EditWorkflowJobTemplate />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Not Found')).toBeInTheDocument();
      });
    });

    it(
      'should fetch /organizations/ and create label when template has no org and a label is added',
      { timeout: 15000 },
      async () => {
        const wjtWithoutOrg = {
          ...mockWfjt,
          id: 1,
          name: 'Test Workflow',
          organization: null,
          summary_fields: {
            ...mockWfjt.summary_fields,
            organization: undefined,
            labels: { count: 0, results: [] },
          },
        };
        let orgFetched = false;
        let labelPostBody: Record<string, unknown> | null = null;
        server.use(
          http.get(awxAPI`/workflow_job_templates/1/`, () => HttpResponse.json(wjtWithoutOrg)),
          http.patch(awxAPI`/workflow_job_templates/1/`, () => HttpResponse.json(wjtWithoutOrg)),
          http.get(awxAPI`/organizations/`, () => {
            orgFetched = true;
            return HttpResponse.json({ count: 1, results: [{ id: 20, name: 'Default' }] });
          }),
          http.post(awxAPI`/workflow_job_templates/1/labels/`, async ({ request }) => {
            labelPostBody = (await request.json()) as Record<string, unknown>;
            return HttpResponse.json(labelPostBody);
          })
        );

        const user = userEvent.setup();
        render(
          <MemoryRouter initialEntries={['/templates/workflow_job_template/1/edit']}>
            <Routes>
              <Route
                path="/templates/workflow_job_template/:id/edit"
                element={<EditWorkflowJobTemplate />}
              />
            </Routes>
          </MemoryRouter>
        );

        await waitFor(
          () => {
            expect(screen.getByDisplayValue('Test Workflow')).toBeInTheDocument();
          },
          { timeout: 10000 }
        );

        const labelsInput = screen.getByTestId('labels-input');
        await user.click(labelsInput);
        await user.type(labelsInput, 'new-label');
        await user.keyboard('{Enter}');

        await user.click(screen.getByRole('button', { name: /save workflow job template/i }));

        await waitFor(() => {
          expect(orgFetched).toBe(true);
        });
        expect(labelPostBody).toMatchObject({ name: 'new-label', organization: 20 });
      }
    );

    it(
      'should not set orgId when /organizations/ returns empty results for WJT',
      { timeout: 15000 },
      async () => {
        const wjtWithoutOrg = {
          ...mockWfjt,
          id: 1,
          name: 'Test Workflow',
          organization: null,
          summary_fields: {
            ...mockWfjt.summary_fields,
            organization: undefined,
            labels: { count: 0, results: [] },
          },
        };
        let orgFetched = false;
        let labelPostBody: Record<string, unknown> | null = null;
        server.use(
          http.get(awxAPI`/workflow_job_templates/1/`, () => HttpResponse.json(wjtWithoutOrg)),
          http.patch(awxAPI`/workflow_job_templates/1/`, () => HttpResponse.json(wjtWithoutOrg)),
          http.get(awxAPI`/organizations/`, () => {
            orgFetched = true;
            return HttpResponse.json({ count: 0, results: [] });
          }),
          http.post(awxAPI`/workflow_job_templates/1/labels/`, async ({ request }) => {
            labelPostBody = (await request.json()) as Record<string, unknown>;
            return HttpResponse.json(labelPostBody);
          })
        );

        const user = userEvent.setup();
        render(
          <MemoryRouter initialEntries={['/templates/workflow_job_template/1/edit']}>
            <Routes>
              <Route
                path="/templates/workflow_job_template/:id/edit"
                element={<EditWorkflowJobTemplate />}
              />
            </Routes>
          </MemoryRouter>
        );

        await waitFor(
          () => {
            expect(screen.getByDisplayValue('Test Workflow')).toBeInTheDocument();
          },
          { timeout: 10000 }
        );

        const labelsInput = screen.getByTestId('labels-input');
        await user.click(labelsInput);
        await user.type(labelsInput, 'new-label');
        await user.keyboard('{Enter}');

        await user.click(screen.getByRole('button', { name: /save workflow job template/i }));

        await waitFor(() => {
          expect(orgFetched).toBe(true);
        });
        expect(labelPostBody).toMatchObject({ name: 'new-label' });
      }
    );

    it(
      'should PATCH with non-null job_tags/skip_tags and null for empty limit and scm_branch',
      { timeout: 15000 },
      async () => {
        let patchBody: Record<string, unknown> | null = null;
        server.use(
          http.patch(awxAPI`/workflow_job_templates/10/`, async ({ request }) => {
            patchBody = (await request.json()) as Record<string, unknown>;
            return HttpResponse.json({ ...mockWfjt });
          })
        );

        const user = userEvent.setup();
        render(
          <MemoryRouter initialEntries={['/templates/workflow_job_template/10/edit']}>
            <Routes>
              <Route
                path="/templates/workflow_job_template/:id/edit"
                element={<EditWorkflowJobTemplate />}
              />
            </Routes>
          </MemoryRouter>
        );

        await waitFor(
          () => {
            expect(screen.getByDisplayValue('My Workflow')).toBeInTheDocument();
          },
          { timeout: 10000 }
        );

        await user.click(screen.getByRole('button', { name: /save workflow job template/i }));

        await waitFor(() => {
          expect(patchBody).not.toBeNull();
          // mockWfjt has job_tags: 'deploy' and skip_tags: 'cleanup' → stringified (non-null)
          expect(patchBody?.job_tags).toBe('deploy');
          expect(patchBody?.skip_tags).toBe('cleanup');
          // mockWfjt has limit: '' and scm_branch: '' → null
          expect(patchBody?.limit).toBeNull();
          expect(patchBody?.scm_branch).toBeNull();
          // mockWfjt has no inventory and no webhook_credential → null
          expect(patchBody?.inventory).toBeNull();
          expect(patchBody?.webhook_credential).toBeNull();
          expect(patchBody?.webhook_service).toBe('');
        });
      }
    );

    it(
      'should PATCH with null job_tags/skip_tags and non-null limit/scm_branch when template has those values',
      { timeout: 15000 },
      async () => {
        const wfjtEmptyTagsWithLimit = {
          ...mockWfjt,
          job_tags: '',
          skip_tags: '',
          limit: 'host-pattern',
          scm_branch: 'feature/test',
        };
        let patchBody: Record<string, unknown> | null = null;
        server.use(
          http.get(awxAPI`/workflow_job_templates/10/`, () =>
            HttpResponse.json(wfjtEmptyTagsWithLimit)
          ),
          http.patch(awxAPI`/workflow_job_templates/10/`, async ({ request }) => {
            patchBody = (await request.json()) as Record<string, unknown>;
            return HttpResponse.json(wfjtEmptyTagsWithLimit);
          })
        );

        const user = userEvent.setup();
        render(
          <MemoryRouter initialEntries={['/templates/workflow_job_template/10/edit']}>
            <Routes>
              <Route
                path="/templates/workflow_job_template/:id/edit"
                element={<EditWorkflowJobTemplate />}
              />
            </Routes>
          </MemoryRouter>
        );

        await waitFor(
          () => {
            expect(screen.getByDisplayValue('My Workflow')).toBeInTheDocument();
          },
          { timeout: 10000 }
        );

        await user.click(screen.getByRole('button', { name: /save workflow job template/i }));

        await waitFor(() => {
          expect(patchBody).not.toBeNull();
          // Empty tags → stringifyTags([]) = '' → null
          expect(patchBody?.job_tags).toBeNull();
          expect(patchBody?.skip_tags).toBeNull();
          // Non-empty limit and scm_branch → passed through as-is
          expect(patchBody?.limit).toBe('host-pattern');
          expect(patchBody?.scm_branch).toBe('feature/test');
        });
      }
    );

    it(
      'should set isWebhookEnabled and render webhook details when webhook_receiver is present',
      { timeout: 15000 },
      async () => {
        const wfjtWithWebhook = {
          ...mockWfjt,
          related: {
            ...mockWfjt.related,
            webhook_receiver: '/api/v2/workflow_job_templates/10/github/',
          },
        };
        server.use(
          http.get(awxAPI`/workflow_job_templates/10/`, () => HttpResponse.json(wfjtWithWebhook)),
          http.get(awxAPI`/workflow_job_templates/10/webhook_key/`, () =>
            HttpResponse.json({ webhook_key: 'test-key' })
          )
        );

        render(
          <MemoryRouter initialEntries={['/templates/workflow_job_template/10/edit']}>
            <Routes>
              <Route
                path="/templates/workflow_job_template/:id/edit"
                element={<EditWorkflowJobTemplate />}
              />
            </Routes>
          </MemoryRouter>
        );

        await waitFor(
          () => {
            expect(screen.getByDisplayValue('My Workflow')).toBeInTheDocument();
          },
          { timeout: 10000 }
        );

        // isWebhookEnabled = true because webhook_receiver is truthy → WebhookSubForm renders
        await waitFor(() => {
          expect(screen.getByText('Webhook details')).toBeInTheDocument();
        });
      }
    );
  });
});
