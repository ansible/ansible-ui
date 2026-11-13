import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PageAsyncSelectOptionsFn } from '@ansible/ansible-ui-framework/PageInputs/PageAsyncSelectOptions';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { PageFormPlatformRoleNameSelect } from './PageFormPlatformRoleNameSelect';

const captured = vi.hoisted(() => ({
  lastAsyncProps: null as null | {
    queryOptions: PageAsyncSelectOptionsFn<string>;
    writeInOption: (search: string) => unknown;
    onChange?: (value: string) => void;
  },
}));

vi.mock('@ansible/ansible-ui-framework/PageForm/Inputs/PageFormAsyncSingleSelect', () => ({
  PageFormAsyncSingleSelect: (props: {
    name: string;
    id: string;
    label: string;
    placeholder: string;
    labelHelp: string;
    queryOptions: PageAsyncSelectOptionsFn<string>;
    queryPlaceholder: string;
    queryErrorText: string;
    queryLabel: (name: string) => string;
    isRequired?: boolean;
    onChange?: (value: string) => void;
    writeInOption: (search: string) => unknown;
  }) => {
    captured.lastAsyncProps = {
      queryOptions: props.queryOptions,
      writeInOption: props.writeInOption,
      onChange: props.onChange,
    };
    return (
      <div data-testid="async-single-mock">
        <span data-testid="field-name">{props.name}</span>
        <span data-testid="field-id">{props.id}</span>
        <span data-testid="label">{props.label}</span>
        <span data-testid="placeholder">{props.placeholder}</span>
        <span data-testid="label-help">{props.labelHelp}</span>
        <span data-testid="query-placeholder">{props.queryPlaceholder}</span>
        <span data-testid="query-error">{props.queryErrorText}</span>
        <span data-testid="query-label">{props.queryLabel('Role display')}</span>
        <span data-testid="required">{props.isRequired ? 'yes' : 'no'}</span>
        <span data-testid="write-in">{JSON.stringify(props.writeInOption('custom'))}</span>
      </div>
    );
  },
}));

function roleDefinitionsHandlerForUrl(assertUrl: (url: string) => void) {
  return http.get(`${gatewayAPI`/role_definitions/`}*`, ({ request }) => {
    assertUrl(request.url);
    return HttpResponse.json({
      count: 25,
      next: null,
      previous: null,
      results: [{ id: 1, name: 'Alpha Role', content_type: 'awx.project' }],
    });
  });
}

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  captured.lastAsyncProps = null;
});
afterAll(() => server.close());

function Wrapper({ children }: { readonly children: React.ReactNode }) {
  const form = useForm<{ roleField: number }>({ defaultValues: { roleField: 0 } });
  return (
    <MemoryRouter>
      <FormProvider {...form}>{children}</FormProvider>
    </MemoryRouter>
  );
}

describe('PageFormPlatformRoleNameSelect', () => {
  beforeEach(() => {
    server.use(
      roleDefinitionsHandlerForUrl((url) => {
        const base = gatewayAPI`/role_definitions/?order_by=name&page_size=20`;
        expect(url).toContain(base);
        expect(url).toContain('page=1');
      })
    );
  });

  it('renders labels and wires the async role query with pagination and search', async () => {
    render(
      <Wrapper>
        <PageFormPlatformRoleNameSelect name="roleField" isRequired />
      </Wrapper>
    );

    expect(screen.getByTestId('field-name')).toHaveTextContent('roleField');
    expect(screen.getByTestId('field-id')).toHaveTextContent('role');
    expect(screen.getByTestId('label')).toHaveTextContent('Role');
    expect(screen.getByTestId('placeholder')).toHaveTextContent('Select role');
    expect(screen.getByTestId('label-help')).toHaveTextContent(
      'Specify the role that matching users are added to or barred from.'
    );
    expect(screen.getByTestId('query-placeholder')).toHaveTextContent('Loading role...');
    expect(screen.getByTestId('query-error')).toHaveTextContent('Error loading roles');
    expect(screen.getByTestId('query-label')).toHaveTextContent('Role display');
    expect(screen.getByTestId('required')).toHaveTextContent('yes');
    expect(screen.getByTestId('write-in')).toHaveTextContent(
      JSON.stringify({ label: 'custom', value: 'custom' })
    );

    const queryFn = captured.lastAsyncProps?.queryOptions;
    expect(queryFn).toBeDefined();

    const first = await queryFn!({
      signal: new AbortController().signal,
    });

    expect(first).toEqual({
      remaining: 24,
      options: [{ label: 'Alpha Role', value: 'Alpha Role' }],
      next: 2,
    });
  });

  it('appends search and content_type filters to the role definitions request', async () => {
    let seenUrl = '';
    server.use(
      http.get(`${gatewayAPI`/role_definitions/`}*`, ({ request }) => {
        seenUrl = request.url;
        return HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [{ id: 2, name: 'Scoped', content_type: 'awx.credential' }],
        });
      })
    );

    render(
      <Wrapper>
        <PageFormPlatformRoleNameSelect name="roleField" contentType="awx.credential" />
      </Wrapper>
    );

    const queryFn = captured.lastAsyncProps!.queryOptions;

    await queryFn({
      search: 'admin',
      signal: new AbortController().signal,
    });

    expect(seenUrl).toContain('name__icontains=admin');
    expect(seenUrl).toContain('content_type__api_slug=awx.credential');
  });
});
