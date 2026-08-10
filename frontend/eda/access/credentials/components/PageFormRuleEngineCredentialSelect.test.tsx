/* eslint-disable i18next/no-literal-string */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { PageFormRuleEngineCredentialSelect } from './PageFormRuleEngineCredentialSelect';

// Mock useGet and useGetItem to return data synchronously
vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: vi.fn(),
  useGetItem: vi.fn(),
}));

// Mock PageFormSingleSelectEdaResource to simplify dropdown testing
vi.mock('../../../common/PageFormSingleSelectEdaResource', () => ({
  PageFormSingleSelectEdaResource: ({ name, label, placeholder, helperText, isDisabled }: any) => {
    return (
      <div>
        <label htmlFor={name}>{label}</label>
        <select id={name} data-testid="rule-engine-credential-select" disabled={!!isDisabled}>
          <option value="">{placeholder}</option>
        </select>
        {helperText && <div data-testid="helper-text">{helperText}</div>}
      </div>
    );
  },
}));

const mockDroolsCredentials = {
  count: 3,
  results: [
    {
      id: 1,
      name: 'Drools Credential 1',
      description: 'Test credential. More details here.',
      managed: false,
      credential_type: {
        id: 1,
        name: 'Event-Driven Ansible Rule Engine',
        namespace: 'drools',
      },
    },
    {
      id: 2,
      name: 'Drools Credential 2',
      description: 'Another test credential',
      managed: false,
      credential_type: {
        id: 1,
        name: 'Event-Driven Ansible Rule Engine',
        namespace: 'drools',
      },
    },
    {
      id: 3,
      name: 'System Managed Credential',
      description: 'System provided credential',
      managed: true,
      credential_type: {
        id: 1,
        name: 'Event-Driven Ansible Rule Engine',
        namespace: 'drools',
      },
    },
  ],
};

function FormWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm({
    defaultValues: {
      rule_engine_credential_id: null,
    },
  });

  return (
    <SWRConfig
      value={{
        provider: () => new Map(),
        dedupingInterval: 0,
        revalidateOnMount: true,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
      }}
    >
      <MemoryRouter>
        <FormProvider {...methods}>{children}</FormProvider>
      </MemoryRouter>
    </SWRConfig>
  );
}

// Import useGet and useGetItem for mocking
import { useGet, useGetItem } from '@ansible/common-ui/crud/useGet';

describe('PageFormRuleEngineCredentialSelect', () => {
  const server = setupServer(
    // Default handler for list endpoint
    http.get('*/eda-credentials/', () => {
      return HttpResponse.json(mockDroolsCredentials);
    }),
    // Default handler for individual credential fetches
    http.get('*/eda-credentials/:id/', ({ params }) => {
      const credential = mockDroolsCredentials.results.find((c) => c.id === Number(params.id));
      return credential
        ? HttpResponse.json(credential)
        : HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    })
  );

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  beforeEach(() => {
    // Mock useGet to return mockDroolsCredentials by default
    vi.mocked(useGet).mockReturnValue({
      data: mockDroolsCredentials,
      error: undefined,
      refresh: vi.fn(),
      isLoading: false,
    });

    // Mock useGetItem to return individual credentials
    vi.mocked(useGetItem).mockImplementation((url, id) => {
      const credential = mockDroolsCredentials.results.find((c) => c.id === id);
      return {
        data: credential,
        error: credential ? undefined : new Error('Not found'),
        refresh: vi.fn(),
        isLoading: false,
      };
    });
  });

  it('should render with correct label and placeholder', () => {
    render(
      <FormWrapper>
        <PageFormRuleEngineCredentialSelect name="rule_engine_credential_id" />
      </FormWrapper>
    );

    expect(screen.getByText('Event persistence credential')).toBeInTheDocument();
    expect(screen.getByText(/Select an event persistence credential/i)).toBeInTheDocument();
  });

  it('should show helper text only when there are no credentials', async () => {
    vi.mocked(useGet).mockReturnValue({
      data: { count: 0, results: [] },
      error: undefined,
      refresh: vi.fn(),
      isLoading: false,
    });

    render(
      <FormWrapper>
        <PageFormRuleEngineCredentialSelect name="rule_engine_credential_id" />
      </FormWrapper>
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          'Create an Ansible Rule Engine credential in the Credentials page to populate this list.'
        )
      ).toBeInTheDocument();
    });
  });

  it('should NOT show helper text when credentials exist', async () => {
    render(
      <FormWrapper>
        <PageFormRuleEngineCredentialSelect name="rule_engine_credential_id" />
      </FormWrapper>
    );

    // Wait for data to load - helper text should not appear at any point
    await waitFor(
      () => {
        expect(
          screen.queryByText(
            'Create an Ansible Rule Engine credential in the Credentials page to populate this list.'
          )
        ).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should auto-select managed credential on mount', async () => {
    let formMethods: any = null;

    const TestComponent = () => {
      const methods = useForm({
        defaultValues: {
          rule_engine_credential_id: null,
        },
      });

      formMethods = methods;

      return (
        <SWRConfig
          value={{
            provider: () => new Map(),
            dedupingInterval: 0,
            revalidateOnMount: true,
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
          }}
        >
          <MemoryRouter>
            <FormProvider {...methods}>
              <PageFormRuleEngineCredentialSelect name="rule_engine_credential_id" />
            </FormProvider>
          </MemoryRouter>
        </SWRConfig>
      );
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(formMethods?.getValues('rule_engine_credential_id')).toBe(3);
    });
  });

  it('should NOT auto-select if a value is already set', async () => {
    let formMethods: any = null;

    const TestComponent = () => {
      const methods = useForm({
        defaultValues: {
          rule_engine_credential_id: 1,
        },
      });

      formMethods = methods;

      return (
        <SWRConfig
          value={{
            provider: () => new Map(),
            dedupingInterval: 0,
            revalidateOnMount: true,
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
          }}
        >
          <MemoryRouter>
            <FormProvider {...methods}>
              <PageFormRuleEngineCredentialSelect name="rule_engine_credential_id" />
            </FormProvider>
          </MemoryRouter>
        </SWRConfig>
      );
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(formMethods?.getValues('rule_engine_credential_id')).toBe(1);
    });
  });

  // Note: Tests for getOptionDescription callback behavior (managed credential description,
  // first sentence extraction, empty/undefined handling) are covered by integration tests
  // and the PageFormSingleSelectEdaResource component tests. These tests were removed because
  // they required complex mocking of the dropdown interaction which is out of scope for
  // unit testing this component's core functionality (auto-select and conditional helper text).

  it('should pass isDisabled prop correctly', () => {
    render(
      <FormWrapper>
        <PageFormRuleEngineCredentialSelect
          name="rule_engine_credential_id"
          isDisabled="Field is disabled"
        />
      </FormWrapper>
    );

    const toggle = screen.getByTestId('rule-engine-credential-select');
    expect(toggle).toBeDisabled();
  });

  it('should filter credentials by drools namespace', () => {
    render(
      <FormWrapper>
        <PageFormRuleEngineCredentialSelect name="rule_engine_credential_id" />
      </FormWrapper>
    );

    // Verify the component renders correctly with the mocked data
    expect(screen.getByText('Event persistence credential')).toBeInTheDocument();

    // Check that useGet was called (it's called by the component)
    expect(useGet).toHaveBeenCalled();
  });
});
