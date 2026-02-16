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
});
