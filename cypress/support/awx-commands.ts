import '@cypress/code-coverage/support';
import { SetRequired } from 'type-fest';
import { randomString } from '../../framework/utils/random-string';
import { AwxItemsResponse } from '../../frontend/awx/common/AwxItemsResponse';
import { AwxHost } from '../../frontend/awx/interfaces/AwxHost';
import { AwxToken } from '../../frontend/awx/interfaces/AwxToken';
import { Credential } from '../../frontend/awx/interfaces/Credential';
import { ExecutionEnvironment } from '../../frontend/awx/interfaces/ExecutionEnvironment';
import { InstanceGroup } from '../../frontend/awx/interfaces/InstanceGroup';
import { Inventory } from '../../frontend/awx/interfaces/Inventory';
import { JobEvent } from '../../frontend/awx/interfaces/JobEvent';
import { JobTemplate } from '../../frontend/awx/interfaces/JobTemplate';
import { Label } from '../../frontend/awx/interfaces/Label';
import { Organization } from '../../frontend/awx/interfaces/Organization';
import { Project } from '../../frontend/awx/interfaces/Project';
import { Schedule } from '../../frontend/awx/interfaces/Schedule';
import { Team } from '../../frontend/awx/interfaces/Team';
import { User } from '../../frontend/awx/interfaces/User';
import {
  CredentialType,
  WorkflowJobTemplate,
} from '../../frontend/awx/interfaces/generated-from-swagger/api';
import './auth';
import './commands';
import './rest-commands';

//  AWX related custom command implementation

// const GLOBAL_PROJECT_NAME = 'Global Project for E2E tests';
// const GLOBAL_PROJECT_DESCRIPTION = 'Global Read Only Project for E2E tests';
// const GLOBAL_PROJECT_SCM_URL = 'https://github.com/ansible/test-playbooks.git';

// function checkIfGlobalProjectExists() {
//   return cy
//     .awxRequestGet<AwxItemsResponse<Project>>(`/api/v2/projects?name__startswith=Global&page=1`)
//     .its('results')
//     .then((results: Project[]) => {
//       if (results.length === 0) {
//         // cy.log('ZERO', results);
//         return null;
//       } else {
//         // cy.log('PROJECT IS HERE', results);
//         expect(results[0].name).to.equal(GLOBAL_PROJECT_NAME);
//         expect(results[0].description).to.equal(GLOBAL_PROJECT_DESCRIPTION);
//         expect(results[0].scm_url).to.equal(GLOBAL_PROJECT_SCM_URL);
//       }
//       return results[0];
//     });
// }

// Cypress.Commands.add('createGlobalProject', () => {
//   cy.log('🔎 Checking if global project exists before creating it');

//   checkIfGlobalProjectExists().then((globalProject) => {
//     if (globalProject) {
//       cy.log(
//         '✅ Global project exists, access it via this.globalProject in the tests',
//         globalProject
//       );
//       return cy.wrap(globalProject).as('globalProject');
//     } else {
//       cy.log('🤷 Global project does not exist, creating it...');
//       cy.awxRequestPost<Pick<Project, 'name' | 'description' | 'scm_type' | 'scm_url'>, Project>(
//         '/api/v2/projects/',
//         {
//           name: GLOBAL_PROJECT_NAME,
//           description: GLOBAL_PROJECT_DESCRIPTION,
//           scm_type: 'git',
//           scm_url: GLOBAL_PROJECT_SCM_URL,
//         }
//       ).then(() => {
//         cy.log('✅ Global project created, access it via this.globalProject in the tests');
//       });
//     }
//   });
// });

Cypress.Commands.add('typeMonacoTextField', (textString: string) => {
  cy.get('[data-cy="expandable"]')
    .click()
    .then(() => {
      cy.get('[class*="monaco-scrollable-element"]').type(`${textString}{esc}`);
    });
});

Cypress.Commands.add('getCheckboxByLabel', (label: string | RegExp) => {
  cy.contains('.pf-v5-c-check__label', label)
    .invoke('attr', 'for')
    .then((id: string | undefined) => {
      if (id) {
        cy.get('#' + id);
      }
    });
});

