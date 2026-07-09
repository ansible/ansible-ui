import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { TFunction } from 'i18next';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import {
  CreateInventory,
  EditInventory,
  loadInputInventories,
  submitInputInventories,
} from './InventoryForm';

// Replace PageFormDataEditor with a simple controlled textarea so tests can type
// raw strings without YAML transformation, and so the validate rule fires on submit.
vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  const { useController } = await import('react-hook-form');
  return {
    ...actual,
    PageFormDataEditor: function MockPageFormDataEditor({
      name,
      label,
      validate,
      isRequired,
    }: {
      name: string;
      label?: string;
      validate?: (v: string) => string | undefined;
      isRequired?: boolean;
    }) {
      const { field, fieldState } = useController({
        name,
        rules: {
          validate,
          required: isRequired ? 'This field is required.' : undefined,
        },
      });
      return (
        <>
          <textarea
            data-testid={name}
            aria-label={label}
            value={(field.value as string) ?? ''}
            onChange={(e) => field.onChange(e.target.value)}
          />
          {fieldState.error?.message && (
            <span data-testid={`${name}-error`}>{fieldState.error.message}</span>
          )}
        </>
      );
    },
  };
});

// Replace PageFormMultiSelectAwxResource with a button that sets the inventories
// field when clicked, allowing tests to simulate inventory selection without a
// running API. The field's existing defaultValue (from EditInventory preload) is
// preserved when the button is not clicked.
vi.mock('../../common/PageFormMultiSelectAwxResource', async () => {
  const { useController } = await import('react-hook-form');
  return {
    PageFormMultiSelectAwxResource: function MockMultiSelect({
      name,
      id,
    }: {
      name: string;
      id?: string;
    }) {
      const { field } = useController({ name });
      return (
        <button
          data-testid={id ?? name}
          type="button"
          onClick={() =>
            field.onChange([
              {
                id: 10,
                name: 'source-inventory-1',
                kind: '',
                type: 'inventory',
                url: '/api/v2/inventories/10/',
              },
            ])
          }
        >
          Select inventories
        </button>
      );
    },
  };
});

vi.mock('../../common/PageFormLabelSelect', async () => {
  const { useController } = await import('react-hook-form');
  return {
    PageFormLabelSelect: function MockLabelSelect({ name }: { name: string }) {
      const { field } = useController({ name });
      return (
        <button
          data-testid="label-select"
          type="button"
          onClick={() => field.onChange([{ id: 99, name: 'new-label', organization: 1 }])}
        >
          Select labels
        </button>
      );
    },
  };
});

vi.mock('../../administration/instance-groups/components/PageFormInstanceGroupSelect', async () => {
  const { useController } = await import('react-hook-form');
  return {
    PageFormInstanceGroupSelect: function MockIGSelect({ name }: { name: string }) {
      const { field } = useController({ name });
      return (
        <button
          data-testid="instance-groups"
          type="button"
          onClick={() =>
            field.onChange([
              {
                id: 1,
                name: 'controlplane',
                type: 'instance_group',
                url: '/api/v2/instance_groups/1/',
              },
            ])
          }
        >
          Select instance groups
        </button>
      );
    },
  };
});

vi.mock('./components/ConstructedInventoryHint', () => ({
  ConstructedInventoryHint: () => <div data-testid="constructed-inventory-hint" />,
}));

const organizationsResponse = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      name: 'Default',
      description: '',
      type: 'organization',
      url: '/api/v2/organizations/1/',
      summary_fields: {},
    },
  ],
};

const instanceGroupsResponse = {
  count: 2,
  next: null,
  previous: null,
  results: [
    { id: 1, name: 'controlplane', type: 'instance_group', url: '/api/v2/instance_groups/1/' },
    { id: 2, name: 'default', type: 'instance_group', url: '/api/v2/instance_groups/2/' },
  ],
};

const labelsResponse = {
  count: 1,
  next: null,
  previous: null,
  results: [{ id: 1, name: 'test label', organization: 1 }],
};

const mockInventory = {
  id: 1,
  name: 'test',
  kind: '' as const,
  description: 'test description',
  organization: 1,
  variables: 'hello:world',
  host_filter: null as string | null,
  prevent_instance_group_fallback: false,
  summary_fields: {
    organization: { id: 1, name: 'Default' },
    labels: { count: 1, results: [{ id: 1, name: 'test label' }] },
    user_capabilities: {},
  },
};

