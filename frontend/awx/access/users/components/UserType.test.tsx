import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { UserType } from './UserType';

describe('UserType', () => {
  it('should render System administrator when user is superuser', () => {
    render(<UserType user={{ is_superuser: true }} />);

    expect(screen.getByText('System administrator')).toBeInTheDocument();
  });

  it('should render System auditor when user is system auditor', () => {
    render(<UserType user={{ is_superuser: false, is_system_auditor: true }} />);

    expect(screen.getByText('System auditor')).toBeInTheDocument();
  });

  it('should render Normal user when user has neither role', () => {
    render(<UserType user={{ is_superuser: false, is_system_auditor: false }} />);

    expect(screen.getByText('Normal user')).toBeInTheDocument();
  });
});
