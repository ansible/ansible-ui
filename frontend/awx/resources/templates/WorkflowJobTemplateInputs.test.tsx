import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { WorkflowJobTemplateForm } from '../../interfaces/WorkflowJobTemplate';
import { WorkflowJobTemplateInputs } from './WorkflowJobTemplateInputs';

vi.mock('@ansible/ansible-ui-framework/components/DataEditor', () => ({
  DataEditor: (props: {
    id?: string;
    name: string;
    value: string;
    onChange: (v: string) => void;
  }) => (
    <textarea
      id={props.id ?? props.name}
      name={props.name}
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      data-testid="data-editor"
    />
  ),
}));

vi.mock('../../access/organizations/components/PageFormOrganizationSelect', () => ({
  PageFormSelectOrganization: () => <div data-testid="organization-select" />,
}));

vi.mock('../inventories/components/PageFormInventorySelect', () => ({
  PageFormInventorySelect: () => <div data-testid="inventory-select" />,
}));

vi.mock('./components/WebhookSubForm', () => ({
  WebhookSubForm: () => <div data-testid="webhook-subform" />,
}));

function TestWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm<WorkflowJobTemplateForm>({
    defaultValues: {
      name: '',
      isWebhookEnabled: false,
      allow_simultaneous: false,
    },
  });
  return (
    <MemoryRouter>
      <FormProvider {...methods}>{children}</FormProvider>
    </MemoryRouter>
  );
}

describe('WorkflowJobTemplateInputs', () => {
  it('should render Name label', () => {
    render(
      <TestWrapper>
        <WorkflowJobTemplateInputs />
      </TestWrapper>
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('should render Description label', () => {
    render(
      <TestWrapper>
        <WorkflowJobTemplateInputs />
      </TestWrapper>
    );

    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('should render all form fields', () => {
    render(
      <TestWrapper>
        <WorkflowJobTemplateInputs />
      </TestWrapper>
    );

    expect(screen.getByText('Limit')).toBeInTheDocument();
    expect(screen.getByText('Source control branch')).toBeInTheDocument();
    expect(screen.getByText('Labels')).toBeInTheDocument();
    expect(screen.getByText('Job tags')).toBeInTheDocument();
    expect(screen.getByText('Skip tags')).toBeInTheDocument();
    expect(screen.getByText('Extra variables')).toBeInTheDocument();
  });

  it('should render Options section with checkboxes', () => {
    render(
      <TestWrapper>
        <WorkflowJobTemplateInputs />
      </TestWrapper>
    );

    expect(screen.getByText('Options')).toBeInTheDocument();
    expect(screen.getByText('Enable webhook')).toBeInTheDocument();
    expect(screen.getByText('Enable concurrent jobs')).toBeInTheDocument();
  });

  it('should render with workflow template data', () => {
    const workflowJobTemplate = {
      id: 1,
      name: 'Test Workflow',
      job_tags: ['tag1', 'tag2'],
      skip_tags: ['skip1'],
    } as unknown as WorkflowJobTemplateForm;

    render(
      <TestWrapper>
        <WorkflowJobTemplateInputs workflowJobTemplate={workflowJobTemplate} />
      </TestWrapper>
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
  });
});
