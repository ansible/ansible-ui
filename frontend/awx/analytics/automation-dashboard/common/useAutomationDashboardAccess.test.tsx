import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { ReactNode } from 'react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { SWRConfig } from 'swr';
import {
  getCanSaveReports,
  getDashboardSettingsOrganization,
  useAutomationDashboardAccess,
} from './useAutomationDashboardAccess';
import { metricsAPI } from '../../../common/api/metrics-utils';
import { IAutomationDashboardAccess } from '../types';

const accessFixture: IAutomationDashboardAccess = {
  scope: 'organization',
  dashboard_enabled: true,
  organizations: [
    { id: 1, name: 'Org 1', can_edit: true },
    { id: 2, name: 'Org 2', can_edit: false },
  ],
};

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{ dedupingInterval: 0, provider: () => new Map(), shouldRetryOnError: false }}
    >
      {children}
    </SWRConfig>
  );
}

describe('useAutomationDashboardAccess', () => {
  test('should load organization access from the metrics API', async () => {
    server.use(
      http.get(metricsAPI`/dashboard_reports/access/`, () => HttpResponse.json(accessFixture))
    );

    const { result } = renderHook(() => useAutomationDashboardAccess(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.access).toEqual(accessFixture));
    expect(result.current.error).toBeUndefined();
  });
});

describe('getCanSaveReports', () => {
  const allEditableAccess: IAutomationDashboardAccess = {
    scope: 'organization',
    dashboard_enabled: true,
    organizations: [
      { id: 1, name: 'Org 1', can_edit: true },
      { id: 2, name: 'Org 2', can_edit: true },
    ],
  };

  test('should allow platform superusers', () => {
    expect(getCanSaveReports(accessFixture, {}, true, false)).toBe(true);
  });

  test('should deny platform auditors', () => {
    expect(getCanSaveReports(accessFixture, {}, true, true)).toBe(false);
  });

  test('should deny global scope for non-superusers', () => {
    expect(getCanSaveReports({ ...accessFixture, scope: 'global' }, {}, false, false)).toBe(false);
  });

  test('should deny when the caller has only view-only organizations', () => {
    expect(getCanSaveReports(accessFixture, {}, false, false)).toBe(false);
  });

  test('should allow a report scoped to a single editable organization', () => {
    expect(getCanSaveReports(accessFixture, { organization: ['1'] }, false, false)).toBe(true);
  });

  test('should deny a report scoped to a view-only organization', () => {
    expect(getCanSaveReports(accessFixture, { organization: ['2'] }, false, false)).toBe(false);
  });

  test('should deny a report scoped to a mix of editable and view-only organizations', () => {
    expect(getCanSaveReports(accessFixture, { organization: ['1', '2'] }, false, false)).toBe(
      false
    );
  });

  test('should allow an all-organization report when every organization is editable', () => {
    expect(getCanSaveReports(allEditableAccess, {}, false, false)).toBe(true);
  });

  test('should deny an organization that is not visible to the caller', () => {
    expect(getCanSaveReports(accessFixture, { organization: ['999'] }, false, false)).toBe(false);
  });
});

describe('getDashboardSettingsOrganization', () => {
  test('should select the only authorized organization when no organization filter is set', () => {
    const singleOrganizationAccess: IAutomationDashboardAccess = {
      scope: 'organization',
      dashboard_enabled: true,
      organizations: [accessFixture.organizations[0]],
    };

    expect(getDashboardSettingsOrganization(singleOrganizationAccess, {})).toEqual(
      accessFixture.organizations[0]
    );
  });

  test('should return the selected authorized organization and its edit capability', () => {
    expect(getDashboardSettingsOrganization(accessFixture, { organization: ['2'] })).toEqual(
      accessFixture.organizations[1]
    );
  });

  test('should not choose a settings organization for multiple selections', () => {
    expect(
      getDashboardSettingsOrganization(accessFixture, { organization: ['1', '2'] })
    ).toBeUndefined();
  });

  test('should ignore an organization that is not in the access response', () => {
    expect(
      getDashboardSettingsOrganization(accessFixture, { organization: ['3'] })
    ).toBeUndefined();
  });
});
