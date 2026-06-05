/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FormProvider, useForm } from 'react-hook-form';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PageFormInventoryFileSelect } from './PageFormInventoryFileSelect';

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/api/v2/projects/1/inventories/'),
    () => HttpResponse.json(['hosts.yml', 'inventory.ini'])
  )
);

function TestWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm({
    defaultValues: { project: { id: 1 } },
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('PageFormInventoryFileSelect', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render', async () => {
    render(
      <TestWrapper>
        <PageFormInventoryFileSelect watch="project" name="source_path" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Inventory path')).toBeInTheDocument();
    });
  });

  it('should render placeholder', async () => {
    render(
      <TestWrapper>
        <PageFormInventoryFileSelect watch="project" name="source_path" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Select inventory path')).toBeInTheDocument();
    });
  });
});
