/* eslint-disable i18next/no-literal-string */
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useContext, useRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  PageAlertToasterProvider,
  PageAlertToasterContext,
  errorToAlertProps,
  usePageAlertToaster,
} from './PageAlertToaster';

function TestConsumer() {
  const toaster = useContext(PageAlertToasterContext);
  const sharedAlertRef = useRef({ title: 'Mutable Alert', variant: 'success' as const });
  return (
    <div>
      <button
        type="button"
        onClick={() => toaster.addAlert({ title: 'Test Alert', variant: 'success' })}
      >
        Add
      </button>
      <button
        type="button"
        onClick={() => toaster.addAlert({ title: 'Timed Alert', variant: 'info', timeout: 1000 })}
      >
        Add Timed
      </button>
      <button
        type="button"
        onClick={() => toaster.addAlert({ title: 'Danger Alert', variant: 'danger' })}
      >
        Add Danger
      </button>
      <button type="button" onClick={() => toaster.addAlert(sharedAlertRef.current)}>
        Add Shared Ref
      </button>
      <button
        type="button"
        onClick={() => {
          sharedAlertRef.current.title = 'Updated Mutable Alert';
          toaster.addAlert(sharedAlertRef.current);
        }}
      >
        Update Shared Ref
      </button>
      <button
        type="button"
        onClick={() =>
          toaster.addAlert({ title: 'Replace Me', variant: 'warning', id: 'rep-target' })
        }
      >
        Add Replace Target
      </button>
      <button
        type="button"
        onClick={() =>
          toaster.replaceAlert(
            { title: 'Replace Me', variant: 'warning', id: 'rep-target' },
            { title: 'Replaced', variant: 'success', id: 'rep-target' }
          )
        }
      >
        Replace
      </button>
      <button
        type="button"
        onClick={() => toaster.addAlert({ title: 'Gone', variant: 'info', id: 'old-rep' })}
      >
        Add Old For Replace Timeout
      </button>
      <button
        type="button"
        onClick={() =>
          toaster.replaceAlert(
            { title: 'Gone', variant: 'info', id: 'old-rep' },
            { title: 'With Timeout', variant: 'info', id: 'new-rep', timeout: 500 }
          )
        }
      >
        Replace With Timeout
      </button>
      <button type="button" onClick={() => toaster.removeAlerts()}>
        Clear All
      </button>
      <button type="button" onClick={() => toaster.removeAlerts((a) => a.variant !== 'danger')}>
        Keep Danger
      </button>
      <button
        type="button"
        onClick={() => {
          const alert = { title: 'Closable', variant: 'info' as const };
          toaster.addAlert(alert);
          toaster.removeAlert(alert);
        }}
      >
        Add And Remove By Ref
      </button>
      <button
        type="button"
        onClick={() =>
          toaster.replaceAlert(
            { title: 'Never Added', variant: 'warning' },
            { title: 'Should Not Appear', variant: 'info' }
          )
        }
      >
        Replace Missing
      </button>
    </div>
  );
}

function HookConsumer() {
  const toaster = usePageAlertToaster();
  return (
    <button type="button" onClick={() => toaster.addAlert({ title: 'From Hook', variant: 'info' })}>
      Add Via Hook
    </button>
  );
}

function DefaultContextConsumer() {
  const toaster = usePageAlertToaster();
  return (
    <button
      type="button"
      onClick={() => {
        toaster.addAlert({ title: 'noop' });
        toaster.removeAlert({ title: 'noop' });
        toaster.replaceAlert({ title: 'a' }, { title: 'b' });
        toaster.removeAlerts();
        toaster.removeAlerts(() => true);
      }}
    >
      Invoke Default Context
    </button>
  );
}

