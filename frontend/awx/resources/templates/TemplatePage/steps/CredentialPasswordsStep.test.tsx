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
  it('renders SSH password field when relaunch config requires ssh_password', () => {
    const config: RelaunchConfig = {
      passwords_needed_to_start: ['ssh_password'],
      retry_counts: { all: 0, failed: 0 },
    };

    render(<CredentialPasswordsStep config={config} />);

    expect(screen.getByText('SSH password')).toBeInTheDocument();
  });

  it('renders vault password fields for vault_password entries', () => {
    const config: RelaunchConfig = {
      passwords_needed_to_start: ['vault_password.prod'],
      retry_counts: { all: 0, failed: 0 },
    };

    render(<CredentialPasswordsStep config={config} />);

    expect(screen.getByText('Vault password | prod')).toBeInTheDocument();
  });
});
