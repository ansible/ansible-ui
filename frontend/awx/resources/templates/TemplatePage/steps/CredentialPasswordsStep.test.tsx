import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CredentialPasswordsStep } from './CredentialPasswordsStep';
import type { RelaunchConfig } from '../RelaunchTemplateWithPasswords';

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: () => ({ wizardData: {} }),
}));

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    PageFormTextInput: ({ label, id }: { label: string; id: string }) => (
      <label htmlFor={id}>{label}</label>
    ),
    PageFormGrid: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

describe('CredentialPasswordsStep', () => {
  it.each([
    {
      passwordField: 'ssh_password',
      expectedLabel: 'SSH password',
    },
    {
      passwordField: 'vault_password.prod',
      expectedLabel: 'Vault password | prod',
    },
    {
      passwordField: 'become_password',
      expectedLabel: 'Privilege escalation password',
    },
  ])(
    'renders $expectedLabel when $passwordField is required',
    ({ passwordField, expectedLabel }) => {
      const config: RelaunchConfig = {
        passwords_needed_to_start: [passwordField],
        retry_counts: { all: 0, failed: 0 },
      };

      render(<CredentialPasswordsStep config={config} />);

      expect(screen.getByText(expectedLabel)).toBeInTheDocument();
    }
  );
});