Cypress.Commands.add('selectDropdownOptionByResourceName', (resource: string, itemName: string) => {
  cy.get(`[data-cy*="${resource}-form-group"]`).within(() => {
    cy.get('[data-ouia-component-id="menu-select"] button')
      .click()
      .then(() => {
        cy.contains('li', itemName).scrollIntoView().click();
      });
  });
});

Cypress.Commands.add('selectPromptOnLaunch', (resourceName: string) => {
  cy.get(`[data-cy="ask_${resourceName}_on_launch"]`).click();
});

Cypress.Commands.add(
  'selectDropdownOptionByResourceName',
  (resource: string, itemName: string, spyglass?: boolean) => {
    if (spyglass === undefined) {
      spyglass === false;
    }
    if (spyglass) {
      cy.get(`[data-cy*="${resource}-form-group"]`).within(() => {
        cy.get('button').eq(1).click();
      });
      cy.get('.pf-v5-c-modal-box').within(() => {
        cy.searchAndDisplayResource(itemName);
        cy.get('tbody tr input').click();
        cy.clickButton('Confirm');
      });
    } else {
      cy.get(`[data-cy*="${resource}-form-group"]`).within(() => {
        cy.get('[data-ouia-component-id="menu-select"] button')
          .click()
          .then(() => {
            cy.contains('li', itemName).click();
          });
      });
    }
  }
);

Cypress.Commands.add('selectItemFromLookupModal', (resource: string, itemName: string) => {
  cy.get(`[data-cy*="${resource}-form-group"]`).within(() => {
    cy.get('button').eq(1).click();
  });
  cy.get('.pf-v5-c-modal-box').within(() => {
    cy.searchAndDisplayResource(itemName);
    cy.get('[data-ouia-component-id="simple-table"] tbody').within(() => {
      cy.get('[data-cy="checkbox-column-cell"]').click();
    });
    cy.clickButton(/^Confirm/);
  });
});

Cypress.Commands.add('setTablePageSize', (text: '10' | '20' | '50' | '100') => {
  cy.get('.pf-v5-c-pagination')
    .first()
    .within(() => {
      cy.get('.pf-v5-c-menu-toggle').click();
      cy.contains('button', `${text} per page`).click();
    });
});

Cypress.Commands.add('clickLink', (label: string | RegExp) => {
  cy.contains('a:not(:disabled):not(:hidden)', label).should(
    'not.have.attr',
    'aria-disabled',
    'true'
  );
  cy.contains('a:not(:disabled):not(:hidden)', label).click();
});

Cypress.Commands.add('clickTab', (label: string | RegExp, isLink) => {
  if (isLink) {
    cy.contains('a[role="tab"]', label).click();
  } else {
    cy.contains('button[role="tab"]', label).click();
  }
});

Cypress.Commands.add('clickButton', (label: string | RegExp) => {
  cy.contains('button:not(:disabled):not(:hidden)', label).click();
});

Cypress.Commands.add('navigateTo', (component: string, label: string) => {
  cy.get('[data-cy="page-navigation"]').then((nav) => {
    if (nav.is(':visible')) {
      cy.get(`[data-cy="${component}-${label}"]`).click();
    } else {
      cy.get('[data-cy="nav-toggle"]').click();
      cy.get(`[data-cy="${component}-${label}"]`).click();
    }
  });
  cy.get('[data-cy="refresh"]').click();
});

Cypress.Commands.add('verifyPageTitle', (label: string) => {
  cy.get(`[data-cy="page-title"]`).should('contain', label);
});

Cypress.Commands.add('hasAlert', (label: string | RegExp) => {
  cy.contains('.pf-v5-c-alert__title', label);
});

Cypress.Commands.add('hasTooltip', (label: string | RegExp) => {
  cy.contains('.pf-v5-c-tooltip__content', label);
});

Cypress.Commands.add('clickToolbarKebabAction', (label: string | RegExp) => {
  cy.get('.page-table-toolbar').within(() => {
    cy.get('.toggle-kebab').click().get('.pf-v5-c-dropdown__menu-item').contains(label).click();
  });
});

Cypress.Commands.add('clickTableRow', (name: string | RegExp, filter?: boolean) => {
  if (filter !== false && typeof name === 'string') {
    cy.filterTableByText(name);
  }
  cy.contains('td', name).within(() => {
    cy.get('a').click();
  });
});

