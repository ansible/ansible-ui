/* eslint-disable i18next/no-literal-string */
import { ITableColumn } from '@ansible/ansible-ui-framework';
import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { EdaRuleAuditEvent } from '../../interfaces/EdaRuleAuditEvent';

function columnCell<T extends object>(column: ITableColumn<T>, item: T) {
  if (!('cell' in column)) {
    throw new Error(`Column "${column.header}" has no cell renderer`);
  }
  return column.cell(item);
}

const showEventPayload = vi.fn();
vi.mock('../EventPayloadDialog', () => ({
  useEventPayloadDialog: () => showEventPayload,
}));

import { useRuleAuditEventsColumns } from './useRuleAuditEventsColumns';

describe('useRuleAuditEventsColumns', () => {
  it('should return name, source type, and timestamp columns', () => {
    const { result } = renderHook(() => useRuleAuditEventsColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });
    expect(result.current.map((column) => column.header)).toEqual([
      'Name',
      'Source type',
      'Timestamp',
    ]);
  });

  it('should open the payload dialog when the event name is clicked', async () => {
    const user = userEvent.setup();
    const { result } = renderHook(() => useRuleAuditEventsColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });
    const event = {
      source_name: 'range',
      source_type: 'ansible.eda.range',
      received_at: '2024-01-01T00:00:00Z',
    } as EdaRuleAuditEvent;

    render(
      <MemoryRouter>
        {columnCell(result.current[0], event)}
        {columnCell(result.current[1], event)}
        {columnCell(result.current[2], event)}
      </MemoryRouter>
    );

    expect(screen.getByText('range')).toBeInTheDocument();
    expect(screen.getByText('ansible.eda.range')).toBeInTheDocument();
    await user.click(screen.getByText('range'));
    expect(showEventPayload).toHaveBeenCalledWith({ event });
  });

  it('should render an empty timestamp when received_at is missing', () => {
    const { result } = renderHook(() => useRuleAuditEventsColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });
    const event = { source_name: 'range', source_type: 'ansible.eda.range' } as EdaRuleAuditEvent;

    render(<MemoryRouter>{columnCell(result.current[2], event)}</MemoryRouter>);
    expect(screen.queryByText('Invalid Date')).not.toBeInTheDocument();
  });
});
