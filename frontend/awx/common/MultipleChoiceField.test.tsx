import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

function TestWrapperWithChoice({ children }: { children: React.ReactNode }) {
  const methods = useForm({
    defaultValues: {
      formattedChoices: [{ name: 'existing', id: 'choice-1', default: false }],
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

  it('should add a choice option', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <MultipleChoiceField type="multiplechoice" />
      </TestWrapper>
    );

    await user.type(screen.getByTestId('add-choice-input'), 'option-a');
    await user.click(screen.getByRole('button', { name: 'Add choice' }));

    expect(screen.getByDisplayValue('option-a')).toBeInTheDocument();
  });

  it('should remove a choice option', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <MultipleChoiceField type="multiplechoice" />
      </TestWrapper>
    );

    await user.type(screen.getByTestId('add-choice-input'), 'remove-me');
    await user.click(screen.getByTestId('add-choice'));
    expect(screen.getByDisplayValue('remove-me')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove choice' }));
    expect(screen.queryByDisplayValue('remove-me')).not.toBeInTheDocument();
  });

  it('should render default option controls for multiselect choices', () => {
    render(
      <TestWrapperWithChoice>
        <MultipleChoiceField type="multiselect" />
      </TestWrapperWithChoice>
    );
    expect(screen.getByText('Default option')).toBeInTheDocument();
    expect(screen.getByDisplayValue('existing')).toBeInTheDocument();
  });

  it('should render multiplechoice default radio controls', () => {
    render(
      <TestWrapperWithChoice>
        <MultipleChoiceField type="multiplechoice" />
      </TestWrapperWithChoice>
    );
    expect(screen.getByText('Default option')).toBeInTheDocument();
  });
});
