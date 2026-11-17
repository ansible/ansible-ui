import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { GraphElement } from '@patternfly/react-topology';
import { AwxRoute } from '../../../main/AwxRoutes';
import { jobPaths, WorkflowOutputNode } from './WorkflowOutputNode';

const pageNavigate = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    usePageNavigate: () => pageNavigate,
  };
});

vi.mock('./hooks/useStatusDecorator', () => ({
  useStatusDecorator: () => () => null,
}));

vi.mock('@patternfly/react-topology', () => ({
  observer: (component: unknown) => component,
  useHover: () => [false, vi.fn()],
  DefaultNode: (props: {
    onSelect?: () => void;
    className?: string;
    children?: React.ReactNode;
    secondaryLabel?: string;
  }) => (
    <button
      type="button"
      data-testid="workflow-output-node"
      className={props.className}
      onClick={props.onSelect}
    >
      {props.secondaryLabel}
      {props.children}
    </button>
  ),
  Layer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  NodeStatus: { default: 'default', success: 'success' },
  TOP_LAYER: 'top',
}));

function createElement(options: {
  job?: { id: number; type: string } | null;
  templateType?: string;
  status?: string;
}): GraphElement {
  const status = options.status ?? 'success';
  return {
    getId: () => 'node-1',
    getData: () => ({
      secondaryLabel: 'elapsed',
      resource: {
        summary_fields: {
          job: options.job,
          unified_job_template: { unified_job_type: options.templateType ?? 'job' },
        },
      },
    }),
    getController: () => ({
      getNodeById: () => ({
        getNodeStatus: () => status,
      }),
    }),
  } as unknown as GraphElement;
}

describe('jobPaths', () => {
  it('should map unified job types to route segments', () => {
    expect(jobPaths.job).toBe('playbook');
    expect(jobPaths.workflow_job).toBe('workflow');
  });
});

describe('WorkflowOutputNode', () => {
  it('should navigate to job output when a playbook node is selected', async () => {
    const user = userEvent.setup({ delay: null });
    pageNavigate.mockClear();

    render(
      <WorkflowOutputNode
        element={createElement({ job: { id: 44, type: 'job' } })}
        selected={false}
      />
    );

    await user.click(screen.getByTestId('workflow-output-node'));
    expect(pageNavigate).toHaveBeenCalledWith(AwxRoute.JobOutput, {
      params: { job_type: 'playbook', id: 44 },
    });
  });

  it('should navigate to workflow approval details for approval nodes', async () => {
    const user = userEvent.setup({ delay: null });
    pageNavigate.mockClear();

    render(
      <WorkflowOutputNode
        element={createElement({ job: { id: 9, type: 'workflow_approval' } })}
        selected={false}
      />
    );

    await user.click(screen.getByTestId('workflow-output-node'));
    expect(pageNavigate).toHaveBeenCalledWith(AwxRoute.WorkflowApprovalDetails, {
      params: { id: 9 },
    });
  });

  it('should mark unexecuted nodes without jobs', () => {
    render(
      <WorkflowOutputNode
        element={createElement({ job: null, status: 'default' })}
        selected={false}
      />
    );

    expect(screen.getByTestId('workflow-output-node')).toHaveClass('unexecuted-job');
  });
});
