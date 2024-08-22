import { edaAPI } from '../common/eda-utils';
import { Projects } from './Projects';

describe('Projects.cy.ts', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'OPTIONS',
        url: '/api/v2/projects/',
      },
      {
        fixture: 'edaProjectsOptions.json',
      }
    ).as('getOptions');
    cy.intercept(
      { method: 'GET', url: edaAPI`/projects/?page=1&page_size=10` },
      {
        fixture: 'edaProjects.json',
      }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/projects/?page=2&page_size=10` },
      {
        count: 12,
        next: null,
        previous: edaAPI`/projects/?page=1&page_size=10`,
        page_size: 10,
        page: 2,
        results: [
          {
            name: 'Test 3',
            description: '',
            eda_credential_id: null,
            id: 11,
            url: 'https://github.com/ansible/ansible-ui',
            git_hash: 'a1c2b012f84de83c4a9fa5126430816bf68364b2',
            import_state: 'completed',
            import_error: null,
            import_task_id: 'b1e4b51b-f967-4022-b955-84b14c21165b',
            created_at: '2023-07-11T22:00:00.179292Z',
            modified_at: '2023-07-11T22:00:02.244685Z',
          },
          {
            name: 'Test 4',
            description: '',
            eda_credential_id: null,
            id: 12,
            url: 'https://github.com/ansible/ansible-ui',
            git_hash: 'a1c2b012f84de83c4a9fa5126430816bf68364b2',
            import_state: 'completed',
            import_error: null,
            import_task_id: 'ada86a8b-9e78-40e3-a98a-f6fc790ea77e',
            created_at: '2023-07-11T22:00:10.299948Z',
            modified_at: '2023-07-11T22:00:11.814164Z',
          },
        ],
      }
    );
    cy.mount(<Projects />);
  });

  it('Renders the correct projects columns', () => {
    cy.verifyPageTitle('Projects');
    cy.get('tbody').find('tr').should('have.length', 10);
    cy.contains(/^A project is a logical collection of rulebooks.$/).should('be.visible');
    cy.contains('th', 'Name');
    cy.contains('th', 'Status');
    cy.contains('th', 'Git hash');
  });
});

describe('Empty list without POST permission', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: edaAPI`/projects/*`,
      },
      {
        fixture: 'emptyList.json',
      }
    ).as('emptyList');
  });
  it('Empty state is displayed correctly', () => {
    cy.mount(<Projects />);
    cy.contains(/^You do not have permission to create a project.$/);
    cy.contains(
      /^Please contact your organization administrator if there is an issue with your access.$/
    );
  });
});

describe('Empty list with POST permission', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'OPTIONS',
        url: edaAPI`/projects/`,
      },
      {
        fixture: 'edaProjectsOptions.json',
      }
    ).as('getOptions');
    cy.intercept(
      {
        method: 'GET',
        url: edaAPI`/projects/*`,
      },
      {
        fixture: 'emptyList.json',
      }
    ).as('emptyList');
  });
  it('Empty state is displayed correctly', () => {
    cy.mount(<Projects />);
    cy.contains(/^There are currently no projects created for your organization.$/);
    cy.contains(/^Please create a project by using the button below.$/);
    cy.contains('button', /^Create project$/).should('be.visible');
  });
});
