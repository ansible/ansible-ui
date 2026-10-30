/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { RemoteFormProps } from '../RemoteForm';
import { RequirementsFile } from './RequirementsFile';

vi.mock('@ansible/ansible-ui-framework/components/DataEditor', () => ({
  DataEditor: (props: { value?: string; onChange?: (value: string) => void }) => (
    <textarea
      aria-label="Requirements file"
      value={props.value ?? ''}
      onChange={(event) => props.onChange?.(event.target.value)}
    />
  ),
}));

function FormWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm<RemoteFormProps>({
    defaultValues: { requirements_file: '' },
  });
  return (
    <MemoryRouter>
      <FormProvider {...methods}>{children}</FormProvider>
    </MemoryRouter>
  );
}

describe('RequirementsFile', () => {
  it('renders requirements file field label', () => {
    render(
      <FormWrapper>
        <RequirementsFile isRequired={false} />
      </FormWrapper>
    );

    expect(screen.getByText('Requirements file')).toBeInTheDocument();
    expect(screen.getByTestId('requirements-file-form-group')).toBeInTheDocument();
  });

  it('shows required helper text when requirements file is required', () => {
    render(
      <FormWrapper>
        <RequirementsFile isRequired={true} />
      </FormWrapper>
    );

    expect(
      screen.getByText(
        'This remote will only sync collections in this file and their dependencies.'
      )
    ).toBeInTheDocument();
  });

  it('shows optional warning helper text when not required', () => {
    render(
      <FormWrapper>
        <RequirementsFile isRequired={false} />
      </FormWrapper>
    );

    expect(
      screen.getByText(/Otherwise, all collections will be synchronized/i)
    ).toBeInTheDocument();
  });
});