Cypress.Commands.add('getTableRowByText', (name: string | RegExp, filter?: boolean) => {
  if (filter !== false && typeof name === 'string') {
    cy.filterTableByText(name);
  }
  cy.contains('tr', name);
});

Cypress.Commands.add('getListCardByText', (name: string | RegExp, filter?: boolean) => {
  if (filter !== false && typeof name === 'string') {
    cy.filterTableByText(name);
  }
  cy.contains('article', name);
});

Cypress.Commands.add(
  'clickTableRowKebabAction',
  (name: string | RegExp, label: string | RegExp, filter?: boolean) => {
    cy.getTableRowByText(name, filter).within(() => {
      cy.get('[data-cy="actions-dropdown"]').click();
      cy.contains('.pf-v5-c-dropdown__menu-item', label)
        .should('not.be.disabled')
        .should('not.have.attr', 'aria-disabled', 'true')
        .click();
    });
  }
);

Cypress.Commands.add(
  'clickListCardKebabAction',
  (name: string | RegExp, label: string | RegExp, filter?: boolean) => {
    cy.getListCardByText(name, filter).within(() => {
      cy.get('.pf-v5-c-dropdown__toggle').click();
      cy.contains('.pf-v5-c-dropdown__menu-item', label)
        .should('not.be.disabled')
        .should('not.have.attr', 'aria-disabled', 'true')
        .click();
    });
  }
);

Cypress.Commands.add(
  'clickTableRowPinnedAction',
  (name: string | RegExp, iconDataCy: string, filter?: boolean) => {
    cy.getTableRowByText(name, filter).within(() => {
      cy.get('[data-cy="actions-column-cell"]').within(() => {
        cy.get(`[data-cy="${iconDataCy}"]`).click();
      });
    });
  }
);

Cypress.Commands.add('tableHasRowWithSuccess', (name: string | RegExp, filter?: boolean) => {
  cy.getTableRowByText(name, filter).within(() => {
    cy.get('[data-label="Status"]').should('contain', 'Successful');
  });
});

Cypress.Commands.add('selectTableRow', (name: string | RegExp, filter?: boolean) => {
  cy.getTableRowByText(name, filter).within(() => {
    cy.get('input[type=checkbox]').click();
  });
});

Cypress.Commands.add('getDialog', () => {
  cy.get('.pf-v5-c-modal-box');
});

Cypress.Commands.add('selectTableRowInDialog', (name: string | RegExp, filter?: boolean) => {
  cy.getDialog().within(() => {
    cy.getTableRowByText(name, filter).within(() => {
      cy.get('td[data-cy=checkbox-column-cell]').click();
    });
  });
});

Cypress.Commands.add('expandTableRow', (name: string | RegExp, filter?: boolean) => {
  cy.getTableRowByText(name, filter).within(() => {
    cy.get('button[id^="expand-toggle"]').click();
  });
});

Cypress.Commands.add(
  'hasDetail',
  (detailTerm: string | RegExp, detailDescription: string | RegExp) => {
    cy.contains('dt', detailTerm).next().should('contain', detailDescription);
  }
);

Cypress.Commands.add('clickModalButton', (label: string | RegExp) => {
  cy.getDialog().within(() => {
    cy.contains('button', label).click();
  });
});

Cypress.Commands.add('clickModalConfirmCheckbox', () => {
  cy.getDialog().within(() => {
    cy.get('input[id="confirm"]').click();
  });
});

Cypress.Commands.add('assertModalSuccess', () => {
  cy.getDialog().within(() => {
    cy.get('tbody>tr')
      .find('[data-label="Status"]')
      .each(($li) => {
        cy.wrap($li).should('contain', 'Success');
      });
  });
});

Cypress.Commands.add('clickPageAction', (label: string | RegExp) => {
  cy.get('.toggle-kebab').click().get('.pf-v5-c-dropdown__menu-item').contains(label).click();
});

// Resources for testing AWX
Cypress.Commands.add('createAwxOrganization', (orgName?: string) => {
  cy.awxRequestPost<Pick<Organization, 'name'>, Organization>('/api/v2/organizations/', {
    name: orgName ? orgName : 'E2E Organization ' + randomString(4),
  });
});

