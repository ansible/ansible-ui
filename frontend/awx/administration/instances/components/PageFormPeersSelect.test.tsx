import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { Instance } from '../../../interfaces/Instance';
import { PageFormPeersSelect } from './PageFormPeersSelect';

let capturedValidate: ((value: Instance[]) => string | undefined) | undefined;

vi.mock('@ansible/ansible-ui-framework/PageForm/Inputs/PageFormMultiInput', () => ({
  PageFormMultiInput: ({
    validate,
    label,
    placeholder,
  }: {
    validate?: (value: Instance[]) => string | undefined;
    label?: string;
    placeholder?: string;
  }) => {
    capturedValidate = validate;
    return (
      <div>
        <span>{label}</span>
        <input placeholder={placeholder} readOnly />
      </div>
    );
  },
}));

vi.mock('../hooks/useSelectPeers', () => ({
  useMultiSelectPeer: () => vi.fn(),
}));

function TestWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm();
  return (
    <MemoryRouter>
      <FormProvider {...methods}>{children}</FormProvider>
    </MemoryRouter>
  );
}

describe('PageFormPeersSelect', () => {
  it('should render with Peers label', () => {
    render(
      <TestWrapper>
        <PageFormPeersSelect name="peers" labelHelp="Select peer instances" />
      </TestWrapper>
    );

    expect(screen.getByText('Peers')).toBeInTheDocument();
  });

  it('should render with Select peer placeholder', () => {
    render(
      <TestWrapper>
        <PageFormPeersSelect name="peers" labelHelp="Select peer instances" />
      </TestWrapper>
    );

    expect(screen.getByPlaceholderText('Select peer')).toBeInTheDocument();
  });

  it('validates listener_port for single and multiple peers', () => {
    render(
      <TestWrapper>
        <PageFormPeersSelect name="peers" labelHelp="Select peer instances" />
      </TestWrapper>
    );

    expect(capturedValidate).toBeDefined();
    expect(
      capturedValidate?.([
        { hostname: 'peer-a', listener_port: 27199 },
        { hostname: 'peer-b', listener_port: 27199 },
      ] as Instance[])
    ).toBeUndefined();
    expect(
      capturedValidate?.([{ hostname: 'solo', listener_port: undefined } as unknown as Instance])
    ).toContain('listener_port');
    expect(
      capturedValidate?.([
        { hostname: 'bad-1', listener_port: undefined },
        { hostname: 'bad-2', listener_port: undefined },
      ] as unknown as Instance[])
    ).toContain('bad-1');
  });
});
