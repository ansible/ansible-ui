import { hubAPI } from '../../common/api/formatPath';
import { HubNamespaceTeamAccess } from './HubNamespaceTeamAccess';

describe('HubNamespaceTeamAccess', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: hubAPI`/_ui/v2/role_team_assignments/?object_id=*`,
      },
      {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 1,
            url: '',
            related: {},
            summary_fields: {
              role_definition: {
                id: 4,
                name: 'galaxy.collection_publisher',
                description: 'Upload and modify collections.',
                managed: false,
              },
              team: { id: 1, name: 'test team', description: '' },
              content_object: { id: 1, name: 'demo', description: '' },
            },
            created: '2024-05-08T18:01:06.186968Z',
            created_by: 4,
            content_type: 'galaxy.namespace',
            object_id: '108',
            object_ansible_id: null,
            role_definition: 4,
            team: 1,
            team_ansible_id: null,
          },
        ],
      }
    );
    cy.intercept('GET', hubAPI`/_ui/v1/namespaces/?limit=1&name=demo`, {
      fixture: 'hubNamespace.json',
    });
  });

  it('should render team assignments', () => {
    const path = '/namespaces/:id/team-access';
    const initialEntries = ['/namespaces/demo/team-access'];
    const params = {
      path,
      initialEntries,
    };

    cy.mount(<HubNamespaceTeamAccess />, params);

    cy.get('tbody tr').should('have.length', 1);
    cy.getByDataCy('team-name-column-cell').contains('test team');
    cy.getByDataCy('role-column-cell').contains('galaxy.collection_publisher');
  });
});
