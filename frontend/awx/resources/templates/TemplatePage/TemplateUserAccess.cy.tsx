import { awxAPI } from '@ansible/cypress/support/formatApiPathForAwx';
import { TemplateUserAccess } from './TemplateUserAccess';

describe('TemplateUserAccess', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: awxAPI`/role_user_assignments/?object_id=1&content_type__model=jobtemplate*`,
      },
      {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 45,
            url: awxAPI`/role_user_assignments/45/`,
            related: {
              created_by: awxAPI`/users/3/`,
              role_definition: awxAPI`/role_definitions/25/`,
              user: awxAPI`/users/3/`,
              content_object: awxAPI`/job_templates/108/`,
            },
            summary_fields: {
              created_by: { id: 3, username: 'dev', first_name: '', last_name: '' },
              role_definition: {
                id: 25,
                name: 'JobTemplate Execute',
                description: 'Has execute permissions to a single job template',
                managed: true,
              },
              user: { id: 3, username: 'dev', first_name: '', last_name: '' },
              content_object: { id: 1, name: 'name', description: '' },
            },
            created: '2024-05-08T18:12:29.653420Z',
            created_by: 3,
            content_type: 'awx.jobtemplate',
            object_id: '108',
            role_definition: 25,
            user: 3,
          },
        ],
      }
    );
  });

  it('should render user assignments', () => {
    const path = '/templates/job_templates/:id/user-access';
    const initialEntries = ['/templates/job_templates/1/user-access'];
    const params = {
      path,
      initialEntries,
    };
    cy.mount(<TemplateUserAccess />, params);
    cy.get('tbody tr').should('have.length', 1);
    cy.getByDataCy('username-column-cell').contains('dev');
    cy.getByDataCy('role-column-cell').contains('JobTemplate Execute');
  });
});
