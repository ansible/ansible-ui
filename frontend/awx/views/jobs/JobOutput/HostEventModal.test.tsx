import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { JobEvent } from '../../../interfaces/JobEvent';
import { HostEventModal } from './HostEventModal';

function renderModal(props: { isOpen: boolean; hostEvent: JobEvent; onClose: () => void }) {
  return render(
    <MemoryRouter>
      <HostEventModal {...props} />
    </MemoryRouter>
  );
}

function makeHostEvent(overrides: Partial<JobEvent> = {}): JobEvent {
  return {
    id: 1,
    counter: 5,
    event: 'runner_on_ok',
    failed: false,
    changed: false,
    play: 'Play 1',
    task: 'Task 1',
    event_data: {
      host: 'host1.example.com',
      task_action: 'command',
      res: {
        stdout: 'hello world',
        stderr: '',
      },
    },
    summary_fields: { job: { id: 26 } },
    ...overrides,
  } as JobEvent;
}

describe('HostEventModal', () => {
  it('should render host details on the Details tab', () => {
    const hostEvent = makeHostEvent();
    renderModal({ isOpen: true, hostEvent, onClose: vi.fn() });

    expect(screen.getByText('host1.example.com')).toBeInTheDocument();
    expect(screen.getByText('Play 1')).toBeInTheDocument();
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('command')).toBeInTheDocument();
  });

  it('should hide empty detail fields via isEmpty', () => {
    const hostEvent = makeHostEvent({
      play: '',
      task: '',
      event_data: { host: '', task_action: '' },
    });
    renderModal({ isOpen: true, hostEvent, onClose: vi.fn() });

    expect(screen.queryByText('Play 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
  });

  it('should show status "OK" for runner_on_ok events', () => {
    const hostEvent = makeHostEvent({ event: 'runner_on_ok', failed: false, changed: false });
    renderModal({ isOpen: true, hostEvent, onClose: vi.fn() });

    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('should show status "Failed" when event has failed=true', () => {
    const hostEvent = makeHostEvent({ event: 'runner_on_failed', failed: true });
    renderModal({ isOpen: true, hostEvent, onClose: vi.fn() });

    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('should show status "Changed" when ok and changed are both true', () => {
    const hostEvent = makeHostEvent({ event: 'runner_on_ok', changed: true });
    renderModal({ isOpen: true, hostEvent, onClose: vi.fn() });

    expect(screen.getByText('Changed')).toBeInTheDocument();
  });

  it('should show status "Unreachable" for runner_on_unreachable', () => {
    const hostEvent = makeHostEvent({ event: 'runner_on_unreachable' });
    renderModal({ isOpen: true, hostEvent, onClose: vi.fn() });

    expect(screen.getByText('Unreachable')).toBeInTheDocument();
  });

  it('should show status "Skipped" for runner_on_skipped', () => {
    const hostEvent = makeHostEvent({ event: 'runner_on_skipped' });
    renderModal({ isOpen: true, hostEvent, onClose: vi.fn() });

    expect(screen.getByText('Skipped')).toBeInTheDocument();
  });

  it('should show Output tab when stdout has content', () => {
    const hostEvent = makeHostEvent();
    renderModal({ isOpen: true, hostEvent, onClose: vi.fn() });

    expect(screen.getByRole('tab', { name: /output/i })).toBeInTheDocument();
  });

  it('should not show Output tab when stdout is empty', () => {
    const hostEvent = makeHostEvent({
      event_data: { host: 'host1', task_action: 'command', res: { stdout: '' } },
    });
    renderModal({ isOpen: true, hostEvent, onClose: vi.fn() });

    expect(screen.queryByRole('tab', { name: /output/i })).not.toBeInTheDocument();
  });

  it('should show Standard Error tab when stderr has content', () => {
    const hostEvent = makeHostEvent({
      event_data: {
        host: 'host1',
        task_action: 'command',
        res: { stdout: 'out', stderr: 'error msg' },
      },
    });
    renderModal({ isOpen: true, hostEvent, onClose: vi.fn() });

    expect(screen.getByRole('tab', { name: /standard error/i })).toBeInTheDocument();
  });

  it('should not show Standard Error tab when stderr is empty', () => {
    const hostEvent = makeHostEvent();
    renderModal({ isOpen: true, hostEvent, onClose: vi.fn() });

    expect(screen.queryByRole('tab', { name: /standard error/i })).not.toBeInTheDocument();
  });

  it('should switch to Data tab and show JSON data', async () => {
    const user = userEvent.setup();
    const hostEvent = makeHostEvent();
    renderModal({ isOpen: true, hostEvent, onClose: vi.fn() });

    await user.click(screen.getByRole('tab', { name: /data/i }));

    const dataTab = screen.getByRole('tabpanel');
    expect(within(dataTab).queryByText(/no data available/i)).not.toBeInTheDocument();
  });

  it('should show empty state on Data tab when res is missing', async () => {
    const user = userEvent.setup();
    const hostEvent = makeHostEvent({ event_data: { host: 'host1' } });
    renderModal({ isOpen: true, hostEvent, onClose: vi.fn() });

    await user.click(screen.getByRole('tab', { name: /data/i }));

    expect(screen.getByText(/no data available/i)).toBeInTheDocument();
  });

  it('should call onClose when modal is closed', async () => {
    const onClose = vi.fn();
    renderModal({ isOpen: true, hostEvent: makeHostEvent(), onClose });

    const closeButton = screen.getByRole('button', { name: /close/i });
    const user = userEvent.setup();
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should handle debug task action stdout from result', () => {
    const hostEvent = makeHostEvent({
      event_data: {
        host: 'host1',
        task_action: 'debug',
        res: { result: { stdout: 'debug output' }, stdout: 'should not use this' },
      },
    });
    renderModal({ isOpen: true, hostEvent, onClose: vi.fn() });

    expect(screen.getByRole('tab', { name: /output/i })).toBeInTheDocument();
  });

  it('should handle yum task action with results array', () => {
    const hostEvent = makeHostEvent({
      event_data: {
        host: 'host1',
        task_action: 'yum',
        res: { results: ['Installed: pkg1', 'Installed: pkg2'], stdout: '' },
      },
    });
    renderModal({ isOpen: true, hostEvent, onClose: vi.fn() });

    expect(screen.getByRole('tab', { name: /output/i })).toBeInTheDocument();
  });

  it('should handle stdout as array', () => {
    const hostEvent = makeHostEvent({
      event_data: {
        host: 'host1',
        task_action: 'shell',
        res: { stdout: ['line1', 'line2'] },
      },
    });
    renderModal({ isOpen: true, hostEvent, onClose: vi.fn() });

    expect(screen.getByRole('tab', { name: /output/i })).toBeInTheDocument();
  });

  it('should handle res as string in processCodeEditorValue', async () => {
    const user = userEvent.setup();
    const hostEvent = makeHostEvent({
      event_data: {
        host: 'host1',
        task_action: 'raw',
        res: 'raw string output' as unknown as JobEvent['event_data'] extends { res: infer R }
          ? R
          : never,
      },
    });
    renderModal({ isOpen: true, hostEvent, onClose: vi.fn() });

    await user.click(screen.getByRole('tab', { name: /data/i }));

    const dataTab = screen.getByRole('tabpanel');
    expect(within(dataTab).queryByText(/no data available/i)).not.toBeInTheDocument();
  });

  it('should handle res as array in processCodeEditorValue', async () => {
    const user = userEvent.setup();
    const hostEvent = makeHostEvent({
      event_data: {
        host: 'host1',
        task_action: 'raw',
        res: ['item1', 'item2'] as unknown as JobEvent['event_data'] extends { res: infer R }
          ? R
          : never,
      },
    });
    renderModal({ isOpen: true, hostEvent, onClose: vi.fn() });

    await user.click(screen.getByRole('tab', { name: /data/i }));

    const dataTab = screen.getByRole('tabpanel');
    expect(within(dataTab).queryByText(/no data available/i)).not.toBeInTheDocument();
  });

  it('should show runner_on_async_ok as OK status', () => {
    const hostEvent = makeHostEvent({ event: 'runner_on_async_ok', failed: false, changed: false });
    renderModal({ isOpen: true, hostEvent, onClose: vi.fn() });

    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('should show runner_item_on_ok as OK status', () => {
    const hostEvent = makeHostEvent({
      event: 'runner_item_on_ok',
      failed: false,
      changed: false,
    });
    renderModal({ isOpen: true, hostEvent, onClose: vi.fn() });

    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    renderModal({ isOpen: false, hostEvent: makeHostEvent(), onClose: vi.fn() });

    expect(screen.queryByText('Host Details')).not.toBeInTheDocument();
  });
});
