/* eslint-disable i18next/no-literal-string */
import { ITableColumn } from '@ansible/ansible-ui-framework';
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { setHubApiPath } from './api/formatPath';
import { PageFormSingleSelectHubResource } from './PageFormSingleSelectHubResource';

interface RegistryResource {
  name: string;
}

interface FormValues {
  registry: RegistryResource | null;
}

const tableColumns: ITableColumn<RegistryResource>[] = [
  { header: 'Name', cell: (item) => item.name, value: (item) => item.name },
];

const server = setupServer(
  http.get('*/_ui/v1/execution-environments/registries/', ({ request }) => {
    const url = new URL(request.url);
    expect(url.searchParams.get('page_size')).toBe('10');
    return HttpResponse.json({
      meta: { count: 1 },
      data: [{ name: 'registry-alpha' }],
    });
  })
);

beforeAll(() => {
  setHubApiPath('/api/galaxy');
  server.listen({ onUnhandledRequest: 'error' });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function FormWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm<FormValues>({ defaultValues: { registry: null } });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('PageFormSingleSelectHubResource', () => {
  it('renders registry single-select field wired to the hub registry API', () => {
    render(
      <MemoryRouter>
        <FormWrapper>
          <PageFormSingleSelectHubResource<RegistryResource, FormValues>
            name="registry"
            label="Registry"
            url="/api/galaxy/_ui/v1/execution-environments/registries/"
            tableColumns={tableColumns}
            placeholder="Select registry"
            queryPlaceholder="Search registries"
            queryErrorText="Could not load registries"
          />
        </FormWrapper>
      </MemoryRouter>
    );

    expect(screen.getByText('Registry')).toBeInTheDocument();
    expect(screen.getByText('Select registry')).toBeInTheDocument();
    expect(screen.getByTestId('registry')).toBeInTheDocument();
  });
});
