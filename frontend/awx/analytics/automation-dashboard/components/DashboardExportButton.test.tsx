/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ReactNode } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { PageAlertToasterProvider } from '@ansible/ansible-ui-framework';
import { ExportIcon, PrintIcon } from '@patternfly/react-icons';
import { DashboardExportButton } from './DashboardExportButton';
import type { IAutomationDashboardExportButton } from '../types';

function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <MemoryRouter>
      <PageAlertToasterProvider>{children}</PageAlertToasterProvider>
    </MemoryRouter>
  );
}

function renderButton(overrides: Partial<IAutomationDashboardExportButton> = {}) {
  const props: IAutomationDashboardExportButton = {
    exportType: 'csv',
    title: 'Export as CSV',
    icon: ExportIcon,
    onExport: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  return render(<DashboardExportButton {...props} />, { wrapper: Wrapper });
}

describe('DashboardExportButton', () => {
  // --- Disabled state ---

  test('should render disabled button when isDisabled is true', () => {
    renderButton({ isDisabled: true });
    expect(screen.getByTestId('dashboard-export-button-csv')).toBeDisabled();
  });

  test('should render disabled print button for html exportType', () => {
    renderButton({ exportType: 'html', title: 'Print report', icon: PrintIcon, isDisabled: true });
    expect(screen.getByTestId('dashboard-export-button-html')).toBeDisabled();
  });

  // --- Enabled state ---

  test('should render enabled export button when not disabled', () => {
    renderButton();
    expect(screen.getByTestId('export-as-csv')).not.toBeDisabled();
  });

  // --- Dropdown options ---

  test('should call onExport with "summary" when Summary is clicked', async () => {
    const user = userEvent.setup();
    const onExport = vi.fn().mockResolvedValue(undefined);
    renderButton({ onExport });

    await user.click(screen.getByTestId('export-as-csv'));
    await user.click(screen.getByRole('menuitem', { name: 'Summary' }));

    await waitFor(() => expect(onExport).toHaveBeenCalledWith('summary'));
  });

  test('should call onExport with "roi" when Roi is clicked', async () => {
    const user = userEvent.setup();
    const onExport = vi.fn().mockResolvedValue(undefined);
    renderButton({ onExport });

    await user.click(screen.getByTestId('export-as-csv'));
    await user.click(screen.getByRole('menuitem', { name: 'ROI' }));

    await waitFor(() => expect(onExport).toHaveBeenCalledWith('roi'));
  });

  test('should call onExport with "trends" when Trends is clicked', async () => {
    const user = userEvent.setup();
    const onExport = vi.fn().mockResolvedValue(undefined);
    renderButton({ onExport });

    await user.click(screen.getByTestId('export-as-csv'));
    await user.click(screen.getByRole('menuitem', { name: 'Trends' }));

    await waitFor(() => expect(onExport).toHaveBeenCalledWith('trends'));
  });

  // --- Loading state ---

  test('should disable button while export is in progress', async () => {
    const user = userEvent.setup();
    let resolve!: () => void;
    const onExport = vi.fn().mockReturnValue(
      new Promise<void>((r) => {
        resolve = r;
      })
    );
    renderButton({ onExport });

    await user.click(screen.getByTestId('export-as-csv'));
    await user.click(screen.getByRole('menuitem', { name: 'Summary' }));

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-export-button-csv')).toBeDisabled();
    });

    resolve();

    await waitFor(() => {
      expect(screen.getByTestId('export-as-csv')).not.toBeDisabled();
    });
  });

  test('should re-enable button after onExport throws', async () => {
    const user = userEvent.setup();
    const onExport = vi.fn().mockRejectedValue(new Error('Export failed'));
    renderButton({ onExport });

    await user.click(screen.getByTestId('export-as-csv'));
    await user.click(screen.getByRole('menuitem', { name: 'Summary' }));

    await waitFor(() => {
      expect(screen.getByTestId('export-as-csv')).not.toBeDisabled();
    });
  });
});
