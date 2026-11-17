import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TableExpandedRow } from './MostUsedModules';

vi.mock('../components/Chart/Breakdown', () => ({
  Breakdown: () => <div data-testid="breakdown" />,
}));

type ExpandedRowProps = {
  item: {
    host_task_count: number;
    host_task_ok_count: number;
    host_task_failed_count: number;
    host_task_changed_count: number;
    host_task_skipped_count: number;
    host_task_unreachable_count: number;
  };
};

const renderExpandedRow = TableExpandedRow as unknown as (props: ExpandedRowProps) => ReactElement;

describe('TableExpandedRow', () => {
  it('renders task breakdown for a module row', () => {
    render(
      <table>
        <thead>
          <tr>
            <th scope="col">Module tasks</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              {renderExpandedRow({
                item: {
                  host_task_count: 10,
                  host_task_ok_count: 6,
                  host_task_failed_count: 2,
                  host_task_changed_count: 1,
                  host_task_skipped_count: 1,
                  host_task_unreachable_count: 0,
                },
              })}
            </td>
          </tr>
        </tbody>
      </table>
    );
    expect(screen.getByText(/All Task status/i)).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByTestId('breakdown')).toBeInTheDocument();
  });

  it('renders zero counts when all task counters are zero', () => {
    render(
      <table>
        <tbody>
          <tr>
            <td>
              {renderExpandedRow({
                item: {
                  host_task_count: 0,
                  host_task_ok_count: 0,
                  host_task_failed_count: 0,
                  host_task_changed_count: 0,
                  host_task_skipped_count: 0,
                  host_task_unreachable_count: 0,
                },
              })}
            </td>
          </tr>
        </tbody>
      </table>
    );
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByTestId('breakdown')).toBeInTheDocument();
  });
});
