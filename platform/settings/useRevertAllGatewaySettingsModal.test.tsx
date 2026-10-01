import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type { ReactNode } from 'react';
import { describe, expect, test, vi, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { RevertAllDialog } from './useRevertAllGatewaySettingsModal';

vi.mock('@patternfly/react-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@patternfly/react-core')>();
  return {
    ...actual,
    Modal: ({
      children,
      'aria-label': ariaLabel,
    }: {
      children: ReactNode;
      'aria-label'?: string;
    }) => (
      <dialog open aria-label={ariaLabel}>
        {children}
      </dialog>
    ),
    ModalHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
    ModalBody: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    ModalFooter: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  };
});

const server = setupServer();

const mockAddAlert = vi.fn();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  mockAddAlert.mockClear();
});

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
