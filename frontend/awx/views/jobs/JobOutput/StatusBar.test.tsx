import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { HostStatusCounts } from '../../../interfaces/Job';
import type { WorkflowNode } from '../../../interfaces/WorkflowNode';
import { HostStatusBar, WorkflowNodesStatusBar } from './StatusBar';

describe('StatusBar', () => {
  describe('HostStatusBar', () => {
    it('should display host status percentages', () => {
      const counts: HostStatusCounts = {
        ok: 10,
        skipped: 0,
        changed: 0,
        failures: 0,
        dark: 0,
      };
      render(<HostStatusBar counts={counts} />);
      expect(screen.getByText('Success 100%')).toBeInTheDocument();
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
      expect(screen.getByText('Success 50%')).toBeInTheDocument();
      expect(screen.getByText('Skipped 20%')).toBeInTheDocument();
      expect(screen.getByText('Changed 20%')).toBeInTheDocument();
      expect(screen.getByText('Failed 10%')).toBeInTheDocument();
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

    it('should show unavailable message when no counts', () => {
      const counts = {} as HostStatusCounts;
      render(<HostStatusBar counts={counts} />);
      expect(screen.getByTestId('status-bar')).toBeInTheDocument();
    });

    it('should fall back to dark styling for counts keys absent from status', () => {
      const counts = {
        ok: 9,
        skipped: 0,
        changed: 0,
        failures: 0,
        dark: 0,
        unknown: 1,
      } as unknown as HostStatusCounts;
      render(<HostStatusBar counts={counts} />);
      // 'unknown' key is not in hostStatus, so legend falls back to the 'dark' (Unreachable) label
      // Two "Unreachable" entries appear: one for dark=0 and one for the fallback unknown=1 (10%)
      expect(screen.getAllByText(/Unreachable/)).toHaveLength(2);
    });

    it('should display <1% and >99% for minority/majority statuses that round to 0%/100%', () => {
      const counts: HostStatusCounts = {
        ok: 999,
        skipped: 0,
        changed: 0,
        failures: 0,
        dark: 1,
      };
      render(<HostStatusBar counts={counts} />);
      expect(screen.getByText('Unreachable <1%')).toBeInTheDocument();
      expect(screen.getByText('Success >99%')).toBeInTheDocument();
    });
  });

  describe('WorkflowNodesStatusBar', () => {
    it('should display workflow node status percentages', () => {
      const nodes: WorkflowNode[] = [
        { summary_fields: { job: { status: 'successful' } } } as WorkflowNode,
        { summary_fields: { job: { status: 'successful' } } } as WorkflowNode,
        { summary_fields: { job: { status: 'successful' } } } as WorkflowNode,
        { summary_fields: { job: { status: 'successful' } } } as WorkflowNode,
      ];
      render(<WorkflowNodesStatusBar nodes={nodes} />);
      expect(screen.getByText('Success 100%')).toBeInTheDocument();
    });

    it('should display mixed workflow status', () => {
      const nodes: WorkflowNode[] = [
        { summary_fields: { job: { status: 'successful' } } } as WorkflowNode,
        { summary_fields: { job: { status: 'canceled' } } } as WorkflowNode,
        { summary_fields: { job: { status: 'error' } } } as WorkflowNode,
        { summary_fields: { job: { status: 'error' } } } as WorkflowNode,
      ];
      render(<WorkflowNodesStatusBar nodes={nodes} />);
      expect(screen.getByText('Success 25%')).toBeInTheDocument();
      expect(screen.getByText('Canceled 25%')).toBeInTheDocument();
      expect(screen.getByText('Error 50%')).toBeInTheDocument();
    });

    it('should handle nodes without job status', () => {
      const nodes: WorkflowNode[] = [
        { summary_fields: {} } as WorkflowNode,
        { summary_fields: { job: { status: 'successful' } } } as WorkflowNode,
      ];
      render(<WorkflowNodesStatusBar nodes={nodes} />);
      expect(screen.getByText('Success 100%')).toBeInTheDocument();
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
