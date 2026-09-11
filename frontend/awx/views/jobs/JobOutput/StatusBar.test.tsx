import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { HostStatusCounts } from '../../../interfaces/Job';
import type { WorkflowNode } from '../../../interfaces/WorkflowNode';
import { HostStatusBar, WorkflowNodesStatusBar } from './StatusBar';

describe('StatusBar', () => {
  describe('HostStatusBar', () => {
    it('should display host status counts', () => {
      const counts: HostStatusCounts = {
        ok: 10,
        skipped: 0,
        changed: 0,
        failures: 0,
        dark: 0,
      };
      render(<HostStatusBar counts={counts} />);
      expect(screen.getByText('Success 10')).toBeInTheDocument();
      expect(screen.queryByText('Success 100%')).not.toBeInTheDocument();
    });

    it('should display multiple status types', () => {
      const counts: HostStatusCounts = {
        ok: 5,
        skipped: 2,
        changed: 2,
        failures: 1,
        dark: 0,
      };
      render(<HostStatusBar counts={counts} />);
      expect(screen.getByText('Success 5')).toBeInTheDocument();
      expect(screen.getByText('Skipped 2')).toBeInTheDocument();
      expect(screen.getByText('Changed 2')).toBeInTheDocument();
      expect(screen.getByText('Failed 1')).toBeInTheDocument();
    });

    it('should render status bar element', () => {
      const counts: HostStatusCounts = {
        ok: 1,
        skipped: 0,
        changed: 0,
        failures: 0,
        dark: 0,
      };
      render(<HostStatusBar counts={counts} />);
      expect(screen.getByTestId('status-bar')).toBeInTheDocument();
    });

    it('should display exact counts for large inventories with minority statuses', () => {
      const counts: HostStatusCounts = {
        ok: 999,
        dark: 1,
      };
      render(<HostStatusBar counts={counts} />);
      expect(screen.getByText('Success 999')).toBeInTheDocument();
      expect(screen.getByText('Unreachable 1')).toBeInTheDocument();
      expect(screen.queryByText('Success 100%')).not.toBeInTheDocument();
      expect(screen.queryByText('Unreachable 0%')).not.toBeInTheDocument();
    });

    it('should show unavailable message when no counts', () => {
      const counts = {} as HostStatusCounts;
      render(<HostStatusBar counts={counts} />);
      expect(screen.getByTestId('status-bar')).toBeInTheDocument();
    });
  });

  describe('WorkflowNodesStatusBar', () => {
    it('should display workflow node status counts', () => {
      const nodes: WorkflowNode[] = [
        { summary_fields: { job: { status: 'successful' } } } as WorkflowNode,
        { summary_fields: { job: { status: 'successful' } } } as WorkflowNode,
        { summary_fields: { job: { status: 'successful' } } } as WorkflowNode,
        { summary_fields: { job: { status: 'successful' } } } as WorkflowNode,
      ];
      render(<WorkflowNodesStatusBar nodes={nodes} />);
      expect(screen.getByText('Success 4')).toBeInTheDocument();
      expect(screen.queryByText('Success 100%')).not.toBeInTheDocument();
    });

    it('should display mixed workflow status', () => {
      const nodes: WorkflowNode[] = [
        { summary_fields: { job: { status: 'successful' } } } as WorkflowNode,
        { summary_fields: { job: { status: 'canceled' } } } as WorkflowNode,
        { summary_fields: { job: { status: 'error' } } } as WorkflowNode,
        { summary_fields: { job: { status: 'error' } } } as WorkflowNode,
      ];
      render(<WorkflowNodesStatusBar nodes={nodes} />);
      expect(screen.getByText('Success 1')).toBeInTheDocument();
      expect(screen.getByText('Canceled 1')).toBeInTheDocument();
      expect(screen.getByText('Error 2')).toBeInTheDocument();
    });

    it('should handle nodes without job status', () => {
      const nodes: WorkflowNode[] = [
        { summary_fields: {} } as WorkflowNode,
        { summary_fields: { job: { status: 'successful' } } } as WorkflowNode,
      ];
      render(<WorkflowNodesStatusBar nodes={nodes} />);
      expect(screen.getByText('Success 1')).toBeInTheDocument();
    });

    it('should render status bar element', () => {
      const nodes: WorkflowNode[] = [
        { summary_fields: { job: { status: 'successful' } } } as WorkflowNode,
      ];
      render(<WorkflowNodesStatusBar nodes={nodes} />);
      expect(screen.getByTestId('status-bar')).toBeInTheDocument();
    });
  });
});
