import { describe, expect, it } from 'vitest';
import { getAggregateCredentials, type AggregateCredential } from './getAggregateCredentials';

describe('getAggregateCredentials', () => {
  const createMockCredential = (
    id: number,
    credential_type: number,
    name: string = `Credential ${id}`
  ): AggregateCredential => ({
    id,
    name,
    credential_type,
    passwords_needed: [],
  });

  describe('basic aggregation', () => {
    it('should return template credentials when no node or prompt credentials exist', () => {
      const templateCredentials = [
        createMockCredential(1, 1, 'Template SSH'),
        createMockCredential(2, 2, 'Template Vault'),
      ];

      const result = getAggregateCredentials([], [], templateCredentials);

      expect(result).toEqual([
        expect.objectContaining({ id: 1, name: 'Template SSH', credential_type: 1 }),
        expect.objectContaining({ id: 2, name: 'Template Vault', credential_type: 2 }),
      ]);
    });

    it('should return empty array when no credentials are provided', () => {
      const result = getAggregateCredentials([], [], []);
      expect(result).toHaveLength(0);
    });
  });

  describe('node credential override', () => {
    it('should override template credentials with node credentials for matching types', () => {
      const templateCredentials = [
        createMockCredential(1, 1, 'Template SSH'),
        createMockCredential(2, 2, 'Template Vault'),
      ];
      const nodeCredentials = [
        createMockCredential(3, 1, 'Node SSH'), // Overrides template SSH (type 1)
      ];

      const result = getAggregateCredentials(nodeCredentials, [], templateCredentials);

      expect(result).toEqual([
        expect.objectContaining({ id: 3, name: 'Node SSH', credential_type: 1 }),
        expect.objectContaining({ id: 2, name: 'Template Vault', credential_type: 2 }),
      ]);
    });

    it('should add node credentials for types not in template', () => {
      const templateCredentials = [createMockCredential(1, 1, 'Template SSH')];
      const nodeCredentials = [createMockCredential(2, 2, 'Node Vault')];

      const result = getAggregateCredentials(nodeCredentials, [], templateCredentials);

      expect(result).toHaveLength(2);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 1, name: 'Template SSH', credential_type: 1 }),
          expect.objectContaining({ id: 2, name: 'Node Vault', credential_type: 2 }),
        ])
      );
    });
  });

  describe('prompt credential override', () => {
    it('should override template and node credentials with prompt credentials', () => {
      const templateCredentials = [
        createMockCredential(1, 1, 'Template SSH'),
        createMockCredential(2, 2, 'Template Vault'),
      ];
      const nodeCredentials = [createMockCredential(3, 1, 'Node SSH')];
      const promptCredentials = [
        createMockCredential(4, 1, 'Prompt SSH'), // Overrides both template and node SSH
      ];

      const result = getAggregateCredentials(
        nodeCredentials,
        promptCredentials,
        templateCredentials
      );

      expect(result).toHaveLength(2);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 4, name: 'Prompt SSH', credential_type: 1 }),
          expect.objectContaining({ id: 2, name: 'Template Vault', credential_type: 2 }),
        ])
      );
    });

    it('should add prompt credentials for new types', () => {
      const templateCredentials = [createMockCredential(1, 1, 'Template SSH')];
      const promptCredentials = [
        createMockCredential(2, 2, 'Prompt Vault'), // New type
        createMockCredential(3, 3, 'Prompt SCM'), // Another new type
      ];

      const result = getAggregateCredentials([], promptCredentials, templateCredentials);

      expect(result).toHaveLength(3);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 1, name: 'Template SSH', credential_type: 1 }),
          expect.objectContaining({ id: 2, name: 'Prompt Vault', credential_type: 2 }),
          expect.objectContaining({ id: 3, name: 'Prompt SCM', credential_type: 3 }),
        ])
      );
    });
  });

  describe('precedence order', () => {
    it('should follow correct precedence: prompt > node > template', () => {
      const templateCredentials = [
        createMockCredential(1, 1, 'Template SSH'),
        createMockCredential(2, 2, 'Template Vault'),
        createMockCredential(3, 3, 'Template SCM'),
      ];
      const nodeCredentials = [
        createMockCredential(4, 1, 'Node SSH'), // Overrides template SSH
        createMockCredential(5, 2, 'Node Vault'), // Overrides template Vault
      ];
      const promptCredentials = [
        createMockCredential(6, 1, 'Prompt SSH'), // Overrides both template and node SSH
      ];

      const result = getAggregateCredentials(
        nodeCredentials,
        promptCredentials,
        templateCredentials
      );

      expect(result).toHaveLength(3);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 6, name: 'Prompt SSH', credential_type: 1 }),
          expect.objectContaining({ id: 5, name: 'Node Vault', credential_type: 2 }),
          expect.objectContaining({ id: 3, name: 'Template SCM', credential_type: 3 }),
        ])
      );
    });
  });

  describe('duplicate prevention', () => {
    it('should prevent duplicate credentials of the same type', () => {
      const templateCredentials = [createMockCredential(1, 1, 'Template SSH A')];
      const nodeCredentials = [
        createMockCredential(2, 1, 'Node SSH B'), // Same type as template
      ];
      const promptCredentials = [
        createMockCredential(3, 1, 'Prompt SSH C'), // Same type as both above
      ];

      const result = getAggregateCredentials(
        nodeCredentials,
        promptCredentials,
        templateCredentials
      );

      // Should only have one credential of type 1, and it should be the prompt one (highest precedence)
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: 3,
          name: 'Prompt SSH C',
          credential_type: 1,
        })
      );
    });

    it('should handle multiple types with some overlapping', () => {
      const templateCredentials = [
        createMockCredential(1, 1, 'Template SSH'),
        createMockCredential(2, 2, 'Template Vault'),
        createMockCredential(3, 3, 'Template SCM'),
      ];
      const nodeCredentials = [
        createMockCredential(4, 2, 'Node Vault'), // Replaces template vault
        createMockCredential(5, 4, 'Node Cloud'), // New type
      ];
      const promptCredentials = [
        createMockCredential(6, 1, 'Prompt SSH'), // Replaces template SSH
        createMockCredential(7, 5, 'Prompt DB'), // New type
      ];

      const result = getAggregateCredentials(
        nodeCredentials,
        promptCredentials,
        templateCredentials
      );

      expect(result).toHaveLength(5);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 6, name: 'Prompt SSH', credential_type: 1 }), // Prompt override
          expect.objectContaining({ id: 4, name: 'Node Vault', credential_type: 2 }), // Node override
          expect.objectContaining({ id: 3, name: 'Template SCM', credential_type: 3 }), // Template only
          expect.objectContaining({ id: 5, name: 'Node Cloud', credential_type: 4 }), // Node only
          expect.objectContaining({ id: 7, name: 'Prompt DB', credential_type: 5 }), // Prompt only
        ])
      );
    });
  });

  describe('edge cases', () => {
    it('should handle empty arrays gracefully', () => {
      expect(getAggregateCredentials()).toEqual([]);
      expect(getAggregateCredentials([], [], [])).toEqual([]);
    });

    it('should handle undefined parameters', () => {
      const templateCredentials = [createMockCredential(1, 1, 'Template SSH')];

      expect(getAggregateCredentials(undefined, undefined, templateCredentials)).toEqual([
        expect.objectContaining({ id: 1, name: 'Template SSH', credential_type: 1 }),
      ]);
    });

    it('should maintain all credential properties', () => {
      const credentialWithExtraProps: AggregateCredential = {
        id: 1,
        name: 'SSH Key',
        credential_type: 1,
        passwords_needed: ['ssh_password'],
        vault_id: 'test-vault',
        inputs: { username: 'testuser' },
      };

      const result = getAggregateCredentials([], [], [credentialWithExtraProps]);

      expect(result[0]).toEqual(credentialWithExtraProps);
    });
  });

  describe('template change behavior', () => {
    it('should return only new template defaults when prompt credentials are cleared on template switch', () => {
      const newTemplateCredentials = [
        createMockCredential(20, 1, 'New Template SSH'),
        createMockCredential(21, 3, 'New Template SCM'),
      ];

      const result = getAggregateCredentials([], [], newTemplateCredentials);

      expect(result).toHaveLength(2);
      expect(result).toEqual([
        expect.objectContaining({ id: 20, name: 'New Template SSH', credential_type: 1 }),
        expect.objectContaining({ id: 21, name: 'New Template SCM', credential_type: 3 }),
      ]);
    });

    it('should preserve prompt values on initial load (no template change)', () => {
      const templateCredentials = [createMockCredential(1, 1, 'Template SSH')];
      const existingPromptCredentials = [
        createMockCredential(5, 1, 'User SSH Override'),
        createMockCredential(6, 2, 'User Vault'),
      ];

      const result = getAggregateCredentials([], existingPromptCredentials, templateCredentials);

      expect(result).toHaveLength(2);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 5, name: 'User SSH Override', credential_type: 1 }),
          expect.objectContaining({ id: 6, name: 'User Vault', credential_type: 2 }),
        ])
      );
    });

    it('should discard stale node credentials when both node and prompt are cleared on template switch', () => {
      const staleNodeCredentials = [
        createMockCredential(3, 1, 'Old Node SSH'),
        createMockCredential(4, 2, 'Old Node Vault'),
      ];
      const newTemplateCredentials = [createMockCredential(20, 3, 'New Template SCM')];

      const result = getAggregateCredentials(staleNodeCredentials, [], newTemplateCredentials);

      expect(result).toHaveLength(3);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 3, credential_type: 1 }),
          expect.objectContaining({ id: 4, credential_type: 2 }),
          expect.objectContaining({ id: 20, credential_type: 3 }),
        ])
      );
    });

    it('should produce clean state when called with all empty arrays (template switch to no-prompts template)', () => {
      const result = getAggregateCredentials([], [], []);
      expect(result).toEqual([]);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle the original bug scenario: same credential ID in template and user selection', () => {
      // This represents the bug scenario where user selected the same credential that was already
      // a template default, which used to cause duplicates
      const templateCredentials = [createMockCredential(10, 1, 'Default SSH Key')];
      const promptCredentials = [
        createMockCredential(10, 1, 'Default SSH Key'), // Same credential selected by user
      ];

      const result = getAggregateCredentials([], promptCredentials, templateCredentials);

      // Should only have one credential, not duplicates
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: 10,
          name: 'Default SSH Key',
          credential_type: 1,
        })
      );
    });

    it('should handle user replacing template default with different credential', () => {
      const templateCredentials = [
        createMockCredential(10, 1, 'Default SSH Key'),
        createMockCredential(11, 2, 'Default Vault'),
      ];
      const promptCredentials = [
        createMockCredential(20, 1, 'User SSH Key'), // Different credential, same type
      ];

      const result = getAggregateCredentials([], promptCredentials, templateCredentials);

      expect(result).toHaveLength(2);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 20, name: 'User SSH Key', credential_type: 1 }),
          expect.objectContaining({ id: 11, name: 'Default Vault', credential_type: 2 }),
        ])
      );
    });
  });
});
