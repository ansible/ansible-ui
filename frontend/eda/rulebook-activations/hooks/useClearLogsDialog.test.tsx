/* eslint-disable i18next/no-literal-string */

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { type BulkActionDialogProps } from '@ansible/ansible-ui-framework/PageDialogs/BulkActionDialog';
import { PageDialogProvider } from '../../../../framework/PageDialogs/PageDialog';
import { edaAPI } from '../../common/eda-utils';
import { ClearLogsTarget } from '../components/ClearLogsConfirmationDialog';
import { useClearLogsDialog } from './useClearLogsDialog';

const { openProgressDialog } = vi.hoisted(() => ({
  openProgressDialog: vi.fn(),
}));

vi.mock('../../common/useEdaBulkActionDialog', () => ({
  useEdaBulkActionDialog: () => openProgressDialog,
}));

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

function TestHarness(
  props: Readonly<{
    onComplete: (targets: ClearLogsTarget[]) => void;
    targets?: ReadonlyArray<ClearLogsTarget>;
  }>
) {
  const openClearLogsDialog = useClearLogsDialog({
    endpointBuilder: (target) => edaAPI`/activation-instances/${target.id.toString()}/clear-logs/`,
    onComplete: props.onComplete,
    targetType: 'instance',
  });

  return (
    <button
      onClick={() => openClearLogsDialog(props.targets ?? [{ id: 201, name: '201 - Instance 1' }])}
    >
      Open clear logs
    </button>
  );
}

describe('useClearLogsDialog', () => {
  it('should report targets only after a successful progress close', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const target: ClearLogsTarget = { id: 201, name: '201 - Instance 1' };

    render(
      <PageDialogProvider>
        <TestHarness onComplete={onComplete} />
      </PageDialogProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Open clear logs' }));
    const confirmationDialog = screen.getByRole('dialog', { name: 'Clear logs?' });
    await user.click(
      within(confirmationDialog).getByRole('checkbox', {
        name: 'I understand that clearing logs cannot be undone.',
      })
    );
    await user.click(within(confirmationDialog).getByRole('button', { name: 'Clear logs' }));

    const progressProps = openProgressDialog.mock
      .calls[0]?.[0] as BulkActionDialogProps<ClearLogsTarget>;
    progressProps.onClose?.('failures', [], [target], []);
    progressProps.onClose?.('canceled', [], [], [target]);
    expect(onComplete).not.toHaveBeenCalled();

    progressProps.onClose?.('success', [target], [], []);
    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledWith([target]);
  });

  it('should not open a dialog when no targets are provided', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    openProgressDialog.mockClear();

    render(
      <PageDialogProvider>
        <TestHarness onComplete={onComplete} targets={[]} />
      </PageDialogProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Open clear logs' }));

    expect(screen.queryByRole('dialog', { name: 'Clear logs?' })).not.toBeInTheDocument();
    expect(openProgressDialog).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });
});
