/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { PageFormFileUpload } from './PageFormFileUpload';

interface Form {
  file: string;
}

function TestWrapper({
  defaultValue,
  children,
}: {
  defaultValue: Form;
  children: React.ReactNode;
}) {
  const methods = useForm<Form>({
    defaultValues: defaultValue,
  });

  return (
    <FormProvider {...methods}>
      <form>{children}</form>
    </FormProvider>
  );
}

describe('PageFormFileUpload', () => {
  it('Should mount, with disabled clear button', () => {
    const { container } = render(
      <TestWrapper defaultValue={{ file: '' }}>
        <PageFormFileUpload
          name="file"
          isClearButtonDisabled
          label="File upload"
          labelHelpTitle="Help text label"
          labelHelp="Help text"
          isRequired={false}
          validate={() => 'valid'}
        />
      </TestWrapper>
    );

    // Check label is visible
    expect(screen.getByText('File upload')).toBeInTheDocument();
    // Check file input exists
    expect(container.querySelector('input[type="file"]')).toBeInTheDocument();
    // Check clear button is disabled
    expect(screen.getByRole('button', { name: /clear/i })).toBeDisabled();
  });

  it('Should have enabled clear button when file has content', () => {
    const fileContent =
      '- name: Create an AWS VPC \n gather_facts: false \n hosts: localhost \n\ntasks:- name: Create a VPC';

    render(
      <TestWrapper defaultValue={{ file: fileContent }}>
        <PageFormFileUpload
          name="file"
          isClearButtonDisabled={false}
          label="File upload"
          labelHelpTitle="Help text label"
          labelHelp="Help text"
          isRequired={false}
          validate={() => 'valid'}
        />
      </TestWrapper>
    );

    expect(screen.getByTestId('file-form-group')).toBeInTheDocument();
    expect(screen.getByText('File upload')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear/i })).not.toBeDisabled();
  });

  it('Can update the input and clear it', async () => {
    const user = userEvent.setup();

    const { container } = render(
      <TestWrapper defaultValue={{ file: '' }}>
        <PageFormFileUpload
          name="file"
          type="text"
          isClearButtonDisabled={false}
          label="File upload"
          labelHelpTitle="Help text label"
          labelHelp="Help text"
          isRequired={false}
          validate={() => 'valid'}
        />
      </TestWrapper>
    );

    // For type="text", PatternFly renders a textarea
    const textarea = container.querySelector('textarea[aria-label="File upload"]');
    expect(textarea).toBeInTheDocument();

    await user.type(textarea!, 'Alex');
    expect(textarea).toHaveValue('Alex');

    await user.click(screen.getByRole('button', { name: /clear/i }));
    expect(textarea).toHaveValue('');
  });

  it('Should display helper text', () => {
    render(
      <TestWrapper defaultValue={{ file: '' }}>
        <PageFormFileUpload
          name="file"
          label="File upload"
          helperText="Supported formats: YAML, JSON"
        />
      </TestWrapper>
    );

    expect(screen.getByText('Supported formats: YAML, JSON')).toBeInTheDocument();
  });

  it('Should render with icon prop', () => {
    render(
      <TestWrapper defaultValue={{ file: '' }}>
        <PageFormFileUpload
          name="file"
          label="File upload"
          icon={<span data-testid="custom-icon">Icon</span>}
        />
      </TestWrapper>
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('Should render with additionalHelperText', () => {
    render(
      <TestWrapper defaultValue={{ file: '' }}>
        <PageFormFileUpload
          name="file"
          label="File upload"
          additionalHelperText={<span>Extra helper info</span>}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Extra helper info')).toBeInTheDocument();
  });
});
