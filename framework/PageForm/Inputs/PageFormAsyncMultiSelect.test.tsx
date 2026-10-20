import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, UseFormReturn, useForm } from 'react-hook-form';
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
    'aria-describedby': ariaDescribedBy,
  }: {
    isDisabled?: string;
    onSelect: (getNewValues: (current: string[]) => string[]) => void;
    'aria-describedby'?: string;
  }) => (
    <>
      <div
        data-testid="async-multi-select"
        data-disabled={String(isDisabled)}
        data-describedby={ariaDescribedBy}
      />
      <button type="button" onClick={() => onSelect((current) => [...current, 'Selected value'])}>
        Select option
      </button>
    </>
  ),
}));

type FormFields = { values: string[] };
type Validation = (value: string[]) => true | string | Promise<true | string>;

let formMethods: UseFormReturn<FormFields> | undefined;
let finishSubmit: (() => void) | undefined;

function TestForm({
  id,
  isDisabled,
  isReadOnly,
  onSubmit,
  validate,
}: {
  id?: string;
  isDisabled?: string;
  isReadOnly?: boolean;
  onSubmit?: () => Promise<void>;
  validate?: Validation;
}) {
  const methods = useForm<FormFields>({ defaultValues: { values: [] } });
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
        <PageFormAsyncMultiSelect
          name="values"
          label="Values"
          id={id}
          isDisabled={isDisabled}
          isReadOnly={isReadOnly}
          validate={validate}
        />
        <output data-testid="form-values">{methods.watch('values').join(',')}</output>
        <button
          type="button"
          onClick={() => methods.setError('values', { type: 'manual', message: 'Existing error' })}
        >
          Set error
        </button>
        <button type="submit">Submit form</button>
      </form>
    </FormProvider>
  );
}

describe('PageFormAsyncMultiSelect validation message', () => {
  it('shows the field error when validation is not in progress', async () => {
    const user = userEvent.setup();

    render(<TestForm />);
    await user.click(screen.getByRole('button', { name: 'Set error' }));

    expect(screen.getByText('Existing error')).toBeInTheDocument();
  });

  it('shows the validating message while an async validation is running', async () => {
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
      validationPromise = formMethods?.trigger('values');
    });

    expect(await screen.findByText('Validating...')).toBeInTheDocument();

    await act(async () => {
      finishValidation?.(true);
      await validationPromise;
    });
  });

  it('updates the selected values', async () => {
    const user = userEvent.setup();

    render(<TestForm validate={() => true} />);
    await user.click(screen.getByRole('button', { name: 'Select option' }));

    expect(screen.getByTestId('form-values').textContent).toBe('Selected value');
  });

  it('disables the select when the field is read-only', () => {
    render(<TestForm isReadOnly />);

    expect(screen.getByTestId('async-multi-select')).toHaveAttribute('data-disabled', 'Readonly');
  });

  it('keeps an explicit disabled reason', () => {
    render(<TestForm isDisabled="Manually disabled" />);

    expect(screen.getByTestId('async-multi-select')).toHaveAttribute(
      'data-disabled',
      'Manually disabled'
    );
  });

  it('disables the select while the form is submitting', async () => {
    const user = userEvent.setup();
    finishSubmit = undefined;
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishSubmit = resolve;
        })
    );

    render(<TestForm onSubmit={onSubmit} validate={() => true} />);
    await user.click(screen.getByRole('button', { name: 'Submit form' }));

    expect(await screen.findByTestId('async-multi-select')).toHaveAttribute(
      'data-disabled',
      'Submitting'
    );
    expect(onSubmit).toHaveBeenCalledOnce();

    await act(async () => {
      finishSubmit?.();
      await Promise.resolve();
    });
  });

  it('links the select to its form group when an id is provided', () => {
    render(<TestForm id="custom-select" />);

    expect(screen.getByTestId('async-multi-select')).toHaveAttribute(
      'data-describedby',
      'custom-select-form-group'
    );
  });
});
