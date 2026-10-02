/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageFormDataUrlFileUpload } from './PageFormDataUrlFileUpload';
import { FormProvider, useForm } from 'react-hook-form';

function TestWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm({ defaultValues: { testFile: '' } });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('PageFormDataUrlFileUpload', () => {
  it('should render the file upload field with label', () => {
    render(
      <TestWrapper>
        <PageFormDataUrlFileUpload name="testFile" label="Upload Certificate" isRequired={false} />
      </TestWrapper>
    );

    expect(screen.getByText('Upload Certificate')).toBeInTheDocument();
  });

  it('should render as required when isRequired is true', () => {
    render(
      <TestWrapper>
        <PageFormDataUrlFileUpload name="testFile" label="Upload Key" isRequired={true} />
      </TestWrapper>
    );

    expect(screen.getByText('Upload Key')).toBeInTheDocument();
  });

  it('should render helper text when provided', () => {
    render(
      <TestWrapper>
        <PageFormDataUrlFileUpload
          name="testFile"
          label="Upload File"
          helperText="Accepted formats: PEM, DER"
          isRequired={false}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Accepted formats: PEM, DER')).toBeInTheDocument();
  });

  it('should render with all optional props', () => {
    render(
      <TestWrapper>
        <PageFormDataUrlFileUpload
          name="cert"
          label="Certificate"
          helperText="Upload your certificate"
          labelHelp="This is the TLS certificate"
          labelHelpTitle="Certificate Help"
          isRequired={true}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Certificate')).toBeInTheDocument();
  });
});
