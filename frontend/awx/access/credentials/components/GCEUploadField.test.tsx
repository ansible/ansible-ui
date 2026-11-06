import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { GCEUploadField } from './GCEUploadField';

vi.mock('@ansible/ansible-ui-framework/PageForm/Inputs/PageFormFileUpload', () => ({
  PageFormFileUpload: (props: {
    label: string;
    helperText: string;
    onClearClick: () => void;
    onInputChange: (file: File) => Promise<void>;
    dropzoneProps: { onDropRejected: () => void };
    additionalHelperText?: React.ReactNode;
  }) => (
    <div>
      <span>{props.label}</span>
      <span>{props.helperText}</span>
      {props.additionalHelperText}
      <button type="button" onClick={() => props.onClearClick()}>
        clear
      </button>
      <button
        type="button"
        onClick={() =>
          void props.onInputChange(
            new File(
              ['{"project_id":"demo","client_email":"svc@test","private_key":"key"}'],
              'svc.json',
              { type: 'application/json' }
            )
          )
        }
      >
        upload-valid
      </button>
      <button
        type="button"
        onClick={() => void props.onInputChange(new File(['not-json'], 'bad.json'))}
      >
        upload-invalid
      </button>
      <button type="button" onClick={() => props.dropzoneProps.onDropRejected()}>
        reject
      </button>
    </div>
  ),
}));

function TestWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm({
    defaultValues: { project: '', username: '', ssh_key_data: '' },
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('GCEUploadField', () => {
  it('should render file upload field with label', () => {
    render(
      <TestWrapper>
        <GCEUploadField />
      </TestWrapper>
    );

    expect(screen.getByText('Service account JSON file')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Select a JSON formatted service account key to autopopulate the following fields.'
      )
    ).toBeInTheDocument();
  });

  it('handles rejected uploads and parses valid JSON uploads', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <GCEUploadField />
      </TestWrapper>
    );

    await user.click(screen.getByText('reject'));
    expect(
      screen.getByText('File upload rejected. Please select a single .json file.')
    ).toBeInTheDocument();

    await user.click(screen.getByText('upload-invalid'));
    await user.click(screen.getByText('upload-valid'));
    await user.click(screen.getByText('clear'));
  });
});
