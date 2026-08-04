/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
  getDefaultResourceDescription,
  PageFormSingleSelectEdaResource,
} from './PageFormSingleSelectEdaResource';

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

interface FormValues {
  resource_id: number | null;
}

function FormWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm<FormValues>({
    defaultValues: {
      resource_id: null,
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('getDefaultResourceDescription', () => {
  it('should return first sentence when description contains a period', () => {
    expect(getDefaultResourceDescription('First sentence. Second sentence.')).toBe(
      'First sentence'
    );
  });

  it('should return full description when no period exists', () => {
    expect(getDefaultResourceDescription('Description without period')).toBe(
      'Description without period'
    );
  });

  it('should return empty string when description is null', () => {
    expect(getDefaultResourceDescription(null)).toBe('');
  });

  it('should return empty string when description is undefined', () => {
    expect(getDefaultResourceDescription(undefined)).toBe('');
  });

  it('should return empty string when description is empty', () => {
    expect(getDefaultResourceDescription('')).toBe('');
  });

  it('should handle period at the beginning', () => {
    expect(getDefaultResourceDescription('.Starts with period')).toBe('');
  });
});

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
          <PageFormSingleSelectEdaResource<TestResource, FormValues, 'resource_id'>
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
          <PageFormSingleSelectEdaResource<TestResource, FormValues, 'resource_id'>
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
          <PageFormSingleSelectEdaResource<TestResource, FormValues, 'resource_id'>
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
          <PageFormSingleSelectEdaResource<TestResource, FormValues, 'resource_id'>
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

  it('should handle description without period using default logic', () => {
    server.use(
      http.get('*/test-resources/*', () => {
        return HttpResponse.json({
          count: 1,
          results: [
            {
              id: 3,
              name: 'Resource No Period',
              description: 'Full description without period',
              managed: false,
            },
          ],
        });
      })
    );

    const { container } = render(
      <MemoryRouter>
        <FormWrapper>
          <PageFormSingleSelectEdaResource<TestResource, FormValues, 'resource_id'>
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

    expect(container).toBeInTheDocument();
  });

  it('should handle empty description using default logic', () => {
    server.use(
      http.get('*/test-resources/*', () => {
        return HttpResponse.json({
          count: 1,
          results: [
            {
              id: 4,
              name: 'Resource Empty Description',
              description: '',
              managed: false,
            },
          ],
        });
      })
    );

    const { container } = render(
      <MemoryRouter>
        <FormWrapper>
          <PageFormSingleSelectEdaResource<TestResource, FormValues, 'resource_id'>
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

    expect(container).toBeInTheDocument();
  });

  it('should handle URL with query parameters correctly', () => {
    server.use(
      http.get('*/test-resources/*', () => {
        return HttpResponse.json(mockResources);
      })
    );

    const { container } = render(
      <MemoryRouter>
        <FormWrapper>
          <PageFormSingleSelectEdaResource<TestResource, FormValues, 'resource_id'>
            name="resource_id"
            id="test-resource-select"
            label="Test Resource"
            placeholder="Select a resource"
            queryPlaceholder="Loading resources..."
            queryErrorText="Error loading resources"
            url="/api/eda/v1/test-resources/?status=active&type=managed"
            tableColumns={[]}
            queryParams={{ credential_type__namespace__in: 'drools' }}
          />
        </FormWrapper>
      </MemoryRouter>
    );

    expect(container).toBeInTheDocument();
  });

  it('should handle queryParams with array values', () => {
    server.use(
      http.get('*/test-resources/*', () => {
        return HttpResponse.json(mockResources);
      })
    );

    const { container } = render(
      <MemoryRouter>
        <FormWrapper>
          <PageFormSingleSelectEdaResource<TestResource, FormValues, 'resource_id'>
            name="resource_id"
            id="test-resource-select"
            label="Test Resource"
            placeholder="Select a resource"
            queryPlaceholder="Loading resources..."
            queryErrorText="Error loading resources"
            url="/api/eda/v1/test-resources/"
            tableColumns={[]}
            queryParams={{ types: ['type1', 'type2'] }}
          />
        </FormWrapper>
      </MemoryRouter>
    );

    expect(container).toBeInTheDocument();
  });
});
