/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AwxActiveUserContext } from '../../common/useAwxActiveUser';
import { Reports } from './Reports';

vi.mock('../../common/useAwxConfig', () => ({
  useAwxConfig: () => ({}),
}));

vi.mock('@ansible/common-ui/utils/useGetDocsUrl', () => ({
  useGetDocsUrl: () => 'https://docs.example.com',
}));

vi.mock('swr', () => ({
  default: vi.fn(() => ({
    data: {
      report: {
        name: 'Automation Calculator',
        description: 'ROI report',
        layoutProps: { schema: [], tags: ['operations'] },
      },
    },
    error: undefined,
  })),
}));

vi.mock('./AutomationCalculator', () => ({
  AutomationCalculator: () => <div data-testid="automation-calculator" />,
}));

function renderReports(activeAwxUser: Record<string, boolean>) {
  return render(
    <AwxActiveUserContext.Provider value={{ activeAwxUser: activeAwxUser as never }}>
      <Reports />
    </AwxActiveUserContext.Provider>
  );
}

describe('Reports', () => {
  it('renders calculator for superusers when data is available', () => {
    renderReports({ is_superuser: true });
    expect(screen.getByText('Automation Calculator')).toBeInTheDocument();
    expect(screen.getByTestId('automation-calculator')).toBeInTheDocument();
  });

  it('shows analytics error state for non-superusers', () => {
    renderReports({ is_superuser: false, is_system_auditor: false });
    expect(
      screen.getByText(/Automation Analytics is currently not enabled to send data/i)
    ).toBeInTheDocument();
    expect(screen.queryByTestId('automation-calculator')).not.toBeInTheDocument();
  });
});
