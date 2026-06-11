import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { describe, expect, it, vi } from 'vitest';
import { RESOURCE_TYPE } from '../constants';
import type { WizardFormValues } from '../types';
import type { LaunchConfiguration } from '../../../../interfaces/LaunchConfiguration';
import {
  getNodeLabel,
  getValueBasedOnJobType,
  hasDaysToKeep,
  replaceIdentifier,
  shouldHideOtherStep,
} from './helpers';
import { validateJobTemplateRequirements } from './validationHelpers';

vi.mock('@patternfly/react-topology', () => ({
  useVisualizationController: vi.fn(() => ({
    getState: () => ({}),
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
}));

describe('NodeEditWizard validation', () => {
  const mockT = (key: string) => key;

  describe('validateJobTemplateRequirements', () => {
    it('should not throw for non-job_template resource', () => {
      const wizardData: Partial<WizardFormValues> = {
        resource: { type: 'workflow_job_template' } as never,
      };
      expect(() => validateJobTemplateRequirements(mockT, wizardData)).not.toThrow();
    });

    it('should not throw when job template has project and inventory', () => {
      const wizardData: Partial<WizardFormValues> = {
        resource: {
          type: 'job_template',
          project: 1,
          inventory: 1,
          ask_inventory_on_launch: false,
        } as never,
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
        } as never,
      };
      expect(() => validateJobTemplateRequirements(mockT, wizardData)).toThrow(RequestError);
    });

    it('should throw when job template has missing inventory and ask_inventory_on_launch is false', () => {
      const wizardData: Partial<WizardFormValues> = {
        resource: {
          type: 'job_template',
          project: 1,
          inventory: null,
          ask_inventory_on_launch: false,
        } as never,
      };
      expect(() => validateJobTemplateRequirements(mockT, wizardData)).toThrow(RequestError);
    });

    it('should not throw when inventory is missing but ask_inventory_on_launch is true', () => {
      const wizardData: Partial<WizardFormValues> = {
        resource: {
          type: 'job_template',
          project: 1,
          inventory: null,
          ask_inventory_on_launch: true,
        } as never,
      };
      expect(() => validateJobTemplateRequirements(mockT, wizardData)).not.toThrow();
    });
  });
});

describe('NodeEditWizard helpers', () => {
  describe('replaceIdentifier', () => {
    it('should return alias when identifier is UUID and alias is non-empty', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      expect(replaceIdentifier(uuid, 'my-alias')).toBe('my-alias');
    });

    it('should return identifier when both are same non-UUID', () => {
      expect(replaceIdentifier('existing-id', 'existing-id')).toBe('existing-id');
    });

    it('should return alias when identifier differs from alias', () => {
      expect(replaceIdentifier('old-id', 'new-id')).toBe('new-id');
    });

    it('should return identifier when UUID and alias is empty', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      expect(replaceIdentifier(uuid, '')).toBe(uuid);
    });
  });

  describe('getValueBasedOnJobType', () => {
    it('should return workflowValue for workflow_approval', () => {
      expect(
        getValueBasedOnJobType(RESOURCE_TYPE.workflow_approval, 'default', 'approval name')
      ).toBe('approval name');
    });

    it('should return defaultValue for job types', () => {
      expect(getValueBasedOnJobType(RESOURCE_TYPE.job, 'job name', 'approval')).toBe('job name');
    });
  });

  describe('hasDaysToKeep', () => {
    it('should return true for cleanup_jobs job_type', () => {
      expect(hasDaysToKeep({ job_type: 'cleanup_jobs' } as never)).toBe(true);
    });

    it('should return true for cleanup_activitystream job_type', () => {
      expect(hasDaysToKeep({ job_type: 'cleanup_activitystream' } as never)).toBe(true);
    });

    it('should return false for other job types', () => {
      expect(hasDaysToKeep({ job_type: 'run' } as never)).toBe(false);
    });

    it('should return false when node is null or has no job_type', () => {
      expect(hasDaysToKeep(null)).toBe(false);
      expect(hasDaysToKeep({} as never)).toBe(false);
    });
  });

  describe('getNodeLabel', () => {
    it('should return alias when alias is non-UUID and non-empty', () => {
      expect(getNodeLabel('Template Name', 'my-alias')).toBe('my-alias');
    });

    it('should return name when alias is empty', () => {
      expect(getNodeLabel('Template Name', '')).toBe('Template Name');
    });

    it('should return name when alias is UUID', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      expect(getNodeLabel('Template Name', uuid)).toBe('Template Name');
    });
  });

  describe('shouldHideOtherStep', () => {
    it('should return true when launch config is empty', () => {
      expect(shouldHideOtherStep({} as LaunchConfiguration)).toBe(true);
    });

    it('should return false when ask_credential_on_launch is true', () => {
      expect(
        shouldHideOtherStep({
          ask_credential_on_launch: true,
        } as LaunchConfiguration)
      ).toBe(false);
    });

    it('should return false when ask_inventory_on_launch is true', () => {
      expect(
        shouldHideOtherStep({
          ask_inventory_on_launch: true,
        } as LaunchConfiguration)
      ).toBe(false);
    });
  });
});
