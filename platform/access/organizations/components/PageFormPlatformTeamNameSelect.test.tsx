import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PageFormPlatformTeamNameSelect } from './PageFormPlatformTeamNameSelect';

vi.mock('../../../common/useQueryPlatformOptions', () => ({
  useQueryPlatformOptions: () => vi.fn(),
}));

vi.mock('@ansible/ansible-ui-framework/PageForm/Inputs/PageFormAsyncSingleSelect', () => ({
  PageFormAsyncSingleSelect: (props: {
    name: string;
    id: string;
    label: string;
    labelHelp: string;
    placeholder: string;
    queryPlaceholder: string;
    queryErrorText: string;
    isRequired?: boolean;
  }) => (
    <div data-testid="async-single-mock">
      <span data-testid="field-name">{props.name}</span>
      <span data-testid="field-id">{props.id}</span>
      <span data-testid="label">{props.label}</span>
      <span data-testid="label-help">{props.labelHelp}</span>
      <span data-testid="placeholder">{props.placeholder}</span>
      <span data-testid="query-placeholder">{props.queryPlaceholder}</span>
      <span data-testid="query-error">{props.queryErrorText}</span>
      <span data-testid="required">{props.isRequired ? 'yes' : 'no'}</span>
    </div>
  ),
}));

function Wrapper({ children }: { readonly children: React.ReactNode }) {
  const form = useForm<{ teamName: string }>({ defaultValues: { teamName: '' } });
  return (
    <MemoryRouter>
      <FormProvider {...form}>{children}</FormProvider>
    </MemoryRouter>
  );
}

describe('PageFormPlatformTeamNameSelect', () => {
  it('renders async select with team labels', () => {
    render(
      <Wrapper>
        <PageFormPlatformTeamNameSelect name="teamName" isRequired />
      </Wrapper>
    );

    expect(screen.getByTestId('field-name')).toHaveTextContent('teamName');
    expect(screen.getByTestId('field-id')).toHaveTextContent('team');
    expect(screen.getByTestId('label')).toHaveTextContent('Team');
    expect(screen.getByTestId('label-help')).toHaveTextContent(
      'Specify the team that matching users are added to or barred from.'
    );
    expect(screen.getByTestId('placeholder')).toHaveTextContent('Select team');
    expect(screen.getByTestId('query-placeholder')).toHaveTextContent('Loading teams...');
    expect(screen.getByTestId('query-error')).toHaveTextContent('Error loading teams');
    expect(screen.getByTestId('required')).toHaveTextContent('yes');
  });
});
