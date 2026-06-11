import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { CredentialTypeDetail } from './CredentialTypeDetail';

describe('CredentialTypeDetail', () => {
  it('should render boolean field as Yes when true', () => {
    render(
      <MemoryRouter>
        <CredentialTypeDetail
          inputs={{ my_bool: true } as unknown as Record<string, string | number>}
          field={{
            id: 'my_bool',
            label: 'My Boolean',
            type: 'boolean',
            help_text: '',
          }}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('My Boolean')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('should render boolean field as No when false', () => {
    render(
      <MemoryRouter>
        <CredentialTypeDetail
          inputs={{ my_bool: false } as unknown as Record<string, string | number>}
          field={{
            id: 'my_bool',
            label: 'My Boolean',
            type: 'boolean',
            help_text: '',
          }}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('should render encrypted value for $encrypted$', () => {
    render(
      <MemoryRouter>
        <CredentialTypeDetail
          inputs={{ secret: '$encrypted$' }}
          field={{
            id: 'secret',
            label: 'Secret',
            type: 'string',
            help_text: '',
          }}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('Encrypted')).toBeInTheDocument();
  });

  it('should render Prompt on launch for ASK when ask_at_runtime', () => {
    render(
      <MemoryRouter>
        <CredentialTypeDetail
          inputs={{ prompt_field: 'ASK' }}
          field={{
            id: 'prompt_field',
            label: 'Prompt Field',
            type: 'string',
            ask_at_runtime: true,
            help_text: '',
          }}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('Prompt on launch')).toBeInTheDocument();
  });

  it('should render plain value for standard field', () => {
    render(
      <MemoryRouter>
        <CredentialTypeDetail
          inputs={{ username: 'myuser' }}
          field={{
            id: 'username',
            label: 'Username',
            type: 'string',
            help_text: 'Enter username',
          }}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('myuser')).toBeInTheDocument();
    expect(screen.getByText('Username')).toBeInTheDocument();
  });
});
