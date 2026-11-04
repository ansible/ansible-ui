/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('disables inputs in read-only mode', () => {
    render(
      <CalculationCost costManual={10} costAutomation={5} readOnly setFromCalculation={vi.fn()} />
    );
    expect(screen.getByLabelText('manual-cost')).toBeDisabled();
    expect(screen.getByLabelText('automation-cost')).toBeDisabled();
  });
});
