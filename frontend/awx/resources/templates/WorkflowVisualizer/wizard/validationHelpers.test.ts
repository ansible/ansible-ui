import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { describe, expect, it } from 'vitest';
import { validateRequiredCredentialTypes } from './validationHelpers';
import { WizardFormValues } from '../types';

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
});
