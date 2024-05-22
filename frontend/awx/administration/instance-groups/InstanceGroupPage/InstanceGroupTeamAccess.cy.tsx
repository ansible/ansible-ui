import { InstanceGroupTeamAccess } from './InstanceGroupTeamAccess';
import { awxAPI } from '../../../common/api/awx-utils';

describe('InstanceGroupTeamAccess', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: awxAPI`/role_team_assignments/?object_id=1&content_type__model=instancegroup*`,
      },
      {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 31,
            url: '/api/v2/role_team_assignments/31/',
            related: {
              created_by: '/api/v2/users/3/',
              role_definition: '/api/v2/role_definitions/5/',
              team: '/api/v2/teams/4/',
              content_object: '/api/v2/instance_groups/2/',
            },
            summary_fields: {
              created_by: { id: 3, username: 'dev', first_name: '', last_name: '' },
              role_definition: {
                id: 5,
                name: 'InstanceGroup Use',
                description: 'Has use permissions to a single instance group',
                managed: true,
              },
              team: { id: 4, name: 'test team', description: '' },
              content_object: { id: 2, name: 'default', is_container_group: true },
            },
            created: '2024-05-09T20:17:39.156601Z',
            created_by: 3,
            content_type: 'awx.instancegroup',
            object_id: '1',
            role_definition: 5,
            team: 4,
          },
        ],
      }
    );
  });

  it('should render team assignments', () => {
    const path = '/instance-groups/:id/team-access';
    const initialEntries = ['/instance-groups/1/team-access'];
    const params = {
      path,
      initialEntries,
    };

    cy.mount(<InstanceGroupTeamAccess />, params);

    cy.get('tbody tr').should('have.length', 1);
    cy.getByDataCy('team-name-column-cell').contains('test team');
    cy.getByDataCy('role-column-cell').contains('InstanceGroup Use');
  });
});
