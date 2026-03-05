import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AuthenticationType } from './AuthenticationType';

describe('AuthenticationType', () => {
  it('should render LDAP when user has ldap_dn', () => {
    render(<AuthenticationType user={{ ldap_dn: 'cn=user,ou=users,dc=example,dc=com' }} />);

    expect(screen.getByText('LDAP')).toBeInTheDocument();
  });

  it('should render Social when user has auth array', () => {
    render(<AuthenticationType user={{ auth: ['some-provider'] }} />);

    expect(screen.getByText('Social')).toBeInTheDocument();
  });

  it('should render Local when user has neither ldap_dn nor auth', () => {
    render(<AuthenticationType user={{}} />);

    expect(screen.getByText('Local')).toBeInTheDocument();
  });
});