Cypress.Commands.add(
  'createAWXCredential',
  (
    credential: SetRequired<
      Partial<Omit<Credential, 'id'>>,
      'organization' | 'kind' | 'credential_type'
    >
  ) => {
    cy.awxRequestPost<
      SetRequired<Partial<Omit<Credential, 'id'>>, 'organization' | 'kind' | 'credential_type'>,
      Credential
    >('/api/v2/credentials/', {
      name: 'E2E Credential ' + randomString(4),
      ...credential,
    });
  }
);

Cypress.Commands.add(
  'deleteAwxCredential',
  (
    credential: Credential,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    // Delete organization created for this credential (this will also delete the credential)
    if (credential?.organization) {
      cy.awxRequestDelete(`/api/v2/organizations/${credential.organization.toString()}/`, options);
    }
  }
);

Cypress.Commands.add('createAwxCredentialType', () => {
  cy.awxRequestPost<Pick<CredentialType, 'name' | 'description'>, CredentialType>(
    '/api/v2/credential_types/',
    {
      name: 'E2E Credential Type ' + randomString(4),
      description: 'E2E Credential Type Description',
    }
  );
});

Cypress.Commands.add(
  'deleteAwxCredentialType',
  (
    credentialType: CredentialType,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    if (credentialType?.id) {
      cy.awxRequestDelete(`/api/v2/credential_types/${credentialType.id.toString()}/`, options);
    }
  }
);

Cypress.Commands.add(
  'awxRequest',
  function awxRequest<T>(
    method: string,
    url: string,
    body?: Cypress.RequestBody,
    /** Whether to fail on response codes other than 2xx and 3xx */
    failOnStatusCode?: boolean
  ) {
    let awxServer = Cypress.env('AWX_SERVER') as string;
    if (awxServer.endsWith('/')) awxServer = awxServer.slice(0, -1);
    cy.getGlobalAwxToken().then((awxToken) => {
      cy.request<T>({
        method,
        url: awxServer + url,
        body,
        headers: { Authorization: 'Bearer ' + awxToken.token },
        failOnStatusCode,
      });
    });
  }
);

Cypress.Commands.add('awxRequestPost', function awxRequestPost<
  RequestBodyT extends Cypress.RequestBody,
  ResponseBodyT = RequestBodyT,
>(url: string, body: RequestBodyT) {
  cy.awxRequest<ResponseBodyT>('POST', url, body).then((response) => response.body);
});

Cypress.Commands.add('awxRequestGet', function awxRequestGet<ResponseBodyT = unknown>(url: string) {
  cy.awxRequest<ResponseBodyT>('GET', url).then((response) => response.body);
});

Cypress.Commands.add(
  'awxRequestDelete',
  function awxRequestDelete(
    url: string,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) {
    cy.awxRequest('DELETE', url, undefined, options?.failOnStatusCode);
  }
);

Cypress.Commands.add(
  'deleteAwxOrganization',
  (
    organization: Organization,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    if (!organization?.id) return;
    cy.awxRequestDelete(`/api/v2/organizations/${organization?.id}/`, options);
  }
);

Cypress.Commands.add('createAwxTeam', (organization: Organization) => {
  cy.awxRequestPost<Pick<Team, 'name' | 'organization'>, Team>('/api/v2/teams/', {
    name: 'E2E Team ' + randomString(4),
    organization: organization.id,
  });
});

Cypress.Commands.add(
  'deleteAwxTeam',
  (
    team: Team,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    if (team.id) {
      cy.awxRequestDelete(`/api/v2/teams/${team.id.toString()}/`, options);
    }
  }
);

Cypress.Commands.add('createAwxUser', (organization: Organization) => {
  cy.awxRequestPost<Omit<User, 'id' | 'auth' | 'summary_fields'>, User>(
    `/api/v2/organizations/${organization.id.toString()}/users/`,
    {
      username: 'e2e-user-' + randomString(4),
      is_superuser: false,
      is_system_auditor: false,
      password: 'pw',
      user_type: 'normal',
    }
  ).then((user) => user);
});

Cypress.Commands.add(
  'deleteAwxUser',
  (
    user: User,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    if (user?.id) {
      cy.awxRequestDelete(`/api/v2/users/${user.id}/`, options);
    }
  }
);

