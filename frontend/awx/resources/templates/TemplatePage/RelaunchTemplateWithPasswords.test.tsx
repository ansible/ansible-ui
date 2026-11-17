import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { RelaunchTemplate } from './RelaunchTemplateWithPasswords';

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    usePageAlertToaster: () => ({ addAlert: vi.fn() }),
    useGetPageUrl: () => () => '/',
    PageFormTextInput: ({ label, id }: { label: string; id: string }) => (
      <label htmlFor={id}>{label}</label>
    ),
  };
});

vi.mock('../../../views/jobs/useGetJobOutputUrl', () => ({
  useGetJobOutputUrl: () => () => '/jobs/1/output',
}));

const server = setupServer(
  http.get(awxAPI`/jobs/:id/relaunch/`, () =>
    HttpResponse.json({
      passwords_needed_to_start: ['ssh_password'],
      retry_counts: { all: 0, failed: 0 },
    })
  ),
  http.get(awxAPI`/jobs/:id/`, () =>
    HttpResponse.json({
      id: 1,
      name: 'Demo Job',
      summary_fields: { credentials: [] },
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('RelaunchTemplate', () => {
  it('renders relaunch wizard with credential passwords step', async () => {
    render(
      <MemoryRouter initialEntries={['/jobs/1/relaunch']}>
        <Routes>
          <Route path="/jobs/:id/relaunch" element={<RelaunchTemplate />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Relaunch job with passwords' })
      ).toBeInTheDocument()
    );
    expect(screen.getAllByText('Credential Passwords').length).toBeGreaterThan(0);
    expect(screen.getByText('SSH password')).toBeInTheDocument();
  });
});
