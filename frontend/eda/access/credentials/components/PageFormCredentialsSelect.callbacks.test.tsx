import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { PageFormCredentialSelect } from './PageFormCredentialsSelect';

const captured = vi.hoisted(() => ({
  props: undefined as
    | {
        queryParams?: { credential_type__kind__in: string };
        isRequired?: boolean;
        labelHelp?: string;
        validate: (credentials: EdaCredential[]) => Promise<string | undefined>;
        formatLabel: (credential: EdaCredential) => string;
        compareOptionValues: (current: EdaCredential, selected: EdaCredential) => boolean;
      }
    | undefined,
}));

vi.mock('../../../common/PageFormMultiSelectEdaResource', () => ({
  PageFormMultiSelectEdaResource: (props: NonNullable<(typeof captured)['props']>) => {
    captured.props = props;
    return <div>Credential</div>;
  },
}));

function renderSelect(
  props: Partial<{
    isRequired: boolean;
    credentialKinds: string[];
  }> = {}
) {
  return render(
    <MemoryRouter>
      <PageFormCredentialSelect name="credentials" labelHelp="Choose a credential" {...props} />
    </MemoryRouter>
  );
}

describe('PageFormCredentialSelect callbacks', () => {
  it('builds kind filters and validates a required selection', async () => {
    renderSelect({ isRequired: true, credentialKinds: ['registry', 'vault'] });

    expect(captured.props?.queryParams).toEqual({
      credential_type__kind__in: 'registry,vault',
    });
    expect(captured.props?.labelHelp).toBe('Choose a credential');
    await expect(captured.props?.validate([])).resolves.toBe('Credential is required.');
    await expect(
      captured.props?.validate([{ id: 1, name: 'Vault' } as EdaCredential])
    ).resolves.toBeUndefined();
  });

  it('formats labels and compares credentials when kinds are not restricted', async () => {
    renderSelect();

    expect(captured.props?.queryParams).toBeUndefined();
    expect(
      captured.props?.formatLabel({
        name: 'Registry',
        credential_type: { name: 'Container Registry' },
      } as EdaCredential)
    ).toBe('Registry | Container Registry');
    expect(captured.props?.formatLabel({ name: 'Mystery' } as EdaCredential)).toBe(
      'Mystery | Unknown type'
    );
    expect(
      captured.props?.compareOptionValues({ id: 4 } as EdaCredential, { id: 4 } as EdaCredential)
    ).toBe(true);
    expect(
      captured.props?.compareOptionValues({ id: 4 } as EdaCredential, { id: 5 } as EdaCredential)
    ).toBe(false);
    await expect(captured.props?.validate([])).resolves.toBeUndefined();
  });
});
