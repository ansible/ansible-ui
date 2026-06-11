import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { RESOURCE_TYPE } from '../constants';
import type { WizardFormValues } from '../types';
import { getValueBasedOnJobType, hasDaysToKeep, shouldHideOtherStep } from './helpers';
import { NodeAddWizard } from './NodeAddWizard';
import {
  validateJobTemplateRequirements,
  validateRequiredCredentialTypes,
} from './validationHelpers';

vi.mock('../../../../views/jobs/WorkflowOutput/WorkflowOutput', () => ({
  greyBadgeLabel: {
    badge: 'ALL',
    badgeColor: 'var(--pf-t--global--background--color--secondary--default)',
    badgeBorderColor: 'var(--pf-t--global--border--color--on-secondary)',
  },
}));

vi.mock('@patternfly/react-topology', () => ({
  useVisualizationController: vi.fn(() => ({
    getState: () => ({ sourceNode: undefined }),
    setState: () => {},
    getGraph: () => ({ getNodes: () => [], layout: () => {} }),
    toModel: () => ({ nodes: [], edges: [] }),
    fromModel: () => {},
    getNodeById: () => null,
  })),
  NodeModel: {},
  NodeShape: { circle: 'circle' },
  EdgeTerminalType: { directional: 'directional' },
  NodeStatus: { danger: 'danger', success: 'success', info: 'info' },
  observer: (component: unknown) => component,
  TopologySideBar: () => null,
  TopologyView: () => null,
}));

vi.mock('../hooks', () => ({
  useCloseSidebar: () => vi.fn(),
  useCreateEdge: () => (source: string, target: string) => ({
    id: `${source}-${target}`,
    type: 'edge',
    source,
    target,
    visible: true,
    data: {},
  }),
  useNodeTypeStepDefaults: () => () => ({
    approval_description: '',
    approval_name: '',
    approval_timeout: 0,
    node_alias: '',
    node_convergence: 'any' as const,
    node_days_to_keep: 30,
    resource: null,
    resourceId: undefined,
    node_type: RESOURCE_TYPE.job,
    node_status_type: undefined,
  }),
}));

describe('NodeAddWizard', () => {
  it('should render wizard with Add step title', () => {
    render(
      <MemoryRouter>
        <NodeAddWizard />
      </MemoryRouter>
    );
    expect(screen.getByTestId('wizard-title')).toHaveTextContent('Add step');
  });

  it('should render wizard navigation', () => {
    render(
      <MemoryRouter>
        <NodeAddWizard />
      </MemoryRouter>
    );
    expect(screen.getByTestId('wizard-nav')).toBeInTheDocument();
  });
});

describe('helpers', () => {
  describe('getValueBasedOnJobType', () => {
    it('should return workflowValue for workflow_approval node type', () => {
      expect(getValueBasedOnJobType('workflow_approval', 'default', 'Approval Name')).toBe(
        'Approval Name'
      );
    });

    it('should return defaultValue for non-approval node types', () => {
      expect(getValueBasedOnJobType('job', 'Job Template Name', 'Ignored')).toBe(
        'Job Template Name'
      );
      expect(getValueBasedOnJobType('workflow_job', 'WJT Name', 'Ignored')).toBe('WJT Name');
      expect(getValueBasedOnJobType('project_update', 'Project Sync', 'Ignored')).toBe(
        'Project Sync'
      );
    });
  });

  describe('hasDaysToKeep', () => {
    it('should return true for cleanup_jobs job_type', () => {
      expect(
        hasDaysToKeep({ job_type: 'cleanup_jobs' } as Parameters<typeof hasDaysToKeep>[0])
      ).toBe(true);
    });

    it('should return true for cleanup_activitystream job_type', () => {
      expect(
        hasDaysToKeep({ job_type: 'cleanup_activitystream' } as Parameters<typeof hasDaysToKeep>[0])
      ).toBe(true);
    });

    it('should return false when node has no job_type', () => {
      expect(hasDaysToKeep({} as Parameters<typeof hasDaysToKeep>[0])).toBe(false);
    });

    it('should return false when job_type is not cleanup', () => {
      expect(hasDaysToKeep({ job_type: 'run' } as Parameters<typeof hasDaysToKeep>[0])).toBe(false);
    });
  });

  describe('shouldHideOtherStep', () => {
    it('should return true for empty launch config', () => {
      expect(shouldHideOtherStep({} as Parameters<typeof shouldHideOtherStep>[0])).toBe(true);
    });

    it('should return false when ask_inventory_on_launch is true', () => {
      expect(
        shouldHideOtherStep({
          ask_inventory_on_launch: true,
        } as Parameters<typeof shouldHideOtherStep>[0])
      ).toBe(false);
    });

    it('should return false when ask_credential_on_launch is true', () => {
      expect(
        shouldHideOtherStep({
          ask_credential_on_launch: true,
        } as Parameters<typeof shouldHideOtherStep>[0])
      ).toBe(false);
    });

    it('should return true when no ask_* flags are set', () => {
      expect(
        shouldHideOtherStep({
          ask_inventory_on_launch: false,
          ask_credential_on_launch: false,
          ask_variables_on_launch: false,
        } as Parameters<typeof shouldHideOtherStep>[0])
      ).toBe(true);
    });
  });
});

