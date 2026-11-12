import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PageFormPlatformOrganizationsSelect } from './PageFormPlatformOrganizationsSelect';

vi.mock('../../../common/useQueryPlatformOptions', () => ({
  useQueryPlatformOptions: () => vi.fn(),
}));

vi.mock('@ansible/ansible-ui-framework/PageForm/Inputs/PageFormAsyncMultiSelect', () => ({
  PageFormAsyncMultiSelect: (props: {
    name: string;
    id: string;
    label: string;
    placeholder: string;
    queryPlaceholder: string;
    queryErrorText: string;
    isRequired?: boolean;
  }) => (
    <div data-testid="async-multi-mock">
      <span data-testid="field-name">{props.name}</span>
      <span data-testid="field-id">{props.id}</span>
      <span data-testid="label">{props.label}</span>
      <span data-testid="placeholder">{props.placeholder}</span>
      <span data-testid="query-placeholder">{props.queryPlaceholder}</span>
      <span data-testid="query-error">{props.queryErrorText}</span>
      <span data-testid="required">{props.isRequired ? 'yes' : 'no'}</span>
    </div>
  ),
}));

function Wrapper({ children }: { readonly children: React.ReactNode }) {
  const form = useForm<{ orgIds: number[] }>({ defaultValues: { orgIds: [] } });
  return (
    <MemoryRouter>
      <FormProvider {...form}>{children}</FormProvider>
    </MemoryRouter>
  );
}

describe('PageFormPlatformOrganizationsSelect', () => {
  it('renders async multi-select with organizations copy', () => {
    render(
      <Wrapper>
        <PageFormPlatformOrganizationsSelect name="orgIds" />
      </Wrapper>
    );

    expect(screen.getByTestId('field-name')).toHaveTextContent('orgIds');
    expect(screen.getByTestId('field-id')).toHaveTextContent('organizations');
    expect(screen.getByTestId('label')).toHaveTextContent('Organizations');
    expect(screen.getByTestId('placeholder')).toHaveTextContent('Select organizations');
    expect(screen.getByTestId('query-placeholder')).toHaveTextContent('Loading organizations...');
    expect(screen.getByTestId('query-error')).toHaveTextContent('Error loading organizations');
    expect(screen.getByTestId('required')).toHaveTextContent('no');
  });
});
