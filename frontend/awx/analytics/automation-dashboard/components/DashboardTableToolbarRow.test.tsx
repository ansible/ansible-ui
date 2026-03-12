/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { vi, test, afterEach, describe, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { DashboardTableToolbarRow } from './DashboardTableToolbarRow';
import { ITemplateOptions } from '../interfaces';

const defaultToolbarState: ITemplateOptions = {
  manual_cost_automation_per_hour: 60,
  automated_process_cost_per_minute: 2,
  enable_template_creation_time: true,
};

const defaultProps = {
  toolbarState: defaultToolbarState,
  setToolbarState: vi.fn(),
  isLoading: false,
  itemCount: 0,
  onExportCsv: vi.fn(),
};

function testWrapper(props = defaultProps) {
  return (
    <DashboardTableToolbarRow
      toolbarState={props.toolbarState}
      setToolbarState={props.setToolbarState}
      isLoading={props.isLoading}
      itemCount={props.itemCount}
      onExportCsv={props.onExportCsv}
    />
  );
}

describe('DashboardTableToolbarRow', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders input fields and switch with correct values', () => {
    render(testWrapper({ ...defaultProps, itemCount: 1 }));
    expect(screen.getByLabelText(/Average cost of per hour/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Average cost per minute/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Include time taken to create automation/i)).toBeInTheDocument();
    expect(screen.getByTestId('btn-export-csv')).toBeEnabled();
  });

  test('calls setToolbarState on input change and blur', async () => {
    const setToolbarState = vi.fn();
    const user = userEvent.setup();
    const element = render(
      testWrapper({ ...defaultProps, setToolbarState: setToolbarState, itemCount: 1 })
    );
    const costManualAutomationInput = element.getByTestId('cost_manual_automation_input');
    await user.clear(costManualAutomationInput);
    await user.type(costManualAutomationInput, '100');
    await user.tab(); // triggers blur
    expect(setToolbarState).toHaveBeenCalled();

    const costAutomatedExecutionInput = element.getByTestId('cost_automated_execution');
    await user.clear(costAutomatedExecutionInput);
    await user.type(costAutomatedExecutionInput, '1000');
    await user.tab(); // triggers blur
    expect(setToolbarState).toHaveBeenCalled();
  });

  test('calls setToolbarState on switch toggle and checks toggle state', async () => {
    const setToolbarState = vi.fn();
    const user = userEvent.setup();
    const state = { ...defaultToolbarState, enable_template_creation_time: false };
    const dashboardTableToolbarRow = render(
      testWrapper({
        ...defaultProps,
        toolbarState: state,
        setToolbarState: setToolbarState,
      })
    );
    const switchInput = dashboardTableToolbarRow.getByTestId('switch-time-taken-automation-toggle');

    expect(switchInput).not.toBeChecked();

    await user.click(switchInput);
    const fn = setToolbarState.mock.calls[0][0] as (prev: ITemplateOptions) => ITemplateOptions;
    const prevState: ITemplateOptions = {
      ...defaultToolbarState,
      enable_template_creation_time: false,
    };
    const newState: ITemplateOptions = fn(prevState);
    expect(newState).toEqual({
      ...defaultToolbarState,
      enable_template_creation_time: true,
    });

    dashboardTableToolbarRow.rerender(
      testWrapper({
        ...defaultProps,
        toolbarState: newState,
        setToolbarState: setToolbarState,
      })
    );
    expect(switchInput).toBeChecked();
  });

  test('disables export button when loading', () => {
    render(testWrapper({ ...defaultProps, isLoading: true, itemCount: 1 }));
    expect(screen.getByTestId('btn-export-csv')).toBeDisabled();
  });

  test('disables export button when itemCount is 0', () => {
    render(testWrapper({ ...defaultProps, itemCount: 0, isLoading: false }));
    expect(screen.getByTestId('btn-export-csv')).toBeDisabled();
  });

  test('calls onExportCsv when export button is clicked', async () => {
    const onExportCsv = vi.fn();
    render(
      testWrapper({ ...defaultProps, itemCount: 1, isLoading: false, onExportCsv: onExportCsv })
    );
    await userEvent.click(screen.getByTestId('btn-export-csv'));
    expect(onExportCsv).toHaveBeenCalled();
  });
});
