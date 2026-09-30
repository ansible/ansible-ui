/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, test, vi } from 'vitest';
import { AuthenticatorTypeEnum } from '../../../../interfaces/Authenticator';
import {
  AuthenticatorPlugins,
  PluginConfiguration,
} from '../../../../interfaces/AuthenticatorPlugin';
import { AuthenticatorSubForm } from './AuthenticatorSubForm';

/**
 * Minimal plugins fixture whose single authenticator type carries a
 * `CharField` with a `pattern`, `patternDescription` (camelCase), and
 * `flags` — the shape returned by the Gateway authenticator-plugins API.
 *
 * The pattern requires the value to start with "https://".  The camelCase
 * `patternDescription` is intentional: the test proves that the API's
 * camelCase field reaches the rendered validation error (instead of the
 * generic "does not match the required pattern" fallback).
 */
const SCHEMA_WITH_CAMEL_CASE_DESC: PluginConfiguration[] = [
  {
    name: 'CALLBACK_URL',
    help_text: 'The callback URL for SSO.',
    required: true,
    type: 'CharField',
    ui_field_label: 'Callback URL',
    pattern: '^https://',
    patternDescription: 'Must start with https://',
    flags: 'i',
  },
];

const PLUGINS_WITH_PATTERN: AuthenticatorPlugins = {
  authenticators: [
    {
      type: AuthenticatorTypeEnum.Keycloak,
      configuration_schema: SCHEMA_WITH_CAMEL_CASE_DESC,
      documentation_url: '',
    },
  ],
};

/**
 * Test wrapper that provides a react-hook-form context with a pre-selected
 * authenticator type so the `PageFormHidden` gate inside the component is
 * open.  A `<form>` element is included so submit-blocking assertions work.
 */
function SubFormTestWrapper(
  props: Readonly<{
    children: React.ReactNode;
    onSubmit: (data: Record<string, unknown>) => void;
  }>
) {
  const methods = useForm({
    defaultValues: {
      type: AuthenticatorTypeEnum.Keycloak,
      configuration: { CALLBACK_URL: '' },
      enabled: false,
      create_objects: false,
      remove_users: false,
    },
  });

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void methods.handleSubmit(props.onSubmit)(e);
        }}
      >
        {props.children}
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}

// Suppress the DataEditor mock warning — we only render CharField fields,
// but the component file imports DataEditor at module level.
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

describe('AuthenticatorSubForm — camelCase patternDescription integration', () => {
  test('renders the API camelCase patternDescription as the validation error, not the generic fallback', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    const { container } = render(
      <SubFormTestWrapper onSubmit={onSubmit}>
        <AuthenticatorSubForm plugins={PLUGINS_WITH_PATTERN} />
      </SubFormTestWrapper>
    );

    // Wait for the configuration input to appear by its id
    let input: HTMLInputElement | null = null;
    await waitFor(
      () => {
        input = container.querySelector(
          '[id="configuration-input-CALLBACK_URL"]'
        ) as HTMLInputElement;
        expect(input).not.toBeNull();
      },
      { timeout: 10000 }
    );

    if (!input) throw new Error('Input not found');

    // Type a value that violates the pattern (does not start with https://)
    await user.click(input);
    await user.type(input, 'http://example.com');
    // Blur so the field triggers validation (pattern validation runs onBlur)
    await user.tab();

    // Submit to ensure validation blocks the form
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    // The API's camelCase patternDescription must appear — NOT the generic fallback
    await waitFor(
      () => {
        expect(screen.getByText('Must start with https://')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // The generic fallback must NOT be present
    expect(
      screen.queryByText('This field does not match the required pattern.')
    ).not.toBeInTheDocument();

    // The form must not have been submitted
    expect(onSubmit).not.toHaveBeenCalled();
  }, 15000);

  test('allows submission when the value satisfies the pattern', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    const { container } = render(
      <SubFormTestWrapper onSubmit={onSubmit}>
        <AuthenticatorSubForm plugins={PLUGINS_WITH_PATTERN} />
      </SubFormTestWrapper>
    );

    let input: HTMLInputElement | null = null;
    await waitFor(
      () => {
        input = container.querySelector(
          '[id="configuration-input-CALLBACK_URL"]'
        ) as HTMLInputElement;
        expect(input).not.toBeNull();
      },
      { timeout: 10000 }
    );

    await user.click(input!);
    await user.type(input!, 'https://example.com/callback');

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(
      () => {
        expect(onSubmit).toHaveBeenCalled();
      },
      { timeout: 10000 }
    );

    // No validation error should appear
    expect(screen.queryByText('Must start with https://')).not.toBeInTheDocument();
    expect(
      screen.queryByText('This field does not match the required pattern.')
    ).not.toBeInTheDocument();
  }, 15000);
});