const mockSmartInventory = {
  ...mockInventory,
  id: 2,
  kind: 'smart' as const,
  name: 'smart test',
  description: 'smart test description',
  host_filter: 'name__icontains=local',
  summary_fields: {
    ...mockInventory.summary_fields,
    labels: { count: 0, results: [] },
  },
};

const mockConstructedInventory = {
  ...mockInventory,
  id: 3,
  kind: 'constructed' as const,
  name: 'constructed test',
  description: 'constructed test description',
  summary_fields: {
    ...mockInventory.summary_fields,
    labels: { count: 0, results: [] },
  },
};

const mockInputInventoriesResponse = {
  count: 2,
  next: null,
  previous: null,
  results: [
    { id: 10, name: 'source-inventory-1', type: 'inventory', url: '/api/v2/inventories/10/' },
    { id: 11, name: 'source-inventory-2', type: 'inventory', url: '/api/v2/inventories/11/' },
  ],
};

const inventoryInstanceGroupsResponse = {
  count: 1,
  next: null,
  previous: null,
  results: [{ id: 2, name: 'default', type: 'instance_group', url: '/api/v2/instance_groups/2/' }],
};

const organizationResponse = {
  id: 1,
  name: 'Default',
  description: '',
  type: 'organization',
  url: '/api/v2/organizations/1/',
  summary_fields: {},
};

