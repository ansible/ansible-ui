import { render, screen } from '@testing-library/react';
import { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { AwxActiveUserContext } from '../../common/useAwxActiveUser';
import { AnalyticsErrorState } from './ErrorStates';

function renderWithUser(ui: ReactElement, activeAwxUser: Record<string, boolean>) {
  return render(
    <AwxActiveUserContext.Provider value={{ activeAwxUser: activeAwxUser as never }}>
      {ui}
    </AwxActiveUserContext.Provider>
  );
}

describe('AnalyticsErrorState', () => {
  it('shows configured error copy for superusers', () => {
    renderWithUser(<AnalyticsErrorState error="missing-url" />, {
      is_superuser: true,
      is_system_auditor: false,
    });
    expect(screen.getByText(/Missing URL for Automation Analytics/i)).toBeInTheDocument();
  });

  it('shows disabled state for non-admin users', () => {
    renderWithUser(<AnalyticsErrorState error="missing-url" />, {
      is_superuser: false,
      is_system_auditor: false,
    });
    expect(
      screen.getByText(/Automation Analytics is currently not enabled to send data/i)
    ).toBeInTheDocument();
  });

  it('shows settings button for superuser disabled state', () => {
    renderWithUser(<AnalyticsErrorState />, { is_superuser: true, is_system_auditor: false });
    expect(screen.getByRole('button', { name: /Go to settings/i })).toBeInTheDocument();
  });

  it('falls back to generic error state for unknown codes', () => {
    renderWithUser(<AnalyticsErrorState error="not-a-known-code" />, {
      is_superuser: true,
      is_system_auditor: false,
    });
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
  });
});
