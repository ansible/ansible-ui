/* eslint-disable @typescript-eslint/no-unsafe-call*/
/* eslint-disable @typescript-eslint/no-unsafe-member-access*/
/* eslint-disable @typescript-eslint/no-unsafe-return*/
/* eslint-disable @typescript-eslint/no-unsafe-assignment*/
import { screen } from '@testing-library/dom';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { JsonBodyType } from 'msw/lib/core/handlers/RequestHandler';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import credentialTypes from './../../../../cypress/fixtures/credentialTypes.json';
import inventories from './../../../../cypress/fixtures/inventory.json';
import { CreateInventorySource } from './InventorySourceForm';
import sourceTypesOptions from './mocks/InventorySourceTypes.json';

export const restHandlers = [
  http.options(awxAPI`/inventory_sources/`, () => {
    return HttpResponse.json(sourceTypesOptions as JsonBodyType);
  }),
  http.get(awxAPI`/inventories/2/`, () => {
    return HttpResponse.json(inventories);
  }),
  http.get(awxAPI`/credential_types/?`, () => {
    return HttpResponse.json(credentialTypes);
  }),
];

describe('CreateInventorySource', () => {
  const server = setupServer(...restHandlers);
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  beforeEach(() => {
    vi.mock('@ansible/ansible-ui-framework/components/DataEditor', () => {
      const FakeDataEditor = vi.fn((props: Record<string, string | (() => void)>) => (
        <textarea
          id={props.id as string}
          name={props.id as string}
          value={props.value as string}
          onChange={props.onChange as () => void}
          className={props.className as string}
          onFocus={props.onFocus as () => void}
          onBlur={props.onBlur as () => void}
        />
      ));
      return { DataEditor: FakeDataEditor };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    server.resetHandlers();
  });

  test('should list the VMWare ESXI source type', async () => {
    const { getAllByRole } = render(
      <MemoryRouter initialEntries={['/infrastructure/inventories/inventory/2/sources/add']}>
        <Routes>
          <Route
            path={`/infrastructure/inventories/inventory/:id/sources/add`}
            element={<CreateInventorySource />}
          />
        </Routes>
      </MemoryRouter>
    );

    const user = userEvent.setup();

    await waitFor(
      () => {
        const sourceButtons = getAllByRole('button');
        expect(sourceButtons.length).toBeGreaterThan(1);
      },
      { timeout: 10000 }
    );

    const sourceButtons = getAllByRole('button');
    await user.click(sourceButtons[1]);

    await waitFor(
      () => {
        expect(screen.getByText('VMware ESXi')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  }, 15000);
});
