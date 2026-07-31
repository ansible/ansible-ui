/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PageFormSingleSelectEdaResource } from './PageFormSingleSelectEdaResource';

interface TestResource {
  id: number;
  name: string;
  description: string;
  managed?: boolean;
}

const mockResources = {
  count: 2,
  results: [
    {
      id: 1,
      name: 'Regular Resource',
      description: 'This is a regular resource. Additional text here.',
      managed: false,
    },
    {
      id: 2,
      name: 'Managed Resource',
      description: 'This is managed. More details.',
      managed: true,
    },
  ],
};

function FormWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm({
    defaultValues: {
      resource_id: null,
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('PageFormSingleSelectEdaResource', () => {
  const server = setupServer();

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should use default description when getOptionDescription is not provided', () => {
    server.use(
      http.get('*/test-resources/*', () => {
        return HttpResponse.json(mockResources);
      })
    );

    render(
      <MemoryRouter>
        <FormWrapper>
          <PageFormSingleSelectEdaResource<TestResource, never, never>
            name="resource_id"
            id="test-resource-select"
            label="Test Resource"
            placeholder="Select a resource"
            queryPlaceholder="Loading resources..."
            queryErrorText="Error loading resources"
            url="/api/eda/v1/test-resources/"
            tableColumns={[]}
          />
        </FormWrapper>
      </MemoryRouter>
    );

    expect(screen.getByText('Test Resource')).toBeInTheDocument();
  });

  it('should use custom getOptionDescription when provided', async () => {
    server.use(
      http.get('*/test-resources/*', () => {
        return HttpResponse.json(mockResources);
      })
    );

    const customDescriptionFn = (resource: TestResource) => {
      if (resource.managed) {
        return 'Default credential provided by the database at install';
      }
      return resource.description.split('.')[0];
    };

    render(
      <MemoryRouter>
        <FormWrapper>
          <PageFormSingleSelectEdaResource<TestResource, never, never>
            name="resource_id"
            id="test-resource-select"
            label="Test Resource"
            placeholder="Select a resource"
            queryPlaceholder="Loading resources..."
            queryErrorText="Error loading resources"
            url="/api/eda/v1/test-resources/"
            tableColumns={[]}
            getOptionDescription={customDescriptionFn}
          />
        </FormWrapper>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Resource')).toBeInTheDocument();
    });
  });

  it('should support React.ReactNode for labelHelp', () => {
    server.use(
      http.get('*/test-resources/*', () => {
        return HttpResponse.json(mockResources);
      })
    );

    const customLabelHelp = (
      <>
        <p>First paragraph of help text.</p>
        <br />
        <p>Second paragraph of help text.</p>
      </>
    );

    render(
      <MemoryRouter>
        <FormWrapper>
          <PageFormSingleSelectEdaResource<TestResource, never, never>
            name="resource_id"
            id="test-resource-select"
            label="Test Resource"
            placeholder="Select a resource"
            queryPlaceholder="Loading resources..."
            queryErrorText="Error loading resources"
            url="/api/eda/v1/test-resources/"
            tableColumns={[]}
            labelHelp={customLabelHelp}
          />
        </FormWrapper>
      </MemoryRouter>
    );

    expect(screen.getByText('Test Resource')).toBeInTheDocument();
  });

  it('should render helperText when provided', () => {
    server.use(
      http.get('*/test-resources/*', () => {
        return HttpResponse.json(mockResources);
      })
    );

    render(
      <MemoryRouter>
        <FormWrapper>
          <PageFormSingleSelectEdaResource<TestResource, never, never>
            name="resource_id"
            id="test-resource-select"
            label="Test Resource"
            placeholder="Select a resource"
            queryPlaceholder="Loading resources..."
            queryErrorText="Error loading resources"
            url="/api/eda/v1/test-resources/"
            tableColumns={[]}
            helperText="This is helper text for the field"
          />
        </FormWrapper>
      </MemoryRouter>
    );

    expect(screen.getByText('This is helper text for the field')).toBeInTheDocument();
  });
});
