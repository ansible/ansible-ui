import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { MultipleChoiceField } from './MultipleChoiceField';

vi.mock('./useAwxConfig', () => ({
  useAwxConfig: () => ({}),
}));

vi.mock('@ansible/common-ui/utils/useGetDocsUrl', () => ({
  useGetDocsUrl: () => 'https://docs.example.com',
}));

function TestWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm({
    defaultValues: {
      formattedChoices: [] as { name: string; id: string; default: boolean }[],
      'add-choice': '',
    },
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('MultipleChoiceField', () => {
  it('should render multiple choice options label and add choice input', () => {
    render(
      <TestWrapper>
        <MultipleChoiceField type="multiplechoice" />
      </TestWrapper>
    );
    expect(screen.getByText('Multiple Choice Options')).toBeInTheDocument();
    expect(screen.getByTestId('add-choice-input')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter multiple choice option')).toBeInTheDocument();
  });
});
