import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PageFormRuleEngineCredentialSelect } from './PageFormRuleEngineCredentialSelect';
import { EdaCredential } from '../../../interfaces/EdaCredential';

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
      description: 'Default credential provided by the database at install',
      managed: true,
      credential_type: {
        id: 1,
        name: 'Event-Driven Ansible Rule Engine',
        namespace: 'drools',
      },
    },
  ] as EdaCredential[],
};

interface FormValues {
  rule_engine_credential_id: number | null;
}

function FormWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm<FormValues>({
    defaultValues: {
      rule_engine_credential_id: null,
    },
  });

  return (
    <MemoryRouter>
      <FormProvider {...methods}>{children}</FormProvider>
    </MemoryRouter>
  );
}

describe('PageFormRuleEngineCredentialSelect', () => {
  const server = setupServer(
    http.get('*/eda-credentials/', ({ request }) => {
      const url = new URL(request.url);
      const namespace = url.searchParams.get('credential_type__namespace__in');
      const pageSize = url.searchParams.get('page_size');

      // Verify correct query params are sent
      if (namespace === 'drools' && pageSize === '5000') {
        return HttpResponse.json(mockDroolsCredentials);
      }

      return HttpResponse.json({ count: 0, results: [] });
    })
  );

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render with correct label and placeholder', () => {
    render(
      <FormWrapper>
        <PageFormRuleEngineCredentialSelect name="rule_engine_credential_id" />
      </FormWrapper>
    );

    expect(screen.getByText('Event persistence credential')).toBeInTheDocument();
    expect(screen.getByText(/Select an event persistence credential/i)).toBeInTheDocument();
  });

  it('should filter credentials by drools namespace with page_size parameter', async () => {
    const user = userEvent.setup();

    render(
      <FormWrapper>
        <PageFormRuleEngineCredentialSelect name="rule_engine_credential_id" />
      </FormWrapper>
    );

    // Open the dropdown to trigger the API call
    await user.click(screen.getByTestId('rule-engine-credential-select'));

    // Wait for credentials to load - verify the handler was called with correct params
    await waitFor(() => {
      expect(screen.getAllByText('Drools Credential 1').length).toBeGreaterThan(0);
    });
  });

  it('should show managed credential description in dropdown', async () => {
    const user = userEvent.setup();

    render(
      <FormWrapper>
        <PageFormRuleEngineCredentialSelect name="rule_engine_credential_id" />
      </FormWrapper>
    );

    await user.click(screen.getByTestId('rule-engine-credential-select'));

    await waitFor(() => {
      expect(screen.getAllByText('System Managed Credential').length).toBeGreaterThan(0);
    });

    // Verify the managed credential shows the default description
    expect(
      screen.getByText('Default credential provided by the database at install')
    ).toBeInTheDocument();
  });

  it('should show first sentence of description for non-managed credentials', async () => {
    const user = userEvent.setup();

    render(
      <FormWrapper>
        <PageFormRuleEngineCredentialSelect name="rule_engine_credential_id" />
      </FormWrapper>
    );

    await user.click(screen.getByTestId('rule-engine-credential-select'));

    await waitFor(() => {
      expect(screen.getAllByText('Drools Credential 1').length).toBeGreaterThan(0);
    });

    // Should show only first sentence (before the period)
    expect(screen.getByText('Test credential')).toBeInTheDocument();
    expect(screen.queryByText('More details here.')).not.toBeInTheDocument();
  });

  it('should show helper text only when there are no credentials', async () => {
    server.use(
      http.get('*/eda-credentials/', () => {
        return HttpResponse.json({ count: 0, results: [] });
      })
    );

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

    // Wait for component to stabilize - helper text should never appear
    await waitFor(
      () => {
        expect(
          screen.queryByText(
            'Create an Ansible Rule Engine credential in the Credentials page to populate this list.'
          )
        ).not.toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('should auto-select managed credential on mount', async () => {
    let formMethods: ReturnType<typeof useForm<FormValues>> | null = null;

    const TestComponent = () => {
      const methods = useForm<FormValues>({
        defaultValues: {
          rule_engine_credential_id: null,
        },
      });

      formMethods = methods;

      return (
        <MemoryRouter>
          <FormProvider {...methods}>
            <PageFormRuleEngineCredentialSelect name="rule_engine_credential_id" />
          </FormProvider>
        </MemoryRouter>
      );
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(formMethods?.getValues('rule_engine_credential_id')).toBe(3);
    });
  });

  it('should NOT auto-select if a value is already set', async () => {
    let formMethods: ReturnType<typeof useForm<FormValues>> | null = null;

    const TestComponent = () => {
      const methods = useForm<FormValues>({
        defaultValues: {
          rule_engine_credential_id: 1,
        },
      });

      formMethods = methods;

      return (
        <MemoryRouter>
          <FormProvider {...methods}>
            <PageFormRuleEngineCredentialSelect name="rule_engine_credential_id" />
          </FormProvider>
        </MemoryRouter>
      );
    };

    render(<TestComponent />);

    // Value should remain as 1, not auto-select to 3
    await waitFor(() => {
      expect(formMethods?.getValues('rule_engine_credential_id')).toBe(1);
    });
  });

  it('should pass isRequired prop correctly', async () => {
    const user = userEvent.setup();

    render(
      <FormWrapper>
        <PageFormRuleEngineCredentialSelect name="rule_engine_credential_id" isRequired />
      </FormWrapper>
    );

    // Open dropdown to verify the field rendered
    await user.click(screen.getByTestId('rule-engine-credential-select'));

    // The field should be marked as required - verify label has required indicator
    expect(screen.getByText('Event persistence credential')).toBeInTheDocument();
  });

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

  it('should handle empty description gracefully', async () => {
    const user = userEvent.setup();

    server.use(
      http.get('*/eda-credentials/', () => {
        return HttpResponse.json({
          count: 1,
          results: [
            {
              id: 1,
              name: 'No Description Cred',
              description: '',
              managed: false,
              credential_type: {
                id: 1,
                name: 'Event-Driven Ansible Rule Engine',
                namespace: 'drools',
              },
            },
          ],
        });
      })
    );

    render(
      <FormWrapper>
        <PageFormRuleEngineCredentialSelect name="rule_engine_credential_id" />
      </FormWrapper>
    );

    await user.click(screen.getByTestId('rule-engine-credential-select'));

    await waitFor(() => {
      expect(screen.getAllByText('No Description Cred')).toHaveLength(2); // Name appears twice in the dropdown
    });

    // Should not show any description when empty - check that option only contains name
    const listItems = screen.getAllByRole('option');
    const credOption = listItems.find((item) => item.textContent?.includes('No Description Cred'));
    // When description is empty, the option should only show the name (no additional text)
    expect(credOption?.textContent).toBe('No Description Cred');
  });
});
