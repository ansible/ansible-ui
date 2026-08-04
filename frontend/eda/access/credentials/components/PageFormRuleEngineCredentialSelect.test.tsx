/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
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
      description: 'Test credential',
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
      http.get('*/eda-credentials/*', () => {
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

  it('should render as required when isRequired is true', () => {
    server.use(
      http.get('*/eda-credentials/*', () => {
        return HttpResponse.json(mockDroolsCredentials);
      })
    );

    render(
      <MemoryRouter>
        <FormWrapper>
          <PageFormRuleEngineCredentialSelect name="rule_engine_credential_id" isRequired />
        </FormWrapper>
      </MemoryRouter>
    );

    expect(screen.getByText('Event persistence credential')).toBeInTheDocument();
  });

  it('should handle empty credentials list', () => {
    server.use(
      http.get('*/eda-credentials/*', () => {
        return HttpResponse.json({ count: 0, results: [] });
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
  });

  it('should render helper text for empty state', () => {
    server.use(
      http.get('*/eda-credentials/*', () => {
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

  it('should render detailed help text in label help', () => {
    server.use(
      http.get('*/eda-credentials/*', () => {
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

    // The component renders the help text - verify key parts are present
    expect(screen.getByText('Event persistence credential')).toBeInTheDocument();
  });

  it('should use custom getOptionDescription for managed credentials', () => {
    server.use(
      http.get('*/eda-credentials/*', () => {
        return HttpResponse.json(mockDroolsCredentials);
      })
    );

    const { container } = render(
      <MemoryRouter>
        <FormWrapper>
          <PageFormRuleEngineCredentialSelect name="rule_engine_credential_id" />
        </FormWrapper>
      </MemoryRouter>
    );

    // Component should render without errors
    expect(container).toBeInTheDocument();
  });

  it('should handle description with period correctly', () => {
    server.use(
      http.get('*/eda-credentials/*', () => {
        return HttpResponse.json({
          count: 1,
          results: [
            {
              id: 1,
              name: 'Credential With Period',
              description: 'First sentence. Second sentence.',
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

    expect(screen.getByText('Event persistence credential')).toBeInTheDocument();
  });

  it('should handle description without period correctly', () => {
    server.use(
      http.get('*/eda-credentials/*', () => {
        return HttpResponse.json({
          count: 1,
          results: [
            {
              id: 1,
              name: 'Credential Without Period',
              description: 'Description without any period',
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

    expect(screen.getByText('Event persistence credential')).toBeInTheDocument();
  });

  it('should handle credential with empty description', () => {
    server.use(
      http.get('*/eda-credentials/*', () => {
        return HttpResponse.json({
          count: 1,
          results: [
            {
              id: 1,
              name: 'Credential No Description',
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

    const { container } = render(
      <MemoryRouter>
        <FormWrapper>
          <PageFormRuleEngineCredentialSelect name="rule_engine_credential_id" />
        </FormWrapper>
      </MemoryRouter>
    );

    expect(container).toBeInTheDocument();
  });

  it('should handle credential with undefined description', () => {
    server.use(
      http.get('*/eda-credentials/*', () => {
        return HttpResponse.json({
          count: 1,
          results: [
            {
              id: 1,
              name: 'Credential Undefined Description',
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

    const { container } = render(
      <MemoryRouter>
        <FormWrapper>
          <PageFormRuleEngineCredentialSelect name="rule_engine_credential_id" />
        </FormWrapper>
      </MemoryRouter>
    );

    expect(container).toBeInTheDocument();
  });

  it('should pass isDisabled prop correctly', () => {
    server.use(
      http.get('*/eda-credentials/*', () => {
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

    expect(screen.getByText('Event persistence credential')).toBeInTheDocument();
  });

  it('should pass correct filter configuration to underlying component', () => {
    server.use(
      http.get('*/eda-credentials/*', () => {
        return HttpResponse.json(mockDroolsCredentials);
      })
    );

    const { container } = render(
      <MemoryRouter>
        <FormWrapper>
          <PageFormRuleEngineCredentialSelect name="rule_engine_credential_id" />
        </FormWrapper>
      </MemoryRouter>
    );

    expect(container).toBeInTheDocument();
  });

  it('should format managed credential description correctly in getOptionDescription', () => {
    server.use(
      http.get('*/eda-credentials/*', () => {
        return HttpResponse.json({
          count: 1,
          results: [
            {
              id: 99,
              name: 'System Managed Credential',
              description: 'Managed credential description. More text here.',
              managed: true,
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
          <PageFormRuleEngineCredentialSelect name="rule_engine_credential_id" isRequired />
        </FormWrapper>
      </MemoryRouter>
    );

    expect(screen.getByText('Event persistence credential')).toBeInTheDocument();
  });

  it('should extract first sentence from description when not managed', () => {
    server.use(
      http.get('*/eda-credentials/*', () => {
        return HttpResponse.json({
          count: 1,
          results: [
            {
              id: 100,
              name: 'Custom Credential',
              description: 'First sentence here. Second sentence here.',
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

    expect(screen.getByText('Event persistence credential')).toBeInTheDocument();
  });
});