describe('PageAlertToaster', () => {
  afterEach(() => {
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

    it('should remove a timed alert after the timeout elapses', async () => {
      vi.useFakeTimers();
      render(
        <PageAlertToasterProvider>
          <TestConsumer />
        </PageAlertToasterProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: 'Add Timed' }));
      expect(screen.getByText('Timed Alert')).toBeInTheDocument();

      await act(async () => {
        await vi.runAllTimersAsync();
      });
      expect(screen.queryByText('Timed Alert')).not.toBeInTheDocument();
    });

    it('should update an alert in place when the same reference is added again', async () => {
      const user = userEvent.setup();
      render(
        <PageAlertToasterProvider>
          <TestConsumer />
        </PageAlertToasterProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Add Shared Ref' }));
      expect(screen.getByText('Mutable Alert')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Update Shared Ref' }));
      expect(screen.queryByText('Mutable Alert')).not.toBeInTheDocument();
      expect(screen.getByText('Updated Mutable Alert')).toBeInTheDocument();
      expect(screen.getAllByText('Updated Mutable Alert')).toHaveLength(1);
    });

    it('should replace an alert matched by serialized props', async () => {
      const user = userEvent.setup();
      render(
        <PageAlertToasterProvider>
          <TestConsumer />
        </PageAlertToasterProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Add Replace Target' }));
      await user.click(screen.getByRole('button', { name: 'Replace' }));
      expect(screen.queryByText('Replace Me')).not.toBeInTheDocument();
      expect(screen.getByText('Replaced')).toBeInTheDocument();
    });

    it('should remove a replaced alert after timeout when the replacement included timeout', async () => {
      vi.useFakeTimers();
      render(
        <PageAlertToasterProvider>
          <TestConsumer />
        </PageAlertToasterProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: 'Add Old For Replace Timeout' }));
      fireEvent.click(screen.getByRole('button', { name: 'Replace With Timeout' }));
      expect(screen.getByText('With Timeout')).toBeInTheDocument();

      await act(async () => {
        await vi.runAllTimersAsync();
      });
      expect(screen.queryByText('With Timeout')).not.toBeInTheDocument();
    });

    it('should expose toaster API via usePageAlertToaster inside the provider', async () => {
      const user = userEvent.setup();
      render(
        <PageAlertToasterProvider>
          <HookConsumer />
        </PageAlertToasterProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Add Via Hook' }));
      expect(screen.getByText('From Hook')).toBeInTheDocument();
    });

    it('should remove a specific alert by object reference', async () => {
      const user = userEvent.setup();
      render(
        <PageAlertToasterProvider>
          <TestConsumer />
        </PageAlertToasterProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Add And Remove By Ref' }));
      expect(screen.queryByText('Closable')).not.toBeInTheDocument();
    });

    it('should leave alerts unchanged when replaceAlert finds no match', async () => {
      const user = userEvent.setup();
      render(
        <PageAlertToasterProvider>
          <TestConsumer />
        </PageAlertToasterProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Add' }));
      await user.click(screen.getByRole('button', { name: 'Replace Missing' }));
      expect(screen.getByText('Test Alert')).toBeInTheDocument();
      expect(screen.queryByText('Should Not Appear')).not.toBeInTheDocument();
    });

    it('should filter alerts when removeAlerts is called with a predicate', async () => {
      const user = userEvent.setup();
      render(
        <PageAlertToasterProvider>
          <TestConsumer />
        </PageAlertToasterProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Add' }));
      await user.click(screen.getByRole('button', { name: 'Add Danger' }));
      expect(screen.getByText('Test Alert')).toBeInTheDocument();
      expect(screen.getByText('Danger Alert')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Keep Danger' }));
      expect(screen.getByText('Test Alert')).toBeInTheDocument();
      expect(screen.queryByText('Danger Alert')).not.toBeInTheDocument();
    });
  });

  describe('default context', () => {
    it('should expose no-op toaster methods outside a provider', async () => {
      const user = userEvent.setup();
      render(<DefaultContextConsumer />);
      await user.click(screen.getByRole('button', { name: 'Invoke Default Context' }));
      expect(screen.queryByTestId('alert-toaster')).not.toBeInTheDocument();
    });
  });
});
