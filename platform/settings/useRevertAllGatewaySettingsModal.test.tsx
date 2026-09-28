import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { describe, expect, test, vi, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { RevertAllDialog } from './useRevertAllGatewaySettingsModal';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  mockAddAlert.mockClear();
});

const mockAddAlert = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageAlertToaster: () => ({ addAlert: mockAddAlert }),
  };
});

describe('RevertAllDialog', () => {
  test('should delete all gateway settings and call onComplete when confirmed', async () => {
    const onComplete = vi.fn();
    const popDialog = vi.fn();
    const user = userEvent.setup();

    server.use(http.delete('*/settings/all/', () => HttpResponse.json({}, { status: 204 })));

    render(<RevertAllDialog onComplete={onComplete} popDialog={popDialog} />);

    await user.click(screen.getByRole('button', { name: 'Confirm revert all' }));

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
    expect(popDialog).toHaveBeenCalled();
  });

  test('should show an error alert when revert request fails', async () => {
    const onComplete = vi.fn();
    const popDialog = vi.fn();
    const user = userEvent.setup();

    server.use(http.delete('*/settings/all/', () => HttpResponse.json({}, { status: 500 })));

    render(<RevertAllDialog onComplete={onComplete} popDialog={popDialog} />);

    await user.click(screen.getByRole('button', { name: 'Confirm revert all' }));

    await waitFor(() => {
      expect(mockAddAlert).toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'danger', title: 'Failed to revert settings' })
      );
    });
    expect(onComplete).not.toHaveBeenCalled();
    expect(popDialog).toHaveBeenCalled();
  });

  test('should close the dialog when cancel is clicked', async () => {
    const popDialog = vi.fn();
    const user = userEvent.setup();

    render(<RevertAllDialog onComplete={vi.fn()} popDialog={popDialog} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(popDialog).toHaveBeenCalled();
  });
});
