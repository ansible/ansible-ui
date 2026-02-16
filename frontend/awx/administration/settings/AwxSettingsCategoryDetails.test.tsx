import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AwxSettingsCategoryDetailsPage } from './AwxSettingsCategoryDetails';

const settingsAllData = {
  results: [{ url: '/api/v2/settings/system/', slug: 'system', name: 'System' }],
};

const settingsOptions = {
  actions: {
    GET: {
      EXAMPLE_SETTING: {
        type: 'string',
        label: 'Example',
        category: 'System',
        category_slug: 'system',
        help_text: 'Example setting',
      },
    },
    PUT: {
      EXAMPLE_SETTING: {
        type: 'string',
        label: 'Example',
        category: 'System',
        category_slug: 'system',
        help_text: 'Example setting',
      },
    },
  },
};

const server = setupServer(
  http.options(
    ({ request }) => request.url.includes('/settings/'),
    () => HttpResponse.json(settingsOptions)
  ),
  http.get(
    ({ request }) => request.url.includes('/settings/all/'),
    () => HttpResponse.json(settingsAllData)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AwxSettingsCategoryDetailsPage', () => {
  it('should render settings detail page', async () => {
    render(
      <MemoryRouter initialEntries={['/settings/system']}>
        <Routes>
          <Route
            path="/settings/:categoryId"
            element={<AwxSettingsCategoryDetailsPage categoryId="system" />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toBeInTheDocument();
    });
  });
});
