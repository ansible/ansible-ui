/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { LaunchConfiguration } from '../../../../interfaces/LaunchConfiguration';
import type { JobTemplate } from '../../../../interfaces/JobTemplate';
import type { WizardFormValues } from '../types';
import { NodePromptsStep } from './NodePromptsStep';

vi.mock('../../JobTemplateFormHelpers', () => ({
  parseStringToTagArray: (val: string | undefined) =>
    val ? val.split(',').map((t) => ({ name: t.trim() })) : [],
}));

vi.mock('@ansible/ansible-ui-framework/utils/codeEditorUtils', () => ({
  yamlToJson: vi.fn((val: string) => val),
}));

vi.mock('../../../../../../framework/components/DataEditor', () => ({
  DataEditor: ({ name }: Readonly<{ name: string }>) => (
    <div data-testid={`mock-data-editor-${name}`}>DataEditor</div>
  ),
}));

vi.mock('../../../../access/credentials/components/PageFormCredentialSelect', () => ({
  PageFormCredentialSelect: () => <div data-testid="mock-credential-select">Credentials</div>,
}));

vi.mock(
  '../../../../administration/execution-environments/components/PageFormSelectExecutionEnvironment',
  () => ({
    PageFormSelectExecutionEnvironment: () => (
      <div data-testid="mock-ee-select">Execution Environment</div>
    ),
  })
);

vi.mock(
  '../../../../administration/instance-groups/components/PageFormInstanceGroupSelect',
  () => ({
    PageFormInstanceGroupSelect: () => <div data-testid="mock-ig-select">Instance Groups</div>,
  })
);

vi.mock('../../../../common/PageFormLabelSelect', () => ({
  PageFormLabelSelect: () => <div data-testid="mock-label-select">Labels</div>,
}));

vi.mock('../../../inventories/components/PageFormInventorySelect', () => ({
  PageFormInventorySelect: () => <div data-testid="mock-inventory-select">Inventory</div>,
}));

const baseTemplate: JobTemplate = {
  id: 1,
  name: 'Test Job Template',
  type: 'job_template',
  organization: 1,
} as JobTemplate;

function createLaunchConfig(overrides: Partial<LaunchConfiguration> = {}): LaunchConfiguration {
  return {
    can_start_without_user_input: true,
    passwords_needed_to_start: [],
    ask_scm_branch_on_launch: false,
    ask_variables_on_launch: false,
    ask_tags_on_launch: false,
    ask_diff_mode_on_launch: false,
    ask_skip_tags_on_launch: false,
    ask_job_type_on_launch: false,
    ask_limit_on_launch: false,
    ask_verbosity_on_launch: false,
    ask_inventory_on_launch: false,
    ask_credential_on_launch: false,
    ask_execution_environment_on_launch: false,
    ask_labels_on_launch: false,
    ask_forks_on_launch: false,
    ask_job_slice_count_on_launch: false,
    ask_timeout_on_launch: false,
    ask_instance_groups_on_launch: false,
    survey_enabled: false,
    variables_needed_to_start: [],
    credential_needed_to_start: false,
    inventory_needed_to_start: false,
    credential_passwords: {} as LaunchConfiguration['credential_passwords'],
    defaults: {} as LaunchConfiguration['defaults'],
    job_template_data: { name: 'Test', id: 1, description: '' },
    unified_job_template_object: {
      name: 'Test',
      id: 1,
      description: '',
      survey_enabled: false,
    },
    ...overrides,
  };
}

function TestWrapper({
  defaultValues,
  preventCredentialsThatNeedPasswordsOnLaunch,
}: Readonly<{
  defaultValues: Partial<WizardFormValues>;
  preventCredentialsThatNeedPasswordsOnLaunch?: boolean;
}>) {
  const methods = useForm<WizardFormValues>({ defaultValues });
  return (
    <MemoryRouter>
      <FormProvider {...methods}>
        <NodePromptsStep
          preventCredentialsThatNeedPasswordsOnLaunch={preventCredentialsThatNeedPasswordsOnLaunch}
        />
      </FormProvider>
    </MemoryRouter>
  );
}

