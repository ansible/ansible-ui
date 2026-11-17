import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, test, vi } from 'vitest';

vi.mock('../../components/useBreakPoint', () => ({
  useBreakpoint: vi.fn(() => true),
}));

const capturedReset = vi.hoisted(() => ({ onClick: undefined as undefined | (() => void) }));

vi.mock('../../PageActions/PageActions', () => ({
  PageActions: ({
    actions,
  }: {
    actions: { label: string; onClick: () => void; isHidden?: () => boolean }[];
  }) => {
    const visible = actions.filter((action) => !action.isHidden?.());
    capturedReset.onClick = visible[0]?.onClick;
    return (
      <>
        {visible.map((action) => (
          <button key={action.label} type="button" onClick={() => action.onClick()}>
            {action.label}
          </button>
        ))}
      </>
    );
  },
}));

import { PageFormCheckbox } from './PageFormCheckbox';

type FormValues = { enabled: boolean };

function Wrapper(
  props: Partial<React.ComponentProps<typeof PageFormCheckbox<FormValues, 'enabled'>>> & {
    defaultValues?: FormValues;
  }
) {
  const { defaultValues = { enabled: false }, ...checkboxProps } = props;
  const methods = useForm<FormValues>({ defaultValues, mode: 'onChange' });
  return (
    <FormProvider {...methods}>
      <PageFormCheckbox name="enabled" label="Enabled" {...checkboxProps} />
    </FormProvider>
  );
}

describe('PageFormCheckbox', () => {
  test('toggles the checkbox value', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);
    const checkbox = screen.getByRole('checkbox', { name: 'Enabled' });
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  test('resets to default through the reset action', async () => {
    render(<Wrapper defaultValues={{ enabled: true }} enableReset defaultValue={false} />);
    const checkbox = screen.getByRole('checkbox', { name: 'Enabled' });
    capturedReset.onClick?.();
    await waitFor(() => expect(checkbox).not.toBeChecked());
  });

  test('hides reset when the current value matches the default', () => {
    render(<Wrapper defaultValues={{ enabled: false }} enableReset defaultValue={false} />);
    expect(screen.queryByRole('button', { name: 'Reset to default' })).not.toBeInTheDocument();
  });
});
