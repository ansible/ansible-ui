import { InstanceGroupUserAccess } from './InstanceGroupUserAccess';
import { awxAPI } from '../../../common/api/awx-utils';

describe('InstanceGroupUserAccess', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: awxAPI`/role_user_assignments/?object_id=1&content_type__model=instancegroup*`,
      },
      {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 95,
            url: '/api/v2/role_user_assignments/95/',
            related: {
              created_by: '/api/v2/users/3/',
              role_definition: '/api/v2/role_definitions/3/',
              user: '/api/v2/users/3/',
              content_object: '/api/v2/instance_groups/2/',
            },
            summary_fields: {
              created_by: { id: 3, username: 'dev', first_name: '', last_name: '' },
              role_definition: {
                id: 3,
                name: 'InstanceGroup Admin',
                description: 'Has all permissions to a single instance group',
                managed: true,
              },
              user: { id: 3, username: 'dev', first_name: '', last_name: '' },
              content_object: { id: 2, name: 'default', is_container_group: true },
            },
            created: '2024-05-09T18:39:30.258426Z',
            created_by: 3,
            content_type: 'awx.instancegroup',
            object_id: '2',
            role_definition: 3,
            user: 3,
          },
        ],
      }
    );
  });

  it('should render user assignments', () => {
    const path = '/instance_groups/instance_group/:id/user-access';
    const initialEntries = ['/instance_groups/instance_group/1/user-access'];
    const params = {
      path,
      initialEntries,
    };

    cy.mount(<InstanceGroupUserAccess />, params);

    cy.get('tbody tr').should('have.length', 1);
    cy.getByDataCy('username-column-cell').contains('dev');
    cy.getByDataCy('role-column-cell').contains('InstanceGroup Admin');
  });
});
