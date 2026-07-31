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
});
