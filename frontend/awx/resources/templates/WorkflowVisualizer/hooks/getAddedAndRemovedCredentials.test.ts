import { describe, expect, it } from 'vitest';
import { getAddedAndRemovedCredentials, type Credential } from './getAddedAndRemovedCredentials';

const cred = (id: number, credentialType: number, name = `Credential ${id}`): Credential => ({
  id,
  name,
  credential_type: credentialType,
});

describe('getAddedAndRemovedCredentials', () => {
  describe('no changes', () => {
    it('should return empty added/removed when all inputs are empty', () => {
      const { added, removed } = getAddedAndRemovedCredentials([], [], []);
      expect(added).toEqual([]);
      expect(removed).toEqual([]);
    });

    it('should return empty added/removed when prompt matches node credentials', () => {
      const nodeCreds = [cred(1, 1, 'SSH')];
      const promptCreds = [cred(1, 1, 'SSH')];

      const { added, removed } = getAddedAndRemovedCredentials(nodeCreds, promptCreds, []);
      expect(added).toEqual([]);
      expect(removed).toEqual([]);
    });

    it('should return empty added/removed when prompt matches template defaults (no node creds)', () => {
      const templateCreds = [cred(1, 1, 'Template SSH')];
      const promptCreds = [cred(1, 1, 'Template SSH')];

      const { added, removed } = getAddedAndRemovedCredentials([], promptCreds, templateCreds);
      expect(added).toEqual([]);
      expect(removed).toEqual([]);
    });
  });

  describe('adding credentials', () => {
    it('should detect a new credential added by the user', () => {
      const promptCreds = [cred(5, 2, 'New Vault')];

      const { added, removed } = getAddedAndRemovedCredentials([], promptCreds, []);
      expect(added).toEqual([cred(5, 2, 'New Vault')]);
      expect(removed).toEqual([]);
    });

    it('should not add a credential that already exists as a template default', () => {
      const templateCreds = [cred(1, 1, 'Template SSH')];
      const promptCreds = [cred(1, 1, 'Template SSH'), cred(5, 2, 'New Vault')];

      const { added, removed } = getAddedAndRemovedCredentials([], promptCreds, templateCreds);
      expect(added).toEqual([cred(5, 2, 'New Vault')]);
      expect(removed).toEqual([]);
    });

    it('should not add a credential that already exists at node level', () => {
      const nodeCreds = [cred(3, 1, 'Node SSH')];
      const promptCreds = [cred(3, 1, 'Node SSH'), cred(5, 2, 'New Vault')];

      const { added, removed } = getAddedAndRemovedCredentials(nodeCreds, promptCreds, []);
      expect(added).toEqual([cred(5, 2, 'New Vault')]);
      expect(removed).toEqual([]);
    });
  });

  describe('removing credentials', () => {
    it('should detect a node credential removed from prompt', () => {
      const nodeCreds = [cred(3, 1, 'Node SSH')];
      const promptCreds: Credential[] = [];

      const { added, removed } = getAddedAndRemovedCredentials(nodeCreds, promptCreds, []);
      expect(added).toEqual([]);
      expect(removed).toEqual([cred(3, 1, 'Node SSH')]);
    });

    it('should remove multiple node credentials when prompt is empty', () => {
      const nodeCreds = [cred(3, 1, 'Node SSH'), cred(4, 2, 'Node Vault')];

      const { added, removed } = getAddedAndRemovedCredentials(nodeCreds, [], []);
      expect(added).toEqual([]);
      expect(removed).toHaveLength(2);
      expect(removed).toEqual(
        expect.arrayContaining([cred(3, 1, 'Node SSH'), cred(4, 2, 'Node Vault')])
      );
    });

    it('should only remove node credentials not present in prompt (template creds are not removed)', () => {
      const nodeCreds = [cred(3, 1, 'Node SSH')];
      const templateCreds = [cred(1, 2, 'Template Vault')];

      const { added: _added, removed } = getAddedAndRemovedCredentials(
        nodeCreds,
        [],
        templateCreds
      );
      expect(removed).toEqual([cred(3, 1, 'Node SSH')]);
    });
  });

  describe('replacing credentials', () => {
    it('should detect when user replaces a node credential with a different one', () => {
      const nodeCreds = [cred(3, 1, 'Old SSH')];
      const promptCreds = [cred(7, 1, 'New SSH')];

      const { added, removed } = getAddedAndRemovedCredentials(nodeCreds, promptCreds, []);
      expect(added).toEqual([cred(7, 1, 'New SSH')]);
      expect(removed).toEqual([cred(3, 1, 'Old SSH')]);
    });

    it('should handle replacing one credential while keeping another', () => {
      const nodeCreds = [cred(3, 1, 'SSH'), cred(4, 2, 'Vault')];
      const promptCreds = [cred(7, 1, 'New SSH'), cred(4, 2, 'Vault')];

      const { added, removed } = getAddedAndRemovedCredentials(nodeCreds, promptCreds, []);
      expect(added).toEqual([cred(7, 1, 'New SSH')]);
      expect(removed).toEqual([cred(3, 1, 'SSH')]);
    });
  });

  describe('template change scenarios', () => {
    it('should disassociate all node credentials when prompt is empty (template switch to no-prompts)', () => {
      const nodeCreds = [cred(3, 1, 'Node SSH'), cred(4, 2, 'Node Vault'), cred(5, 3, 'Node SCM')];
      const promptCreds: Credential[] = [];
      const templateCreds: Credential[] = [];

      const { added, removed } = getAddedAndRemovedCredentials(
        nodeCreds,
        promptCreds,
        templateCreds
      );
      expect(added).toEqual([]);
      expect(removed).toHaveLength(3);
      expect(removed).toEqual(nodeCreds);
    });

    it('should disassociate node credentials even when new template has its own defaults', () => {
      const nodeCreds = [cred(3, 1, 'Old Template SSH')];
      const promptCreds: Credential[] = [];
      const newTemplateCreds = [cred(10, 1, 'New Template SSH')];

      const { added, removed } = getAddedAndRemovedCredentials(
        nodeCreds,
        promptCreds,
        newTemplateCreds
      );
      expect(removed).toEqual([cred(3, 1, 'Old Template SSH')]);
      expect(added).toEqual([]);
    });

    it('should add and remove correctly when switching to a template with different credential types', () => {
      const nodeCreds = [cred(3, 1, 'SSH from old template')];
      const promptCreds = [cred(10, 5, 'Cloud cred for new template')];
      const newTemplateCreds = [cred(9, 4, 'New template default')];

      const { added, removed } = getAddedAndRemovedCredentials(
        nodeCreds,
        promptCreds,
        newTemplateCreds
      );
      expect(added).toEqual([cred(10, 5, 'Cloud cred for new template')]);
      expect(removed).toEqual([cred(3, 1, 'SSH from old template')]);
    });
  });

  describe('multiple credential types', () => {
    it('should handle complex scenario with adds, removes, and keeps', () => {
      const nodeCreds = [
        cred(1, 1, 'SSH - keep'),
        cred(2, 2, 'Vault - remove'),
        cred(3, 3, 'SCM - replace'),
      ];
      const promptCreds = [
        cred(1, 1, 'SSH - keep'),
        cred(7, 3, 'SCM - new'),
        cred(8, 5, 'Cloud - add'),
      ];
      const templateCreds = [cred(10, 4, 'Template Network')];

      const { added, removed } = getAddedAndRemovedCredentials(
        nodeCreds,
        promptCreds,
        templateCreds
      );

      expect(added).toEqual([cred(7, 3, 'SCM - new'), cred(8, 5, 'Cloud - add')]);
      expect(removed).toEqual([cred(2, 2, 'Vault - remove'), cred(3, 3, 'SCM - replace')]);
    });

    it('should treat same ID in both node and template as existing (not added)', () => {
      const nodeCreds = [cred(1, 1, 'SSH')];
      const templateCreds = [cred(1, 1, 'SSH')];
      const promptCreds = [cred(1, 1, 'SSH')];

      const { added, removed } = getAddedAndRemovedCredentials(
        nodeCreds,
        promptCreds,
        templateCreds
      );
      expect(added).toEqual([]);
      expect(removed).toEqual([]);
    });
  });
});
