/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable i18next/no-literal-string */
import { CredentialDetails } from './CredentialDetails';

describe('TemplateDetails', () => {
  const credential = {
    id: 2,
    type: 'credential',
    url: '/api/v2/credentials/2/',
    related: {
      named_url:
        '/api/v2/credentials/Ansible Galaxy++Ansible Galaxy%2FAutomation Hub API Token+galaxy++/',
      created_by: '/api/v2/users/1/',
      modified_by: '/api/v2/users/1/',
      activity_stream: '/api/v2/credentials/2/activity_stream/',
      access_list: '/api/v2/credentials/2/access_list/',
      object_roles: '/api/v2/credentials/2/object_roles/',
      owner_users: '/api/v2/credentials/2/owner_users/',
      owner_teams: '/api/v2/credentials/2/owner_teams/',
      copy: '/api/v2/credentials/2/copy/',
      input_sources: '/api/v2/credentials/2/input_sources/',
      credential_type: '/api/v2/credential_types/18/',
    },
    summary_fields: {
      credential_type: {
        id: 18,
        name: 'Ansible Galaxy/Automation Hub API Token',
        description: '',
      },
      created_by: {
        id: 1,
        username: 'admin',
        first_name: '',
        last_name: '',
      },
      modified_by: {
        id: 1,
        username: 'admin',
        first_name: '',
        last_name: '',
      },
      object_roles: {
        admin_role: {
          description: 'Can manage all aspects of the credential',
          name: 'Admin',
          id: 23,
        },
        use_role: {
          description: 'Can use the credential in a job template',
          name: 'Use',
          id: 24,
        },
        read_role: {
          description: 'May view settings for the credential',
          name: 'Read',
          id: 25,
        },
      },
      user_capabilities: {
        edit: true,
        delete: true,
        copy: true,
        use: true,
      },
      owners: [],
    },
    created: '2022-12-09T15:26:49.544132Z',
    modified: '2022-12-09T15:26:49.544146Z',
    name: 'Ansible Galaxy',
    description: '',
    organization: null,
    credential_type: 18,
    managed: true,
    inputs: {
      url: 'https://galaxy.ansible.com/',
    },
    kind: 'galaxy_api_token',
    cloud: false,
    kubernetes: false,
  };

  it('Component renders and displays Credential', () => {
    cy.mount(<CredentialDetails credential={credential} />);
    cy.contains('dd#name>div', 'Ansible Galaxy').should('exist');
  });
});
