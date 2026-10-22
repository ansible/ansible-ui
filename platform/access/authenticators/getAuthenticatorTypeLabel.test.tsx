import { describe, expect, it } from 'vitest';
import { getAuthenticatorTypeLabel } from './getAuthenticatorTypeLabel';

const t = ((key: string) => key) as Parameters<typeof getAuthenticatorTypeLabel>[1];

const ldapType = 'ansible_base.authentication.authenticator_plugins.ldap';
const externalOauthType = 'ansible_base.authentication.authenticator_plugins.external_oauth';

describe('getAuthenticatorTypeLabel', () => {
  it('prefers display_name from the plugins list when present', () => {
    const label = getAuthenticatorTypeLabel(externalOauthType, t, [
      { type: externalOauthType, display_name: 'External OAuth API Bearer Token' },
    ]);

    expect(label).toBe('External OAuth API Bearer Token');
  });

  it('falls back to the static map when display_name is missing', () => {
    const label = getAuthenticatorTypeLabel(ldapType, t, [{ type: ldapType, display_name: null }]);

    expect(label).toBe('LDAP');
  });

  it('falls back to the static map when plugins are not provided', () => {
    expect(getAuthenticatorTypeLabel(ldapType, t)).toBe('LDAP');
  });

  it('falls back to the static map when the type is not in the plugins list', () => {
    const label = getAuthenticatorTypeLabel(ldapType, t, [
      { type: externalOauthType, display_name: 'External OAuth API Bearer Token' },
    ]);

    expect(label).toBe('LDAP');
  });

  it('formats unknown types when there is no map entry or display_name', () => {
    const unknownType = 'ansible_base.authentication.authenticator_plugins.custom_auth';

    expect(getAuthenticatorTypeLabel(unknownType, t)).toBe('Custom auth');
  });

  it('uses the short type name for map lookups', () => {
    expect(getAuthenticatorTypeLabel('ldap', t)).toBe('LDAP');
  });
});
