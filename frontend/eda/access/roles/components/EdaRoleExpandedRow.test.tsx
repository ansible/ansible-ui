/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { edaAPI } from '../../../common/eda-utils';
import { EdaRbacRole } from '../../../interfaces/EdaRbacRole';
import { EdaRoleExpandedRow } from './EdaRoleExpandedRow';

const mockRoleDetails: EdaRbacRole = {
  id: 5,
  name: 'Project Admin',
  description: 'Full access to projects',
  managed: false,
  content_type: 'eda.project',
  permissions: ['eda.view_project', 'eda.change_project', 'eda.delete_project'],
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-01T00:00:00Z',
  summary_fields: {},
} as unknown as EdaRbacRole;

const server = setupServer(
  http.get(edaAPI`/role_definitions/5/`, () => HttpResponse.json(mockRoleDetails))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('EdaRoleExpandedRow', () => {
  it('should render expandable row content before data loads', () => {
    server.use(
      http.get(edaAPI`/role_definitions/99/`, async () => {
        await new Promise(() => {});
        return HttpResponse.json(mockRoleDetails);
      })
    );

    const role = { id: 99, name: 'Pending Role' } as EdaRbacRole;

    const { container } = render(
      <MemoryRouter>
        <table>
          <tbody>
            <tr>
              <td>
                <EdaRoleExpandedRow role={role} />
              </td>
            </tr>
          </tbody>
        </table>
      </MemoryRouter>
    );

    expect(container.querySelector('.pf-v6-c-table__expandable-row-content')).toBeInTheDocument();
    expect(screen.queryByTestId('permissions-description-list')).not.toBeInTheDocument();
  });

  it('should render permissions when data loads', async () => {
    const role = { id: 5, name: 'Project Admin' } as EdaRbacRole;

    render(
      <MemoryRouter>
        <table>
          <tbody>
            <tr>
              <td>
                <EdaRoleExpandedRow role={role} />
              </td>
            </tr>
          </tbody>
        </table>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('permissions-description-list')).toBeInTheDocument();
    });
  });
});
