import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { PageFormTextInput } from './PageFormTextInput';

describe('PageFormTextInput actions', () => {
  it('restores the form default when undo is selected', async () => {
    const user = userEvent.setup();

    function Wrapper() {
      const methods = useForm({ defaultValues: { name: 'Original name' } });
      return (
        <FormProvider {...methods}>
          <form>
            <PageFormTextInput name="name" label="Name" enableUndo />
          </form>
        </FormProvider>
      );
    }

    render(<Wrapper />);
    const input = screen.getByRole('textbox', { name: 'Name' });
    await user.clear(input);
    await user.type(input, 'Changed name');
    await user.click(screen.getByRole('button', { name: 'kebab dropdown toggle' }));
    await user.click(screen.getByRole('menuitem', { name: 'Undo changes' }));

    await waitFor(() => expect(input).toHaveValue('Original name'));
  });

  it('resets to defaultValue when reset is selected', async () => {
    const user = userEvent.setup();

    function Wrapper() {
      const methods = useForm({ defaultValues: { name: 'Form value' } });
      return (
        <FormProvider {...methods}>
          <form>
            <PageFormTextInput name="name" label="Name" defaultValue="Default value" enableReset />
          </form>
        </FormProvider>
      );
    }

    render(<Wrapper />);
    const input = screen.getByRole('textbox', { name: 'Name' });
    await user.clear(input);
    await user.type(input, 'Changed name');
    await user.click(screen.getByRole('button', { name: 'kebab dropdown toggle' }));
    await user.click(screen.getByRole('menuitem', { name: 'Reset to default' }));

    await waitFor(() => expect(input).toHaveValue('Default value'));
  });

  it('keeps the field registered when shouldUnregister is false', () => {
    function Wrapper() {
      const methods = useForm({ defaultValues: { field: 'value' } });
      return (
        <FormProvider {...methods}>
          <form>
            <PageFormTextInput name="field" label="Field" shouldUnregister={false} />
          </form>
        </FormProvider>
      );
    }

    render(<Wrapper />);

    expect(screen.getByRole('textbox', { name: 'Field' })).toHaveValue('value');
  });

  it('renders the input as read-only', () => {
    function Wrapper() {
      const methods = useForm({ defaultValues: { field: 'value' } });
      return (
        <FormProvider {...methods}>
          <form>
            <PageFormTextInput name="field" label="Field" isReadOnly />
          </form>
        </FormProvider>
      );
    }

    render(<Wrapper />);

    expect(screen.getByRole('textbox', { name: 'Field' })).toHaveAttribute('readonly');
  });
});
