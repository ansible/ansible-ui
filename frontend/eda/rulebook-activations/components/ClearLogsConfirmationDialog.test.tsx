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

  it('should require acknowledgement before deleting logs older than the default seven days', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <ClearLogsConfirmationDialog targets={[activation]} onClose={vi.fn()} onConfirm={onConfirm} />
    );

    expect(screen.getByRole('dialog')).toHaveTextContent(
      'This deletes stored database logs for Activation 1. Rulebook activations will continue running, and system logs on activation workers remain unaffected.'
    );
    expect(screen.getByText('Activation 1', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Permanently Delete Logs' })).toBeInTheDocument();
    const deleteButton = screen.getByRole('button', { name: 'Delete logs' });
    expect(deleteButton).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Delete logs older than 7 days' })).toBeChecked();
    expect(screen.getByRole('spinbutton', { name: 'Number of days' })).toHaveValue(7);

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Yes, I confirm that I want to permanently delete these logs and understand that this action cannot be undone.',
      })
    );
    await user.click(deleteButton);

    expect(onConfirm).toHaveBeenCalledWith(expect.any(String));
  });

  it('should disable the days input when older-than date mode is selected', async () => {
    const user = userEvent.setup();

    render(
      <ClearLogsConfirmationDialog targets={[activation]} onClose={vi.fn()} onConfirm={vi.fn()} />
    );

    await user.click(screen.getByRole('radio', { name: 'Delete logs older than' }));

    expect(screen.getByRole('spinbutton', { name: 'Number of days' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'Delete logs older than' })).toBeEnabled();
  });

  it('should submit the selected older-than date after validating it', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <ClearLogsConfirmationDialog targets={[activation]} onClose={vi.fn()} onConfirm={onConfirm} />
    );

    await user.click(screen.getByRole('radio', { name: 'Delete logs older than' }));
    const dateInput = screen.getByRole('textbox', { name: 'Delete logs older than' });
    const deleteButton = screen.getByRole('button', { name: 'Delete logs' });

    await user.type(dateInput, '2025-02-31');
    expect(deleteButton).toBeDisabled();

    await user.clear(dateInput);
    await user.type(dateInput, '2025-02-29');
    expect(deleteButton).toBeDisabled();

    await user.clear(dateInput);
    await user.type(dateInput, '2024-02-29');
    await user.click(
      screen.getByRole('checkbox', {
        name: 'Yes, I confirm that I want to permanently delete these logs and understand that this action cannot be undone.',
      })
    );
    await user.click(deleteButton);

    expect(onConfirm).toHaveBeenCalledWith('2024-02-29T00:00:00.000Z');

    await user.clear(dateInput);
    await user.type(dateInput, '2025-01-02');
    await user.click(deleteButton);
    expect(onConfirm).toHaveBeenCalledWith('2025-01-02T00:00:00.000Z');
  });

  it('should validate keep-last days and submit the supported boundaries', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <ClearLogsConfirmationDialog targets={[activation]} onClose={vi.fn()} onConfirm={onConfirm} />
    );

    const daysInput = screen.getByRole('spinbutton', { name: 'Number of days' });
    await user.click(screen.getByRole('radio', { name: 'Delete logs older than' }));
    await user.click(screen.getByRole('radio', { name: 'Delete logs older than 7 days' }));
    await user.click(screen.getByRole('button', { name: 'Increase number of days' }));
    expect(daysInput).toHaveValue(8);
    await user.click(screen.getByRole('button', { name: 'Decrease number of days' }));
    expect(daysInput).toHaveValue(7);
    await user.clear(daysInput);
    expect(daysInput).toHaveValue(null);
    expect(screen.getByText('Enter a whole number from 1 to 36500.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete logs' })).toBeDisabled();

    await user.type(daysInput, '0');
    expect(screen.getByRole('button', { name: 'Delete logs' })).toBeDisabled();
    await user.clear(daysInput);
    await user.type(daysInput, '1.5');
    expect(screen.getByRole('button', { name: 'Delete logs' })).toBeDisabled();
    await user.clear(daysInput);
    await user.type(daysInput, '36501');
    expect(screen.getByRole('button', { name: 'Delete logs' })).toBeDisabled();

    await user.clear(daysInput);
    await user.type(daysInput, '1');

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Yes, I confirm that I want to permanently delete these logs and understand that this action cannot be undone.',
      })
    );
    const deleteButton = screen.getByRole('button', { name: 'Delete logs' });
    expect(deleteButton).toBeEnabled();
    await user.clear(daysInput);
    await user.type(daysInput, '36500');
    expect(deleteButton).toBeEnabled();
    await user.click(deleteButton);

    expect(onConfirm).toHaveBeenCalledWith(expect.any(String));
  });

  it('should delete all logs without a date cutoff when selected', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <ClearLogsConfirmationDialog targets={[activation]} onClose={vi.fn()} onConfirm={onConfirm} />
    );

    await user.click(screen.getByRole('radio', { name: 'Delete all logs' }));
    expect(screen.getByRole('textbox', { name: 'Delete logs older than' })).toBeDisabled();
    expect(screen.getByRole('spinbutton', { name: 'Number of days' })).toBeDisabled();

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Yes, I confirm that I want to permanently delete these logs and understand that this action cannot be undone.',
      })
    );
    await user.click(screen.getByRole('button', { name: 'Delete logs' }));

    expect(onConfirm).toHaveBeenCalledWith(undefined);
  });

  it('should show up to five selected activation names without rendering a table', () => {
    const targets = Array.from({ length: 5 }, (_, index) => ({
      id: index + 1,
      name: `Activation ${index + 1}`,
    }));

    render(<ClearLogsConfirmationDialog targets={targets} onClose={vi.fn()} onConfirm={vi.fn()} />);

    expect(screen.getByRole('dialog')).toHaveTextContent(
      'This deletes stored database logs for Activation 1, Activation 2, Activation 3, Activation 4, Activation 5. Rulebook activations will continue running, and system logs on activation workers remain unaffected.'
    );
    expect(
      screen.getByText('Activation 1, Activation 2, Activation 3, Activation 4, Activation 5', {
        selector: 'strong',
      })
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

    expect(screen.getByRole('dialog')).toHaveTextContent(
      'This deletes stored database logs for the selected instance (201 - Instance 1). Rulebook activations will continue running, and system logs on activation workers remain unaffected.'
    );
    expect(screen.getByText('201 - Instance 1', { selector: 'strong' })).toBeInTheDocument();
  });

  it('should show the selected activation count when more than five activations are selected', () => {
    const targets = Array.from({ length: 6 }, (_, index) => ({
      id: index + 1,
      name: `Activation ${index + 1}`,
    }));

    render(<ClearLogsConfirmationDialog targets={targets} onClose={vi.fn()} onConfirm={vi.fn()} />);

    expect(screen.getByRole('dialog')).toHaveTextContent(
      'This deletes stored database logs for 6 activations. Rulebook activations will continue running, and system logs on activation workers remain unaffected.'
    );
    expect(
      screen.queryByText('Activation 1, Activation 2', { selector: 'strong' })
    ).not.toBeInTheDocument();
  });
});