Cypress.Commands.add(
  'createAwxProject',
  (project?: SetRequired<Partial<Omit<Project, 'id'>>, 'organization'>, skipSync?: boolean) => {
    cy.awxRequestPost<Partial<Project>, Project>('/api/v2/projects/', {
      name: 'E2E Project ' + randomString(4),
      scm_type: 'git',
      scm_url: 'https://github.com/ansible/ansible-ui',
      ...project,
    }).then((project) => {
      if (!skipSync) {
        cy.waitForProjectToFinishSyncing(project.id);
      } else {
        cy.wrap(project);
      }
    });
  }
);

Cypress.Commands.add('waitForProjectToFinishSyncing', (projectId: number) => {
  let requestCount = 1;
  cy.awxRequestGet<Project>(`/api/v2/projects/${projectId}`).then((project) => {
    // Assuming that projects could take up to 5 min to sync if the instance is under load with other jobs
    if (project.status === 'successful' || requestCount > 300) {
      if (requestCount > 300) {
        cy.log('Reached maximum number of requests for reading project status');
      }
      // Reset request count
      requestCount = 1;
      return;
    }
    Cypress.log({
      displayName: 'PROJECT SYNC:',
      message: [`🕓WAITING FOR PROJECT TO SYNC...🕓`],
    });
    requestCount++;
    cy.wait(1000);
    cy.waitForProjectToFinishSyncing(projectId);
  });
});

Cypress.Commands.add(
  'createAwxExecutionEnvironment',
  (execution_environment?: Partial<Omit<ExecutionEnvironment, 'id'>>) => {
    cy.awxRequestPost<Partial<Omit<ExecutionEnvironment, 'id'>>, ExecutionEnvironment>(
      '/api/v2/execution_environments/',
      {
        name: 'E2E Execution Environment ' + randomString(4),
        image: 'executionenvimage',
        ...execution_environment,
      }
    );
  }
);

Cypress.Commands.add(
  'createEdaSpecificAwxProject',
  (options?: { project?: Partial<Omit<Project, 'id'>> }) => {
    cy.createAwxProject({
      name: 'EDA Project ' + randomString(4),
      organization: options?.project?.organization ?? null,
      scm_type: 'git',
      scm_url: 'https://github.com/ansible/ansible-ui',
    });
  }
);

Cypress.Commands.add(
  'deleteAwxProject',
  (
    project: Project,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    const organizationId = project.organization;
    // Delete sync job related to project
    if (project && project.related && typeof project.related.last_job === 'string') {
      const projectUpdateEndpoint: string = project.related.last_job;
      cy.awxRequestDelete(projectUpdateEndpoint, options);
    }
    // Delete project
    cy.awxRequestDelete(`/api/v2/projects/${project.id}/`, options);
    // Delete organization for the project
    if (organizationId) {
      cy.requestDelete(`/api/v2/organizations/${organizationId.toString()}/`, options);
    }
  }
);

// Cypress.Commands.add('createAwxOrganization', (orgName?: string) => {
//   cy.awxRequestPost<Pick<Organization, 'name'>, Organization>('/api/v2/organizations/', {
//     name: orgName ? orgName : 'E2E Organization ' + randomString(4),
//   });
// });

Cypress.Commands.add('createAwxInventory', (inventory?: Partial<Omit<Inventory, 'id'>>) => {
  if (inventory?.organization !== undefined) {
    cy.awxRequestPost<Partial<Omit<Inventory, 'id'>>, Inventory>('/api/v2/inventories/', {
      name: 'E2E Inventory ' + randomString(4),
      ...inventory,
    });
  } else {
    cy.createAwxOrganization().then((organization) => {
      cy.awxRequestPost<Partial<Omit<Inventory, 'id'>>, Inventory>('/api/v2/inventories/', {
        name: 'E2E Inventory ' + randomString(4),
        organization: organization.id,
        ...inventory,
      });
    });
  }
});

Cypress.Commands.add(
  'deleteAwxInventory',
  (
    inventory: Inventory,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    // Delete organization created for this inventory (this will also delete the inventory)
    if (inventory?.organization) {
      cy.awxRequestDelete(`/api/v2/organizations/${inventory.organization.toString()}/`, options);
    }
  }
);

Cypress.Commands.add('createAWXSchedule', () => {
  cy.requestPost<Schedule>('/api/v2/schedules/', {
    name: 'E2E Schedule ' + randomString(4),
    description: 'E2E Schedule Description',
    enabled: true,
    rrule: 'DTSTART:20201231T000000Z RRULE:FREQ=DAILY;INTERVAL=1;COUNT=1',
    unified_job_template: 1,
    extra_data: {},
  }).then((schedule) => schedule);
});

