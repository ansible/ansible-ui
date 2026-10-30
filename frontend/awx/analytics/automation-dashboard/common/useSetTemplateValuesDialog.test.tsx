import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { ReactNode } from 'react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { PageAlertToasterProvider, PageDialogProvider } from '@ansible/ansible-ui-framework';
import { useSetTemplateValuesDialog } from './useSetTemplateValuesDialog';
import {
  clickApply,
  fillSetTemplateValuesDialog,
  findSetTemplateValuesDialog,
  mockBulkPatch,
} from './useSetTemplateValuesDialog.testUtils';

// ─── MSW server ───────────────────────────────────────────────────────────────

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ─── Wrapper ──────────────────────────────────────────────────────────────────

// Mirrors PageFramework: the dialog renders in PageDialogProvider, outside
// PageAlertToasterProvider, so the hook must raise the alerts.
function Wrapper({ children }: { children: ReactNode }) {
  return (
    <PageDialogProvider>
      <PageAlertToasterProvider>{children}</PageAlertToasterProvider>
    </PageDialogProvider>
  );
}

const refresh = vi.fn<() => Promise<void>>();
const waitForPendingSaves = vi.fn<() => Promise<void>>();
const applyBulkValues = vi.fn();

function OpenDialogButton() {
  const openDialog = useSetTemplateValuesDialog(refresh, { waitForPendingSaves, applyBulkValues });
  return <button onClick={openDialog}>Open dialog</button>;
}

