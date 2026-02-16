import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { GCEUploadField } from './GCEUploadField';

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
});
