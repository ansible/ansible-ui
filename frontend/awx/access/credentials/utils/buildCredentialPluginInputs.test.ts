import { describe, expect, it } from 'vitest';
import { buildCredentialPluginInputs } from './buildCredentialPluginInputs';

describe('buildCredentialPluginInputs', () => {
  it('omits empty ssh_key_unlock from inputs', () => {
    const credential = {
      name: 'test',
      ssh_key_data: 'key-material',
      ssh_key_unlock: '',
    };

    const inputs = buildCredentialPluginInputs(
      credential,
      [
        { id: 'ssh_key_data', type: 'string', label: 'SSH Private Key' },
        { id: 'ssh_key_unlock', type: 'string', label: 'Private Key Passphrase' },
      ],
      () => false
    );

    expect(inputs).toEqual({ ssh_key_data: 'key-material' });
    expect(credential).not.toHaveProperty('ssh_key_unlock');
  });

  it('includes non-empty ssh_key_unlock', () => {
    const credential = {
      ssh_key_data: 'key-material',
      ssh_key_unlock: 'passphrase',
    };

    const inputs = buildCredentialPluginInputs(
      credential,
      [
        { id: 'ssh_key_data', type: 'string', label: 'SSH Private Key' },
        { id: 'ssh_key_unlock', type: 'string', label: 'Private Key Passphrase' },
      ],
      () => false
    );

    expect(inputs).toEqual({
      ssh_key_data: 'key-material',
      ssh_key_unlock: 'passphrase',
    });
  });

  it('still includes empty strings for other optional fields', () => {
    const credential = {
      security_token: '',
      username: 'admin',
    };

    const inputs = buildCredentialPluginInputs(
      credential,
      [
        { id: 'username', type: 'string', label: 'Username' },
        { id: 'security_token', type: 'string', label: 'STS Token' },
      ],
      () => false
    );

    expect(inputs).toEqual({ username: 'admin', security_token: '' });
  });
});
