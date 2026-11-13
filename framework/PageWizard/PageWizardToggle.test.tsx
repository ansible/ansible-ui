import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PageWizardContext } from './PageWizardProvider';
import { PageWizardToggle } from './PageWizardToggle';

describe('PageWizardToggle', () => {
  it('shows the active step and toggles expansion', async () => {
    const user = userEvent.setup();
    const setToggleExpanded = vi.fn();
    render(
      <PageWizardContext.Provider
        value={
          { activeStep: { label: 'Details' }, isToggleExpanded: false, setToggleExpanded } as never
        }
      >
        <PageWizardToggle />
      </PageWizardContext.Provider>
    );

    expect(screen.getByText('Details')).toBeInTheDocument();
    await user.click(screen.getByTestId('wizard-toggle'));
    expect(setToggleExpanded).toHaveBeenCalled();
  });
});
