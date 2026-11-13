/* eslint-disable i18next/no-literal-string */
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useContext } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  PageAlertToasterProvider,
  PageAlertToasterContext,
  errorToAlertProps,
  usePageAlertToaster,
} from './PageAlertToaster';

function TestConsumer(props: { onClearAll?: () => void } = {}) {
  const toaster = useContext(PageAlertToasterContext);
  const alert = { title: 'Test Alert', variant: 'success' as const };
  return (
    <div>
      <button type="button" onClick={() => toaster.addAlert(alert)}>
        Add
      </button>
      <button
        type="button"
        onClick={() =>
          toaster.addAlert({ title: 'Danger Alert', variant: 'danger', timeout: 7000 })
        }
      >
        Add Danger
      </button>
      <button
        type="button"
        onClick={() => toaster.addAlert({ title: 'Fresh Alert', variant: 'success' })}
      >
        Add Fresh
      </button>
      <button
        type="button"
        onClick={() => toaster.addAlert({ title: 'Timed Alert', variant: 'info' })}
      >
        Add Timed Fresh
      </button>
      <button type="button" onClick={() => toaster.replaceAlert(alert, { title: 'Replaced' })}>
        Replace
      </button>
      <button
        type="button"
        onClick={() =>
          toaster.replaceAlert(
            { title: 'Timed Alert', variant: 'info', timeout: 5000 },
            { title: 'Timed Replaced', variant: 'warning' }
          )
        }
      >
        Replace Timed
      </button>
      <button
        type="button"
        onClick={() => toaster.addAlert({ title: 'Timed Alert', variant: 'info', timeout: 5000 })}
      >
        Add Timed For Replace
      </button>
      <button
        type="button"
        onClick={() => toaster.removeAlert({ title: 'Timed Alert', variant: 'info' })}
      >
        Remove Timed Fresh
      </button>
      <button
        type="button"
        onClick={() => toaster.removeAlert({ title: 'Missing Alert', variant: 'info' })}
      >
        Remove Missing
      </button>
      <button
        type="button"
        onClick={() => toaster.addAlert({ title: 'Timed Alert', variant: 'info', timeout: 1000 })}
      >
        Add Timed
      </button>
      <button
        type="button"
        onClick={() => {
          toaster.removeAlerts();
          props.onClearAll?.();
        }}
      >
        Clear All
      </button>
      <button type="button" onClick={() => toaster.removeAlerts((a) => a.variant === 'danger')}>
        Keep Danger
      </button>
    </div>
  );
}

function DefaultContextConsumer() {
  const toaster = usePageAlertToaster();
  return (
    <button
      type="button"
      onClick={() => {
        toaster.addAlert({ title: 'Default context' });
        toaster.removeAlert({ title: 'Default context' });
        toaster.replaceAlert({ title: 'Old' }, { title: 'New' });
        toaster.removeAlerts();
      }}
    >
      Invoke no-op defaults
    </button>
  );
}

