import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PageFormPlatformOrganizationNameSelect } from './PageFormPlatformOrganizationNameSelect';

vi.mock('../../../common/useQueryPlatformOptions', () => ({
  useQueryPlatformOptions: () => vi.fn(),
}));

vi.mock('@ansible/ansible-ui-framework/PageForm/Inputs/PageFormAsyncSingleSelect', () => ({
  PageFormAsyncSingleSelect: (props: {
    name: string;
    id: string;
    label: string;
    placeholder: string;
    labelHelp: string;
    queryPlaceholder: string;
    queryErrorText: string;
    isRequired?: boolean;
  }) => (
    <div data-testid="async-single-mock">
      <span data-testid="field-name">{props.name}</span>
      <span data-testid="field-id">{props.id}</span>
      <span data-testid="label">{props.label}</span>
      <span data-testid="placeholder">{props.placeholder}</span>
      <span data-testid="label-help">{props.labelHelp}</span>
      <span data-testid="query-placeholder">{props.queryPlaceholder}</span>
      <span data-testid="query-error">{props.queryErrorText}</span>
      <span data-testid="required">{props.isRequired ? 'yes' : 'no'}</span>
    </div>
  ),
}));

function Wrapper({ children }: { readonly children: React.ReactNode }) {
  const form = useForm<{ orgName: string }>({ defaultValues: { orgName: '' } });
  return (
    <MemoryRouter>
      <FormProvider {...form}>{children}</FormProvider>
    </MemoryRouter>
  );
}

describe('PageFormPlatformOrganizationNameSelect', () => {
  it('renders async select with organization labels and help', () => {
    render(
      <Wrapper>
        <PageFormPlatformOrganizationNameSelect name="orgName" isRequired />
      </Wrapper>
    );

    expect(screen.getByTestId('field-name')).toHaveTextContent('orgName');
    expect(screen.getByTestId('field-id')).toHaveTextContent('organization');
    expect(screen.getByTestId('label')).toHaveTextContent('Organization');
    expect(screen.getByTestId('placeholder')).toHaveTextContent('Select organization');
    expect(screen.getByTestId('label-help')).toHaveTextContent(
      'Specify the organization that matching users are added to or barred from.'
    );
    expect(screen.getByTestId('query-placeholder')).toHaveTextContent('Loading organizations...');
    expect(screen.getByTestId('query-error')).toHaveTextContent('Error loading organizations');
    expect(screen.getByTestId('required')).toHaveTextContent('yes');
  });
});
