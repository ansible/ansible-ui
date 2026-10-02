import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { useDeprecationDashboardColumns, DeprecationRow } from './useDeprecationDashboardColumns';

vi.mock('@patternfly/react-component-groups', () => ({
  Severity: ({ label }: { label: string }) => <span data-testid="severity-label">{label}</span>,
  SeverityType: {
    critical: 'critical',
    important: 'important',
    moderate: 'moderate',
    minor: 'minor',
  },
}));

const mockRow: DeprecationRow = {
  type: 'with_items on module',
  description: 'Using with_items on package modules (yum, dnf, apt)',
  count: 42,
  severity: 'warm',
  jobIds: [1, 2, 3],
  jobOccurrences: { 1: 10, 2: 20, 3: 12 },
  organizations: ['Engineering', 'Operations'],
  jobTemplates: ['Deploy App', 'Run Tests'],
  severityRank: 1,
};

function TestHarness({ row }: { row: DeprecationRow }) {
  const columns = useDeprecationDashboardColumns();
  return (
    <table>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.header}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {columns.map((col) => (
            <td key={col.header}>{'cell' in col ? col.cell(row) : null}</td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

describe('useDeprecationDashboardColumns', () => {
  it('should render pattern column with type and description', () => {
    render(
      <MemoryRouter>
        <TestHarness row={mockRow} />
      </MemoryRouter>
    );

    expect(screen.getByText('with_items on module')).toBeInTheDocument();
    expect(
      screen.getByText('Using with_items on package modules (yum, dnf, apt)')
    ).toBeInTheDocument();
  });

  it('should render total occurrences column', () => {
    render(
      <MemoryRouter>
        <TestHarness row={mockRow} />
      </MemoryRouter>
    );

    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should render severity column', () => {
    render(
      <MemoryRouter>
        <TestHarness row={mockRow} />
      </MemoryRouter>
    );

    expect(screen.getByText('Important')).toBeInTheDocument();
  });

  it('should render correct headers', () => {
    render(
      <MemoryRouter>
        <TestHarness row={mockRow} />
      </MemoryRouter>
    );

    expect(screen.getByText('Pattern')).toBeInTheDocument();
    expect(screen.getByText('Total occurrences')).toBeInTheDocument();
    expect(screen.getByText('Severity')).toBeInTheDocument();
  });

  it('should render critical severity for hot', () => {
    const hotRow: DeprecationRow = { ...mockRow, severity: 'hot', severityRank: 0 };
    render(
      <MemoryRouter>
        <TestHarness row={hotRow} />
      </MemoryRouter>
    );

    expect(screen.getByText('Critical')).toBeInTheDocument();
  });

  it('should render moderate severity', () => {
    const moderateRow: DeprecationRow = { ...mockRow, severity: 'moderate', severityRank: 2 };
    render(
      <MemoryRouter>
        <TestHarness row={moderateRow} />
      </MemoryRouter>
    );

    expect(screen.getByText('Moderate')).toBeInTheDocument();
  });

  it('should render minor severity for cool', () => {
    const coolRow: DeprecationRow = { ...mockRow, severity: 'cool', severityRank: 3 };
    render(
      <MemoryRouter>
        <TestHarness row={coolRow} />
      </MemoryRouter>
    );

    expect(screen.getByText('Minor')).toBeInTheDocument();
  });
});
