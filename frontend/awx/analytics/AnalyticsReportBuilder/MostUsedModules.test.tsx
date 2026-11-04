/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TableExpandedRow } from './MostUsedModules';

vi.mock('../components/Chart/Breakdown', () => ({
  Breakdown: () => <div data-testid="breakdown" />,
}));

describe('TableExpandedRow', () => {
  it('renders task breakdown for a module row', () => {
    render(
      <table>
        <tbody>
          <tr>
            <td>
              <TableExpandedRow
                item={{
                  host_task_count: 10,
                  host_task_ok_count: 6,
                  host_task_failed_count: 2,
                  host_task_changed_count: 1,
                  host_task_skipped_count: 1,
                  host_task_unreachable_count: 0,
                }}
              />
            </td>
          </tr>
        </tbody>
      </table>
    );
    expect(screen.getByText(/All Task status/i)).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByTestId('breakdown')).toBeInTheDocument();
  });
});
