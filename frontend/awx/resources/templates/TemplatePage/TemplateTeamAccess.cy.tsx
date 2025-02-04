import { awxAPI } from '@ansible/cypress/support/formatApiPathForAwx';
import { TemplateTeamAccess } from './TemplateTeamAccess';

describe('TemplateTeamAccess', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: awxAPI`/role_team_assignments/?object_id=1&content_type__model=jobtemplate*`,
      },
      {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 4,
            url: awxAPI`/role_team_assignments/4/`,
            related: {
              created_by: awxAPI`/users/3/`,
              role_definition: awxAPI`/role_definitions/25/`,
              team: awxAPI`/teams/1/`,
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
              team: { id: 1, name: 'test team', description: '' },
              content_object: { id: 1, name: 'name', description: '' },
            },
            created: '2024-05-08T18:01:06.186968Z',
            created_by: 3,
            content_type: 'awx.jobtemplate',
            object_id: '108',
            role_definition: 25,
            team: 1,
          },
        ],
      }
    );
  });

  it('should render team assignments', () => {
    const path = '/templates/job_templates/:id/team-access';
    const initialEntries = ['/templates/job_templates/1/team-access'];
    const params = {
      path,
      initialEntries,
    };
    cy.mount(<TemplateTeamAccess />, params);
    cy.get('tbody tr').should('have.length', 1);
    cy.getByDataCy('team-name-column-cell').contains('test team');
    cy.getByDataCy('role-column-cell').contains('JobTemplate Execute');
  });
});
