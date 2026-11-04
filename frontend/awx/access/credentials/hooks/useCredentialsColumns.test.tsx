import { ColumnModalOption, ColumnTableOption } from '@ansible/ansible-ui-framework';
import { renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { Credential } from '../../../interfaces/Credential';
import { useCredentialsColumns } from './useCredentialsColumns';

const server = setupServer(
  http.get(awxAPI`/credential_types/`, () =>
    HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

const credentialWithOrganization = {
  id: 7,
  name: 'Machine credential',
  summary_fields: {
    organization: { id: 7, name: 'Engineering', description: '' },
  },
} as unknown as Credential;

const credentialWithoutOrganization = {
  ...credentialWithOrganization,
  summary_fields: { organization: null },
} as unknown as Credential;

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useCredentialsColumns', () => {
  test('includes Organization as a configurable table column', () => {
    const { result } = renderHook(() => useCredentialsColumns(), { wrapper });

    const headers = result.current.map((column) => column.header);
    const organizationIndex = headers.indexOf('Organization');
    expect(organizationIndex).toBe(headers.indexOf('Description') + 1);
    expect(headers[organizationIndex + 1]).toBe('Credential type');

    const organizationColumn = result.current.find((column) => column.header === 'Organization');
    expect(organizationColumn).toMatchObject({
      table: ColumnTableOption.expanded,
      list: 'hidden',
      card: 'hidden',
      modal: ColumnModalOption.hidden,
      sort: 'organization',
    });
    expect(organizationColumn?.value?.(credentialWithOrganization)).toBe('Engineering');
  });

  test('returns no organization value when a credential has no organization', () => {
    const { result } = renderHook(() => useCredentialsColumns(), { wrapper });
    const organizationColumn = result.current.find((column) => column.header === 'Organization');

    expect(organizationColumn?.value?.(credentialWithoutOrganization)).toBeUndefined();
  });
});
