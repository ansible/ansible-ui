import { renderHook } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import { Token } from '../../../interfaces/Token';
import { useApiTokenColumns } from './useApiTokenColumns';

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
  last_used: null,
  summary_fields: {
    user: { id: 2, username: 'alice', first_name: '', last_name: '' },
    application: { id: 3, name: 'My App' },
  },
};

function renderColumns(route = '/access/api-tokens') {
  return renderHook(() => useApiTokenColumns(), {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="*" element={children} />
        </Routes>
      </MemoryRouter>
    ),
  });
}

describe('useApiTokenColumns', () => {
  test('should define description, user, scope, and expiry columns', () => {
    const { result } = renderColumns();

    expect(result.current.map((column) => column.header)).toEqual(
      expect.arrayContaining(['Description', 'User', 'Scope', 'Expires'])
    );
  });

  test('should map scope values for read and write tokens', () => {
    const { result } = renderColumns();
    const scopeColumn = result.current.find((column) => column.header === 'Scope');

    expect(scopeColumn?.value?.({ ...sampleToken, scope: 'read' })).toEqual(['Read']);
    expect(scopeColumn?.value?.({ ...sampleToken, scope: 'write' })).toEqual(['Write']);
    expect(scopeColumn?.value?.({ ...sampleToken, scope: 'custom' })).toEqual(['custom']);
  });

  test('should use token description as the sortable value', () => {
    const { result } = renderColumns();
    const descriptionColumn = result.current.find((column) => column.header === 'Description');

    expect(descriptionColumn?.value?.({ ...sampleToken, description: 'Token label' })).toBe(
      'Token label'
    );
    expect(descriptionColumn?.value?.({ ...sampleToken, description: '' })).toBe('');
  });
});