describe('PageAlertToaster', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('errorToAlertProps', () => {
    it('should convert Error instance to alert props', () => {
      const result = errorToAlertProps(new Error('Something failed'));
      expect(result).toEqual({
        title: 'Something failed',
        variant: 'danger',
        timeout: 2000,
      });
    });

    it('should handle non-Error values', () => {
      const result = errorToAlertProps('string error');
      expect(result).toEqual({
        title: 'Unknown',
        variant: 'danger',
        timeout: 2000,
      });
    });

    it('should handle null/undefined', () => {
      const result = errorToAlertProps(null);
      expect(result.variant).toBe('danger');
    });
  });

  describe('PageAlertToasterProvider', () => {
    it('should expose no-op toaster methods outside the provider', async () => {
      const user = userEvent.setup();
      render(<DefaultContextConsumer />);

      await user.click(screen.getByRole('button', { name: 'Invoke no-op defaults' }));

      expect(screen.getByRole('button', { name: 'Invoke no-op defaults' })).toBeInTheDocument();
    });

    it('should render children', () => {
      render(
        <PageAlertToasterProvider>
          <div>Child Content</div>
        </PageAlertToasterProvider>
      );
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });

    it('should add an alert', async () => {
      const user = userEvent.setup();
      render(
        <PageAlertToasterProvider>
          <TestConsumer />
        </PageAlertToasterProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Add' }));
      expect(screen.getByText('Test Alert')).toBeInTheDocument();
    });

    it('should remove timed alerts after their timeout', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const user = userEvent.setup();
      render(
        <PageAlertToasterProvider>
          <TestConsumer />
        </PageAlertToasterProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Add Timed' }));
      expect(screen.getByText('Timed Alert')).toBeInTheDocument();

      await act(() => {
        vi.advanceTimersByTime(1000);
        return Promise.resolve();
      });
      expect(screen.queryByText('Timed Alert')).not.toBeInTheDocument();
    });

    it('should replace timed alerts when replaceAlert uses the original timed props', async () => {
      const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
      const user = userEvent.setup();
      render(
        <PageAlertToasterProvider>
          <TestConsumer />
        </PageAlertToasterProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Add Timed For Replace' }));
      const timeoutIndex = setTimeoutSpy.mock.calls.findIndex(([, delay]) => delay === 5000);
      const alertTimeoutId = setTimeoutSpy.mock.results[timeoutIndex]?.value as
        | ReturnType<typeof setTimeout>
        | undefined;
      await user.click(screen.getByRole('button', { name: 'Replace Timed' }));

      expect(screen.getByText('Timed Replaced')).toBeInTheDocument();
      expect(screen.queryByText('Timed Alert')).not.toBeInTheDocument();
      expect(alertTimeoutId).toBeDefined();
      expect(clearTimeoutSpy).toHaveBeenCalledWith(alertTimeoutId);
    });

    it('should clear a timer when an equivalent alert is added without a timeout', async () => {
      const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
      const user = userEvent.setup();
      render(
        <PageAlertToasterProvider>
          <TestConsumer />
        </PageAlertToasterProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Add Timed For Replace' }));
      const timeoutIndex = setTimeoutSpy.mock.calls.findIndex(([, delay]) => delay === 5000);
      const alertTimeoutId = setTimeoutSpy.mock.results[timeoutIndex]?.value as
        | ReturnType<typeof setTimeout>
        | undefined;
      await user.click(screen.getByRole('button', { name: 'Add Timed Fresh' }));

      expect(alertTimeoutId).toBeDefined();
      expect(clearTimeoutSpy).toHaveBeenCalledWith(alertTimeoutId);
      expect(screen.getByText('Timed Alert')).toBeInTheDocument();
    });

    it('should remove a timed alert when removeAlert receives fresh props', async () => {
      const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
      const user = userEvent.setup();
      render(
        <PageAlertToasterProvider>
          <TestConsumer />
        </PageAlertToasterProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Add Timed For Replace' }));
      const timeoutIndex = setTimeoutSpy.mock.calls.findIndex(([, delay]) => delay === 5000);
      const alertTimeoutId = setTimeoutSpy.mock.results[timeoutIndex]?.value as
        | ReturnType<typeof setTimeout>
        | undefined;

      await user.click(screen.getByRole('button', { name: 'Remove Timed Fresh' }));

      expect(screen.queryByText('Timed Alert')).not.toBeInTheDocument();
      expect(alertTimeoutId).toBeDefined();
      expect(clearTimeoutSpy).toHaveBeenCalledWith(alertTimeoutId);
    });

    it('should keep a timed alert when removeAlert does not match it', async () => {
      const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
      const user = userEvent.setup();
      render(
        <PageAlertToasterProvider>
          <TestConsumer />
        </PageAlertToasterProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Add Timed For Replace' }));
      const timeoutIndex = setTimeoutSpy.mock.calls.findIndex(([, delay]) => delay === 5000);
      const alertTimeoutId = setTimeoutSpy.mock.results[timeoutIndex]?.value as
        | ReturnType<typeof setTimeout>
        | undefined;
      await user.click(screen.getByRole('button', { name: 'Remove Missing' }));

      expect(alertTimeoutId).toBeDefined();
      expect(clearTimeoutSpy).not.toHaveBeenCalledWith(alertTimeoutId);
      expect(screen.getByText('Timed Alert')).toBeInTheDocument();
    });

    it('should clear auto-dismiss timers when alerts are dismissed early', async () => {
      const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
      const user = userEvent.setup();
      const alertTimeoutId: { current: ReturnType<typeof setTimeout> | undefined } = {
        current: undefined,
      };
      let clearCallsAtClear = 0;
      let timerWasClearedBeforeStateUpdate = false;
      render(
        <PageAlertToasterProvider>
          <TestConsumer
            onClearAll={() => {
              clearCallsAtClear = clearTimeoutSpy.mock.calls.length;
              timerWasClearedBeforeStateUpdate = clearTimeoutSpy.mock.calls.some(
                ([timeoutId]) => timeoutId === alertTimeoutId.current
              );
            }}
          />
        </PageAlertToasterProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Add Timed For Replace' }));
      const timeoutIndex = setTimeoutSpy.mock.calls.findIndex(([, delay]) => delay === 5000);
      alertTimeoutId.current = setTimeoutSpy.mock.results[timeoutIndex]?.value as
        | ReturnType<typeof setTimeout>
        | undefined;
      expect(alertTimeoutId.current).toBeDefined();
      await user.click(screen.getByRole('button', { name: 'Clear All' }));

      expect(timerWasClearedBeforeStateUpdate).toBe(true);
      expect(clearCallsAtClear).toBeGreaterThan(0);
      expect(clearTimeoutSpy).toHaveBeenCalledWith(alertTimeoutId.current);
      expect(clearTimeoutSpy).toHaveBeenCalledWith(alertTimeoutId.current);
      expect(screen.queryByText('Timed Alert')).not.toBeInTheDocument();
    });

    it('should clear only timers for alerts removed by a filter', async () => {
      const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
      const user = userEvent.setup();
      render(
        <PageAlertToasterProvider>
          <TestConsumer />
        </PageAlertToasterProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Add Timed For Replace' }));
      await user.click(screen.getByRole('button', { name: 'Add' }));
      await user.click(screen.getByRole('button', { name: 'Add Danger' }));
      const infoTimeoutIndex = setTimeoutSpy.mock.calls.findIndex(([, delay]) => delay === 5000);
      const dangerTimeoutIndex = setTimeoutSpy.mock.calls.findIndex(([, delay]) => delay === 7000);
      const infoTimeoutId = setTimeoutSpy.mock.results[infoTimeoutIndex]?.value as
        | ReturnType<typeof setTimeout>
        | undefined;
      const dangerTimeoutId = setTimeoutSpy.mock.results[dangerTimeoutIndex]?.value as
        | ReturnType<typeof setTimeout>
        | undefined;
      await user.click(screen.getByRole('button', { name: 'Keep Danger' }));

      expect(infoTimeoutId).toBeDefined();
      expect(dangerTimeoutId).toBeDefined();
      expect(clearTimeoutSpy).toHaveBeenCalledWith(infoTimeoutId);
      expect(clearTimeoutSpy).not.toHaveBeenCalledWith(dangerTimeoutId);
      expect(screen.getByText('Danger Alert')).toBeInTheDocument();
      expect(screen.queryByText('Test Alert')).not.toBeInTheDocument();
      expect(screen.queryByText('Timed Alert')).not.toBeInTheDocument();
    });

    it('should clear auto-dismiss timers when the provider unmounts', async () => {
      const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
      const user = userEvent.setup();
      const { unmount } = render(
        <PageAlertToasterProvider>
          <TestConsumer />
        </PageAlertToasterProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Add Timed For Replace' }));
      const timeoutIndex = setTimeoutSpy.mock.calls.findIndex(([, delay]) => delay === 5000);
      const alertTimeoutId = setTimeoutSpy.mock.results[timeoutIndex]?.value as
        | ReturnType<typeof setTimeout>
        | undefined;
      expect(alertTimeoutId).toBeDefined();

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalledWith(alertTimeoutId);
    });

    it('should replace an alert when the same alert is added again', async () => {
      const user = userEvent.setup();
      render(
        <PageAlertToasterProvider>
          <TestConsumer />
        </PageAlertToasterProvider>
      );

      const addButton = screen.getByRole('button', { name: 'Add' });
      await user.click(addButton);
      await user.click(addButton);

      expect(screen.getAllByText('Test Alert')).toHaveLength(1);
    });

    it('should replace an alert when equivalent fresh props are added again', async () => {
      const user = userEvent.setup();
      render(
        <PageAlertToasterProvider>
          <TestConsumer />
        </PageAlertToasterProvider>
      );

      const addButton = screen.getByRole('button', { name: 'Add Fresh' });
      await user.click(addButton);
      await user.click(addButton);

      expect(screen.getAllByText('Fresh Alert')).toHaveLength(1);
    });

    it('should leave alerts unchanged when replaceAlert cannot find the old alert', async () => {
      const user = userEvent.setup();
      render(
        <PageAlertToasterProvider>
          <TestConsumer />
        </PageAlertToasterProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Replace' }));

      expect(screen.queryByText('Replaced')).not.toBeInTheDocument();
    });

    it('should replace an existing alert through replaceAlert', async () => {
      const user = userEvent.setup();
      render(
        <PageAlertToasterProvider>
          <TestConsumer />
        </PageAlertToasterProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Add' }));
      await user.click(screen.getByRole('button', { name: 'Replace' }));

      expect(screen.getByText('Replaced')).toBeInTheDocument();
      expect(screen.queryByText('Test Alert')).not.toBeInTheDocument();
    });

    it('should remove all alerts', async () => {
      const user = userEvent.setup();
      render(
        <PageAlertToasterProvider>
          <TestConsumer />
        </PageAlertToasterProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Add' }));
      expect(screen.getByText('Test Alert')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Clear All' }));
      expect(screen.queryByText('Test Alert')).not.toBeInTheDocument();
    });

    it('should render alert close buttons', async () => {
      const user = userEvent.setup();
      render(
        <PageAlertToasterProvider>
          <TestConsumer />
        </PageAlertToasterProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Add' }));
      expect(screen.getByText('Test Alert')).toBeInTheDocument();

      const closeButtons = screen.getAllByRole('button', { name: /close/i });
      expect(closeButtons.length).toBeGreaterThan(0);
    });
  });
});
