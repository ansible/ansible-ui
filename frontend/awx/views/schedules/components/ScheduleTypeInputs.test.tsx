import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { FormProvider, useForm } from 'react-hook-form';
import { ScheduleTypeInputs } from './ScheduleTypeInputs';
import { ScheduleFormWizard } from '../types';

const { useParams } = vi.hoisted(() => ({ useParams: vi.fn() }));

vi.mock('react-router-dom', () => ({
  useParams: useParams,
}));

vi.mock('../../../administration/management-jobs/components/PageFormManagementJobsSelect', () => ({
  PageFormManagementJobsSelect: ({ name }: { name: string }) => (
    <div data-testid="management-job-select">{name}</div>
  ),
}));

vi.mock('../../../resources/inventories/components/PageFormInventorySelect', () => ({
  PageFormInventorySelect: ({ name }: { name: string }) => (
    <div data-testid="inventory-select">{name}</div>
  ),
}));

vi.mock('../../../resources/inventories/components/PageFormInventorySourceSelect', () => ({
  PageFormInventorySourceSelect: ({ name, inventoryId }: { name: string; inventoryId: number }) => (
    <div data-testid="inventory-source-select">
      {name}-{inventoryId}
    </div>
  ),
}));

vi.mock('../../../resources/projects/components/PageFormProjectSelect', () => ({
  PageFormProjectSelect: ({ name }: { name: string }) => (
    <div data-testid="project-select">{name}</div>
  ),
}));

vi.mock('../../../resources/templates/components/PageFormJobTemplateSelect', () => ({
  PageFormJobTemplateSelect: ({ name }: { name: string }) => (
    <div data-testid="job-template-select">{name}</div>
  ),
}));

vi.mock('../../../resources/templates/components/PageFormWorkflowJobTemplateSelect', () => ({
  PageFormWorkflowJobTemplateSelect: ({ name }: { name: string }) => (
    <div data-testid="workflow-job-template-select">{name}</div>
  ),
}));

function TestWrapper({
  children,
  defaultValues,
}: {
  children: React.ReactNode;
  defaultValues?: Partial<ScheduleFormWizard>;
}) {
  const methods = useForm<ScheduleFormWizard>({
    defaultValues: {
      schedule_type: '',
      resourceId: null,
      resourceInventory: undefined,
      ...defaultValues,
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('ScheduleTypeInputs', () => {
  beforeEach(() => {
    useParams.mockReturnValue({});
  });

  it('renders resource type select dropdown', () => {
    render(
      <TestWrapper>
        <ScheduleTypeInputs />
      </TestWrapper>
    );

    expect(screen.getByText('Resource type')).toBeInTheDocument();
  });

  it('renders job template select when schedule_type is job_template', () => {
    render(
      <TestWrapper defaultValues={{ schedule_type: 'job_template' }}>
        <ScheduleTypeInputs />
      </TestWrapper>
    );

    expect(screen.getByTestId('job-template-select')).toBeInTheDocument();
    expect(screen.getByTestId('job-template-select')).toHaveTextContent('resourceId');
  });

  it('renders workflow job template select when schedule_type is workflow_job_template', () => {
    render(
      <TestWrapper defaultValues={{ schedule_type: 'workflow_job_template' }}>
        <ScheduleTypeInputs />
      </TestWrapper>
    );

    expect(screen.getByTestId('workflow-job-template-select')).toBeInTheDocument();
    expect(screen.getByTestId('workflow-job-template-select')).toHaveTextContent('resourceId');
  });

  it('renders project select when schedule_type is project', () => {
    render(
      <TestWrapper defaultValues={{ schedule_type: 'project' }}>
        <ScheduleTypeInputs />
      </TestWrapper>
    );

    expect(screen.getByTestId('project-select')).toBeInTheDocument();
    expect(screen.getByTestId('project-select')).toHaveTextContent('resourceId');
  });

  it('renders management job template select when schedule_type is management_job_template', () => {
    render(
      <TestWrapper defaultValues={{ schedule_type: 'management_job_template' }}>
        <ScheduleTypeInputs />
      </TestWrapper>
    );

    expect(screen.getByTestId('management-job-select')).toBeInTheDocument();
    expect(screen.getByTestId('management-job-select')).toHaveTextContent('resourceId');
  });

  it('renders inventory select when schedule_type is inventory_source', () => {
    render(
      <TestWrapper defaultValues={{ schedule_type: 'inventory_source' }}>
        <ScheduleTypeInputs />
      </TestWrapper>
    );

    expect(screen.getByTestId('inventory-select')).toBeInTheDocument();
    expect(screen.getByTestId('inventory-select')).toHaveTextContent('resourceInventory');
  });

  it('renders inventory source select when inventory is selected for inventory_source type', () => {
    render(
      <TestWrapper
        defaultValues={{
          schedule_type: 'inventory_source',
          resourceInventory: 123,
        }}
      >
        <ScheduleTypeInputs />
      </TestWrapper>
    );

    expect(screen.getByTestId('inventory-select')).toBeInTheDocument();
    expect(screen.getByTestId('inventory-source-select')).toBeInTheDocument();
    expect(screen.getByTestId('inventory-source-select')).toHaveTextContent('resourceId-123');
  });

  it('does not render inventory source select when no inventory is selected', () => {
    render(
      <TestWrapper defaultValues={{ schedule_type: 'inventory_source' }}>
        <ScheduleTypeInputs />
      </TestWrapper>
    );

    expect(screen.getByTestId('inventory-select')).toBeInTheDocument();
    expect(screen.queryByTestId('inventory-source-select')).not.toBeInTheDocument();
  });

  it('does not render any resource select when schedule_type is empty', () => {
    render(
      <TestWrapper>
        <ScheduleTypeInputs />
      </TestWrapper>
    );

    expect(screen.queryByTestId('job-template-select')).not.toBeInTheDocument();
    expect(screen.queryByTestId('workflow-job-template-select')).not.toBeInTheDocument();
    expect(screen.queryByTestId('project-select')).not.toBeInTheDocument();
    expect(screen.queryByTestId('management-job-select')).not.toBeInTheDocument();
    expect(screen.queryByTestId('inventory-select')).not.toBeInTheDocument();
  });

  it('renders all resource type options in the dropdown', () => {
    render(
      <TestWrapper>
        <ScheduleTypeInputs />
      </TestWrapper>
    );

    const selectElement = screen.getByRole('button', { name: /Resource type/i });
    expect(selectElement).toBeInTheDocument();
  });
});
