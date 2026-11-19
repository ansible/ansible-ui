/* eslint-disable i18next/no-literal-string */
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FieldValues, FormProvider, useForm } from 'react-hook-form';
import { describe, expect, test, vi } from 'vitest';
import { PageFormMultiSelect } from './PageFormMultiSelect';

vi.mock('i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('i18next')>();
  return { ...actual, t: (key: string) => key };
});

const options = [
  { label: 'Option A', value: 'A' },
  { label: 'Option B', value: 'B' },
];

let finishSubmit: (() => void) | undefined;

function TestForm(props: { isReadOnly?: boolean }) {
  const methods = useForm<FieldValues>({ defaultValues: { choices: [] } });

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={(event) => {
          void methods.handleSubmit(async () => {
            await new Promise<void>((resolve) => {
              finishSubmit = resolve;
            });
          })(event);
        }}
      >
        <PageFormMultiSelect
          name="choices"
          label="Choices"
          placeholder="Choose"
          options={options}
          isReadOnly={props.isReadOnly}
        />
        <button type="submit">Submit form</button>
      </form>
    </FormProvider>
  );
}

function MultiSelectHarness() {
  const methods = useForm<FieldValues>({ defaultValues: { choices: ['A'] } });
  return (
    <FormProvider {...methods}>
      <PageFormMultiSelect
        name="choices"
        label="Choices"
        placeholder="Choose"
        options={options}
        helperText="Pick one or more"
      />
    </FormProvider>
  );
}

describe('PageFormMultiSelect', () => {
  test('shows helper text and selected values', () => {
    render(<MultiSelectHarness />);
    expect(screen.getByText('Pick one or more')).toBeInTheDocument();
    expect(screen.getByText('Option A')).toBeInTheDocument();
  });

  test('selects additional options', async () => {
    const user = userEvent.setup();
    render(<MultiSelectHarness />);

    const toggle = screen.getAllByRole('button').find((btn) => btn.hasAttribute('aria-expanded'));
    await user.click(toggle!);
    await user.click(within(await screen.findByRole('listbox')).getByText('Option B'));

    expect(screen.getAllByText('Option B').length).toBeGreaterThan(0);
  });

  test('disables the control when read-only', () => {
    render(<TestForm isReadOnly />);
    const toggle = screen.getAllByRole('button').find((btn) => btn.hasAttribute('aria-expanded'));
    expect(toggle).toBeDisabled();
  });

  test('disables the control while submitting', async () => {
    const user = userEvent.setup();
    render(<TestForm />);
    const toggle = screen.getAllByRole('button').find((btn) => btn.hasAttribute('aria-expanded'));
    await user.click(screen.getByRole('button', { name: 'Submit form' }));
    expect(toggle).toBeDisabled();
    act(() => {
      finishSubmit?.();
    });
  });
});
