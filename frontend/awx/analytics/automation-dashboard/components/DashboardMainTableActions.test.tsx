import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ReactNode } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { PageAlertToasterProvider } from '@ansible/ansible-ui-framework';
import { ExportIcon } from '@patternfly/react-icons';
import { DashboardMainTableActions } from './DashboardMainTableActions';
import type { IAutomationDashboardMainTableActions } from '../types';

function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <MemoryRouter>
      <PageAlertToasterProvider>{children}</PageAlertToasterProvider>
    </MemoryRouter>
  );
}

function renderActions(overrides: Partial<IAutomationDashboardMainTableActions> = {}) {
  const props: IAutomationDashboardMainTableActions = {
    title: 'Export as CSV',
    icon: ExportIcon,
    onExport: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  return render(<DashboardMainTableActions {...props} />, { wrapper: Wrapper });
}

function setWindowWidth(width: number) {
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(width);
}

describe('DashboardMainTableActions', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // --- Export: enabled / disabled ---

  test('should render enabled export button when no disabled reason is given', () => {
    renderActions();
    expect(screen.getByTestId('export-as-csv')).not.toHaveAttribute('aria-disabled', 'true');
  });

  test('should disable export and show the reason in a tooltip', async () => {
    const user = userEvent.setup();
    renderActions({ exportDisabledReason: 'Report data is loading.' });

    const exportButton = screen.getByTestId('export-as-csv');
    expect(exportButton).toHaveAttribute('aria-disabled', 'true');

    await user.hover(exportButton);
    expect(await screen.findByText('Report data is loading.')).toBeInTheDocument();
  });

  // --- Export: dropdown options ---

  test.each([
    ['Summary', 'summary'],
    ['ROI', 'roi'],
    ['Trends', 'trends'],
  ])('should call onExport with "%s" report type', async (label, reportType) => {
    const user = userEvent.setup();
    const onExport = vi.fn().mockResolvedValue(undefined);
    renderActions({ onExport });

    await user.click(screen.getByTestId('export-as-csv'));
    await user.click(screen.getByRole('menuitem', { name: label }));

    await waitFor(() => expect(onExport).toHaveBeenCalledWith(reportType));
  });

  // --- Export: in progress ---

  test('should disable export and show a spinner while export is in progress', async () => {
    const user = userEvent.setup();
    let resolveExport!: () => void;
    const onExport = vi.fn().mockReturnValue(
      new Promise<void>((resolve) => {
        resolveExport = resolve;
      })
    );
    renderActions({ onExport });

    await user.click(screen.getByTestId('export-as-csv'));
    await user.click(screen.getByRole('menuitem', { name: 'Summary' }));

    await waitFor(() =>
      expect(screen.getByTestId('export-as-csv')).toHaveAttribute('aria-disabled', 'true')
    );
    expect(
      within(screen.getByTestId('export-as-csv')).getByRole('progressbar')
    ).toBeInTheDocument();

    resolveExport();

    await waitFor(() =>
      expect(screen.getByTestId('export-as-csv')).not.toHaveAttribute('aria-disabled', 'true')
    );
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  test('should re-enable export after onExport throws', async () => {
    const user = userEvent.setup();
    const onExport = vi.fn().mockRejectedValue(new Error('Export failed'));
    renderActions({ onExport });

    await user.click(screen.getByTestId('export-as-csv'));
    await user.click(screen.getByRole('menuitem', { name: 'Summary' }));

    await waitFor(() =>
      expect(screen.getByTestId('export-as-csv')).not.toHaveAttribute('aria-disabled', 'true')
    );
  });

  // --- Set template values ---

  test('should hide "Set template values" when it is not allowed', () => {
    renderActions({ canSetTemplateValues: false });
    expect(screen.queryByRole('button', { name: 'Set template values' })).not.toBeInTheDocument();
  });

  test('should call onSetTemplateValues when "Set template values" is clicked', async () => {
    const user = userEvent.setup();
    const onSetTemplateValues = vi.fn();
    renderActions({ canSetTemplateValues: true, onSetTemplateValues });

    await user.click(screen.getByRole('button', { name: 'Set template values' }));

    expect(onSetTemplateValues).toHaveBeenCalledTimes(1);
  });

  test('should disable "Set template values" and show the reason in a tooltip', async () => {
    const user = userEvent.setup();
    const onSetTemplateValues = vi.fn();
    renderActions({
      canSetTemplateValues: true,
      setTemplateValuesDisabledReason: 'Report data is loading.',
      onSetTemplateValues,
    });

    const button = screen.getByRole('button', { name: 'Set template values' });
    expect(button).toHaveAttribute('aria-disabled', 'true');

    await user.click(button);
    expect(onSetTemplateValues).not.toHaveBeenCalled();
    expect(await screen.findByText('Report data is loading.')).toBeInTheDocument();
  });

  // --- Narrow window: kebab ---

  test('should list the actions and reports directly in the kebab below md', async () => {
    setWindowWidth(500);
    const user = userEvent.setup();
    const onExport = vi.fn().mockResolvedValue(undefined);
    const onSetTemplateValues = vi.fn();
    renderActions({ onExport, canSetTemplateValues: true, onSetTemplateValues });

    expect(screen.queryByRole('button', { name: 'Set template values' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'kebab dropdown toggle' }));

    expect(screen.getByRole('menuitem', { name: 'Set template values' })).toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: 'Export as CSV: ROI' }));

    await waitFor(() => expect(onExport).toHaveBeenCalledWith('roi'));
  });

  test('should disable the reports in the kebab with the export disabled reason', async () => {
    setWindowWidth(500);
    const user = userEvent.setup();
    renderActions({ exportDisabledReason: 'No data available to export.' });

    await user.click(screen.getByRole('button', { name: 'kebab dropdown toggle' }));

    const summary = screen.getByRole('menuitem', { name: 'Export as CSV: Summary' });
    expect(summary).toHaveAttribute('aria-disabled', 'true');
    await user.hover(summary);
    expect(await screen.findByText('No data available to export.')).toBeInTheDocument();
  });
});
