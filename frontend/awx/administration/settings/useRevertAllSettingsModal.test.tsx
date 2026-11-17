import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { RevertAllDialog, useRevertAllSettingsModal } from './useRevertAllSettingsModal';
import { renderHook } from '@testing-library/react';

const mockPushDialog = vi.fn();
const mockPopDialog = vi.fn();
const mockAddAlert = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    usePageDialogs: () => ({ pushDialog: mockPushDialog, popDialog: mockPopDialog }),
    usePageAlertToaster: () => ({ addAlert: mockAddAlert }),
  };
});

const deletedCategories: string[] = [];
const server = setupServer(
  http.delete(awxAPI`/settings/:category/`, ({ params }) => {
    deletedCategories.push(params.category as string);
    return new HttpResponse(null, { status: 204 });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  deletedCategories.length = 0;
});
afterAll(() => server.close());

describe('useRevertAllSettingsModal', () => {
  it('opens revert dialog when props are provided', async () => {
    const { result } = renderHook(() => useRevertAllSettingsModal());

    result.current({ categorySlugs: ['system'], onComplete: vi.fn() });

    await waitFor(() => expect(mockPushDialog).toHaveBeenCalled());
  });
});

describe('RevertAllDialog', () => {
  it('reverts settings for each category and calls onComplete', async () => {
    const onComplete = vi.fn();
    const user = userEvent.setup();

    render(
      <RevertAllDialog
        categorySlugs={['system', 'jobs']}
        onComplete={onComplete}
        popDialog={mockPopDialog}
      />
    );

    expect(screen.getByTestId('revert-settings-modal')).toBeInTheDocument();

    await user.click(screen.getByTestId('delete-group-modal-delete-button'));

    await waitFor(() => expect(deletedCategories.sort()).toEqual(['jobs', 'system']));
    expect(onComplete).toHaveBeenCalled();
    expect(mockPopDialog).toHaveBeenCalled();
  });
});
