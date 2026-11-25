import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
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
type Validation = (value: FormFields['value']) => true | string | Promise<true | string>;
let formMethods: UseFormReturn<FormFields> | undefined;
let finishSubmit: (() => void) | undefined;

function TestForm({
  isReadOnly,
  isDisabled,
  id,
  onChange,
  onSubmit,
  validate,
}: {
  isReadOnly?: boolean;
  isDisabled?: string;
  id?: string;
  onChange?: (value: string) => void;
  onSubmit?: () => Promise<void>;
  validate?: Validation;
}) {
  const methods = useForm<FormFields>({ defaultValues: { value: null } });
  formMethods = methods;

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
          id={id}
          isDisabled={isDisabled}
          isReadOnly={isReadOnly}
          onChange={onChange}
          validate={validate}
        />
        <output data-testid="form-value">{methods.watch('value') ?? ''}</output>
        <button
          type="button"
          onClick={() => methods.setError('value', { type: 'manual', message: 'Existing error' })}
        >
          Set error
        </button>
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

  it('updates the form value when no optional onChange callback is provided', async () => {
    const user = userEvent.setup();
    render(<TestForm />);

    await user.click(screen.getByRole('button', { name: 'Select option' }));

    expect(screen.getByTestId('form-value').textContent).toBe('Selected value');
  });

  it('disables the control when read-only', () => {
    render(<TestForm isReadOnly />);
    expect(screen.getByTestId('async-single-select')).toHaveAttribute('data-disabled', 'Readonly');
  });

  it('shows the field error when validation is not in progress', async () => {
    const user = userEvent.setup();
    render(<TestForm validate={() => true} />);

    await user.click(screen.getByRole('button', { name: 'Set error' }));

    expect(screen.getByText('Existing error')).toBeInTheDocument();
  });

  it('shows the validating message while async validation is running', async () => {
    formMethods = undefined;
    let finishValidation: ((result: true | string) => void) | undefined;
    const validate: Validation = async () =>
      await new Promise<true | string>((resolve) => {
        finishValidation = resolve;
      });
    const user = userEvent.setup();

    render(<TestForm validate={validate} />);
    await user.click(screen.getByRole('button', { name: 'Set error' }));

    let validationPromise: Promise<boolean> | undefined;
    act(() => {
      validationPromise = formMethods?.trigger('value');
    });

    expect(await screen.findByText('Validating...')).toBeInTheDocument();

    await act(async () => {
      finishValidation?.(true);
      await validationPromise;
    });
  });

  it('keeps an explicit disabled reason', () => {
    render(<TestForm isDisabled="Manually disabled" />);

    expect(screen.getByTestId('async-single-select')).toHaveAttribute(
      'data-disabled',
      'Manually disabled'
    );
  });

  it('links the select to its form group when an id is provided', () => {
    render(<TestForm id="custom-select" />);

    expect(screen.getByTestId('async-single-select')).toHaveAttribute(
      'data-describedby',
      'custom-select-form-group'
    );
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
