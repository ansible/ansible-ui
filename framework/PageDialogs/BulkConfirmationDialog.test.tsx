/* eslint-disable i18next/no-literal-string */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { render, screen, renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BulkConfirmationDialog, useBulkConfirmation } from './BulkConfirmationDialog';
import { PageDialogProvider } from './PageDialog';
import { FrameworkTranslationsProvider } from '../useFrameworkTranslations';
import { BrowserRouter } from 'react-router-dom';

vi.mock('@patternfly/react-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@patternfly/react-core')>();
  return {
    ...actual,
    Modal: ({ children, title }: { children: React.ReactNode; title: string }) => (
      <div data-testid="modal">
        <h1>{title}</h1>
        {children}
      </div>
    ),
  };
});

describe('BulkConfirmationDialog', () => {
  const items = [{ id: 1, name: 'Item 1' }];
  const keyFn = (item: { id: number }) => item.id;
  const confirmationColumns = [{ header: 'Name', cell: (item: { name: string }) => item.name }];
  const onConfirm = vi.fn();

  it('should render alert prompts when provided', () => {
    const alertPrompts = ['Alert 1', 'Alert 2'];
    render(
      <BrowserRouter>
        <FrameworkTranslationsProvider>
          <PageDialogProvider>
            <BulkConfirmationDialog
              title="Confirm Bulk Action"
              items={items}
              keyFn={keyFn}
              confirmationColumns={confirmationColumns as any}
              onConfirm={onConfirm}
              confirmText="Confirm this action"
              actionButtonText="Action"
              alertPrompts={alertPrompts}
            />
          </PageDialogProvider>
        </FrameworkTranslationsProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Alert 1')).toBeInTheDocument();
    expect(screen.getByText('Alert 2')).toBeInTheDocument();
  });

  it('should render alert prompts with plain styling when isPlain is true', () => {
    const alertPrompts = ['Plain Alert'];
    render(
      <BrowserRouter>
        <FrameworkTranslationsProvider>
          <PageDialogProvider>
            <BulkConfirmationDialog
              title="Confirm Bulk Action"
              items={items}
              keyFn={keyFn}
              confirmationColumns={confirmationColumns as any}
              onConfirm={onConfirm}
              confirmText="Confirm this action"
              actionButtonText="Action"
              alertPrompts={alertPrompts}
              isPlain={true}
            />
          </PageDialogProvider>
        </FrameworkTranslationsProvider>
      </BrowserRouter>
    );

    const alert = screen.getByTestId('alert-toaster');
    expect(alert).toHaveClass('pf-m-plain');
  });

  it('should call onConfirm when action button is clicked', () => {
    const { getByRole, getByLabelText } = render(
      <BrowserRouter>
        <FrameworkTranslationsProvider>
          <PageDialogProvider>
            <BulkConfirmationDialog
              title="Confirm Bulk Action"
              items={items}
              keyFn={keyFn}
              confirmationColumns={confirmationColumns as any}
              onConfirm={onConfirm}
              confirmText="Confirm this action"
              actionButtonText="Action"
            />
          </PageDialogProvider>
        </FrameworkTranslationsProvider>
      </BrowserRouter>
    );

    const checkbox = getByLabelText('Confirm this action');
    checkbox.click();

    const actionButton = getByRole('button', { name: 'Action' });
    actionButton.click();

    expect(onConfirm).toHaveBeenCalled();
  });

  it('useBulkConfirmation should open a dialog', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PageDialogProvider>
        <FrameworkTranslationsProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </FrameworkTranslationsProvider>
      </PageDialogProvider>
    );
    const { result } = renderHook(() => useBulkConfirmation(), { wrapper });

    act(() => {
      result.current({
        title: 'Bulk Action Opened',
        items: [],
        keyFn: (i: any) => i.id,
        confirmationColumns: [],
        actionColumns: [],
        confirmText: 'Confirm',
        actionButtonText: 'Submit',
        actionFn: () => Promise.resolve(),
      });
    });

    expect(screen.getByText('Bulk Action Opened')).toBeInTheDocument();
  });
});
