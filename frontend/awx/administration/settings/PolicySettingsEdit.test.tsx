import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { AwxSettingsOptionsAction } from './AwxSettingsForm';
import { PolicySettingsForm } from './PolicySettingsEdit';
import options from './policySettingsOptions.fixture.json';

const data = {
  OPA_HOST: '',
  OPA_PORT: 8181,
  OPA_SSL: false,
  OPA_AUTH_TYPE: 'None',
  OPA_AUTH_TOKEN: '$encrypted$',
  OPA_AUTH_CLIENT_CERT: '',
  OPA_AUTH_CLIENT_KEY: '$encrypted$',
  OPA_AUTH_CA_CERT: '',
  OPA_AUTH_CUSTOM_HEADERS: '$encrypted$',
  OPA_REQUEST_TIMEOUT: 1.5,
  OPA_REQUEST_RETRIES: 2,
};

describe('PolicySettingsForm', () => {
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
  });

  test('should show certificate fields', async () => {
    render(
      <MemoryRouter initialEntries={['/settings/policy-settings']}>
        <Routes>
          <Route
            path={'/settings/policy-settings'}
            element={
              <PolicySettingsForm
                options={options.actions.PUT as unknown as Record<string, AwxSettingsOptionsAction>}
                data={data}
              />
            }
          />
        </Routes>
      </MemoryRouter>
    );
    const user = userEvent.setup();

    expect(screen.queryByRole('textbox', { name: 'Drag a file here or browse to upload' })).to.be
      .null;
    expect(screen.queryByRole('textbox', { name: 'OPA client key content' })).to.be.null;

    await user.type(
      screen.getByRole('textbox', { name: /OPA server hostname/i }),
      'opa.ansible.com'
    );
    await user.click(screen.getByRole('button', { name: 'None' }));
    await user.click(screen.getByText('Certificate'));

    expect(
      screen.getAllByRole('textbox', { name: 'Drag a file here or browse to upload' })
    ).to.have.length(2);
    expect(screen.getByRole('textbox', { name: 'OPA client key content' })).toBeVisible();
  });
});