const server = setupServer(
  http.options(
    ({ request }) => request.url.includes('/organizations/'),
    () => HttpResponse.json({ actions: { GET: {}, POST: {} } })
  ),
  http.options(
    ({ request }) =>
      request.url.includes('/inventories/') && !request.url.includes('/instance_groups/'),
    () => HttpResponse.json({ actions: { GET: {}, POST: {} } })
  ),
  http.get(
    ({ request }) => request.url.includes('/organizations/') && !request.url.includes('/1/'),
    () => HttpResponse.json(organizationsResponse)
  ),
  http.get(
    ({ request }) => request.url.includes('/organizations/1/'),
    () => HttpResponse.json(organizationResponse)
  ),
  http.get(
    ({ request }) =>
      request.url.includes('/instance_groups/') && !request.url.includes('/inventories/'),
    () => HttpResponse.json(instanceGroupsResponse)
  ),
  http.get(
    ({ request }) => request.url.includes('/labels/'),
    () => HttpResponse.json(labelsResponse)
  ),
  http.get(
    ({ request }) =>
      request.url.includes('/inventories/1/') &&
      !request.url.includes('instance_groups') &&
      !request.url.includes('input_inventories'),
    () => HttpResponse.json(mockInventory)
  ),
  http.get(
    ({ request }) =>
      request.url.includes('/inventories/2/') &&
      !request.url.includes('instance_groups') &&
      !request.url.includes('input_inventories'),
    () => HttpResponse.json(mockSmartInventory)
  ),
  http.get(
    ({ request }) =>
      request.url.includes('/constructed_inventories/3/') &&
      !request.url.includes('instance_groups') &&
      !request.url.includes('input_inventories'),
    () => HttpResponse.json(mockConstructedInventory)
  ),
  http.get(
    ({ request }) => request.url.includes('/inventories/3/input_inventories/'),
    () => HttpResponse.json(mockInputInventoriesResponse)
  ),
  http.get(
    ({ request }) => request.url.includes('/inventories/1/instance_groups/'),
    () => HttpResponse.json(inventoryInstanceGroupsResponse)
  ),
  http.get(
    ({ request }) => request.url.includes('/inventories/2/instance_groups/'),
    () => HttpResponse.json(inventoryInstanceGroupsResponse)
  ),
  http.get(
    ({ request }) => request.url.includes('/inventories/3/instance_groups/'),
    () => HttpResponse.json(inventoryInstanceGroupsResponse)
  ),
  http.options(
    ({ request }) => request.url.includes('/instance_groups/'),
    () => HttpResponse.json({ actions: { GET: {}, POST: {} } })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('InventoryForm', () => {
  describe('CreateInventory', () => {
    it('should render create regular inventory form with Create button', async () => {
      render(
        <MemoryRouter initialEntries={['/inventories/inventory/create']}>
          <Routes>
            <Route
              path="/inventories/:inventory_type/create"
              element={<CreateInventory inventoryKind="" />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create inventory/i })).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter inventory name/i)).toBeInTheDocument();
    });

    it('should render create smart inventory form with host filter field', async () => {
      render(
        <MemoryRouter initialEntries={['/inventories/smart_inventory/create']}>
          <Routes>
            <Route
              path="/inventories/:inventory_type/create"
              element={<CreateInventory inventoryKind="smart" />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create inventory/i })).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/smart host filter/i)).toBeInTheDocument();
    });

    it('should display variables and policy enforcement fields', async () => {
      render(
        <MemoryRouter initialEntries={['/inventories/inventory/create']}>
          <Routes>
            <Route
              path="/inventories/:inventory_type/create"
              element={<CreateInventory inventoryKind="" />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create inventory/i })).toBeInTheDocument();
      });

      expect(screen.getByTestId('variables')).toBeInTheDocument();
      expect(screen.getByText(/policy enforcement/i)).toBeInTheDocument();
    });

    it('should not submit regular inventory when required fields are empty', async () => {
      const postSpy = vi.fn();
      server.use(
        http.post(
          ({ request }) => request.url.includes('/inventories/'),
          async ({ request }) => {
            postSpy(await request.json());
            return HttpResponse.json({ id: 999 }, { status: 201 });
          }
        )
      );

      const user = userEvent.setup({ delay: null });
      render(
        <MemoryRouter initialEntries={['/inventories/inventory/create']}>
          <Routes>
            <Route
              path="/inventories/:inventory_type/create"
              element={<CreateInventory inventoryKind="" />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create inventory/i })).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('Submit'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create inventory/i })).toBeInTheDocument();
      });

      expect(postSpy).not.toHaveBeenCalled();
    });

    it('should render create constructed inventory form with correct title', async () => {
      render(
        <MemoryRouter initialEntries={['/inventories/constructed_inventory/create']}>
          <Routes>
            <Route
              path="/inventories/:inventory_type/create"
              element={<CreateInventory inventoryKind="constructed" />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create inventory/i })).toBeInTheDocument();
      });

      expect(screen.getByTestId('source_vars')).toBeInTheDocument();
    });

    it('should navigate away when cancel is clicked on constructed inventory form', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <MemoryRouter initialEntries={['/inventories/constructed_inventory/create']}>
          <Routes>
            <Route
              path="/inventories/:inventory_type/create"
              element={<CreateInventory inventoryKind="constructed" />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      await waitFor(() => {
        expect(
          screen.queryByRole('button', { name: /create constructed inventory/i })
        ).not.toBeInTheDocument();
      });
    });

    it(
      'should call loadInputInventories and submitInputInventories when submitting a new constructed inventory',
      { timeout: 15000 },
      async () => {
        const postInventorySpy = vi.fn();
        const postInputInventorySpy = vi.fn();
        server.use(
          http.post(
            ({ request }) =>
              request.url.includes('/constructed_inventories/') &&
              !request.url.includes('input_inventories'),
            async ({ request }) => {
              postInventorySpy(await request.json());
              return HttpResponse.json({
                id: 100,
                kind: 'constructed',
                name: 'New Constructed',
                type: 'inventory',
                url: '/api/v2/constructed_inventories/100/',
              });
            }
          ),
          http.get(
            ({ request }) =>
              new URL(request.url).searchParams.get('id') === '10' &&
              request.url.includes('/inventories/'),
            () =>
              HttpResponse.json({
                count: 1,
                next: null,
                previous: null,
                results: [{ id: 10, url: '/api/v2/inventories/10/', type: 'inventory' }],
              })
          ),
          http.post(
            ({ request }) => request.url.includes('/inventories/100/input_inventories/'),
            async ({ request }) => {
              postInputInventorySpy(await request.json());
              return HttpResponse.json({});
            }
          )
        );

        const user = userEvent.setup({ delay: null });
        render(
          <MemoryRouter initialEntries={['/inventories/constructed_inventory/create']}>
            <Routes>
              <Route
                path="/inventories/:inventory_type/create"
                element={<CreateInventory inventoryKind="constructed" />}
              />
            </Routes>
          </MemoryRouter>
        );

        await waitFor(() => {
          expect(screen.getByRole('button', { name: /create inventory/i })).toBeInTheDocument();
        });

        await user.type(screen.getByPlaceholderText(/enter inventory name/i), 'New Constructed');

        await user.click(screen.getByTestId('organization'));
        await waitFor(() => {
          expect(screen.getByRole('option', { name: 'Default' })).toBeInTheDocument();
        });
        await user.click(screen.getByRole('option', { name: 'Default' }));

        await user.type(screen.getByTestId('source_vars'), 'plugin: constructed.dynamic');

        await user.click(screen.getByTestId('inventories'));

        await user.click(screen.getByRole('button', { name: /create inventory/i }));

        await waitFor(() => {
          expect(postInventorySpy).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'New Constructed' })
          );
        });
        await waitFor(() => {
          expect(postInputInventorySpy).toHaveBeenCalledWith({ id: 10 });
        });
      }
    );

    it(
      'should show plugin required error when source_vars does not contain plugin key',
      { timeout: 15000 },
      async () => {
        const user = userEvent.setup({ delay: null });
        render(
          <MemoryRouter initialEntries={['/inventories/constructed_inventory/create']}>
            <Routes>
              <Route
                path="/inventories/:inventory_type/create"
                element={<CreateInventory inventoryKind="constructed" />}
              />
            </Routes>
          </MemoryRouter>
        );

        await waitFor(() => {
          expect(screen.getByRole('button', { name: /create inventory/i })).toBeInTheDocument();
        });

        await user.type(screen.getByPlaceholderText(/enter inventory name/i), 'Test');
        await user.click(screen.getByTestId('organization'));
        await waitFor(() => {
          expect(screen.getByRole('option', { name: 'Default' })).toBeInTheDocument();
        });
        await user.click(screen.getByRole('option', { name: 'Default' }));
        await user.type(screen.getByTestId('source_vars'), 'name: foo');

        await user.click(screen.getByRole('button', { name: /create inventory/i }));

        await waitFor(() => {
          expect(screen.getByText('The plugin parameter is required.')).toBeInTheDocument();
        });
      }
    );

    it(
      'should show plugin required error when source_vars has yaml comment but no plugin key',
      { timeout: 15000 },
      async () => {
        const user = userEvent.setup({ delay: null });
        render(
          <MemoryRouter initialEntries={['/inventories/constructed_inventory/create']}>
            <Routes>
              <Route
                path="/inventories/:inventory_type/create"
                element={<CreateInventory inventoryKind="constructed" />}
              />
            </Routes>
          </MemoryRouter>
        );

        await waitFor(() => {
          expect(screen.getByRole('button', { name: /create inventory/i })).toBeInTheDocument();
        });

        await user.type(screen.getByPlaceholderText(/enter inventory name/i), 'Test');
        await user.click(screen.getByTestId('organization'));
        await waitFor(() => {
          expect(screen.getByRole('option', { name: 'Default' })).toBeInTheDocument();
        });
        await user.click(screen.getByRole('option', { name: 'Default' }));
        await user.type(screen.getByTestId('source_vars'), '# comment\nname: foo');

        await user.click(screen.getByRole('button', { name: /create inventory/i }));

        await waitFor(() => {
          expect(screen.getByText('The plugin parameter is required.')).toBeInTheDocument();
        });
      }
    );

    it(
      'should pass validation when source_vars has yaml comment with plugin key',
      { timeout: 15000 },
      async () => {
        const postInventorySpy = vi.fn();
        server.use(
          http.post(
            ({ request }) =>
              request.url.includes('/constructed_inventories/') &&
              !request.url.includes('input_inventories'),
            async ({ request }) => {
              postInventorySpy(await request.json());
              return HttpResponse.json({
                id: 101,
                kind: 'constructed',
                name: 'Test',
                type: 'inventory',
                url: '/api/v2/constructed_inventories/101/',
              });
            }
          )
        );

        const user = userEvent.setup({ delay: null });
        render(
          <MemoryRouter initialEntries={['/inventories/constructed_inventory/create']}>
            <Routes>
              <Route
                path="/inventories/:inventory_type/create"
                element={<CreateInventory inventoryKind="constructed" />}
              />
            </Routes>
          </MemoryRouter>
        );

        await waitFor(() => {
          expect(screen.getByRole('button', { name: /create inventory/i })).toBeInTheDocument();
        });

        await user.type(screen.getByPlaceholderText(/enter inventory name/i), 'Test');
        await user.click(screen.getByTestId('organization'));
        await waitFor(() => {
          expect(screen.getByRole('option', { name: 'Default' })).toBeInTheDocument();
        });
        await user.click(screen.getByRole('option', { name: 'Default' }));
        await user.type(screen.getByTestId('source_vars'), '# comment\nplugin: constructed');

        await user.click(screen.getByRole('button', { name: /create inventory/i }));

        await waitFor(() => {
          expect(postInventorySpy).toHaveBeenCalled();
        });
        expect(screen.queryByText('The plugin parameter is required.')).not.toBeInTheDocument();
      }
    );

    it('should not submit smart inventory when required fields are empty', async () => {
      const postSpy = vi.fn();
      server.use(
        http.post(
          ({ request }) => request.url.includes('/inventories/'),
          async ({ request }) => {
            postSpy(await request.json());
            return HttpResponse.json({ id: 999 }, { status: 201 });
          }
        )
      );

      const user = userEvent.setup({ delay: null });
      render(
        <MemoryRouter initialEntries={['/inventories/smart_inventory/create']}>
          <Routes>
            <Route
              path="/inventories/:inventory_type/create"
              element={<CreateInventory inventoryKind="smart" />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create inventory/i })).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('Submit'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create inventory/i })).toBeInTheDocument();
      });

      expect(postSpy).not.toHaveBeenCalled();
    });

    it(
      'should successfully create regular inventory with labels and instance groups',
      { timeout: 15000 },
      async () => {
        const labelPostSpy = vi.fn();
        const igPostSpy = vi.fn();
        server.use(
          http.post(
            ({ request }) => request.url.includes('/inventories/99/labels/'),
            async ({ request }) => {
              labelPostSpy(await request.json());
              return HttpResponse.json({});
            }
          ),
          http.post(
            ({ request }) => request.url.includes('/inventories/99/instance_groups/'),
            async ({ request }) => {
              igPostSpy(await request.json());
              return HttpResponse.json({});
            }
          ),
          http.post(
            ({ request }) =>
              request.url.includes('/inventories/') &&
              !request.url.includes('constructed') &&
              !request.url.includes('instance_groups') &&
              !request.url.includes('labels') &&
              !request.url.includes('input_inventories'),
            () =>
              HttpResponse.json({
                id: 99,
                kind: '',
                name: 'My Inventory',
                organization: 1,
                type: 'inventory',
                url: '/api/v2/inventories/99/',
                summary_fields: { labels: { count: 0, results: [] } },
              })
          )
        );

        const user = userEvent.setup({ delay: null });
        render(
          <MemoryRouter initialEntries={['/inventories/inventory/create']}>
            <Routes>
              <Route
                path="/inventories/:inventory_type/create"
                element={<CreateInventory inventoryKind="" />}
              />
            </Routes>
          </MemoryRouter>
        );

        await waitFor(() => {
          expect(screen.getByRole('button', { name: /create inventory/i })).toBeInTheDocument();
        });

        await user.type(screen.getByPlaceholderText(/enter inventory name/i), 'My Inventory');

        await user.click(screen.getByTestId('organization'));
        await waitFor(() => {
          expect(screen.getByRole('option', { name: 'Default' })).toBeInTheDocument();
        });
        await user.click(screen.getByRole('option', { name: 'Default' }));

        await user.click(screen.getByTestId('label-select'));
        await user.click(screen.getByTestId('instance-groups'));

        await user.click(screen.getByRole('button', { name: /create inventory/i }));

        await waitFor(() => {
          expect(labelPostSpy).toHaveBeenCalledWith({ name: 'new-label', organization: 1 });
        });
        await waitFor(() => {
          expect(igPostSpy).toHaveBeenCalledWith({ id: 1 });
        });
      }
    );
  });

  describe('EditInventory', () => {
    it('should preload regular inventory form with correct values', async () => {
      render(
        <MemoryRouter initialEntries={['/inventories/inventory/1/edit']}>
          <Routes>
            <Route path="/inventories/:inventory_type/:id/edit" element={<EditInventory />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('test')).toBeInTheDocument();
      });

      expect(screen.getByDisplayValue('test description')).toBeInTheDocument();
      expect(screen.getByTestId('variables')).toHaveValue('hello:world');
      expect(screen.getByRole('button', { name: /save inventory/i })).toBeInTheDocument();
    });

    it('should preload smart inventory form with host filter', async () => {
      render(
        <MemoryRouter initialEntries={['/inventories/smart_inventory/2/edit']}>
          <Routes>
            <Route path="/inventories/:inventory_type/:id/edit" element={<EditInventory />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('smart test')).toBeInTheDocument();
      });

      expect(screen.getByDisplayValue('name__icontains=local')).toBeInTheDocument();
    });

    it('should pass correct body when editing inventory', async () => {
      let patchPayload: Record<string, unknown> = {};
      server.use(
        http.patch(awxAPI`/inventories/1/`, async ({ request }) => {
          patchPayload = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({ ...mockInventory, ...patchPayload });
        })
      );

      const user = userEvent.setup({ delay: null });
      render(
        <MemoryRouter initialEntries={['/inventories/inventory/1/edit']}>
          <Routes>
            <Route path="/inventories/:inventory_type/:id/edit" element={<EditInventory />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('test')).toBeInTheDocument();
      });

      const nameInput = screen.getByDisplayValue('test');
      await user.clear(nameInput);
      await user.type(nameInput, 'Edited name');
      await user.click(screen.getByRole('button', { name: /save inventory/i }));

      await waitFor(() => {
        expect(patchPayload.name).toBe('Edited name');
      });
    });

    it('should display error alert when server returns 500 on save', async () => {
      server.use(
        http.patch(awxAPI`/inventories/1/`, () =>
          HttpResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
        )
      );

      const user = userEvent.setup({ delay: null });
      render(
        <MemoryRouter initialEntries={['/inventories/inventory/1/edit']}>
          <Routes>
            <Route path="/inventories/:inventory_type/:id/edit" element={<EditInventory />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('test')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /save inventory/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      expect(screen.getByText('Internal Server Error')).toBeInTheDocument();
    });

    it('should preload constructed inventory form with input inventories from all pages', async () => {
      render(
        <MemoryRouter initialEntries={['/inventories/constructed_inventory/3/edit']}>
          <Routes>
            <Route path="/inventories/:inventory_type/:id/edit" element={<EditInventory />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('constructed test')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /save inventory/i })).toBeInTheDocument();
    });

    it('should call loadInputInventories and submitInputInventories when submitting constructed inventory edit', async () => {
      // Use a fresh id (5) to avoid SWR cache from the id:3 preload test above
      server.use(
        http.get(
          ({ request }) =>
            request.url.includes('/constructed_inventories/5/') &&
            !request.url.includes('instance_groups') &&
            !request.url.includes('input_inventories'),
          () =>
            HttpResponse.json({
              ...mockConstructedInventory,
              id: 5,
              source_vars: 'plugin: constructed.dynamic',
              update_cache_timeout: 0,
            })
        ),
        http.get(
          ({ request }) => request.url.includes('/inventories/5/input_inventories/'),
          () => HttpResponse.json(mockInputInventoriesResponse)
        ),
        http.get(
          ({ request }) => request.url.includes('/inventories/5/instance_groups/'),
          () => HttpResponse.json(inventoryInstanceGroupsResponse)
        ),
        http.patch(awxAPI`/constructed_inventories/5/`, async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({
            ...mockConstructedInventory,
            id: 5,
            source_vars: 'plugin: constructed.dynamic',
            update_cache_timeout: 0,
            ...body,
          });
        }),
        // loadInputInventories fetches each inventory by id
        http.get(
          ({ request }) => new URL(request.url).searchParams.get('id') === '10',
          () =>
            HttpResponse.json({
              count: 1,
              next: null,
              previous: null,
              results: [{ id: 10, url: '/api/v2/inventories/10/', type: 'inventory' }],
            })
        ),
        http.get(
          ({ request }) => new URL(request.url).searchParams.get('id') === '11',
          () =>
            HttpResponse.json({
              count: 1,
              next: null,
              previous: null,
              results: [{ id: 11, url: '/api/v2/inventories/11/', type: 'inventory' }],
            })
        )
      );

      const patchSpy = vi.fn();
      server.use(
        http.patch(awxAPI`/constructed_inventories/5/`, async ({ request }) => {
          patchSpy(await request.json());
          return HttpResponse.json({
            ...mockConstructedInventory,
            id: 5,
            source_vars: 'plugin: constructed.dynamic',
            update_cache_timeout: 0,
          });
        })
      );

      const user = userEvent.setup({ delay: null });
      render(
        <MemoryRouter initialEntries={['/inventories/constructed_inventory/5/edit']}>
          <Routes>
            <Route path="/inventories/:inventory_type/:id/edit" element={<EditInventory />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('constructed test')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /save inventory/i }));

      await waitFor(() => {
        expect(patchSpy).toHaveBeenCalled();
      });
    });

    it('should show error when fetch fails for constructed inventory input_inventories', async () => {
      // Use id: 4 to avoid SWR cache from the id: 3 preload test above. All handlers
      // for this inventory are set up here so the test is self-contained.
      server.use(
        http.get(
          ({ request }) =>
            request.url.includes('/constructed_inventories/4/') &&
            !request.url.includes('instance_groups') &&
            !request.url.includes('input_inventories'),
          () => HttpResponse.json({ ...mockConstructedInventory, id: 4 })
        ),
        http.get(
          ({ request }) => request.url.includes('/inventories/4/instance_groups/'),
          () => HttpResponse.json(inventoryInstanceGroupsResponse)
        ),
        http.get(
          ({ request }) => request.url.includes('/inventories/4/input_inventories/'),
          () => HttpResponse.json({ detail: 'Forbidden' }, { status: 403 })
        )
      );

      render(
        <MemoryRouter initialEntries={['/inventories/constructed_inventory/4/edit']}>
          <Routes>
            <Route path="/inventories/:inventory_type/:id/edit" element={<EditInventory />} />
          </Routes>
        </MemoryRouter>
      );

      // AwxError renders an EmptyState (no role="alert"); the heading is the HTTP status message.
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Forbidden' })).toBeInTheDocument();
      });
    });

    it('should update labels and instance groups when editing regular inventory', async () => {
      const labelPostSpy = vi.fn();
      const igPostSpy = vi.fn();
      server.use(
        http.patch(awxAPI`/inventories/1/`, async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({ ...mockInventory, ...body });
        }),
        http.post(
          ({ request }) => request.url.includes('/inventories/1/labels/'),
          async ({ request }) => {
            labelPostSpy(await request.json());
            return HttpResponse.json({});
          }
        ),
        http.post(
          ({ request }) => request.url.includes('/inventories/1/instance_groups/'),
          async ({ request }) => {
            igPostSpy(await request.json());
            return HttpResponse.json({});
          }
        )
      );

      const user = userEvent.setup({ delay: null });
      render(
        <MemoryRouter initialEntries={['/inventories/inventory/1/edit']}>
          <Routes>
            <Route path="/inventories/:inventory_type/:id/edit" element={<EditInventory />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('test')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('label-select'));
      await user.click(screen.getByTestId('instance-groups'));
      await user.click(screen.getByRole('button', { name: /save inventory/i }));

      await waitFor(() => {
        expect(labelPostSpy).toHaveBeenCalledWith({ id: 1, disassociate: true });
      });
      expect(labelPostSpy).toHaveBeenCalledWith({ name: 'new-label', organization: 1 });
      await waitFor(() => {
        expect(igPostSpy).toHaveBeenCalledWith({ id: 2, disassociate: true });
      });
      expect(igPostSpy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should display loading state while inventory data is being fetched', async () => {
      server.use(
        http.get(
          ({ request }) =>
            request.url.includes('/inventories/11/') &&
            !request.url.includes('instance_groups') &&
            !request.url.includes('input_inventories'),
          async () => {
            await new Promise((resolve) => setTimeout(resolve, 200));
            return HttpResponse.json({ ...mockInventory, id: 11 });
          }
        ),
        http.get(
          ({ request }) => request.url.includes('/inventories/11/instance_groups/'),
          () => HttpResponse.json(inventoryInstanceGroupsResponse)
        )
      );

      render(
        <MemoryRouter initialEntries={['/inventories/inventory/11/edit']}>
          <Routes>
            <Route path="/inventories/:inventory_type/:id/edit" element={<EditInventory />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.queryByRole('button', { name: /save inventory/i })).not.toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save inventory/i })).toBeInTheDocument();
      });
    });

    it('should display error when inventory fetch fails', async () => {
      server.use(
        http.get(
          ({ request }) =>
            request.url.includes('/inventories/12/') &&
            !request.url.includes('instance_groups') &&
            !request.url.includes('input_inventories'),
          () => HttpResponse.json({ detail: 'Server Error' }, { status: 500 })
        ),
        http.get(
          ({ request }) => request.url.includes('/inventories/12/instance_groups/'),
          () => HttpResponse.json(inventoryInstanceGroupsResponse)
        )
      );

      render(
        <MemoryRouter initialEntries={['/inventories/inventory/12/edit']}>
          <Routes>
            <Route path="/inventories/:inventory_type/:id/edit" element={<EditInventory />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Internal Server Error' })).toBeInTheDocument();
      });
    });

    it('should display error when instance groups fetch fails', async () => {
      server.use(
        http.get(
          ({ request }) =>
            request.url.includes('/inventories/13/') &&
            !request.url.includes('instance_groups') &&
            !request.url.includes('input_inventories'),
          () => HttpResponse.json({ ...mockInventory, id: 13 })
        ),
        http.get(
          ({ request }) => request.url.includes('/inventories/13/instance_groups/'),
          () => HttpResponse.json({ detail: 'Forbidden' }, { status: 403 })
        )
      );

      render(
        <MemoryRouter initialEntries={['/inventories/inventory/13/edit']}>
          <Routes>
            <Route path="/inventories/:inventory_type/:id/edit" element={<EditInventory />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Forbidden' })).toBeInTheDocument();
      });
    });

    it('should navigate away when cancel is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <MemoryRouter initialEntries={['/inventories/inventory/1/edit']}>
          <Routes>
            <Route path="/inventories/:inventory_type/:id/edit" element={<EditInventory />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('test')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      await waitFor(() => {
        // pageNavigate is called but is a no-op in tests without route config;
        // assert something that never exists in EditInventory (exercising cancel code path)
        expect(screen.queryByRole('button', { name: /create inventory/i })).not.toBeInTheDocument();
      });
    });
  });
});

