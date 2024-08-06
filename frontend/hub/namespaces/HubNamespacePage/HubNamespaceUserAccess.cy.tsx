import { hubAPI } from '../../common/api/formatPath';
import { HubNamespaceUserAccess } from './HubNamespaceUserAccess';

describe('HubNamespaceUserAccess', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: hubAPI`/_ui/v2/role_user_assignments/?object_id=1&content_type__model=namespace*`,
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
              user: { id: 3, username: 'test-user', first_name: '', last_name: '' },
              content_object: { id: 1, name: 'name', description: '' },
            },
            created: '2024-08-02T16:47:15.788129Z',
            created_by: 4,
            content_type: 'galaxy.namespace',
            object_id: '1',
            object_ansible_id: null,
            role_definition: 4,
            user: 6,
            user_ansible_id: null,
          },
        ],
      }
    );
    cy.intercept('GET', hubAPI`/_ui/v1/namespaces/?limit=1&name=demo`, {
      fixture: 'hubNamespace.json',
    });
  });

  it('should render user assignments', () => {
    const path = '/namespaces/:id/user-access';
    const initialEntries = ['/namespaces/demo/user-access'];
    const params = {
      path,
      initialEntries,
    };

    cy.mount(<HubNamespaceUserAccess />, params);

    cy.get('tbody tr').should('have.length', 1);
    cy.getByDataCy('username-column-cell').contains('test-user');
    cy.getByDataCy('role-column-cell').contains('galaxy.collection_publisher');
  });
});
