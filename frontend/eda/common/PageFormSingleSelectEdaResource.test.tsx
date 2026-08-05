/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('should render default descriptions from resource when dropdown is opened', async () => {
    const user = userEvent.setup();
    server.use(
      http.get('*/test-resources/', () => {
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

    await user.click(screen.getByTestId('test-resource-select'));

    await waitFor(() => {
      expect(screen.getByText('Regular Resource')).toBeInTheDocument();
    });

    expect(screen.getByText('This is a regular resource')).toBeInTheDocument();
    expect(screen.getByText('This is managed')).toBeInTheDocument();
  });

  it('should use custom getOptionDescription when provided', async () => {
    const user = userEvent.setup();
    server.use(
      http.get('*/test-resources/', () => {
        return HttpResponse.json(mockResources);
      })
    );

    const customDescriptionFn = (resource: TestResource) => {
      if (resource.managed) {
        return 'Custom managed description';
      }
      return 'Custom: ' + resource.name;
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

    await user.click(screen.getByTestId('test-resource-select'));

    await waitFor(() => {
      expect(screen.getByText('Regular Resource')).toBeInTheDocument();
    });

    expect(screen.getByText('Custom: Regular Resource')).toBeInTheDocument();
    expect(screen.getByText('Custom managed description')).toBeInTheDocument();
  });

  it('should handle resources with empty description', async () => {
    const user = userEvent.setup();
    server.use(
      http.get('*/test-resources/', () => {
        return HttpResponse.json({
          count: 2,
          results: [
            {
              id: 4,
              name: 'No Description Resource',
              description: '',
              managed: false,
            },
            {
              id: 5,
              name: 'With Description',
              description: 'A valid description. More text.',
              managed: false,
            },
          ],
        });
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

    await user.click(screen.getByTestId('test-resource-select'));

    await waitFor(() => {
      expect(screen.getByText('No Description Resource')).toBeInTheDocument();
    });
    expect(screen.getByText('A valid description')).toBeInTheDocument();
  });

  it('should handle resources with undefined description', async () => {
    const user = userEvent.setup();
    server.use(
      http.get('*/test-resources/', () => {
        return HttpResponse.json({
          count: 2,
          results: [
            {
              id: 5,
              name: 'Undefined Description Resource',
            },
            {
              id: 6,
              name: 'Another Resource',
              description: 'Has a description. With more text.',
            },
          ],
        });
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

    await user.click(screen.getByTestId('test-resource-select'));

    await waitFor(() => {
      expect(screen.getByText('Undefined Description Resource')).toBeInTheDocument();
    });
    expect(screen.getByText('Has a description')).toBeInTheDocument();
  });

  it('should apply queryParams to the request', async () => {
    const user = userEvent.setup();
    let requestUrl = '';
    server.use(
      http.get('*/test-resources/', ({ request }) => {
        requestUrl = request.url;
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
            queryParams={{ credential_type__namespace__in: 'drools' }}
          />
        </FormWrapper>
      </MemoryRouter>
    );

    await user.click(screen.getByTestId('test-resource-select'));

    await waitFor(() => {
      expect(requestUrl).toContain('credential_type__namespace__in=drools');
    });
  });

  it('should apply array queryParams to the request', async () => {
    const user = userEvent.setup();
    let requestUrl = '';
    server.use(
      http.get('*/test-resources/', ({ request }) => {
        requestUrl = request.url;
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
            queryParams={{ types: ['type1', 'type2'] }}
          />
        </FormWrapper>
      </MemoryRouter>
    );

    await user.click(screen.getByTestId('test-resource-select'));

    await waitFor(() => {
      expect(requestUrl).toContain('types=');
    });
  });

  it('should handle URL with existing query parameters', async () => {
    const user = userEvent.setup();
    let requestUrl = '';
    server.use(
      http.get('*/test-resources/', ({ request }) => {
        requestUrl = request.url;
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
            url="/api/eda/v1/test-resources/?status=active"
            tableColumns={[]}
          />
        </FormWrapper>
      </MemoryRouter>
    );

    await user.click(screen.getByTestId('test-resource-select'));

    await waitFor(() => {
      expect(requestUrl).toContain('status=active');
    });
    expect(requestUrl).toContain('page_size=');
    expect(requestUrl).toContain('order_by=name');
  });

  it('should handle API error gracefully by returning empty options', async () => {
    const user = userEvent.setup();
    server.use(
      http.get('*/test-resources/', () => {
        return HttpResponse.error();
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

    await user.click(screen.getByTestId('test-resource-select'));

    // The queryOptions catch block returns empty options, which the framework
    // handles - since the promise resolves (not rejects), the framework shows
    // no options available rather than an error state.
    await waitFor(() => {
      expect(screen.queryByText('Regular Resource')).not.toBeInTheDocument();
    });
  });

  it('should support React.ReactNode for labelHelp', () => {
    server.use(
      http.get('*/test-resources/', () => {
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
      http.get('*/test-resources/', () => {
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

  it('should handle description without period using default logic', async () => {
    const user = userEvent.setup();
    server.use(
      http.get('*/test-resources/', () => {
        return HttpResponse.json({
          count: 2,
          results: [
            {
              id: 3,
              name: 'Resource No Period',
              description: 'Full description without period',
              managed: false,
            },
            {
              id: 4,
              name: 'Resource With Period',
              description: 'First sentence. Second sentence.',
              managed: false,
            },
          ],
        });
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

    await user.click(screen.getByTestId('test-resource-select'));

    await waitFor(() => {
      expect(screen.getByText('Resource No Period')).toBeInTheDocument();
    });
    expect(screen.getByText('Full description without period')).toBeInTheDocument();
    expect(screen.getByText('First sentence')).toBeInTheDocument();
  });
});