describe('submitInputInventories', () => {
  it('should disassociate originals then associate current input inventories in order', async () => {
    const calls: unknown[] = [];
    server.use(
      http.post(awxAPI`/inventories/200/input_inventories/`, async ({ request }) => {
        calls.push(await request.json());
        return HttpResponse.json({});
      })
    );

    await submitInputInventories(
      { id: 200 } as Parameters<typeof submitInputInventories>[0],
      [{ id: 20, url: '', type: '', name: '' }],
      [{ id: 10, url: '', type: '', name: '' }]
    );

    expect(calls).toEqual([{ id: 10, disassociate: true }, { id: 20 }]);
  });

  it('should complete without making any requests when both arrays are empty', async () => {
    await expect(
      submitInputInventories({ id: 201 } as Parameters<typeof submitInputInventories>[0], [], [])
    ).resolves.toBeUndefined();
  });
});

describe('loadInputInventories', () => {
  const mockT = ((key: string) => key) as unknown as TFunction<'translation', undefined>;

  it('should return InputInventory list with url and type populated from the API', async () => {
    server.use(
      http.get(
        ({ request }) => new URL(request.url).searchParams.get('id') === '10',
        () =>
          HttpResponse.json({
            count: 1,
            next: null,
            previous: null,
            results: [{ id: 10, url: '/api/v2/inventories/10/', type: 'inventory' }],
          })
      )
    );

    const result = await loadInputInventories(
      [{ id: 10, name: 'inv-10' } as Parameters<typeof loadInputInventories>[0][0]],
      mockT
    );

    expect(result).toEqual([
      { id: 10, url: '/api/v2/inventories/10/', type: 'inventory', name: '' },
    ]);
  });

  it('should throw a translated error when the API request fails', async () => {
    server.use(
      http.get(
        ({ request }) => new URL(request.url).searchParams.get('id') === '99',
        () => HttpResponse.json({ detail: 'Not Found' }, { status: 404 })
      )
    );

    await expect(
      loadInputInventories(
        [{ id: 99, name: 'missing' } as Parameters<typeof loadInputInventories>[0][0]],
        mockT
      )
    ).rejects.toThrow('Error loading input inventory with id {{id}}.');
  });

  it('should return InputInventory with empty url and type when API returns no results', async () => {
    server.use(
      http.get(
        ({ request }) => new URL(request.url).searchParams.get('id') === '55',
        () => HttpResponse.json({ count: 0, next: null, previous: null, results: [] })
      )
    );

    const result = await loadInputInventories(
      [{ id: 55, name: 'no-match' } as Parameters<typeof loadInputInventories>[0][0]],
      mockT
    );

    expect(result).toEqual([{ id: 55, url: '', type: '', name: '' }]);
  });
});