async function openDialog(user: ReturnType<typeof userEvent.setup>) {
  render(<OpenDialogButton />, { wrapper: Wrapper });
  await user.click(screen.getByRole('button', { name: 'Open dialog' }));
  return findSetTemplateValuesDialog();
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useSetTemplateValuesDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    refresh.mockResolvedValue(undefined);
    waitForPendingSaves.mockResolvedValue(undefined);
  });

  test('should show the title, description, fields and help text', async () => {
    const user = userEvent.setup();
    const dialog = await openDialog(user);

    expect(
      within(dialog).getByText(
        'Set the same effort estimates for all templates. Individual values can be adjusted in the table.'
      )
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole('spinbutton', { name: /Time taken to manually execute/ })
    ).toHaveValue(null);
    expect(
      within(dialog).getByRole('spinbutton', { name: /Time taken to create automation/ })
    ).toHaveValue(null);
    expect(
      within(dialog).getByText(
        'Used in calculations when "Include time taken to create automation in calculations" is enabled.'
      )
    ).toBeInTheDocument();
  });

  test('should keep "Apply to templates" disabled until the overwrite is confirmed', async () => {
    const user = userEvent.setup();
    const patchBodies = mockBulkPatch(server);
    const dialog = await openDialog(user);

    await fillSetTemplateValuesDialog(user, dialog, { manual: '45', create: '30' }, false);
    const apply = within(dialog).getByRole('button', { name: 'Apply to templates' });
    expect(apply).toHaveAttribute('aria-disabled', 'true');

    await user.click(apply);
    expect(
      await screen.findByText('Confirm the overwrite to apply the values.')
    ).toBeInTheDocument();
    expect(patchBodies).toHaveLength(0);

    await user.click(within(dialog).getByRole('checkbox', { name: /Yes, I confirm/ }));
    expect(apply).not.toHaveAttribute('aria-disabled', 'true');
  });

  test('should show validation messages for out-of-range values and not send them', async () => {
    const user = userEvent.setup();
    const patchBodies = mockBulkPatch(server);
    const dialog = await openDialog(user);

    await fillSetTemplateValuesDialog(user, dialog, { manual: '-5', create: '2000000' });
    await clickApply(user, dialog);

    expect(
      await within(dialog).findByText('Value must be greater than or equal to 1.')
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText('Value must be less than or equal to 1000000.')
    ).toBeInTheDocument();
    expect(patchBodies).toHaveLength(0);
  });

  test('should reject a decimal value', async () => {
    const user = userEvent.setup();
    const patchBodies = mockBulkPatch(server);
    const dialog = await openDialog(user);

    await fillSetTemplateValuesDialog(user, dialog, { manual: '1.5', create: '30' });
    await clickApply(user, dialog);

    expect(await within(dialog).findByText('Please enter a valid integer.')).toBeInTheDocument();
    expect(patchBodies).toHaveLength(0);
  });

  test('should not send the bulk update while a value is empty', async () => {
    const user = userEvent.setup();
    const patchBodies = mockBulkPatch(server);
    const dialog = await openDialog(user);

    await user.type(
      within(dialog).getByRole('spinbutton', { name: /Time taken to manually execute/ }),
      '45'
    );
    await user.click(within(dialog).getByRole('checkbox', { name: /Yes, I confirm/ }));
    await clickApply(user, dialog);

    await new Promise((r) => setTimeout(r, 100));
    expect(patchBodies).toHaveLength(0);
    expect(screen.getByRole('dialog', { name: 'Set template values' })).toBeInTheDocument();
  });

  test('should PATCH all templates, close the dialog, show a toast, refresh and show the values', async () => {
    const user = userEvent.setup();
    const patchBodies = mockBulkPatch(server);
    const dialog = await openDialog(user);

    await fillSetTemplateValuesDialog(user, dialog, { manual: '45', create: '30' });
    await clickApply(user, dialog);

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(patchBodies).toEqual([
      { time_taken_manually_execute_minutes: 45, time_taken_create_automation_minutes: 30 },
    ]);
    expect(
      await screen.findByText('Template values applied. Updated templates: 3')
    ).toBeInTheDocument();
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
    expect(applyBulkValues).toHaveBeenCalledWith({
      time_taken_manually_execute_minutes: 45,
      time_taken_create_automation_minutes: 30,
    });
    expect(applyBulkValues.mock.invocationCallOrder[0]).toBeLessThan(
      refresh.mock.invocationCallOrder[0]
    );
  });

  test('should wait for pending table saves before sending the bulk update', async () => {
    const user = userEvent.setup();
    let releaseSaves!: () => void;
    waitForPendingSaves.mockReturnValue(
      new Promise<void>((resolve) => {
        releaseSaves = resolve;
      })
    );
    const patchBodies = mockBulkPatch(server);
    const dialog = await openDialog(user);

    await fillSetTemplateValuesDialog(user, dialog, { manual: '45', create: '30' });
    await clickApply(user, dialog);
    await waitFor(() => expect(waitForPendingSaves).toHaveBeenCalled());
    expect(patchBodies).toHaveLength(0);

    releaseSaves();
    await waitFor(() => expect(patchBodies).toHaveLength(1));
  });

  test('should let the user cancel while waiting for table saves, without sending anything', async () => {
    const user = userEvent.setup();
    let releaseSaves!: () => void;
    waitForPendingSaves.mockReturnValue(
      new Promise<void>((resolve) => {
        releaseSaves = resolve;
      })
    );
    const patchBodies = mockBulkPatch(server);
    const dialog = await openDialog(user);

    await fillSetTemplateValuesDialog(user, dialog, { manual: '45', create: '30' });
    await clickApply(user, dialog);
    await waitFor(() => expect(waitForPendingSaves).toHaveBeenCalled());

    const cancel = within(dialog).getByRole('button', { name: 'Cancel' });
    expect(cancel).toBeEnabled();
    await user.click(cancel);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    releaseSaves();
    await new Promise((r) => setTimeout(r, 100));
    expect(patchBodies).toHaveLength(0);
    expect(refresh).not.toHaveBeenCalled();
  });

  test('should show a generic toast when the PATCH returns no content', async () => {
    const user = userEvent.setup();
    mockBulkPatch(server, () => new HttpResponse(null, { status: 204 }));
    const dialog = await openDialog(user);

    await fillSetTemplateValuesDialog(user, dialog, { manual: '45', create: '30' });
    await clickApply(user, dialog);

    expect(await screen.findByText('Template values applied.')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('should warn and keep the applied values when the refresh fails', async () => {
    const user = userEvent.setup();
    refresh.mockRejectedValue(new Error('Network error'));
    mockBulkPatch(server);
    const dialog = await openDialog(user);

    await fillSetTemplateValuesDialog(user, dialog, { manual: '45', create: '30' });
    await clickApply(user, dialog);

    expect(await screen.findByText('Update saved but failed to refresh view.')).toBeInTheDocument();
    expect(applyBulkValues).toHaveBeenCalledTimes(1);
  });

  test('should keep the dialog open and show the error when the PATCH fails', async () => {
    const user = userEvent.setup();
    mockBulkPatch(server, () =>
      HttpResponse.json({ detail: 'Internal server error.' }, { status: 500 })
    );
    const dialog = await openDialog(user);

    await fillSetTemplateValuesDialog(user, dialog, { manual: '45', create: '30' });
    await clickApply(user, dialog);

    expect(await within(dialog).findByText('Internal server error.')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Set template values' })).toBeInTheDocument();
    expect(refresh).not.toHaveBeenCalled();
  });

  test('should close the dialog on Cancel without sending anything', async () => {
    const user = userEvent.setup();
    const patchBodies = mockBulkPatch(server);
    const dialog = await openDialog(user);

    await fillSetTemplateValuesDialog(user, dialog, { manual: '45', create: '30' });
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(patchBodies).toHaveLength(0);
  });

  test('should not close the dialog while the values are being applied', async () => {
    const user = userEvent.setup();
    let releasePatch!: () => void;
    const patchGate = new Promise<void>((resolve) => {
      releasePatch = resolve;
    });
    mockBulkPatch(server, async () => {
      await patchGate;
      return HttpResponse.json({ updated: 3 });
    });
    const dialog = await openDialog(user);

    await fillSetTemplateValuesDialog(user, dialog, { manual: '45', create: '30' });
    await clickApply(user, dialog);

    const cancel = within(dialog).getByRole('button', { name: 'Cancel' });
    await waitFor(() => expect(cancel).toBeDisabled());
    expect(within(dialog).queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.getByRole('dialog', { name: 'Set template values' })).toBeInTheDocument();

    releasePatch();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
