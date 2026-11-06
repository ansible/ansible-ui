import { renderHook } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import { Application } from '@ansible/awx-ui/interfaces/Application';
import { useOAuthApplicationColumns } from './useOAuthApplicationColumns';

function renderColumns() {
  return renderHook(() => useOAuthApplicationColumns(), {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={['/applications']}>
        <Routes>
          <Route path="*" element={children} />
        </Routes>
      </MemoryRouter>
    ),
  });
}

const sampleApp: Application = {
  id: 3,
  name: 'App',
  app_url: 'https://app.example.com',
  url: '/apps/3/',
  client_type: 'confidential',
  organization: 1,
  type: 'o_auth2_application',
  created: '',
  modified: '',
  summary_fields: {
    user_capabilities: { edit: true, delete: true },
    organization: { id: 1, name: 'O', description: '' },
  },
};

describe('useOAuthApplicationColumns', () => {
  test('includes URL column with app_url value', () => {
    const { result } = renderColumns();
    const urlCol = result.current.find((c) => c.header === 'URL');
    expect(urlCol?.type).toBe('text');
    expect(urlCol?.value?.(sampleApp)).toBe('https://app.example.com');
  });
});
