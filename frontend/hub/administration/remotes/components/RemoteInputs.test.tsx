/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { RemoteFormProps } from '../RemoteForm';
import { RemoteInputs } from './RemoteInputs';

function FormWrapper({
  children,
  defaultValues,
}: {
  children: React.ReactNode;
  defaultValues?: Partial<RemoteFormProps>;
}) {
  const methods = useForm<RemoteFormProps>({
    defaultValues: {
      name: '',
      url: '',
      signed_only: false,
      ...defaultValues,
    },
  });
  return (
    <MemoryRouter>
      <FormProvider {...methods}>{children}</FormProvider>
    </MemoryRouter>
  );
}

describe('RemoteInputs', () => {
  it('renders core remote form inputs', () => {
    render(
      <FormWrapper>
        <RemoteInputs handleOnClear={vi.fn()} shouldHideField={() => false} />
      </FormWrapper>
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Server URL')).toBeInTheDocument();
    expect(screen.getByText('Options')).toBeInTheDocument();
  });

  it('shows external sync info alert', () => {
    render(
      <FormWrapper defaultValues={{ url: 'https://galaxy.ansible.com/api/' }}>
        <RemoteInputs
          handleOnClear={vi.fn()}
          shouldHideField={() => false}
          setIsCommunityRemote={vi.fn()}
        />
      </FormWrapper>
    );

    expect(screen.getByTestId('external-sync-warning')).toBeInTheDocument();
  });
});
