import { render as rtlRender, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import type React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Token } from '../../../interfaces/Token';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { useApiTokenColumns } from './useApiTokenColumns';

const mockGetPageUrl = vi.fn();

vi.mock('@ansible/common-ui/columns', () => ({
  useCreatedColumn: () => ({ header: 'Created', id: 'created' }),
  useModifiedColumn: () => ({ header: 'Modified', id: 'modified' }),
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useGetPageUrl: () => mockGetPageUrl,
  };
});

const sampleToken: Token = {
  id: 5,
  type: 'o_auth2_access_token',
  url: '/api/gateway/v1/tokens/5/',
  token: 'secret',
  description: '',
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-01T00:00:00Z',
  user: 2,
  application: 3,
  scope: 'write',
  expires: '2025-01-01T00:00:00Z',
  last_used: '2024-06-01T00:00:00Z',
  summary_fields: {
    user: { id: 2, username: 'alice', first_name: '', last_name: '' },
    application: { id: 3, name: 'My App' },
  },
};

function renderColumns(
  route = '/access/api-tokens',
  options?: { disableLinks?: boolean; disableSort?: boolean }
) {
  return renderHook(() => useApiTokenColumns(options), {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/access/users/:id/api-tokens" element={children} />
          <Route path="*" element={children} />
        </Routes>
      </MemoryRouter>
    ),
  });
}

function columnByHeader(columns: ReturnType<typeof useApiTokenColumns>, header: string) {
  return columns.find((column) => column.header === header);
}

function render(ui: ReactNode) {
  return rtlRender(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('useApiTokenColumns', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPageUrl.mockImplementation((route: string) => `/mock/${route}`);
  });

  it('should define core token columns', () => {
    const { result } = renderColumns();

    expect(result.current.map((column) => column.header)).toEqual(
      expect.arrayContaining([
        'Description',
        'User',
        'Scope',
        'OAuth application',
        'Last used',
        'Expires',
        'Created',
        'Modified',
      ])
    );
  });

  it.each([
    ['read', ['Read']],
    ['write', ['Write']],
    ['custom', ['custom']],
  ] as const)('maps scope value %s', (scope, expected) => {
    const { result } = renderColumns();
    const scopeColumn = columnByHeader(result.current, 'Scope');

    expect(scopeColumn?.value?.({ ...sampleToken, scope })).toEqual(expected);
  });

  it.each([
    ['description text', 'Token label', 'Token label'],
    ['empty description', '', ''],
  ])('uses token description as sortable value (%s)', (_label, description, expected) => {
    const { result } = renderColumns();
    const descriptionColumn = columnByHeader(result.current, 'Description');

    expect(descriptionColumn?.value?.({ ...sampleToken, description })).toBe(expected);
  });

  it.each([
    ['application name', { description: '', applicationName: 'My App' }, 'My App'],
    [
      'personal access token label',
      { description: '', applicationName: undefined },
      'Personal Access Token',
    ],
    [
      'explicit description',
      { description: 'Custom label', applicationName: 'My App' },
      'Custom label',
    ],
  ])('description cell shows %s', (_label, fields, expectedText) => {
    const { result } = renderColumns();
    const descriptionColumn = columnByHeader(result.current, 'Description');
    const token: Token = {
      ...sampleToken,
      description: fields.description,
      summary_fields: {
        user: sampleToken.summary_fields.user,
        application: fields.applicationName
          ? { id: 3, name: fields.applicationName }
          : { id: 0, name: '' },
      },
    };

    const { cell } = descriptionColumn as { cell?: (row: Token) => React.ReactNode };
    const { getByText } = render(<>{cell?.(token)}</>);
    expect(getByText(expectedText)).toBeInTheDocument();
  });

  it('links description to global token page by default', () => {
    const { result } = renderColumns();
    const descriptionColumn = columnByHeader(result.current, 'Description');

    const { cell } = descriptionColumn as { cell?: (row: Token) => React.ReactNode };
    render(<>{cell?.({ ...sampleToken, description: 'Linked token' })}</>);

    expect(mockGetPageUrl).toHaveBeenCalledWith(PlatformRoute.ApiTokenPage, {
      params: { tokenid: '5' },
    });
  });

  it('links description to user token page when user route param is set', () => {
    const { result } = renderColumns('/access/users/2/api-tokens');
    const descriptionColumn = columnByHeader(result.current, 'Description');

    const { cell } = descriptionColumn as { cell?: (row: Token) => React.ReactNode };
    render(<>{cell?.({ ...sampleToken, description: 'User context' })}</>);

    expect(mockGetPageUrl).toHaveBeenCalledWith(PlatformRoute.UserApiTokenPage, {
      params: { id: 2, tokenid: '5' },
    });
  });

  it('omits navigation links when disableLinks is true', () => {
    const { result } = renderColumns('/access/api-tokens', { disableLinks: true });
    const userColumn = columnByHeader(result.current, 'User');

    const { cell } = userColumn as { cell?: (row: Token) => React.ReactNode };
    render(<>{cell?.(sampleToken)}</>);
    expect(mockGetPageUrl).not.toHaveBeenCalled();
  });

  it('clears sort keys when disableSort is true', () => {
    const { result } = renderColumns('/access/api-tokens', { disableSort: true });

    expect(columnByHeader(result.current, 'Description')?.sort).toBeUndefined();
    expect(columnByHeader(result.current, 'Scope')?.sort).toBeUndefined();
    expect(columnByHeader(result.current, 'Last used')?.sort).toBeUndefined();
    expect(columnByHeader(result.current, 'Expires')?.sort).toBeUndefined();
  });

  it('maps user, application, and datetime fields', () => {
    const { result } = renderColumns();

    expect(columnByHeader(result.current, 'User')?.value?.(sampleToken)).toBe('alice');
    expect(columnByHeader(result.current, 'OAuth application')?.value?.(sampleToken)).toBe(
      'My App'
    );
    expect(columnByHeader(result.current, 'Last used')?.value?.(sampleToken)).toBe(
      '2024-06-01T00:00:00Z'
    );
    expect(columnByHeader(result.current, 'Expires')?.value?.(sampleToken)).toBe(
      '2025-01-01T00:00:00Z'
    );
  });
});
