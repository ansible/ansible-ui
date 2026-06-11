import { describe, expect, it } from 'vitest';
import { isOidcCredential } from './isOidcCredential';

describe('isOidcCredential', () => {
  it('should return true for hashivault-kv-oidc', () => {
    expect(isOidcCredential('hashivault-kv-oidc')).toBe(true);
  });

  it('should return true for hashivault-ssh-oidc', () => {
    expect(isOidcCredential('hashivault-ssh-oidc')).toBe(true);
  });

  it('should return false for other namespaces', () => {
    expect(isOidcCredential('cyberark')).toBe(false);
    expect(isOidcCredential('hashivault-kv')).toBe(false);
    expect(isOidcCredential('custom')).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isOidcCredential(undefined)).toBe(false);
  });
});
