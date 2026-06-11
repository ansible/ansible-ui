/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { ManagementJobsRetainDataModal } from './ManagementJobsRetainDataModal';

vi.mock('@patternfly/react-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@patternfly/react-core')>();
  return {
    ...actual,
    Modal: ({
      children,
      onClose,
      ...props
    }: {
      children: ReactNode;
      onClose: () => void;
      'aria-label'?: string;
    }) => (
      <dialog aria-label={props['aria-label']} data-testid="modal" open>
        <button type="button" aria-label="Close" onClick={onClose} />
        {children}
      </dialog>
    ),
  };
});

const mockLaunchResponse = {
  id: 1,
  type: 'management_job',
  name: 'Cleanup Job Details',
  status: 'pending',
};

const server = setupServer(
  http.post(awxAPI`/system_job_templates/1/launch/`, () => HttpResponse.json(mockLaunchResponse))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ManagementJobsRetainDataModal', () => {
  const mockPopDialog = vi.fn();

  test('should render modal content', () => {
    render(
      <MemoryRouter>
        <ManagementJobsRetainDataModal id={1} popDialog={mockPopDialog} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });
});