Cypress.Commands.add(
  'deleteAWXSchedule',
  (
    schedule: Schedule,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */

      failOnStatusCode?: boolean;
    }
  ) => {
    cy.requestDelete(`/api/v2/schedules/${schedule.id}/`, options);
  }
);

Cypress.Commands.add(
  'createAwxOrganizationProjectInventoryJobTemplate',
  (options?: { project?: Partial<Omit<Project, 'id'>>; jobTemplate?: Partial<JobTemplate> }) => {
    cy.createAwxOrganization().then((organization) => {
      cy.createAwxInventory({ organization: organization.id }).then((inventory) => {
        cy.createEdaSpecificAwxProject({ project: { organization: organization.id } }).then(
          (project) => {
            cy.createEdaAwxJobTemplate(project, inventory, options?.jobTemplate).then(
              (jobTemplate) => ({
                project,
                inventory,
                jobTemplate,
              })
            );
          }
        );
      });
    });
  }
);

/** Interface for tracking created resources that will need to be delete
at the end of testing using cy.deleteAwxResources*/
export interface IAwxResources {
  jobTemplate?: JobTemplate;
}

Cypress.Commands.add(
  'deleteAwxResources',
  (
    resources?: IAwxResources,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */

      failOnStatusCode?: boolean;
    }
  ) => {
    if (resources?.jobTemplate) cy.deleteAwxJobTemplate(resources.jobTemplate, options);
  }
);

Cypress.Commands.add(
  'createAwxJobTemplate',
  (
    jobTemplate: SetRequired<
      Partial<Omit<JobTemplate, 'id'>>,
      'organization' | 'project' | 'inventory'
    >
  ) => {
    cy.requestPost<
      SetRequired<Partial<Omit<JobTemplate, 'id'>>, 'organization' | 'project' | 'inventory'>,
      JobTemplate
    >('/api/v2/job_templates/', {
      name: 'E2E Job Template ' + randomString(4),
      playbook: 'playbooks/hello_world.yml',
      ...jobTemplate,
    });
  }
);

Cypress.Commands.add('createAwxWorkflowJobTemplate', (jobTemplate: WorkflowJobTemplate) => {
  cy.requestPost<WorkflowJobTemplate>('/api/v2/workflow_job_templates/', {
    name: 'E2E Job Template ' + randomString(4),
    ...jobTemplate,
  });
});

Cypress.Commands.add(
  'createEdaAwxJobTemplate',
  (project: Project, inventory: Inventory, jobTemplate?: Partial<JobTemplate>) => {
    cy.awxRequestPost<Partial<JobTemplate>, JobTemplate>('/api/v2/job_templates/', {
      name: 'run_basic',
      playbook: 'basic.yml',
      project: project.id,
      inventory: inventory.id,
      organization: inventory.organization,
      ...jobTemplate,
    });
  }
);

Cypress.Commands.add('getAwxJobTemplateByName', (awxJobTemplateName: string) => {
  cy.awxRequestGet<AwxItemsResponse<JobTemplate>>(
    `/api/v2/job_templates/?name=${awxJobTemplateName}`
  ).then((result) => {
    cy.log('Job Template', result);
    if (result && result.count === 0) {
      cy.createAwxOrganizationProjectInventoryJobTemplate();
    } else {
      cy.awxRequestGet<JobTemplate>(
        `/api/v2/job_templates/${result.results[0].id?.toString() ?? ''}`
      );
    }
  });
});

Cypress.Commands.add(
  'deleteAwxJobTemplate',
  (
    jobTemplate: JobTemplate,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    const projectId = jobTemplate.project;

    if (jobTemplate.id) {
      const templateId = typeof jobTemplate.id === 'number' ? jobTemplate.id.toString() : '';
      cy.awxRequestDelete(`/api/v2/job_templates/${templateId}/`, options);
    }
    if (typeof projectId === 'number') {
      cy.awxRequestGet<Project>(`/api/v2/projects/${projectId}/`).then((project) => {
        // This will take care of deleting the project and the associated org, inventory
        cy.deleteAwxProject(project, options);
      });
    }
  }
);