describe('NodePromptsStep', () => {
  it('should return null when launch_config is missing', () => {
    const { container } = render(
      <TestWrapper
        defaultValues={{
          resource: baseTemplate,
          launch_config: null,
        }}
      />
    );

    expect(container.innerHTML).toBe('');
  });

  it('should return null when resource is missing', () => {
    const { container } = render(
      <TestWrapper
        defaultValues={{
          resource: null,
          launch_config: createLaunchConfig(),
        }}
      />
    );

    expect(container.innerHTML).toBe('');
  });

  it('should show inventory field when ask_inventory_on_launch is true', () => {
    render(
      <TestWrapper
        defaultValues={{
          resource: baseTemplate,
          launch_config: createLaunchConfig({
            ask_inventory_on_launch: true,
          }),
        }}
      />
    );

    expect(screen.getByTestId('mock-inventory-select')).toBeInTheDocument();
  });

  it('should show credential field when ask_credential_on_launch is true', () => {
    render(
      <TestWrapper
        defaultValues={{
          resource: baseTemplate,
          launch_config: createLaunchConfig({
            ask_credential_on_launch: true,
          }),
        }}
      />
    );

    expect(screen.getByTestId('mock-credential-select')).toBeInTheDocument();
  });

  it('should show job type field when ask_job_type_on_launch is true', () => {
    render(
      <TestWrapper
        defaultValues={{
          resource: baseTemplate,
          launch_config: createLaunchConfig({
            ask_job_type_on_launch: true,
          }),
        }}
      />
    );

    expect(screen.getByText('Job type')).toBeInTheDocument();
  });

  it('should show limit field when ask_limit_on_launch is true', () => {
    render(
      <TestWrapper
        defaultValues={{
          resource: baseTemplate,
          launch_config: createLaunchConfig({
            ask_limit_on_launch: true,
          }),
        }}
      />
    );

    expect(screen.getByText('Limit')).toBeInTheDocument();
  });

  it('should show scm_branch field when ask_scm_branch_on_launch is true', () => {
    render(
      <TestWrapper
        defaultValues={{
          resource: baseTemplate,
          launch_config: createLaunchConfig({
            ask_scm_branch_on_launch: true,
          }),
        }}
      />
    );

    expect(screen.getByText('Source control branch')).toBeInTheDocument();
  });

  it('should show verbosity field when ask_verbosity_on_launch is true', () => {
    render(
      <TestWrapper
        defaultValues={{
          resource: baseTemplate,
          launch_config: createLaunchConfig({
            ask_verbosity_on_launch: true,
          }),
        }}
      />
    );

    expect(screen.getByText('Verbosity')).toBeInTheDocument();
  });

  it('should show diff_mode switch when ask_diff_mode_on_launch is true', () => {
    render(
      <TestWrapper
        defaultValues={{
          resource: baseTemplate,
          launch_config: createLaunchConfig({
            ask_diff_mode_on_launch: true,
          }),
        }}
      />
    );

    expect(screen.getByText('Show changes')).toBeInTheDocument();
  });

  it('should show forks field when ask_forks_on_launch is true', () => {
    render(
      <TestWrapper
        defaultValues={{
          resource: baseTemplate,
          launch_config: createLaunchConfig({
            ask_forks_on_launch: true,
          }),
        }}
      />
    );

    expect(screen.getByText('Forks')).toBeInTheDocument();
  });

  it('should show job tags when ask_tags_on_launch is true', () => {
    render(
      <TestWrapper
        defaultValues={{
          resource: baseTemplate,
          launch_config: createLaunchConfig({
            ask_tags_on_launch: true,
          }),
        }}
      />
    );

    expect(screen.getByText('Job tags')).toBeInTheDocument();
  });

  it('should show skip tags when ask_skip_tags_on_launch is true', () => {
    render(
      <TestWrapper
        defaultValues={{
          resource: baseTemplate,
          launch_config: createLaunchConfig({
            ask_skip_tags_on_launch: true,
          }),
        }}
      />
    );

    expect(screen.getByText('Skip tags')).toBeInTheDocument();
  });

  it('should show execution environment when ask_execution_environment_on_launch is true', () => {
    render(
      <TestWrapper
        defaultValues={{
          resource: baseTemplate,
          launch_config: createLaunchConfig({
            ask_execution_environment_on_launch: true,
          }),
        }}
      />
    );

    expect(screen.getByTestId('mock-ee-select')).toBeInTheDocument();
  });

  it('should show instance groups when ask_instance_groups_on_launch is true', () => {
    render(
      <TestWrapper
        defaultValues={{
          resource: baseTemplate,
          launch_config: createLaunchConfig({
            ask_instance_groups_on_launch: true,
          }),
        }}
      />
    );

    expect(screen.getByTestId('mock-ig-select')).toBeInTheDocument();
  });

  it('should show labels when ask_labels_on_launch is true', () => {
    render(
      <TestWrapper
        defaultValues={{
          resource: baseTemplate,
          launch_config: createLaunchConfig({
            ask_labels_on_launch: true,
          }),
        }}
      />
    );

    expect(screen.getByTestId('mock-label-select')).toBeInTheDocument();
  });

  it('should show variables editor when ask_variables_on_launch is true', () => {
    render(
      <TestWrapper
        defaultValues={{
          resource: baseTemplate,
          launch_config: createLaunchConfig({
            ask_variables_on_launch: true,
          }),
        }}
      />
    );

    expect(screen.getByText('Variables')).toBeInTheDocument();
  });

  it('should show timeout field when ask_timeout_on_launch is true', () => {
    render(
      <TestWrapper
        defaultValues={{
          resource: baseTemplate,
          launch_config: createLaunchConfig({
            ask_timeout_on_launch: true,
          }),
        }}
      />
    );

    expect(screen.getByText('Timeout')).toBeInTheDocument();
  });

  it('should show job slicing field when ask_job_slice_count_on_launch is true', () => {
    render(
      <TestWrapper
        defaultValues={{
          resource: baseTemplate,
          launch_config: createLaunchConfig({
            ask_job_slice_count_on_launch: true,
          }),
        }}
      />
    );

    expect(screen.getByText('Job slicing')).toBeInTheDocument();
  });

  it('should hide all prompt fields when no ask_* flags are true', () => {
    render(
      <TestWrapper
        defaultValues={{
          resource: baseTemplate,
          launch_config: createLaunchConfig(),
        }}
      />
    );

    expect(screen.queryByTestId('mock-inventory-select')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-credential-select')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-ee-select')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-ig-select')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-label-select')).not.toBeInTheDocument();
    expect(screen.queryByText('Job type')).not.toBeInTheDocument();
    expect(screen.queryByText('Limit')).not.toBeInTheDocument();
    expect(screen.queryByText('Source control branch')).not.toBeInTheDocument();
    expect(screen.queryByText('Verbosity')).not.toBeInTheDocument();
    expect(screen.queryByText('Show changes')).not.toBeInTheDocument();
    expect(screen.queryByText('Forks')).not.toBeInTheDocument();
    expect(screen.queryByText('Job tags')).not.toBeInTheDocument();
    expect(screen.queryByText('Skip tags')).not.toBeInTheDocument();
    expect(screen.queryByText('Variables')).not.toBeInTheDocument();
    expect(screen.queryByText('Timeout')).not.toBeInTheDocument();
    expect(screen.queryByText('Job slicing')).not.toBeInTheDocument();
  });

  it('should show multiple fields when multiple ask_* flags are true', () => {
    render(
      <TestWrapper
        defaultValues={{
          resource: baseTemplate,
          launch_config: createLaunchConfig({
            ask_inventory_on_launch: true,
            ask_credential_on_launch: true,
            ask_limit_on_launch: true,
            ask_diff_mode_on_launch: true,
          }),
        }}
      />
    );

    expect(screen.getByTestId('mock-inventory-select')).toBeInTheDocument();
    expect(screen.getByTestId('mock-credential-select')).toBeInTheDocument();
    expect(screen.getByText('Limit')).toBeInTheDocument();
    expect(screen.getByText('Show changes')).toBeInTheDocument();
    expect(screen.queryByText('Forks')).not.toBeInTheDocument();
    expect(screen.queryByText('Verbosity')).not.toBeInTheDocument();
  });
});
