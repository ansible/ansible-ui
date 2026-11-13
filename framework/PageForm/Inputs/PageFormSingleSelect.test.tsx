import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FieldValues, FormProvider, useForm } from 'react-hook-form';
import { describe, expect, test, vi } from 'vitest';
import { PageFormSingleSelect } from './PageFormSingleSelect';

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
  const methods = useForm<FieldValues>({ defaultValues: { choice: '' } });

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
        <PageFormSingleSelect
          name="choice"
          label="Choice"
          placeholder="Choose"
          options={options}
          isReadOnly={props.isReadOnly}
        />
        <button type="submit">Submit form</button>
      </form>
    </FormProvider>
  );
}

function SelectTestForm() {
  const methods = useForm<FieldValues>({ defaultValues: { choice: '' } });
  return (
    <FormProvider {...methods}>
      <PageFormSingleSelect name="choice" label="Choice" placeholder="Choose" options={options} />
    </FormProvider>
  );
}

describe('PageFormSingleSelect', () => {
  test('selects an option', async () => {
    const user = userEvent.setup();
    render(<SelectTestForm />);
    const toggle = screen.getAllByRole('button').find((btn) => btn.hasAttribute('aria-expanded'));
    await user.click(toggle!);
    await user.click(within(await screen.findByRole('listbox')).getByText('Option B'));
    expect(toggle).toHaveTextContent('Option B');
  });

  test('disables the select when read-only', () => {
    render(<TestForm isReadOnly />);
    const toggle = screen.getAllByRole('button').find((btn) => btn.hasAttribute('aria-expanded'));
    expect(toggle).toBeDisabled();
  });

  test('disables the select while the form is submitting', async () => {
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