Cypress.Commands.add(
  'createInventoryHostGroup',
  function createInventoryHostGroup(organization: Organization) {
    cy.awxRequestPost<Partial<Inventory>>('/api/v2/inventories/', {
      name: 'E2E Inventory ' + randomString(4),
      organization: organization.id,
    }).then((inventory) => {
      cy.awxRequestPost<Partial<AwxHost>, AwxHost>('/api/v2/hosts/', {
        name: 'E2E Host ' + randomString(4),
        inventory: inventory.id,
      }).then((host) => {
        cy.awxRequestPost<{ name: string; inventory: number }>(`/api/v2/hosts/${host.id}/groups/`, {
          name: 'E2E Group ' + randomString(4),
          inventory: host.inventory,
        }).then((group) => ({
          inventory,
          host,
          group,
        }));
      });
    });
  }
);

Cypress.Commands.add('createAwxLabel', (label: Partial<Omit<Label, 'id'>>) => {
  cy.awxRequestPost<Partial<Omit<Label, 'id'>>, Label>('/api/v2/labels/', {
    name: 'E2E Label ' + randomString(4),
    ...label,
  });
});

Cypress.Commands.add(
  'deleteAwxLabel',
  (
    label?: Label,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    const labelId = label?.id;
    if (labelId) {
      cy.awxRequestDelete(`/api/v2/labels/${labelId.toString()}/`, options);
    }
  }
);

Cypress.Commands.add(
  'createAwxInstanceGroup',
  (instanceGroup?: Partial<Omit<InstanceGroup, 'id'>>) => {
    cy.awxRequestPost<Partial<Omit<InstanceGroup, 'id'>>, InstanceGroup>(
      '/api/v2/instance_groups/',
      {
        name: 'E2E Instance Group ' + randomString(4),
        ...instanceGroup,
      }
    );
  }
);

Cypress.Commands.add(
  'deleteAwxInstanceGroup',
  (
    instanceGroup: InstanceGroup,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    // const instanceGroupId = instanceGroup.id;
    if (instanceGroup?.id) {
      cy.awxRequestDelete(`/api/v2/instance_groups/${instanceGroup.id.toString()}/`, options);
    }
  }
);

Cypress.Commands.add('createAwxToken', (awxToken?: Partial<AwxToken>) => {
  let awxServer = Cypress.env('AWX_SERVER') as string;
  if (awxServer.endsWith('/')) awxServer = awxServer.slice(0, -1);
  const username = Cypress.env('AWX_USERNAME') as string;
  const password = Cypress.env('AWX_PASSWORD') as string;
  cy.exec(
    `curl --insecure -d '${JSON.stringify({
      description: 'E2E-' + randomString(4),
      ...awxToken,
    })}' -H "Content-Type: application/json" -u "${username}:${password}" -X POST '${awxServer}/api/v2/tokens/'`
  ).then((result) => JSON.parse(result.stdout) as AwxToken);
});

Cypress.Commands.add('getGlobalAwxToken', () => {
  if (globalAwxToken) cy.wrap(globalAwxToken);
  else cy.createAwxToken().then((awxToken) => (globalAwxToken = awxToken));
});

Cypress.Commands.add(
  'deleteAwxToken',
  (
    awxToken: AwxToken,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    cy.awxRequestDelete(`/api/v2/tokens/${awxToken.id}/`, options);
  }
);

// Global variable to store the token for AWX
// Created on demand when a command needs it
let globalAwxToken: AwxToken | undefined;

after(() => {
  // Delete the token if it was created
  if (globalAwxToken) cy.deleteAwxToken(globalAwxToken, { failOnStatusCode: false });
});

Cypress.Commands.add('waitForTemplateStatus', (jobID: string) => {
  cy.requestGet<AwxItemsResponse<JobEvent>>(
    `api/v2/jobs/${jobID}/job_events/?order_by=counter&page=1&page_size=50`
  )
    .its('results')
    .then((results: { summary_fields: { job: { status: string } } }[]) => {
      if (results.length > 0) {
        return results[0].summary_fields.job.status;
      }
      return '';
    })
    .then((status: string) => {
      cy.log(status);
      switch (status) {
        case 'failed':
        case 'successful':
          cy.wrap(status);
          break;
        default:
          cy.wait(100).then(() => cy.waitForTemplateStatus(jobID));
          break;
      }
    });
});
