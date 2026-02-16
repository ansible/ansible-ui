import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { CredentialLabel } from './CredentialLabel';

describe('CredentialLabel', () => {
  it('should render credential label with kind and name', () => {
    const credential = {
      id: 1,
      name: 'My SSH Key',
      description: '',
      kind: 'ssh',
      cloud: false,
    };
    render(
      <MemoryRouter>
        <CredentialLabel credential={credential} />
      </MemoryRouter>
    );
    const link = screen.getByRole('link', { name: /SSH.*My SSH Key/ });
    expect(link).toBeInTheDocument();
  });

  it('should return null when credential is undefined', () => {
    const { container } = render(
      <MemoryRouter>
        <CredentialLabel credential={undefined} />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });
});
