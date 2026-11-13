import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { JobEvent } from '../../../interfaces/JobEvent';
import { IJobOutputRow, JobOutputRow, jobEventToRows, tracebackToRows } from './JobOutputRow';

vi.mock('@ansible/ansible-ui-framework/hooks/useResizeObserver', () => ({
  useResizeObserver: vi.fn(),
}));

const baseRow: IJobOutputRow = {
  counter: 1,
  uuid: 'event-uuid',
  playUuid: 'play-uuid',
  taskUuid: 'task-uuid',
  line: 10,
  stdout: 'TASK [ping] ***************',
  eventLine: 0,
  canCollapse: false,
  isHeaderLine: false,
};

describe('jobEventToRows', () => {
  it('should return an empty list when stdout or counter is missing', () => {
    const event = {
      counter: 0,
      stdout: 'output',
      uuid: '1',
      event_data: { play_uuid: '', task_uuid: '' },
    } as unknown as JobEvent;
    expect(jobEventToRows(event)).toEqual([]);

    const noStdout = {
      counter: 1,
      stdout: '',
      uuid: '1',
      event_data: { play_uuid: '', task_uuid: '' },
    } as unknown as JobEvent;
    expect(jobEventToRows(noStdout)).toEqual([]);
  });

  it('should map stdout lines and mark collapsible header rows', () => {
    const event = {
      counter: 3,
      uuid: 'uuid-1',
      parent_uuid: 'parent-uuid',
      stdout: 'PLAY [Demo] ********\r\n',
      start_line: 1,
      event: 'playbook_on_play_start',
      event_data: { play_uuid: 'play-a', task_uuid: '' },
      created: '2024-01-01T10:00:00Z',
    } as unknown as JobEvent;

    const rows = jobEventToRows(event);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      line: 1,
      stdout: 'PLAY [Demo] ********',
      canCollapse: true,
      isHeaderLine: true,
    });
    expect(rows[1].canCollapse).toBe(false);
  });
});

describe('tracebackToRows', () => {
  it('should split traceback output into rows without line numbers', () => {
    const rows = tracebackToRows('Traceback\nError line');
    expect(rows).toHaveLength(2);
    expect(rows[0].stdout).toBe('Traceback');
    expect(rows[0].line).toBeUndefined();
  });
});

describe('JobOutputRow', () => {
  it('should render stdout text and line number', () => {
    render(
      <JobOutputRow
        index={0}
        row={baseRow}
        collapsed={{}}
        setCollapsed={vi.fn()}
        setHeight={vi.fn()}
        onClick={vi.fn()}
      />
    );

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('TASK [ping] ***************')).toBeInTheDocument();
  });

  it('should toggle collapsed state when expand button is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    const setCollapsed = vi.fn();
    const collapsibleRow: IJobOutputRow = {
      ...baseRow,
      canCollapse: true,
      isHeaderLine: true,
      created: '2024-05-01T12:00:00Z',
    };

    const { container } = render(
      <JobOutputRow
        index={0}
        row={collapsibleRow}
        collapsed={{ 'event-uuid': true }}
        setCollapsed={setCollapsed}
        setHeight={vi.fn()}
        canCollapseEvents
        onClick={vi.fn()}
      />
    );

    const expandButton = container.querySelector('.output-grid-row button');
    expect(expandButton).not.toBeNull();
    await user.click(expandButton as HTMLButtonElement);
    expect(setCollapsed).toHaveBeenCalledWith('event-uuid', 1, false);
  });
});
