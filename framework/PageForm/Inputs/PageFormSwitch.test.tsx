/* eslint-disable i18next/no-literal-string */
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { PageFormSwitch } from './PageFormSwitch';

let finishSubmit: (() => void) | undefined;

function SwitchForm(props: { blockSubmit?: boolean }) {
  const methods = useForm({
    defaultValues: { enabled: false },
    mode: 'onSubmit',
  });

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={(event) => {
          void methods.handleSubmit(async () => {
            if (props.blockSubmit) {
              await new Promise<void>((resolve) => {
                finishSubmit = resolve;
              });
            }
          })(event);
        }}
      >
        <PageFormSwitch
          name="enabled"
          label="Enable feature"
          labelOn="On"
          labelHelpTitle="Enable feature"
          labelHelp="Turns the feature on"
          helperText="Optional helper"
          additionalControls={<button type="button">Extra</button>}
        />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}

describe('PageFormSwitch', () => {
  it('toggles value and shows helper text', async () => {
    const user = userEvent.setup();
    render(<SwitchForm />);

    expect(screen.getByText('Optional helper')).toBeInTheDocument();
    const toggle = screen.getByRole('switch', { name: 'Enable feature' });
    expect(toggle).not.toBeChecked();

    await user.click(toggle);
    expect(toggle).toBeChecked();
    expect(screen.getByRole('button', { name: 'Extra' })).toBeInTheDocument();
  });

  it('shows labelOn text when the switch is enabled', async () => {
    const user = userEvent.setup();
    render(<SwitchForm />);

    await user.click(screen.getByRole('switch', { name: 'Enable feature' }));
    expect(screen.getByText('On')).toBeInTheDocument();
  });

  it('disables the switch while the form is submitting', async () => {
    const user = userEvent.setup();
    render(<SwitchForm blockSubmit />);

    const toggle = screen.getByRole('switch', { name: 'Enable feature' });
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(toggle).toBeDisabled();
    act(() => {
      finishSubmit?.();
    });
  });
});
