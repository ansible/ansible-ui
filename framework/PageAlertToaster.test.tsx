/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useContext } from 'react';
import { describe, expect, it } from 'vitest';
import {
  PageAlertToasterProvider,
  PageAlertToasterContext,
  errorToAlertProps,
} from './PageAlertToaster';

function TestConsumer() {
  const toaster = useContext(PageAlertToasterContext);
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
      <button type="button" onClick={() => toaster.removeAlerts()}>
        Clear All
      </button>
      <button type="button" onClick={() => toaster.removeAlerts((a) => a.variant !== 'danger')}>
        Keep Danger
      </button>
    </div>
  );
}

describe('PageAlertToaster', () => {
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
  });
});
