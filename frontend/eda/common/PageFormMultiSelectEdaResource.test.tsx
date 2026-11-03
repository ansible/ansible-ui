import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PageDialogProvider } from '@ansible/ansible-ui-framework/PageDialogs/PageDialog';
import { PageFormMultiSelectEdaResource } from './PageFormMultiSelectEdaResource';

type MockResource = { id: number; name: string; description?: string | null };

const server = setupServer(
  http.get('*/api/eda/v1/users/', () =>
    HttpResponse.json({
      count: 2,
      results: [
        { id: 1, name: 'alice', description: 'Admin' },
        { id: 2, name: 'bob' },
      ],
    })
  )
);

function TestWrapper({
  children,
  defaultValues,
}: {
  children: React.ReactNode;
  defaultValues?: { users: MockResource[] };
}) {
  const methods = useForm({ defaultValues: defaultValues ?? { users: [] as MockResource[] } });
  return (
    <MemoryRouter>
      <PageDialogProvider>
        <FormProvider {...methods}>{children}</FormProvider>
      </PageDialogProvider>
    </MemoryRouter>
  );
}

function renderSelect(defaultValues?: { users: MockResource[] }) {
  return render(
    <TestWrapper defaultValues={defaultValues}>
      <PageFormMultiSelectEdaResource<MockResource>
        name="users"
        label="Users"
        url="/api/eda/v1/users/?page_size=5"
        queryParams={{ is_superuser: ['true', 'false'] }}
        tableColumns={[{ header: 'Name', cell: (resource) => resource.name }]}
        placeholder="Select users"
        queryPlaceholder="Loading..."
        queryErrorText="Error loading"
        formatLabel={(resource) => resource.name.toUpperCase()}
      />
    </TestWrapper>
  );
}

describe('PageFormMultiSelectEdaResource', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should load formatted options and open the browse dialog', async () => {
    const user = userEvent.setup();
    renderSelect();

    expect(screen.getByText('Users')).toBeInTheDocument();
    await user.click(screen.getByText('Select users'));
    await waitFor(() => {
      expect(screen.getByText('ALICE')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Browse' }));
    await waitFor(() => {
      expect(screen.getAllByText('Users').length).toBeGreaterThan(1);
    });
  });

  it('should show named values and fall back to an async label', async () => {
    server.use(http.get('*/api/eda/v1/users/2/', () => HttpResponse.json({ id: 2, name: 'bob' })));

    renderSelect({
      users: [{ id: 1, name: 'alice' }, { id: 2, name: '' } as MockResource],
    });

    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(await screen.findByText('bob')).toBeInTheDocument();
  });

  it('should return no options when the query fails', async () => {
    const user = userEvent.setup();
    server.use(http.get('*/api/eda/v1/users/', () => HttpResponse.json({}, { status: 500 })));
    renderSelect();

    await user.click(screen.getByText('Select users'));
    await waitFor(() => {
      expect(screen.queryByText('ALICE')).not.toBeInTheDocument();
    });
  });
});
