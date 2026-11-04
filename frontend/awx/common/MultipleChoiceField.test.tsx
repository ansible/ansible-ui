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

  it('shows validation when adding an empty choice', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <MultipleChoiceField type="multiplechoice" />
      </TestWrapper>
    );

    await user.click(screen.getByTestId('add-choice-input'));
    await user.keyboard('{Enter}');
    expect(screen.getByText('Choice option cannot be empty.')).toBeInTheDocument();
  });

  it('shows validation when adding a duplicate choice', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <MultipleChoiceField type="multiplechoice" />
      </TestWrapper>
    );

    await user.type(screen.getByTestId('add-choice-input'), 'dup');
    await user.click(screen.getByRole('button', { name: 'Add choice' }));
    await user.type(screen.getByTestId('add-choice-input'), 'dup{Enter}');

    expect(screen.getByText('Choice option already exists.')).toBeInTheDocument();
  });

  it('adds a choice when pressing Enter in the input', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <MultipleChoiceField type="multiplechoice" />
      </TestWrapper>
    );

    await user.type(screen.getByTestId('add-choice-input'), 'enter-choice{Enter}');
    expect(screen.getByDisplayValue('enter-choice')).toBeInTheDocument();
  });

  it('sets default choice via radio', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapperWithChoice>
        <MultipleChoiceField type="multiplechoice" />
      </TestWrapperWithChoice>
    );

    const radio = screen.getByTestId('choice-radio-0');
    await user.click(radio);
    expect(radio).toBeChecked();
  });

  it('toggles multiselect default via checkbox', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapperWithChoice>
        <MultipleChoiceField type="multiselect" />
      </TestWrapperWithChoice>
    );

    const checkbox = screen.getByTestId('choice-checkbox-0');
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });
});
