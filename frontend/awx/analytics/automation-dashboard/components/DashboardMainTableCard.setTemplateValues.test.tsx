import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  clickApply,
  fillSetTemplateValuesDialog,
  findSetTemplateValuesDialog,
  mockBulkPatch,
} from '../common/useSetTemplateValuesDialog.testUtils';
import {
  buildMainTableView,
  buildProps,
  mockRefresh,
  renderCard,
} from './DashboardMainTableCard.testUtils';

// ─── Hoisted mocks ────────────────────────────────────────────────────────────

const { mockUseAwxActiveUser } = vi.hoisted(() => ({
  mockUseAwxActiveUser: vi.fn(),
}));

vi.mock('../../../common/useAwxActiveUser', () => ({
  useAwxActiveUser: mockUseAwxActiveUser,
}));

// ─── MSW server ───────────────────────────────────────────────────────────────

const server = setupServer(
  http.put(/template_metadata\/1\//, () =>
    HttpResponse.json({
      time_taken_manually_execute_minutes: 42,
      time_taken_create_automation_minutes: 60,
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function openSetTemplateValuesDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Set template values' }));
  return findSetTemplateValuesDialog();
}

// Integration with the table card; the dialog itself is covered by useSetTemplateValuesDialog.test.
// These render the whole card and type into several PatternFly inputs, which takes a few seconds.
describe('DashboardMainTableCard - Set template values', { timeout: 15000 }, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRefresh.mockResolvedValue(undefined);
    mockUseAwxActiveUser.mockReturnValue({ activeAwxUser: { is_superuser: true } });
  });

  test('should show "Set template values" for a superuser when the table has results', () => {
    renderCard();
    expect(screen.getByRole('button', { name: 'Set template values' })).toBeInTheDocument();
  });

  test('should hide "Set template values" for a non-superuser', () => {
    mockUseAwxActiveUser.mockReturnValue({ activeAwxUser: { is_superuser: false } });
    renderCard();
    expect(screen.queryByRole('button', { name: 'Set template values' })).not.toBeInTheDocument();
  });

  test('should hide "Set template values" when the table has no results', () => {
    renderCard(buildProps({ mainTableView: buildMainTableView({ itemCount: 0, pageItems: [] }) }));
    expect(screen.queryByRole('button', { name: 'Set template values' })).not.toBeInTheDocument();
  });

  test('should disable "Set template values" while the report is loading', () => {
    renderCard(buildProps({ loading: true }));
    expect(screen.getByRole('button', { name: 'Set template values' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  test('should wait for a pending table save before sending the bulk update', async () => {
    const user = userEvent.setup();
    let putCount = 0;
    let releasePut!: () => void;
    const putGate = new Promise<void>((resolve) => {
      releasePut = resolve;
    });
    server.use(
      http.put(/template_metadata\/1\//, async ({ request }) => {
        putCount++;
        await putGate;
        return HttpResponse.json(await request.json());
      })
    );
    const patchBodies = mockBulkPatch(server);
    renderCard();

    const cell = screen.getByTestId('time_taken_manually_execute_minutes_1');
    await user.clear(cell);
    await user.type(cell, '50');
    await waitFor(() => expect(putCount).toBe(1));

    const dialog = await openSetTemplateValuesDialog(user);

    await fillSetTemplateValuesDialog(user, dialog, { manual: '45', create: '30' });
    await clickApply(user, dialog);
    await new Promise((r) => setTimeout(r, 100));
    expect(patchBodies).toHaveLength(0);

    releasePut();
    await waitFor(() => expect(patchBodies).toHaveLength(1));
    expect(putCount).toBe(1);
  });

  test('should not wait for a stalled refresh that follows a table save', async () => {
    const user = userEvent.setup();
    const patchBodies = mockBulkPatch(server);
    mockRefresh.mockReturnValueOnce(new Promise<void>(() => {}));
    renderCard();

    const cell = screen.getByTestId('time_taken_manually_execute_minutes_1');
    await user.clear(cell);
    await user.type(cell, '50');
    await waitFor(() => expect(mockRefresh).toHaveBeenCalledTimes(1));

    const dialog = await openSetTemplateValuesDialog(user);
    await fillSetTemplateValuesDialog(user, dialog, { manual: '45', create: '30' });
    await clickApply(user, dialog);

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(patchBodies).toHaveLength(1);
  });

  test('should show the bulk values and reset an invalid table edit after the bulk update', async () => {
    const user = userEvent.setup();
    mockBulkPatch(server);
    const mainTableView = buildMainTableView();
    renderCard(buildProps({ mainTableView }));

    const cell = screen.getByTestId('time_taken_manually_execute_minutes_1');
    await user.clear(cell);
    expect(screen.getByText('Please enter a valid number.')).toBeInTheDocument();

    const dialog = await openSetTemplateValuesDialog(user);
    await fillSetTemplateValuesDialog(user, dialog, { manual: '45', create: '30' });
    await clickApply(user, dialog);

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(mainTableView.updateItem).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        time_taken_manually_execute_minutes: 45,
        time_taken_create_automation_minutes: 30,
      })
    );
    await waitFor(() =>
      expect(screen.queryByText('Please enter a valid number.')).not.toBeInTheDocument()
    );
  });
});
