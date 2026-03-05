import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AwxRbacRole } from '../../../interfaces/AwxRbacRole';
import { ContentTypeEnum } from '../../../interfaces/ContentType';
import { AwxRolePermissions } from './AwxRolePermissions';

const mockRole: AwxRbacRole = {
  id: 1,
  name: 'Admin',
  content_type: ContentTypeEnum.Credential,
  permissions: ['awx.view_credential', 'awx.use_credential'],
  url: '/api/v2/role_definitions/1/',
  related: { team_assignments: '', user_assignments: '' },
  summary_fields: {},
  created: '',
  modified: '',
  description: '',
  managed: true,
  created_by: null,
  modified_by: null,
};

describe('AwxRolePermissions', () => {
  it('should render permissions description list with content type', () => {
    render(
      <MemoryRouter>
        <AwxRolePermissions role={mockRole} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('permissions-description-list')).toBeInTheDocument();
    expect(screen.getByTestId('awx.credential')).toBeInTheDocument();
  });

  it('should render permission labels', () => {
    render(
      <MemoryRouter>
        <AwxRolePermissions role={mockRole} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('awx.view_credential')).toBeInTheDocument();
    expect(screen.getByTestId('awx.use_credential')).toBeInTheDocument();
  });

  it('should render empty permissions when role has none', () => {
    const roleWithNoPermissions: AwxRbacRole = {
      ...mockRole,
      content_type: ContentTypeEnum.Project,
      permissions: [],
    };

    render(
      <MemoryRouter>
        <AwxRolePermissions role={roleWithNoPermissions} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('permissions-description-list')).toBeInTheDocument();
    expect(screen.getByTestId('awx.project')).toBeInTheDocument();
  });
});
