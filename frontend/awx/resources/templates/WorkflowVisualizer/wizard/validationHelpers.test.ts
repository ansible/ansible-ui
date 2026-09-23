import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { describe, expect, it } from 'vitest';
import type { LaunchConfiguration } from '../../../../interfaces/LaunchConfiguration';
import type { JobTemplate } from '../../../../interfaces/JobTemplate';
import type { WorkflowJobTemplate } from '../../../../interfaces/WorkflowJobTemplate';
import { RESOURCE_TYPE } from '../constants';
import { WizardFormValues } from '../types';
import { registerLaunchConfigLoad, type LaunchConfigLoadResult } from './launchConfigLoad';
import {
  awaitNodeLaunchConfigForWizard,
  validateJobTemplateRequirements,
  validateNodeTypeStep,
  validateRequiredCredentialTypes,
} from './validationHelpers';

type WizardData = Partial<WizardFormValues>;

describe('validationHelpers', () => {
  const mockT = (key: string, params?: Record<string, unknown>) => {
    if (params) {
      return key.replace(
        /\{\{(\w+)\}\}/g,
        (match, paramKey) => String(params[paramKey as string]) || match
      );
    }
    return key;
  };

  describe('validateRequiredCredentialTypes', () => {
    const requiredCredentialTypes = [
      { id: 1, name: 'Machine' },
      { id: 2, name: 'Vault' },
    ];

    it('should pass validation when all required credential types are selected', () => {
      const wizardData = {
        prompt: {
          credentials: [
            { id: 1, name: 'SSH Key', credential_type: 1 },
            { id: 2, name: 'Vault Pass', credential_type: 2 },
          ],
        },
      };

      expect(() =>
        validateRequiredCredentialTypes(mockT, wizardData as WizardData, requiredCredentialTypes)
      ).not.toThrow();
    });

    it('should fail validation when extra credential types are selected', () => {
      const wizardData = {
        prompt: {
          credentials: [
            { id: 1, name: 'SSH Key', credential_type: 1 },
            { id: 2, name: 'Vault Pass', credential_type: 2 },
            { id: 3, name: 'Source Control', credential_type: 3 },
          ],
        },
      };

      expect(() =>
        validateRequiredCredentialTypes(mockT, wizardData as WizardData, requiredCredentialTypes)
      ).toThrow(RequestError);
    });

    it('should fail validation when required credential types are missing', () => {
      const wizardData = {
        prompt: {
          credentials: [
            { id: 1, name: 'SSH Key', credential_type: 1 },
            // Missing credential_type: 2 (Vault)
            { id: 3, name: 'Source Control', credential_type: 3 },
          ],
        },
      };

      expect(() =>
        validateRequiredCredentialTypes(mockT, wizardData as WizardData, requiredCredentialTypes)
      ).toThrow(RequestError);

      try {
        validateRequiredCredentialTypes(mockT, wizardData as WizardData, requiredCredentialTypes);
        throw new Error('Expected validation to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestError);
        expect((error as RequestError).json).toEqual({
          __all__: [expect.stringContaining('Vault')],
        });
      }
    });

    it('should fail validation when multiple required credential types are missing', () => {
      const wizardData = {
        prompt: {
          credentials: [
            { id: 3, name: 'Source Control', credential_type: 3 },
            // Missing both credential_type: 1 (Machine) and credential_type: 2 (Vault)
          ],
        },
      };

      expect(() =>
        validateRequiredCredentialTypes(mockT, wizardData as WizardData, requiredCredentialTypes)
      ).toThrow(RequestError);
    });

    it('should pass validation when no credentials are selected and no types are required', () => {
      const wizardData = {
        prompt: {
          credentials: [],
        },
      };

      expect(() => validateRequiredCredentialTypes(mockT, wizardData, [])).not.toThrow();
    });

    it('should fail validation when prompt is undefined but credentials required', () => {
      const wizardData = {};

      expect(() =>
        validateRequiredCredentialTypes(mockT, wizardData, requiredCredentialTypes)
      ).toThrow();
    });

    it('should use user-friendly credential type names in error messages', () => {
      const customRequiredTypes = [
        { id: 5, name: 'Custom Machine Type' },
        { id: 6, name: 'Custom Vault Type' },
      ];

      const wizardData = {
        prompt: {
          credentials: [],
        },
      };

      try {
        validateRequiredCredentialTypes(mockT, wizardData, customRequiredTypes);
        throw new Error('Expected validation to throw');
      } catch (error) {
        const errorData = (error as RequestError)?.json as { __all__: string[] };
        const errorMessage = errorData?.__all__[0];
        expect(errorMessage).toContain('Custom Machine Type');
        expect(errorMessage).toContain('Custom Vault Type');
        expect(errorMessage).not.toContain('5'); // Should not contain raw IDs
        expect(errorMessage).not.toContain('6');
      }
    });
  });

  describe('awaitNodeLaunchConfigForWizard', () => {
    it('should return undefined when resourceId is missing', async () => {
      await expect(
        awaitNodeLaunchConfigForWizard({ node_type: RESOURCE_TYPE.job })
      ).resolves.toBeUndefined();
    });

    it('should return undefined for node types that do not load launch config', async () => {
      await expect(
        awaitNodeLaunchConfigForWizard({
          node_type: RESOURCE_TYPE.workflow_approval,
          resourceId: 1,
        })
      ).resolves.toBeUndefined();
    });

    it('should return undefined when no launch config load is registered', async () => {
      await expect(
        awaitNodeLaunchConfigForWizard({
          node_type: RESOURCE_TYPE.job,
          resourceId: 999,
        })
      ).resolves.toBeUndefined();
    });

    it('should return launch config data when a registered load completes', async () => {
      const loadResult: LaunchConfigLoadResult = {
        launch_config: { survey_enabled: true } as LaunchConfiguration,
        resource: { id: 5, name: 'Deploy', type: 'job_template' } as JobTemplate,
        resourceId: 5,
      };

      registerLaunchConfigLoad(RESOURCE_TYPE.job, 5, Promise.resolve(loadResult));

      await expect(
        awaitNodeLaunchConfigForWizard({
          node_type: RESOURCE_TYPE.job,
          resourceId: 5,
        })
      ).resolves.toEqual({
        launch_config: loadResult.launch_config,
        resource: loadResult.resource,
        resourceId: 5,
      });
    });

    it('should return launch config data for workflow job templates', async () => {
      const loadResult: LaunchConfigLoadResult = {
        launch_config: { survey_enabled: false } as LaunchConfiguration,
        resource: { id: 8, name: 'Workflow', type: 'workflow_job_template' } as WorkflowJobTemplate,
        resourceId: 8,
      };

      registerLaunchConfigLoad(RESOURCE_TYPE.workflow_job, 8, Promise.resolve(loadResult));

      await expect(
        awaitNodeLaunchConfigForWizard({
          node_type: RESOURCE_TYPE.workflow_job,
          resourceId: 8,
        })
      ).resolves.toEqual({
        launch_config: loadResult.launch_config,
        resource: loadResult.resource,
        resourceId: 8,
      });
    });

    it('should clear stale launch_config when the selected template has no registered load', async () => {
      await expect(
        awaitNodeLaunchConfigForWizard(
          {
            node_type: RESOURCE_TYPE.job,
            resourceId: 2,
          },
          {
            node_type: RESOURCE_TYPE.job,
            resourceId: 1,
            launch_config: { survey_enabled: true } as LaunchConfiguration,
          }
        )
      ).resolves.toEqual({
        launch_config: null,
        resourceId: 2,
      });
    });
  });

  describe('validateNodeTypeStep', () => {
    const mockSimpleT = (key: string) => key;

    it('should validate the loaded resource rather than form-only values', async () => {
      registerLaunchConfigLoad(
        RESOURCE_TYPE.job,
        5,
        Promise.resolve({
          launch_config: null,
          resource: {
            type: 'job_template',
            project: null,
            inventory: 1,
            ask_inventory_on_launch: false,
          } as unknown as JobTemplate,
          resourceId: 5,
        })
      );

      await expect(
        validateNodeTypeStep(
          mockSimpleT,
          { node_type: RESOURCE_TYPE.job, resourceId: 5 },
          { launch_config: { survey_enabled: true } as LaunchConfiguration, resourceId: 1 }
        )
      ).rejects.toBeInstanceOf(RequestError);
    });

    it('should merge form resourceId over stale wizard launch_config when a load completes', async () => {
      const loadResult: LaunchConfigLoadResult = {
        launch_config: { survey_enabled: false } as LaunchConfiguration,
        resource: { id: 5, name: 'Deploy', type: 'job_template' } as JobTemplate,
        resourceId: 5,
      };
      registerLaunchConfigLoad(RESOURCE_TYPE.job, 5, Promise.resolve(loadResult));

      await expect(
        validateNodeTypeStep(
          mockSimpleT,
          { node_type: RESOURCE_TYPE.job, resourceId: 5 },
          { launch_config: { survey_enabled: true } as LaunchConfiguration, resourceId: 1 }
        )
      ).resolves.toEqual({
        launch_config: loadResult.launch_config,
        resource: loadResult.resource,
        resourceId: 5,
      });
    });
  });

  describe('validateJobTemplateRequirements', () => {
    const mockSimpleT = (key: string) => key;

    it('should not throw when resource is not a job template', () => {
      expect(() =>
        validateJobTemplateRequirements(mockSimpleT, {
          resource: { type: 'workflow_job_template' } as WizardFormValues['resource'],
        })
      ).not.toThrow();
    });

    it('should not throw when job template resource lacks project and inventory fields', () => {
      expect(() =>
        validateJobTemplateRequirements(mockSimpleT, {
          resource: {
            type: 'job_template',
            name: 'Partial template',
          } as WizardFormValues['resource'],
        })
      ).not.toThrow();
    });

    it('should throw when job template is missing project', () => {
      expect(() =>
        validateJobTemplateRequirements(mockSimpleT, {
          resource: {
            type: 'job_template',
            project: null,
            inventory: 1,
            ask_inventory_on_launch: false,
          } as unknown as WizardFormValues['resource'],
        })
      ).toThrow(RequestError);
    });
  });
});
