import { render, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import userEvent from '@testing-library/user-event';
import { CreateAuthenticatorMapping, EditAuthenticatorMapping } from './AuthenticatorMappingForm';
import authenticator from './mocks/authenticator.json';
import authenticatorMapping from './mocks/authenticatorMapping.json';
import roleDefinitions from './mocks/roleDefinitions.json';

describe('AuthenticatorMappingForm', () => {
  const authMappingAttributesPayload = {
    id: 3,
    name: 'mapping one',
    map_type: 'allow',
    order: 1,
    authenticator: '1',
    triggers: {
      attributes: {
        join_condition: 'or',
        'attribute one': { contains: 'value one' },
        'attribute two': { contains: 'value two' },
      },
    },
    organization: null,
    team: null,
    role: null,
  };
  const server = setupServer(
    http.get(gatewayAPI`/authenticators/1`, () => {
      return HttpResponse.json(authenticator);
    }),
    http.get(gatewayAPI`/authenticators/1`, () => {
      return HttpResponse.json(authenticator);
    }),
    http.get(gatewayAPI`/authenticator_maps/3/`, () => {
      return HttpResponse.json(authenticatorMapping);
    }),
    http.get(gatewayAPI`/authenticator_maps//`, () => {
      return HttpResponse.json(authenticatorMapping);
    }),
    http.get(gatewayAPI`/role_definitions/`, () => {
      return HttpResponse.json(roleDefinitions);
    }),
    http.post(gatewayAPI`/authenticator_maps/`, () => {
      return HttpResponse.json(authMappingAttributesPayload);
    })
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  afterAll(() => server.close());

  beforeEach(() => {
    vi.mock('react-i18next', () => ({
      useTranslation: () => {
        return {
          t: (str: string) => str,
          i18n: {
            changeLanguage: () => new Promise(() => {}),
          },
        };
      },
      initReactI18next: {
        type: '3rdParty',
        init: () => {},
      },
    }));
    server.resetHandlers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should render create authenticator mapping form', () => {
    const { getByRole } = render(
      <MemoryRouter initialEntries={['/access/authenticators/1/mappings/create']}>
        <Routes>
          <Route
            path={'/access/authenticators/:id/mappings/create'}
            element={<CreateAuthenticatorMapping />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(getByRole('button', { name: 'Create mapping' })).toBeInTheDocument();
  });

  test('should render edit authenticator mapping form', async () => {
    const { getByRole } = render(
      <MemoryRouter initialEntries={['/access/authenticators/1/mappings/3/edit']}>
        <Routes>
          <Route
            path={'/access/authenticators/:id/mappings/:map_id/edit'}
            element={<EditAuthenticatorMapping />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByRole('button', { name: 'Save mapping' })).toBeInTheDocument();
    });
  });

  test('should create a mapping with an "Always" trigger', async () => {
    const { container, getByRole } = render(
      <MemoryRouter initialEntries={['/access/authenticators/1/mappings/create']}>
        <Routes>
          <Route
            path={'/access/authenticators/:id/mappings/create'}
            element={<CreateAuthenticatorMapping />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(container.querySelector('[id="name"]')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const nameField = container.querySelector('[id="name"]') as HTMLInputElement;
    const triggerSelect = getByRole('button', { name: 'Select trigger' }) as HTMLInputElement;
    const submitButton = getByRole('button', { name: 'Create mapping' });

    await user.type(nameField, 'Always mapping');
    await user.click(triggerSelect);
    await user.click(getByRole('option', { name: 'Always' }));

    expect(nameField.value).toBe('Always mapping');
    expect(triggerSelect.innerText).toBe('Alwaysundefined');
    await user.click(submitButton);
  });

  test('should create a mapping with an "Never" trigger', async () => {
    const { container, getByRole } = render(
      <MemoryRouter initialEntries={['/access/authenticators/1/mappings/create']}>
        <Routes>
          <Route
            path={'/access/authenticators/:id/mappings/create'}
            element={<CreateAuthenticatorMapping />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(container.querySelector('[id="name"]')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const nameField = container.querySelector('[id="name"]') as HTMLInputElement;
    const triggerSelect = getByRole('button', { name: 'Select trigger' }) as HTMLInputElement;
    const submitButton = getByRole('button', { name: 'Create mapping' });

    await user.type(nameField, 'Never mapping');
    await user.click(triggerSelect);
    await user.click(getByRole('option', { name: 'Never' }));

    expect(nameField.value).toBe('Never mapping');
    expect(triggerSelect.innerText).toBe('Neverundefined');
    await user.click(submitButton);
  });

  test('should edit a mapping with an "Attributes" trigger', async () => {
    const { container, getByRole } = render(
      <MemoryRouter initialEntries={['/access/authenticators/1/mappings/3/edit']}>
        <Routes>
          <Route
            path={'/access/authenticators/:id/mappings/:map_id/edit'}
            element={<EditAuthenticatorMapping />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(container.querySelector('[id="name"]')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const nameField = container.querySelector('[id="name"]') as HTMLInputElement;
    const conditionaField = container.querySelector(
      '[id="attributes-conditional-form-group-toggle"]'
    ) as HTMLInputElement;
    const attributeOneField = container.querySelector(
      '[id="attributes-0-attribute"]'
    ) as HTMLInputElement;
    const attributeTwoField = container.querySelector(
      '[id="attributes-1-attribute"]'
    ) as HTMLInputElement;
    const valueOneField = container.querySelector('[id="attributes-0-value"]') as HTMLInputElement;
    const valueTwoField = container.querySelector('[id="attributes-1-value"]') as HTMLInputElement;

    expect(conditionaField.innerText).toBe('orundefined');
    expect(nameField.value).toBe('mapping one');
    expect(attributeOneField.value).toBe('attribute one');
    expect(valueOneField.value).toBe('value one');
    expect(attributeTwoField.value).toBe('attribute two');
    expect(valueTwoField.value).toBe('value 2');

    const submitButton = getByRole('button', { name: 'Save mapping' });
    await user.type(nameField, ' modified');

    expect(nameField.value).toBe('mapping one modified');
    await user.click(submitButton);
  });
});
