/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PageFormRuleEngineCredentialSelect } from './PageFormRuleEngineCredentialSelect';

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

  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('PageFormRuleEngineCredentialSelect', () => {
  const server = setupServer();

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render with correct label and placeholder', () => {
    server.use(
      http.get('*/eda-credentials/', () => {
        return HttpResponse.json(mockDroolsCredentials);
      })
    );

    render(
      <MemoryRouter>
        <FormWrapper>
          <PageFormRuleEngineCredentialSelect name="rule_engine_credential_id" />
        </FormWrapper>
      </MemoryRouter>
    );

    expect(screen.getByText('Event persistence credential')).toBeInTheDocument();
    expect(screen.getByText(/Select an event persistence credential/i)).toBeInTheDocument();
  });

  it('should render helper text', () => {
    server.use(
      http.get('*/eda-credentials/', () => {
        return HttpResponse.json(mockDroolsCredentials);
      })
    );

    render(
      <MemoryRouter>
        <FormWrapper>
          <PageFormRuleEngineCredentialSelect name="rule_engine_credential_id" />
        </FormWrapper>
      </MemoryRouter>
    );

    expect(
      screen.getByText(
        'Create an Ansible Rule Engine credential in the Credentials page to populate this list.'
      )
    ).toBeInTheDocument();
  });

  it('should show managed credential description when dropdown is opened', async () => {
    const user = userEvent.setup();
    server.use(
      http.get('*/eda-credentials/', () => {
        return HttpResponse.json(mockDroolsCredentials);
      })
    );

    render(
      <MemoryRouter>
        <FormWrapper>
          <PageFormRuleEngineCredentialSelect name="rule_engine_credential_id" />
        </FormWrapper>
      </MemoryRouter>
    );

    await user.click(screen.getByTestId('rule-engine-credential-select'));

    await waitFor(() => {
      expect(screen.getByText('System Managed Credential')).toBeInTheDocument();
    });

    expect(
      screen.getByText('Default credential provided by the database at install')
    ).toBeInTheDocument();
  });

  it('should show first sentence as description for non-managed credentials with period', async () => {
    const user = userEvent.setup();
    server.use(
      http.get('*/eda-credentials/', () => {
        return HttpResponse.json(mockDroolsCredentials);
      })
    );

    render(
      <MemoryRouter>
        <FormWrapper>
          <PageFormRuleEngineCredentialSelect name="rule_engine_credential_id" />
        </FormWrapper>
      </MemoryRouter>
    );

    await user.click(screen.getByTestId('rule-engine-credential-select'));

    await waitFor(() => {
      expect(screen.getByText('Drools Credential 1')).toBeInTheDocument();
    });

    expect(screen.getByText('Test credential')).toBeInTheDocument();
  });

  it('should show full description for non-managed credentials without period', async () => {
    const user = userEvent.setup();
    server.use(
      http.get('*/eda-credentials/', () => {
        return HttpResponse.json(mockDroolsCredentials);
      })
    );

    render(
      <MemoryRouter>
        <FormWrapper>
          <PageFormRuleEngineCredentialSelect name="rule_engine_credential_id" />
        </FormWrapper>
      </MemoryRouter>
    );

    await user.click(screen.getByTestId('rule-engine-credential-select'));

    await waitFor(() => {
      expect(screen.getByText('Drools Credential 2')).toBeInTheDocument();
    });

    expect(screen.getByText('Another test credential')).toBeInTheDocument();
  });

  it('should handle empty description for non-managed credentials', async () => {
    const user = userEvent.setup();
    server.use(
      http.get('*/eda-credentials/', () => {
        return HttpResponse.json({
          count: 2,
          results: [
            {
              id: 10,
              name: 'No Description Credential',
              description: '',
              managed: false,
              credential_type: {
                id: 1,
                name: 'Event-Driven Ansible Rule Engine',
                namespace: 'drools',
              },
            },
            {
              id: 11,
              name: 'Has Description Credential',
              description: 'Credential info. More here.',
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
      <MemoryRouter>
        <FormWrapper>
          <PageFormRuleEngineCredentialSelect name="rule_engine_credential_id" />
        </FormWrapper>
      </MemoryRouter>
    );

    await user.click(screen.getByTestId('rule-engine-credential-select'));

    await waitFor(() => {
      expect(screen.getByText('No Description Credential')).toBeInTheDocument();
    });
    expect(screen.getByText('Credential info')).toBeInTheDocument();
  });

  it('should handle undefined description for non-managed credentials', async () => {
    const user = userEvent.setup();
    server.use(
      http.get('*/eda-credentials/', () => {
        return HttpResponse.json({
          count: 2,
          results: [
            {
              id: 11,
              name: 'Undefined Description Credential',
              managed: false,
              credential_type: {
                id: 1,
                name: 'Event-Driven Ansible Rule Engine',
                namespace: 'drools',
              },
            },
            {
              id: 12,
              name: 'Normal Credential',
              description: 'Normal description. Extra text.',
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
      <MemoryRouter>
        <FormWrapper>
          <PageFormRuleEngineCredentialSelect name="rule_engine_credential_id" />
        </FormWrapper>
      </MemoryRouter>
    );

    await user.click(screen.getByTestId('rule-engine-credential-select'));

    await waitFor(() => {
      expect(screen.getByText('Undefined Description Credential')).toBeInTheDocument();
    });
    expect(screen.getByText('Normal description')).toBeInTheDocument();
  });

  it('should pass isDisabled prop correctly', () => {
    server.use(
      http.get('*/eda-credentials/', () => {
        return HttpResponse.json(mockDroolsCredentials);
      })
    );

    render(
      <MemoryRouter>
        <FormWrapper>
          <PageFormRuleEngineCredentialSelect
            name="rule_engine_credential_id"
            isDisabled="Field is disabled"
          />
        </FormWrapper>
      </MemoryRouter>
    );

    const toggle = screen.getByTestId('rule-engine-credential-select');
    expect(toggle).toBeDisabled();
  });

  it('should filter credentials by drools namespace', async () => {
    const user = userEvent.setup();
    let requestUrl = '';
    server.use(
      http.get('*/eda-credentials/', ({ request }) => {
        requestUrl = request.url;
        return HttpResponse.json(mockDroolsCredentials);
      })
    );

    render(
      <MemoryRouter>
        <FormWrapper>
          <PageFormRuleEngineCredentialSelect name="rule_engine_credential_id" />
        </FormWrapper>
      </MemoryRouter>
    );

    await user.click(screen.getByTestId('rule-engine-credential-select'));

    await waitFor(() => {
      expect(requestUrl).toContain('credential_type__namespace__in=drools');
    });
  });
});
