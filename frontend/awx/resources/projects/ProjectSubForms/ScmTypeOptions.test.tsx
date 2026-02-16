import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import type { Project, SCMType } from '../../../interfaces/Project';
import { ScmTypeOptions } from './ScmTypeOptions';

function TestWrapper({
  children,
  scm_type = 'git',
}: {
  children: React.ReactNode;
  scm_type?: SCMType;
}) {
  const methods = useForm<Project>({
    defaultValues: {
      scm_type,
    },
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('ScmTypeOptions', () => {
  it('should render Options section', () => {
    render(
      <TestWrapper>
        <ScmTypeOptions />
      </TestWrapper>
    );

    expect(screen.getByText('Options')).toBeInTheDocument();
  });

  it('should render Clean checkbox', () => {
    render(
      <TestWrapper>
        <ScmTypeOptions />
      </TestWrapper>
    );

    expect(screen.getByText('Clean')).toBeInTheDocument();
  });

  it('should render Delete checkbox', () => {
    render(
      <TestWrapper>
        <ScmTypeOptions />
      </TestWrapper>
    );

    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should render Update revision on launch checkbox', () => {
    render(
      <TestWrapper>
        <ScmTypeOptions />
      </TestWrapper>
    );

    expect(screen.getByText('Update revision on launch')).toBeInTheDocument();
  });

  it('should render Allow branch override checkbox when hideAllowOverride is false', () => {
    render(
      <TestWrapper>
        <ScmTypeOptions />
      </TestWrapper>
    );

    expect(screen.getByText('Allow branch override')).toBeInTheDocument();
  });

  it('should not render Allow branch override when hideAllowOverride is true', () => {
    render(
      <TestWrapper>
        <ScmTypeOptions hideAllowOverride />
      </TestWrapper>
    );

    expect(screen.queryByText('Allow branch override')).not.toBeInTheDocument();
  });

  it('should render Track submodules checkbox when scm_type is git', () => {
    render(
      <TestWrapper scm_type="git">
        <ScmTypeOptions />
      </TestWrapper>
    );

    expect(screen.getByText('Track submodules')).toBeInTheDocument();
  });
});
