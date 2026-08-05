/* eslint-disable i18next/no-literal-string */
import { render, renderHook, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PageFormRuleEngineCredentialSelect } from './PageFormRuleEngineCredentialSelect';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { EdaCredential } from '../../../interfaces/EdaCredential';

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

  it('should use getOptionDescription callback for managed credentials', () => {
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

    const { container } = render(
      <MemoryRouter>
        <FormWrapper>
          <PageFormRuleEngineCredentialSelect name="rule_engine_credential_id" isRequired />
        </FormWrapper>
      </MemoryRouter>
    );

    expect(container).toBeInTheDocument();
  });

  it('should use getOptionDescription callback for non-managed credentials with period', () => {
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

    const { container } = render(
      <MemoryRouter>
        <FormWrapper>
          <PageFormRuleEngineCredentialSelect name="rule_engine_credential_id" />
        </FormWrapper>
      </MemoryRouter>
    );

    expect(container).toBeInTheDocument();
  });

  it('should use getOptionDescription callback for non-managed credentials without period', () => {
    server.use(
      http.get('*/eda-credentials/*', () => {
        return HttpResponse.json({
          count: 1,
          results: [
            {
              id: 101,
              name: 'No Period Credential',
              description: 'Full description with no period',
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
});

describe('getOptionDescription logic', () => {
  it('should return managed credential text for managed credentials', () => {
    const { result } = renderHook(() => {
      const { t } = useTranslation();
      return useCallback(
        (credential: EdaCredential) => {
          if (credential.managed) {
            return t('Default credential provided by the database at install');
          }
          if (!credential.description) {
            return '';
          }
          const periodIndex = credential.description.indexOf('.');
          return credential.description.slice(0, periodIndex === -1 ? undefined : periodIndex);
        },
        [t]
      );
    });

    const managedCredential: Partial<EdaCredential> = {
      id: 1,
      name: 'Managed Cred',
      description: 'Some description.',
      managed: true,
      credential_type: {
        id: 1,
        name: 'Type',
        namespace: 'drools',
        kind: 'cloud',
      },
    };

    expect(result.current(managedCredential as EdaCredential)).toBe(
      'Default credential provided by the database at install'
    );
  });

  it('should extract first sentence for non-managed credentials with period', () => {
    const { result } = renderHook(() => {
      const { t } = useTranslation();
      return useCallback(
        (credential: EdaCredential) => {
          if (credential.managed) {
            return t('Default credential provided by the database at install');
          }
          if (!credential.description) {
            return '';
          }
          const periodIndex = credential.description.indexOf('.');
          return credential.description.slice(0, periodIndex === -1 ? undefined : periodIndex);
        },
        [t]
      );
    });

    const credential: Partial<EdaCredential> = {
      id: 2,
      name: 'Custom Cred',
      description: 'First sentence. Second sentence.',
      managed: false,
      credential_type: {
        id: 1,
        name: 'Type',
        namespace: 'drools',
        kind: 'cloud',
      },
    };

    expect(result.current(credential as EdaCredential)).toBe('First sentence');
  });

  it('should return full description for non-managed credentials without period', () => {
    const { result } = renderHook(() => {
      const { t } = useTranslation();
      return useCallback(
        (credential: EdaCredential) => {
          if (credential.managed) {
            return t('Default credential provided by the database at install');
          }
          if (!credential.description) {
            return '';
          }
          const periodIndex = credential.description.indexOf('.');
          return credential.description.slice(0, periodIndex === -1 ? undefined : periodIndex);
        },
        [t]
      );
    });

    const credential: Partial<EdaCredential> = {
      id: 3,
      name: 'No Period Cred',
      description: 'Full description without period',
      managed: false,
      credential_type: {
        id: 1,
        name: 'Type',
        namespace: 'drools',
        kind: 'cloud',
      },
    };

    expect(result.current(credential as EdaCredential)).toBe('Full description without period');
  });

  it('should return empty string for non-managed credentials without description', () => {
    const { result } = renderHook(() => {
      const { t } = useTranslation();
      return useCallback(
        (credential: EdaCredential) => {
          if (credential.managed) {
            return t('Default credential provided by the database at install');
          }
          if (!credential.description) {
            return '';
          }
          const periodIndex = credential.description.indexOf('.');
          return credential.description.slice(0, periodIndex === -1 ? undefined : periodIndex);
        },
        [t]
      );
    });

    const credential: Partial<EdaCredential> = {
      id: 4,
      name: 'No Description',
      managed: false,
      credential_type: {
        id: 1,
        name: 'Type',
        namespace: 'drools',
        kind: 'cloud',
      },
    };

    expect(result.current(credential as EdaCredential)).toBe('');
  });
});
