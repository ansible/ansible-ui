import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { useDeprecationAffectedJobsColumns } from './useDeprecationAffectedJobsColumns';

interface AffectedJob {
  id: number;
  name: string;
  type: string;
  status: string;
  started: string;
  finished: string;
  occurrences: number;
  summary_fields: {
    job_template?: { name: string };
  };
}

const mockJob: AffectedJob = {
  id: 42,
  name: 'Deploy Application',
  type: 'job',
  status: 'successful',
  started: '2024-06-15T10:00:00Z',
  finished: '2024-06-15T10:05:00Z',
  occurrences: 3,
  summary_fields: { job_template: { name: 'Deploy App Template' } },
};

function TestHarness({ job }: { job: AffectedJob }) {
  const columns = useDeprecationAffectedJobsColumns();
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
            <td key={col.header}>{'cell' in col ? col.cell(job) : null}</td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

describe('useDeprecationAffectedJobsColumns', () => {
  it('should render all column headers', () => {
    render(
      <MemoryRouter>
        <TestHarness job={mockJob} />
      </MemoryRouter>
    );

    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Occurrences')).toBeInTheDocument();
    expect(screen.getByText('Started')).toBeInTheDocument();
    expect(screen.getByText('Finished')).toBeInTheDocument();
  });

  it('should render job ID', () => {
    render(
      <MemoryRouter>
        <TestHarness job={mockJob} />
      </MemoryRouter>
    );

    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should render job template name from summary_fields', () => {
    render(
      <MemoryRouter>
        <TestHarness job={mockJob} />
      </MemoryRouter>
    );

    expect(screen.getByText('Deploy App Template')).toBeInTheDocument();
  });

  it('should fall back to job name when job_template is not available', () => {
    const jobWithoutTemplate: AffectedJob = {
      ...mockJob,
      summary_fields: {},
    };

    render(
      <MemoryRouter>
        <TestHarness job={jobWithoutTemplate} />
      </MemoryRouter>
    );

    expect(screen.getByText('Deploy Application')).toBeInTheDocument();
  });

  it('should render occurrences count', () => {
    render(
      <MemoryRouter>
        <TestHarness job={mockJob} />
      </MemoryRouter>
    );

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should render status cell', () => {
    render(
      <MemoryRouter>
        <TestHarness job={mockJob} />
      </MemoryRouter>
    );

    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('should handle job with empty started/finished fields', () => {
    const jobNoTimes: AffectedJob = {
      ...mockJob,
      started: '',
      finished: '',
    };

    render(
      <MemoryRouter>
        <TestHarness job={jobNoTimes} />
      </MemoryRouter>
    );

    expect(screen.getByText('42')).toBeInTheDocument();
  });
});
