import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SeverityLabel } from './DeprecationSeverityLabel';
import type { DeprecationSeverity } from './DeprecationSeverityLabel';

vi.mock('@patternfly/react-component-groups', () => ({
  Severity: ({ label }: { severity: string; label: string }) => (
    <span data-testid="severity-label">{label}</span>
  ),
  SeverityType: {
    critical: 'critical',
    important: 'important',
    moderate: 'moderate',
    minor: 'minor',
  },
}));

describe('SeverityLabel', () => {
  it('should render Critical label for hot severity', () => {
    render(<SeverityLabel severity="hot" />);
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });

  it('should render Important label for warm severity', () => {
    render(<SeverityLabel severity="warm" />);
    expect(screen.getByText('Important')).toBeInTheDocument();
  });

  it('should render Moderate label for moderate severity', () => {
    render(<SeverityLabel severity="moderate" />);
    expect(screen.getByText('Moderate')).toBeInTheDocument();
  });

  it('should render Minor label for cool severity', () => {
    render(<SeverityLabel severity="cool" />);
    expect(screen.getByText('Minor')).toBeInTheDocument();
  });

  it('should render all severity variants without errors', () => {
    const severities: DeprecationSeverity[] = ['hot', 'warm', 'moderate', 'cool'];
    for (const severity of severities) {
      const { unmount } = render(<SeverityLabel severity={severity} />);
      expect(screen.getByTestId('severity-label')).toBeInTheDocument();
      unmount();
    }
  });
});
