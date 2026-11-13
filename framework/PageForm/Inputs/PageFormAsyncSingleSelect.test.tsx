import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { PageFormAsyncSingleSelect } from './PageFormAsyncSingleSelect';

vi.mock('i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('i18next')>();
  return { ...actual, t: (key: string) => key };
});

vi.mock('../../PageInputs/PageAsyncSingleSelect', () => ({
  PageAsyncSingleSelect: ({
    isDisabled,
    onSelect,
    'aria-describedby': ariaDescribedBy,
  }: {
    isDisabled?: string | boolean;
    onSelect: (value: string) => void;
    'aria-describedby'?: string;
  }) => (
    <>
      <div
        data-testid="async-single-select"
        data-disabled={String(isDisabled)}
        data-describedby={ariaDescribedBy}
      />
      <button type="button" onClick={() => onSelect('Selected value')}>
        Select option
      </button>
    </>
  ),
}));

type FormFields = { value: string | null };
let finishSubmit: (() => void) | undefined;

function TestForm({
  isReadOnly,
  onChange,
  onSubmit,
}: {
  isReadOnly?: boolean;
  onChange?: (value: string) => void;
  onSubmit?: () => Promise<void>;
}) {
  const methods = useForm<FormFields>({ defaultValues: { value: null } });

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={(event) => {
          void methods.handleSubmit(async () => {
            await onSubmit?.();
          })(event);
        }}
      >
        <PageFormAsyncSingleSelect
          name="value"
          label="Value"
          placeholder="Select"
          queryLabel={String}
          queryOptions={() => Promise.resolve({ next: 0, remaining: 0, options: [] })}
          isReadOnly={isReadOnly}
          onChange={onChange}
        />
        <output data-testid="form-value">{methods.watch('value') ?? ''}</output>
        <button type="submit">Submit form</button>
      </form>
    </FormProvider>
  );
}

describe('PageFormAsyncSingleSelect', () => {
  it('forwards selection and optional onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TestForm onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Select option' }));
    expect(screen.getByTestId('form-value').textContent).toBe('Selected value');
    expect(onChange).toHaveBeenCalledWith('Selected value');
  });

  it('disables the control when read-only', () => {
    render(<TestForm isReadOnly />);
    expect(screen.getByTestId('async-single-select')).toHaveAttribute('data-disabled', 'Readonly');
  });

  it('disables the control while the form is submitting', async () => {
    const user = userEvent.setup();
    finishSubmit = undefined;
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishSubmit = resolve;
        })
    );

    render(<TestForm onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: 'Submit form' }));
    expect(await screen.findByTestId('async-single-select')).toHaveAttribute(
      'data-disabled',
      'Submitting'
    );

    await act(async () => {
      finishSubmit?.();
      await Promise.resolve();
    });
  });
});
