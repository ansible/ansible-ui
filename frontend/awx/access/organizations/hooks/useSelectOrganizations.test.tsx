import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePageDialog } from '@ansible/ansible-ui-framework';
import { awxAPI } from '../../../common/api/awx-utils';
import { Organization } from '../../../interfaces/Organization';
import { useSelectOrganizations } from './useSelectOrganizations';

vi.mock('@ansible/ansible-ui-framework', async () => ({
  ...(await vi.importActual('@ansible/ansible-ui-framework')),
  usePageDialog: vi.fn(),
}));

const server = setupServer(
  http.options(awxAPI`/organizations/`, () => HttpResponse.json({ actions: { GET: {} } })),
  http.get(awxAPI`/organizations/`, () =>
    HttpResponse.json({
      count: 1,
      results: [{ id: 1, name: 'Default', type: 'organization' }],
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useSelectOrganizations', () => {
  const setDialog = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePageDialog).mockReturnValue([null, setDialog]);
  });

  it('opens organization multi-select dialog and forwards selection', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useSelectOrganizations());
    result.current('Choose organizations', onSelect);

    const dialogElement: unknown = setDialog.mock.calls[0]?.[0];
    expect(React.isValidElement(dialogElement)).toBe(true);
    if (!React.isValidElement(dialogElement)) {
      throw new Error('expected dialog element');
    }
    const props = dialogElement.props as {
      title: string;
      onSelect: (organizations: Organization[]) => void;
    };
    expect(props.title).toBe('Choose organizations');
    props.onSelect([{ id: 2, name: 'Acme' } as Organization]);
    expect(onSelect).toHaveBeenCalledWith([{ id: 2, name: 'Acme' }]);
  });

  it('renders organization multi-select dialog content', async () => {
    const { result } = renderHook(() => useSelectOrganizations());
    result.current('Pick orgs', vi.fn());
    const dialogElement: unknown = setDialog.mock.calls[0]?.[0];
    if (!React.isValidElement(dialogElement)) {
      throw new Error('expected dialog element');
    }

    render(<MemoryRouter>{dialogElement}</MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText('Default')).toBeInTheDocument();
    });
  });
});
