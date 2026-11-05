import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { AutomationFormula } from './AutomationFormula';

describe('AutomationFormula', () => {
  it('opens and closes the formula modal', async () => {
    const user = userEvent.setup();
    render(<AutomationFormula />);

    expect(screen.queryByTestId('automation_formula_modal')).not.toBeInTheDocument();
    await user.click(screen.getByTestId('automation_formula_button'));
    expect(screen.getByTestId('automation_formula_modal')).toBeInTheDocument();
    await user.click(screen.getByTestId('automation_formula_cancel_button'));
    expect(screen.queryByTestId('automation_formula_modal')).not.toBeInTheDocument();
  });
});
