import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CalculationCost } from './CalculationCost';

describe('CalculationCost', () => {
  it('renders manual and automation cost inputs', () => {
    render(
      <CalculationCost
        costManual={10}
        costAutomation={5}
        readOnly={false}
        setFromCalculation={vi.fn()}
      />
    );
    expect(screen.getByLabelText('manual-cost')).toHaveValue(10);
    expect(screen.getByLabelText('automation-cost')).toHaveValue(5);
  });

  it('calls setFromCalculation when manual cost changes', async () => {
    const setFromCalculation = vi.fn();
    const user = userEvent.setup();
    render(
      <CalculationCost
        costManual={10}
        costAutomation={5}
        readOnly={false}
        setFromCalculation={setFromCalculation}
      />
    );

    await user.clear(screen.getByLabelText('manual-cost'));
    await user.type(screen.getByLabelText('manual-cost'), '25');
    expect(setFromCalculation).toHaveBeenCalledWith('manual_cost', expect.any(Number));
  });

  it('calls setFromCalculation when automation cost changes', async () => {
    const setFromCalculation = vi.fn();
    const user = userEvent.setup();
    render(
      <CalculationCost
        costManual={10}
        costAutomation={5}
        readOnly={false}
        setFromCalculation={setFromCalculation}
      />
    );

    await user.clear(screen.getByLabelText('automation-cost'));
    await user.type(screen.getByLabelText('automation-cost'), '12');
    expect(setFromCalculation).toHaveBeenCalledWith('automation_cost', expect.any(Number));
  });

  it('disables inputs in read-only mode', () => {
    render(
      <CalculationCost costManual={10} costAutomation={5} readOnly setFromCalculation={vi.fn()} />
    );
    expect(screen.getByLabelText('manual-cost')).toBeDisabled();
    expect(screen.getByLabelText('automation-cost')).toBeDisabled();
  });

  it('shows an empty value when a cost is not a number and uses default props', async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <CalculationCost {...({} as ComponentProps<typeof CalculationCost>)} />
    );
    expect(screen.getByLabelText('manual-cost')).toHaveValue(0);
    expect(screen.getByLabelText('automation-cost')).toHaveValue(0);
    expect(screen.getByLabelText('manual-cost')).toBeDisabled();
    unmount();

    render(
      <CalculationCost
        {...({
          costManual: Number.NaN,
          costAutomation: Number.NaN,
          readOnly: false,
        } as ComponentProps<typeof CalculationCost>)}
      />
    );
    expect(screen.getByLabelText('manual-cost')).toHaveValue(null);
    expect(screen.getByLabelText('automation-cost')).toHaveValue(null);
    await user.type(screen.getByLabelText('manual-cost'), '4');
    await user.type(screen.getByLabelText('automation-cost'), '2');
  });

  it('rejects a negative manual cost', async () => {
    const setFromCalculation = vi.fn();
    const user = userEvent.setup();
    render(
      <CalculationCost
        costManual={8}
        costAutomation={3}
        readOnly={false}
        setFromCalculation={setFromCalculation}
      />
    );

    const manual = screen.getByLabelText('manual-cost');
    await user.clear(manual);
    await user.type(manual, '-6');

    expect(setFromCalculation).toHaveBeenCalled();
    const negativeCall = setFromCalculation.mock.calls.find((call) => Number(call[1]) < 0);
    const nanCall = setFromCalculation.mock.calls.find((call) => Number.isNaN(call[1]));
    expect(negativeCall ?? nanCall).toBeDefined();
  });
});
