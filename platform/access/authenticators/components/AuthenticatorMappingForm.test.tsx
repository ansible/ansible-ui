import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
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
    http.get(gatewayAPI`/authenticators/1/authenticator_maps/`, () => {
      return HttpResponse.json({ count: 0, results: [] });
    }),
    http.get(gatewayAPI`/role_definitions/`, () => {
      return HttpResponse.json(roleDefinitions);
    }),
    http.post(gatewayAPI`/authenticator_maps/`, () => {
      return HttpResponse.json(authMappingAttributesPayload);
    }),
    http.patch(gatewayAPI`/authenticator_maps/3/`, () => {
      return HttpResponse.json(authenticatorMapping);
    })
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  afterAll(() => server.close());

  beforeEach(() => {
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
    const triggerSelect = getByRole('button', {
      name: 'Select rule condition',
    }) as HTMLInputElement;
    const submitButton = getByRole('button', { name: 'Create mapping' });

    await user.type(nameField, 'Always mapping');
    await user.click(triggerSelect);
    await user.click(getByRole('option', { name: 'Always' }));

    expect(nameField.value).toBe('Always mapping');
    expect(triggerSelect.innerText).toBe('Always');
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
    const triggerSelect = getByRole('button', {
      name: 'Select rule condition',
    }) as HTMLInputElement;
    const submitButton = getByRole('button', { name: 'Create mapping' });

    await user.type(nameField, 'Never mapping');
    await user.click(triggerSelect);
    await user.click(getByRole('option', { name: 'Never' }));

    expect(nameField.value).toBe('Never mapping');
    expect(triggerSelect.innerText).toBe('Never');
    await user.click(submitButton);
  });

  test('should set order to 1 when creating first mapping', async () => {
    const postSpy = vi.fn();
    server.use(
      http.get(gatewayAPI`/authenticators/1/authenticator_maps/`, () => {
        return HttpResponse.json({ count: 0, results: [] });
      }),
      http.post(gatewayAPI`/authenticator_maps/`, async ({ request }) => {
        const body = await request.json();
        postSpy(body);
        return HttpResponse.json({ ...authMappingAttributesPayload, id: 10 });
      })
    );

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
    const submitButton = getByRole('button', { name: 'Create mapping' });

    await user.type(nameField, 'First mapping');
    await user.click(
      getByRole('button', {
        name: 'Select rule condition',
      })
    );
    await user.click(getByRole('option', { name: 'Always' }));
    await user.click(submitButton);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'First mapping',
          order: 1,
        })
      );
    });
  });

  test('should set order to count + 1 when creating additional mapping', async () => {
    const postSpy = vi.fn();
    server.use(
      http.get(gatewayAPI`/authenticators/1/authenticator_maps/`, () => {
        return HttpResponse.json({ count: 5, results: [] });
      }),
      http.post(gatewayAPI`/authenticator_maps/`, async ({ request }) => {
        const body = await request.json();
        postSpy(body);
        return HttpResponse.json({ ...authMappingAttributesPayload, id: 11 });
      })
    );

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
    const submitButton = getByRole('button', { name: 'Create mapping' });

    await user.type(nameField, 'Sixth mapping');
    await user.click(
      getByRole('button', {
        name: 'Select rule condition',
      })
    );
    await user.click(getByRole('option', { name: 'Always' }));
    await user.click(submitButton);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Sixth mapping',
          order: 6,
        })
      );
    });
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

    expect(conditionaField.innerText).toBe('at least one');
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

  test('should not change order when editing mapping', async () => {
    const patchSpy = vi.fn();
    server.use(
      http.patch(gatewayAPI`/authenticator_maps/3/`, async ({ request }) => {
        const body = await request.json();
        patchSpy(body);
        return HttpResponse.json({ ...authenticatorMapping, name: 'mapping one modified' });
      })
    );

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
    const submitButton = getByRole('button', { name: 'Save mapping' });

    await user.type(nameField, ' modified');
    await user.click(submitButton);

    await waitFor(() => {
      expect(patchSpy).toHaveBeenCalled();
      const patchPayload = patchSpy.mock.calls[0][0] as object;
      expect(patchPayload).not.toHaveProperty('order');
    });
  });
});
