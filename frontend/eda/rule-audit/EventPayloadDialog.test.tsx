import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PageDialogProvider } from '@ansible/ansible-ui-framework/PageDialogs/PageDialog';
import { EdaRuleAuditEvent } from '../interfaces/EdaRuleAuditEvent';
import { EventPayloadDialog, useEventPayloadDialog } from './EventPayloadDialog';

vi.mock('@patternfly/react-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@patternfly/react-core')>();
  return {
    ...actual,
    Modal: ({
      children,
      title,
      'aria-label': ariaLabel,
    }: {
      children: React.ReactNode;
      title?: string;
      'aria-label'?: string;
    }) => (
      <div data-testid="modal" aria-label={ariaLabel}>
        {title ? <h1>{title}</h1> : null}
        {children}
      </div>
    ),
  };
});

const event = {
  source_name: 'range',
  source_type: 'ansible.eda.range',
  received_at: '2024-01-01T00:00:00Z',
  payload: '{"i": 1}',
} as EdaRuleAuditEvent;

describe('EventPayloadDialog', () => {
  it('should render event details and payload', () => {
    render(
      <PageDialogProvider>
        <EventPayloadDialog event={event} />
      </PageDialogProvider>
    );

    expect(screen.getByText('Event details')).toBeInTheDocument();
    expect(screen.getByText('range')).toBeInTheDocument();
    expect(screen.getByText('ansible.eda.range')).toBeInTheDocument();
    expect(screen.getByText('Event log')).toBeInTheDocument();
  });

  it('should omit the payload editor when payload is missing', () => {
    render(
      <PageDialogProvider>
        <EventPayloadDialog event={{ source_name: 'range' } as EdaRuleAuditEvent} />
      </PageDialogProvider>
    );

    expect(screen.getByText('range')).toBeInTheDocument();
    expect(screen.queryByText('Event log')).not.toBeInTheDocument();
  });

  it('should close the dialog when Close is clicked', async () => {
    const user = userEvent.setup();
    const { result } = renderHook(() => useEventPayloadDialog(), {
      wrapper: ({ children }) => <PageDialogProvider>{children}</PageDialogProvider>,
    });

    act(() => {
      result.current({ event });
    });
    expect(await screen.findByText('Event details')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(screen.queryByText('Event details')).not.toBeInTheDocument();
    });
  });
});
