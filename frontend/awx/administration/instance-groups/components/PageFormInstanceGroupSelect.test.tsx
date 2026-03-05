/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { PageFormInstanceGroupSelect } from './PageFormInstanceGroupSelect';

const instanceGroupsResponse = {
  count: 0,
  results: [],
  next: null,
  previous: null,
};

const server = setupServer(
  http.options(awxAPI`/instance_groups/`, () => HttpResponse.json({ actions: { GET: {} } })),
  http.get(
    ({ request }) =>
      request.url.includes('/instance_groups/') && !request.url.includes('/instance_groups/1/'),
    () => HttpResponse.json(instanceGroupsResponse)
  )
);

function TestWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm();
  return (
    <MemoryRouter>
      <FormProvider {...methods}>{children}</FormProvider>
    </MemoryRouter>
  );
}

describe('PageFormInstanceGroupSelect', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  beforeEach(() => {
    server.use(
      http.options(awxAPI`/instance_groups/`, () => HttpResponse.json({ actions: { GET: {} } })),
      http.get(
        ({ request }) =>
          request.url.includes('/instance_groups/') && !request.url.includes('/instance_groups/1/'),
        () => HttpResponse.json(instanceGroupsResponse)
      )
    );
  });

  it('should render with Instance groups label', async () => {
    render(
      <TestWrapper>
        <PageFormInstanceGroupSelect name="instance_groups" labelHelp="Select instance groups" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Instance groups')).toBeInTheDocument();
    });
  });

  it('should render with Select instance groups placeholder', async () => {
    render(
      <TestWrapper>
        <PageFormInstanceGroupSelect name="instance_groups" labelHelp="Select instance groups" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Select instance groups')).toBeInTheDocument();
    });
  });
});
