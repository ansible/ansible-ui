/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { useProjectStatusColumn } from './useProjectStatusColumn';

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    useGetPageUrl:
      () =>
      (_routeId: string, opts?: { params?: Record<string, string | number | undefined> }) => {
        const id = opts?.params?.id;
        const jobType = opts?.params?.job_type;
        if (id !== undefined) return `/jobs/${jobType}/${id}/output`;
        return '/mock-url';
      },
  };
});

type ProjectItem = {
  type?: string;
  status?: string;
  summary_fields?: {
    last_job?: { id?: number };
    current_job?: { id?: number };
  };
};

function getColumn(options?: Parameters<typeof useProjectStatusColumn>[0]) {
  const { result } = renderHook(() => useProjectStatusColumn(options), {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
  });
  return result.current;
}

function renderCell(item: ProjectItem, options?: Parameters<typeof useProjectStatusColumn>[0]) {
  const col = getColumn(options);
  if (!col?.cell) throw new Error('Cell function not found');
  const cellContent = col.cell(item);
  return render(<MemoryRouter>{cellContent}</MemoryRouter>);
}

describe('useProjectStatusColumn — jobId guard', () => {
  it('current_job.id present → link uses that id', () => {
    renderCell({
      type: 'project',
      status: 'successful',
      summary_fields: {
        current_job: { id: 100 },
        last_job: { id: 200 },
      },
    });

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/jobs/project/100/output');
  });

  it('only last_job.id → uses last job id', () => {
    renderCell({
      type: 'project',
      status: 'successful',
      summary_fields: {
        current_job: {},
        last_job: { id: 200 },
      },
    });

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/jobs/project/200/output');
  });

  it('job objects without id → not a link', () => {
    renderCell({
      type: 'project',
      status: 'failed',
      summary_fields: {
        current_job: {},
        last_job: {},
      },
    });

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('neither job → unlinked status', () => {
    renderCell({
      type: 'project',
      status: 'never-updated',
      summary_fields: {},
    });

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Never updated')).toBeInTheDocument();
  });
});
