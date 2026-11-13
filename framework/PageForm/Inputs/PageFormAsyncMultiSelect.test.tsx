import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { PageFormAsyncMultiSelect } from './PageFormAsyncMultiSelect';

vi.mock('i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('i18next')>();
  return { ...actual, t: (key: string) => key };
});

vi.mock('../../PageInputs/PageAsyncMultiSelect', () => ({
  PageAsyncMultiSelect: ({
    isDisabled,
    onSelect,
    values,
  }: {
    isDisabled?: string | boolean;
    onSelect: (getNewValues: (current: string[]) => string[]) => void;
    values: string[];
  }) => (
    <div>
      <div data-testid="async-multi-select" data-disabled={String(isDisabled)} />
      <span data-testid="values">{values?.join(',') ?? ''}</span>
      <button type="button" onClick={() => onSelect((current) => [...(current ?? []), 'new-item'])}>
        Add item
      </button>
    </div>
  ),
}));

type FormFields = { tags: string[] };

function TestForm({ isReadOnly }: { isReadOnly?: boolean }) {
  const methods = useForm<FormFields>({ defaultValues: { tags: ['one'] } });

  return (
    <FormProvider {...methods}>
      <PageFormAsyncMultiSelect
        name="tags"
        label="Tags"
        placeholder="Select"
        queryLabel={String}
        queryOptions={() => Promise.resolve({ next: 0, remaining: 0, options: [] })}
        isReadOnly={isReadOnly}
      />
      <output data-testid="form-value">{methods.watch('tags')?.join(',') ?? ''}</output>
    </FormProvider>
  );
}

describe('PageFormAsyncMultiSelect', () => {
  it('forwards multi-select changes into the form field', async () => {
    const user = userEvent.setup();
    render(<TestForm />);

    expect(screen.getByTestId('values')).toHaveTextContent('one');
    await user.click(screen.getByRole('button', { name: 'Add item' }));

    expect(screen.getByTestId('form-value')).toHaveTextContent('one,new-item');
  });

  it('disables the control when read-only', () => {
    render(<TestForm isReadOnly />);
    expect(screen.getByTestId('async-multi-select')).toHaveAttribute('data-disabled', 'Readonly');
  });
});
