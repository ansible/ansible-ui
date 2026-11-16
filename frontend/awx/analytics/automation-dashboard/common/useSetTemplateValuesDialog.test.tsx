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
  replaceFieldValue,
  templateDefaultsHandler,
} from './useSetTemplateValuesDialog.testUtils';

// ─── MSW server ───────────────────────────────────────────────────────────────

const server = setupServer(templateDefaultsHandler());

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
        'Set the default effort estimates for templates. Applying them overwrites the current values of all templates. Individual values can be adjusted in the table.'
      )
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(
        'Used in calculations when "Include time taken to create automation in calculations" is enabled.'
      )
    ).toBeInTheDocument();
  });

  test('should prefill the fields with the default values from the API', async () => {
    const user = userEvent.setup();
    const dialog = await openDialog(user);

    expect(
      within(dialog).getByRole('spinbutton', { name: /Time taken to manually execute/ })
    ).toHaveValue(60);
    expect(
      within(dialog).getByRole('spinbutton', { name: /Time taken to create automation/ })
    ).toHaveValue(120);
  });

  test('should show a loading indicator until the default values are loaded', async () => {
    const user = userEvent.setup();
    let releaseDefaults!: () => void;
    const defaultsGate = new Promise<void>((resolve) => {
      releaseDefaults = resolve;
    });
    server.use(
      templateDefaultsHandler(async () => {
        await defaultsGate;
        return HttpResponse.json({
          time_taken_manually_execute_minutes: 5,
          time_taken_create_automation_minutes: 10,
        });
      })
    );
    render(<OpenDialogButton />, { wrapper: Wrapper });
    await user.click(screen.getByRole('button', { name: 'Open dialog' }));

    const dialog = await screen.findByRole('dialog', { name: 'Set template default values' });
    expect(
      within(dialog).getByRole('progressbar', { name: 'Loading default values' })
    ).toBeVisible();
    expect(within(dialog).queryByRole('spinbutton')).not.toBeInTheDocument();

    releaseDefaults();
    expect(
      await within(dialog).findByRole('spinbutton', { name: /Time taken to manually execute/ })
    ).toHaveValue(5);
    expect(
      within(dialog).getByRole('spinbutton', { name: /Time taken to create automation/ })
    ).toHaveValue(10);
  });

  test('should leave a field empty when its default value is missing', async () => {
    const user = userEvent.setup();
    server.use(
      templateDefaultsHandler(() =>
        HttpResponse.json({
          time_taken_manually_execute_minutes: 15,
          time_taken_create_automation_minutes: null,
        })
      )
    );
    const dialog = await openDialog(user);

    expect(
      within(dialog).getByRole('spinbutton', { name: /Time taken to manually execute/ })
    ).toHaveValue(15);
    expect(
      within(dialog).getByRole('spinbutton', { name: /Time taken to create automation/ })
    ).toHaveValue(null);
  });

  test('should read default values sent as numeric strings', async () => {
    const user = userEvent.setup();
    server.use(
      templateDefaultsHandler(() =>
        HttpResponse.json({
          time_taken_manually_execute_minutes: '30',
          time_taken_create_automation_minutes: 'abc',
        })
      )
    );
    const dialog = await openDialog(user);

    expect(
      within(dialog).getByRole('spinbutton', { name: /Time taken to manually execute/ })
    ).toHaveValue(30);
    expect(
      within(dialog).getByRole('spinbutton', { name: /Time taken to create automation/ })
    ).toHaveValue(null);
  });

  test('should flag a default value outside the allowed range as soon as the dialog opens', async () => {
    const user = userEvent.setup();
    server.use(
      templateDefaultsHandler(() =>
        HttpResponse.json({
          time_taken_manually_execute_minutes: 0,
          time_taken_create_automation_minutes: 30,
        })
      )
    );
    const dialog = await openDialog(user);

    expect(
      await within(dialog).findByText('Value must be greater than or equal to 1.')
    ).toBeInTheDocument();
    // A valid prefilled value and the empty state do not show errors
    expect(within(dialog).queryByText(/is required/)).not.toBeInTheDocument();
  });

  test('should move focus to the first field once the default values are loaded', async () => {
    const user = userEvent.setup();
    const dialog = await openDialog(user);

    await waitFor(() =>
      expect(
        within(dialog).getByRole('spinbutton', { name: /Time taken to manually execute/ })
      ).toHaveFocus()
    );
  });

  test('should load the default values again each time the dialog opens', async () => {
    const user = userEvent.setup();
    let manual = 10;
    server.use(
      templateDefaultsHandler(() =>
        HttpResponse.json({
          time_taken_manually_execute_minutes: manual,
          time_taken_create_automation_minutes: 20,
        })
      )
    );
    let dialog = await openDialog(user);
    expect(
      within(dialog).getByRole('spinbutton', { name: /Time taken to manually execute/ })
    ).toHaveValue(10);
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    manual = 25;
    await user.click(screen.getByRole('button', { name: 'Open dialog' }));
    dialog = await findSetTemplateValuesDialog();
    expect(
      within(dialog).getByRole('spinbutton', { name: /Time taken to manually execute/ })
    ).toHaveValue(25);
  });

  test('should show a warning and empty fields when the default values fail to load', async () => {
    const user = userEvent.setup();
    server.use(
      templateDefaultsHandler(() => HttpResponse.json({ detail: 'Error' }, { status: 500 }))
    );
    const patchBodies = mockBulkPatch(server);
    const dialog = await openDialog(user);

    expect(
      within(dialog).getByText('Failed to load the default values. Enter the values manually.')
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole('spinbutton', { name: /Time taken to manually execute/ })
    ).toHaveValue(null);
    expect(
      within(dialog).getByRole('spinbutton', { name: /Time taken to create automation/ })
    ).toHaveValue(null);

    // The values can still be entered and applied
    await fillSetTemplateValuesDialog(user, dialog, { manual: '45', create: '30' });
    await clickApply(user, dialog);
    await waitFor(() => expect(patchBodies).toHaveLength(1));
  });

  test('should send the default values unchanged when they are only confirmed', async () => {
    const user = userEvent.setup();
    const patchBodies = mockBulkPatch(server);
    const dialog = await openDialog(user);

    await user.click(within(dialog).getByRole('checkbox', { name: /Yes, I confirm/ }));
    await clickApply(user, dialog);

    await waitFor(() =>
      expect(patchBodies).toEqual([
        { time_taken_manually_execute_minutes: 60, time_taken_create_automation_minutes: 120 },
      ])
    );
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

    await replaceFieldValue(
      user,
      within(dialog).getByRole('spinbutton', { name: /Time taken to create automation/ }),
      ''
    );
    await user.click(within(dialog).getByRole('checkbox', { name: /Yes, I confirm/ }));
    await clickApply(user, dialog);

    await new Promise((r) => setTimeout(r, 100));
    expect(patchBodies).toHaveLength(0);
    expect(screen.getByRole('dialog', { name: 'Set template default values' })).toBeInTheDocument();
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
      await screen.findByText('Template defaults applied. Updated templates: 3')
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

    expect(await screen.findByText('Template defaults applied.')).toBeInTheDocument();
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
    expect(screen.getByRole('dialog', { name: 'Set template default values' })).toBeInTheDocument();
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
    expect(screen.getByRole('dialog', { name: 'Set template default values' })).toBeInTheDocument();

    releasePatch();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
