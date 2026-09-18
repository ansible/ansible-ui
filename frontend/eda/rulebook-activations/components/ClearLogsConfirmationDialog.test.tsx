/* eslint-disable i18next/no-literal-string */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ClearLogsConfirmationDialog, ClearLogsTarget } from './ClearLogsConfirmationDialog';

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
      <dialog open aria-label={ariaLabel}>
        {children}
      </dialog>
    ),
  };
});

describe('ClearLogsConfirmationDialog', () => {
  const activation: ClearLogsTarget = { id: 1, name: 'Activation 1' };

  it('should require acknowledgement before clearing the default seven days', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <ClearLogsConfirmationDialog targets={[activation]} onClose={vi.fn()} onConfirm={onConfirm} />
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
      <ClearLogsConfirmationDialog targets={[activation]} onClose={vi.fn()} onConfirm={vi.fn()} />
    );

    await user.click(screen.getByRole('radio', { name: 'Older than' }));

    expect(screen.getByRole('spinbutton', { name: 'Days to keep' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'Clear logs older than' })).toBeEnabled();
  });

  it('should submit the selected older-than date after validating it', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <ClearLogsConfirmationDialog targets={[activation]} onClose={vi.fn()} onConfirm={onConfirm} />
    );

    await user.click(screen.getByRole('radio', { name: 'Older than' }));
    const dateInput = screen.getByRole('textbox', { name: 'Clear logs older than' });
    const clearButton = screen.getByRole('button', { name: 'Clear logs' });

    await user.type(dateInput, 'not-a-date');
    expect(clearButton).toBeDisabled();

    await user.clear(dateInput);
    await user.type(dateInput, '2025-01-02');
    await user.click(
      screen.getByRole('checkbox', {
        name: 'I understand that clearing logs cannot be undone.',
      })
    );
    await user.click(clearButton);

    expect(onConfirm).toHaveBeenCalledWith('2025-01-02T00:00:00.000Z');
  });

  it('should submit the adjusted keep-last range', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <ClearLogsConfirmationDialog targets={[activation]} onClose={vi.fn()} onConfirm={onConfirm} />
    );

    const daysInput = screen.getByRole('spinbutton', { name: 'Days to keep' });
    await user.click(screen.getByRole('radio', { name: 'Older than' }));
    await user.click(screen.getByRole('radio', { name: 'Keep last' }));
    await user.click(screen.getByRole('button', { name: 'Increase days to keep' }));
    expect(daysInput).toHaveValue(8);
    await user.click(screen.getByRole('button', { name: 'Decrease days to keep' }));
    expect(daysInput).toHaveValue(7);
    await user.clear(daysInput);
    expect(daysInput).toHaveValue(1);

    await user.click(
      screen.getByRole('checkbox', {
        name: 'I understand that clearing logs cannot be undone.',
      })
    );
    await user.click(screen.getByRole('button', { name: 'Clear logs' }));

    expect(onConfirm).toHaveBeenCalledWith(expect.any(String));
  });

  it('should keep selected activation names in the description without rendering a table', () => {
    render(
      <ClearLogsConfirmationDialog
        targets={[activation, { id: 2, name: 'Activation 2' }]}
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

  it('should describe instance-scoped log removal accurately', () => {
    render(
      <ClearLogsConfirmationDialog
        targets={[{ id: 201, name: '201 - Instance 1' }]}
        targetType="instance"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(
      screen.getByText(
        'Removes stored logs for the selected instance (201 - Instance 1). Activations continue running, and container logs are not affected. Logs outside this window remain unchanged. This cannot be undone.'
      )
    ).toBeInTheDocument();
  });
});