describe('validationHelpers', () => {
  const mockT = (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key;

  describe('validateRequiredCredentialTypes', () => {
    it('should not throw when requiredCredentialTypes is empty', () => {
      expect(() => validateRequiredCredentialTypes(mockT, {}, [])).not.toThrow();
    });

    it('should not throw when credentials match required types', () => {
      const wizardData: Partial<WizardFormValues> = {
        prompt: {
          credentials: [{ id: 1, name: 'Test', credential_type: 1, passwords_needed: [] }],
        },
      };
      expect(() =>
        validateRequiredCredentialTypes(mockT, wizardData, [{ id: 1, name: 'SSH' }])
      ).not.toThrow();
    });

    it('should throw when missing required credential type', () => {
      const wizardData: Partial<WizardFormValues> = {
        prompt: {
          credentials: [],
        },
      };
      expect(() =>
        validateRequiredCredentialTypes(mockT, wizardData, [{ id: 1, name: 'SSH' }])
      ).toThrow();
    });

    it('should throw when extra credential type is selected', () => {
      const wizardData: Partial<WizardFormValues> = {
        prompt: {
          credentials: [{ id: 2, name: 'Other', credential_type: 2, passwords_needed: [] }],
        },
      };
      expect(() =>
        validateRequiredCredentialTypes(mockT, wizardData, [{ id: 1, name: 'SSH' }])
      ).toThrow();
    });
  });

  describe('validateJobTemplateRequirements', () => {
    it('should not throw when resource is not job_template', () => {
      expect(() =>
        validateJobTemplateRequirements(mockT, {
          resource: { type: 'workflow_job_template' } as WizardFormValues['resource'],
        })
      ).not.toThrow();
    });

    it('should not throw when job template has project and inventory', () => {
      const wizardData: Partial<WizardFormValues> = {
        resource: {
          type: 'job_template',
          project: 1,
          inventory: 1,
          ask_inventory_on_launch: false,
        } as unknown as WizardFormValues['resource'],
      };
      expect(() => validateJobTemplateRequirements(mockT, wizardData)).not.toThrow();
    });

    it('should not throw when ask_inventory_on_launch is true and inventory missing', () => {
      const wizardData: Partial<WizardFormValues> = {
        resource: {
          type: 'job_template',
          project: 1,
          inventory: null,
          ask_inventory_on_launch: true,
        } as unknown as WizardFormValues['resource'],
      };
      expect(() => validateJobTemplateRequirements(mockT, wizardData)).not.toThrow();
    });

    it('should throw when job template has missing project', () => {
      const wizardData: Partial<WizardFormValues> = {
        resource: {
          type: 'job_template',
          project: null,
          inventory: 1,
          ask_inventory_on_launch: false,
        } as unknown as WizardFormValues['resource'],
      };
      expect(() => validateJobTemplateRequirements(mockT, wizardData)).toThrow();
    });

    it('should throw when job template has missing inventory and ask_inventory_on_launch false', () => {
      const wizardData: Partial<WizardFormValues> = {
        resource: {
          type: 'job_template',
          project: 1,
          inventory: null,
          ask_inventory_on_launch: false,
        } as unknown as WizardFormValues['resource'],
      };
      expect(() => validateJobTemplateRequirements(mockT, wizardData)).toThrow();
    });
  });
});

describe('RESOURCE_TYPE constants', () => {
  it('should have all expected node types', () => {
    expect(RESOURCE_TYPE.job).toBe('job');
    expect(RESOURCE_TYPE.workflow_job).toBe('workflow_job');
    expect(RESOURCE_TYPE.project_update).toBe('project_update');
    expect(RESOURCE_TYPE.workflow_approval).toBe('workflow_approval');
    expect(RESOURCE_TYPE.inventory_update).toBe('inventory_update');
    expect(RESOURCE_TYPE.system_job).toBe('system_job');
  });
});
