/* eslint-disable i18next/no-literal-string */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ClearLogsActivation, ClearLogsConfirmationDialog } from './ClearLogsConfirmationDialog';

vi.mock('@patternfly/react-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@patternfly/react-core')>();
  return {
    ...actual,
    Modal: ({
      children,
      'aria-label': ariaLabel,
    }: {
      children: React.ReactNode;
      'aria-label': string;
    }) => (
      <div role="dialog" aria-label={ariaLabel}>
        {children}
      </div>
    ),
  };
});

describe('ClearLogsConfirmationDialog', () => {
  const activation: ClearLogsActivation = { id: 1, name: 'Activation 1' };

  it('should require acknowledgement before clearing the default seven days', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <ClearLogsConfirmationDialog
        activations={[activation]}
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />
    );

    expect(
      screen.getByText(
        'Removes stored logs for Activation 1. Activations continue running, and container logs are not affected. Logs outside this window remain unchanged. This cannot be undone.'
      )
    ).toBeInTheDocument();
    const clearButton = screen.getByRole('button', { name: 'Clear logs' });
    expect(clearButton).toBeDisabled();
    expect(screen.getByRole('spinbutton', { name: 'Days to keep' })).toHaveValue(7);

    await user.click(
      screen.getByRole('checkbox', {
        name: 'I understand that clearing logs cannot be undone.',
      })
    );
    await user.click(clearButton);

    expect(onConfirm).toHaveBeenCalledWith(expect.any(String));
  });

  it('should disable the days input when older-than date mode is selected', async () => {
    const user = userEvent.setup();

    render(
      <ClearLogsConfirmationDialog
        activations={[activation]}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    await user.click(screen.getByRole('radio', { name: 'Older than' }));

    expect(screen.getByRole('spinbutton', { name: 'Days to keep' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'Clear logs older than' })).toBeEnabled();
  });

  it('should keep selected activation names in the description without rendering a table', () => {
    render(
      <ClearLogsConfirmationDialog
        activations={[activation, { id: 2, name: 'Activation 2' }]}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(
      screen.getByText(
        'Removes stored logs for Activation 1, Activation 2. Activations continue running, and container logs are not affected. Logs outside this window remain unchanged. This cannot be undone.'
      )
    ).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
