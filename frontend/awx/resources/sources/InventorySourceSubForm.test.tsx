import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FormProvider, useForm } from 'react-hook-form';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { InventorySourceForm } from '../../interfaces/InventorySource';
import { Project } from '../../interfaces/Project';
import { InventorySourceSubForm } from './InventorySourceSubForm';

vi.mock('../../access/credentials/components/PageFormCredentialSelect', () => ({
  PageFormCredentialSelect: ({ label }: { label: string }) => (
    <div data-testid="credential-select">{label}</div>
  ),
}));

vi.mock('../projects/components/PageFormProjectSelect', () => ({
  PageFormProjectSelect: ({ name }: { name: string }) => (
    <div data-testid="project-select">{name}</div>
  ),
}));

vi.mock('./component/PageFormInventoryFileSelect', () => ({
  PageFormInventoryFileSelect: ({ name }: { name: string }) => (
    <div data-testid="inventory-file-select">{name}</div>
  ),
}));

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

const mockProject: Project = {
  id: 123,
  name: 'Test Project',
  allow_override: false,
  description: '',
  scm_type: 'git',
  type: 'project',
  base_dir: '/tmp/projects',
  summary_fields: {} as Project['summary_fields'],
  related: {} as Project['related'],
} as Project;

const server = setupServer(
  http.get(
    ({ request }) =>
      request.url.includes('/api/v2/projects/123') && !request.url.includes('/inventories/'),
    () => HttpResponse.json(mockProject)
  )
);

function TestWrapper({
  children,
  defaultValues = {},
}: {
  children: React.ReactNode;
  defaultValues?: Partial<InventorySourceForm>;
}) {
  const methods = useForm<InventorySourceForm>({
    defaultValues: {
      source: 'scm',
      source_project: { id: 123 },
      ...defaultValues,
    },
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('InventorySourceSubForm', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it('should render at least one label when source is scm', async () => {
    render(
      <TestWrapper>
        <InventorySourceSubForm sourceTypeValues={['scm']} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Credential')).toBeInTheDocument();
    });
  });

  it('should render Source Details section when source is scm', async () => {
    render(
      <TestWrapper>
        <InventorySourceSubForm sourceTypeValues={['scm']} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Source Details')).toBeInTheDocument();
    });
  });
});
