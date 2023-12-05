import '@cypress/code-coverage/support';
import { SetRequired } from 'type-fest';
import { randomString } from '../../framework/utils/random-string';
import { AwxItemsResponse } from '../../frontend/awx/common/AwxItemsResponse';
import { AwxHost } from '../../frontend/awx/interfaces/AwxHost';
import { AwxToken } from '../../frontend/awx/interfaces/AwxToken';
import { Credential } from '../../frontend/awx/interfaces/Credential';
import { CredentialType } from '../../frontend/awx/interfaces/CredentialType';
import { ExecutionEnvironment } from '../../frontend/awx/interfaces/ExecutionEnvironment';
import { InstanceGroup } from '../../frontend/awx/interfaces/InstanceGroup';
import { Inventory } from '../../frontend/awx/interfaces/Inventory';
import { Job } from '../../frontend/awx/interfaces/Job';
import { JobEvent } from '../../frontend/awx/interfaces/JobEvent';
import { JobTemplate } from '../../frontend/awx/interfaces/JobTemplate';
import { Label } from '../../frontend/awx/interfaces/Label';
import { Organization } from '../../frontend/awx/interfaces/Organization';
import { Project } from '../../frontend/awx/interfaces/Project';
import { Schedule } from '../../frontend/awx/interfaces/Schedule';
import { Team } from '../../frontend/awx/interfaces/Team';
import { User } from '../../frontend/awx/interfaces/User';
import { WorkflowJobTemplate } from '../../frontend/awx/interfaces/WorkflowJobTemplate';
import './auth';
import './commands';
import { awxAPI } from './formatApiPathForAwx';
import './rest-commands';
//import { Credential } from '../../frontend/eda/interfaces/generated/eda-api';

//  AWX related custom command implementation

/**
 * cy.inputCustomCredTypeConfig(json/yml, input/injector config)
 */

Cypress.Commands.add('inputCustomCredTypeConfig', (configType: string, config: string) => {
  cy.get(`[data-cy="${configType}"]`)
    .find('textarea:not(:disabled)')
    .focus()
    .clear()
    .type('{selectAll}{backspace}')
    .type(`${config}`, {
      delay: 0,
      parseSpecialCharSequences: false,
    })
    .type('{esc}');
});

/**@param
 * createAWXCredentialTypeUI
 */

Cypress.Commands.add(
  'createAndDeleteCustomAWXCredentialTypeUI',
  (
    customCredTypeName: string,
    inputConfig?: string,
    injectorConfig?: string,
    defaultFormat?: string
  ) => {
    const credentialTypeDesc = 'This is a custom credential type that is not managed';
    cy.navigateTo('awx', 'credential-types');
    cy.get('a[data-cy="create-credential-type"').click();
    cy.verifyPageTitle('Create Credential Type');
    cy.url().then((currentUrl) => {
      expect(currentUrl.includes('/credential-types/create')).to.be.true;
    });
    cy.get('[data-cy="name"]').type(`${customCredTypeName}`);
    cy.get('[data-cy="description"]').type(`${credentialTypeDesc}`);
    if (inputConfig && injectorConfig) {
      if (defaultFormat === 'json') {
        cy.configFormatToggle('inputs');
      }
      cy.inputCustomCredTypeConfig('inputs', inputConfig);
      if (defaultFormat === 'json') {
        cy.configFormatToggle('injectors');
      }
      cy.inputCustomCredTypeConfig('injectors', injectorConfig);
    }
    cy.clickButton(/^Create credential type$/);
    cy.verifyPageTitle(customCredTypeName);
    cy.hasDetail(/^Name$/, `${customCredTypeName}`);
    cy.hasDetail(/^Description$/, `${credentialTypeDesc}`);
    cy.clickPageAction('delete-credential-type');
    cy.get('#confirm').click();
    cy.clickButton(/^Delete credential type/);
    cy.clickButton(/^Close/);
  }
);

/** @param
 * Configuration format YAML-JSON and JSON-YAML toggle switch
 *
 */

Cypress.Commands.add('configFormatToggle', (configType: string) => {
  cy.get(`[data-cy="${configType}-form-group"] [data-cy=toggle-json]`).click();
});

Cypress.Commands.add('typeMonacoTextField', (textString: string) => {
  cy.get('[data-cy="variables"]').type(textString);
});

Cypress.Commands.add('assertMonacoTextField', (textString: string) => {
  cy.get('[data-cy="variables"] code').should('contain', textString);
});

Cypress.Commands.add('selectPromptOnLaunch', (resourceName: string) => {
  cy.get(`[data-cy="ask_${resourceName}_on_launch"]`).click();
});

Cypress.Commands.add('selectItemFromLookupModal', (resource: string, itemName: string) => {
  cy.get(`[data-cy*="${resource}-form-group"]`).within(() => {
    cy.get('button').eq(1).click();
  });
  cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
    cy.searchAndDisplayResource(itemName);
    cy.get('[data-ouia-component-id="simple-table"] tbody').within(() => {
      cy.get('[data-cy="checkbox-column-cell"] input').click();
    });
    cy.clickButton(/^Confirm/);
  });
});

Cypress.Commands.add('selectDropdownOptionByResourceName', (resource: string, itemName: string) => {
  const menuSelector = `[data-cy*="${resource}-form-group"] div[data-ouia-component-id="menu-select"]`;
  cy.get('[data-cy="loading-spinner"]').should('not.exist');

  cy.get(`${menuSelector}`)
    .find('svg[data-cy="lookup-button"]', { timeout: 1000 })
    .should((_) => {})
    .then(($elements) => {
      if ($elements.length) {
        cy.get('svg[data-cy="lookup-button"]').click({ force: true });
        cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
          cy.searchAndDisplayResource(itemName);
          cy.get('tbody tr input').click();
          cy.clickButton('Confirm');
        });
      } else {
        cy.get(`${menuSelector} button`)
          .click()
          .then(() => {
            cy.contains('li', itemName).click();
          });
      }
    });
});

Cypress.Commands.add('setTablePageSize', (text: '10' | '20' | '50' | '100') => {
  cy.get('[data-cy="pagination"]')
    .first()
    .within(() => {
      cy.get('#options-menu-bottom-toggle').click();
      cy.contains('button', `${text} per page`).click();
    });
});

Cypress.Commands.add('clickLink', (label: string | RegExp) => {
  cy.contains('a:not(:disabled):not(:hidden)', label)
    .should('not.have.attr', 'aria-disabled', 'true')
    .should('be.visible');
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
  cy.contains('button', label).click();
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
  cy.clearAllFilters();
  cy.get('[data-cy="refresh"]').click();
});

Cypress.Commands.add('verifyPageTitle', (label: string) => {
  cy.get(`[data-cy="page-title"]`).should('contain', label);
});

Cypress.Commands.add('hasAlert', (label: string | RegExp) => {
  cy.contains('[data-cy="alert-toaster"]', label);
});

Cypress.Commands.add('hasTooltip', (label: string | RegExp) => {
  cy.contains('.pf-v5-c-tooltip__content', label);
});

Cypress.Commands.add('clickToolbarKebabAction', (dataCyLabel: string | RegExp) => {
  cy.get('[data-ouia-component-id="page-toolbar"]').within(() => {
    cy.get('[data-cy*="actions-dropdown"]')
      .click()
      .then(() => {
        cy.get(`[data-cy=${dataCyLabel}]`).click();
      });
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

Cypress.Commands.add('selectDetailsPageKebabAction', (dataCy: string) => {
  cy.get('[data-cy="actions-dropdown"]')
    .click()
    .then(() => {
      cy.get(`[data-cy="${dataCy}"]`).click();
      cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
        cy.get('[data-ouia-component-id="confirm"]').click();
        cy.get('[data-ouia-component-id="submit"]').click();
      });
    });
});

Cypress.Commands.add(
  'clickTableRowKebabAction',
  (name: string | RegExp, dataCyLabel: string | RegExp, filter?: boolean) => {
    cy.getTableRowByText(name, filter).within(() => {
      cy.get('[data-cy*="actions-dropdown"]')
        .click()
        .then(() => {
          cy.get(`[data-cy=${dataCyLabel}]`).click();
        });
    });
  }
);

Cypress.Commands.add(
  'clickListCardKebabAction',
  (id: number, name: string | RegExp, dataCyLabel: string | RegExp) => {
    cy.get(`[data-ouia-component-id="${id}"]`).within(() => {
      cy.get('[data-cy*="actions-dropdown"]')
        .click()
        .then(() => {
          cy.get(`[data-cy=${dataCyLabel}]`).click();
        });
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

Cypress.Commands.add('selectTableRowInDialog', (name: string | RegExp, filter?: boolean) => {
  cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
    cy.getTableRowByText(name, filter).within(() => {
      cy.get('td[data-cy=checkbox-column-cell]').click();
    });
  });
});

Cypress.Commands.add('expandTableRow', (name: string | RegExp, filter?: boolean) => {
  cy.getTableRowByText(name, filter).within(() => {
    cy.get('[data-cy="expand-column-cell"]').click();
  });
});

Cypress.Commands.add(
  'hasDetail',
  (detailTerm: string | RegExp, detailDescription: string | RegExp) => {
    cy.contains('dt', detailTerm).next().should('contain', detailDescription);
  }
);

Cypress.Commands.add('clickModalButton', (label: string | RegExp) => {
  cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
    cy.contains('button', label).click();
  });
});

Cypress.Commands.add('clickModalConfirmCheckbox', () => {
  cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
    cy.get('input[id="confirm"]').click();
  });
});

Cypress.Commands.add('assertModalSuccess', () => {
  cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
    cy.get('tbody>tr')
      .find('[data-label="Status"]')
      .each(($li) => {
        cy.wrap($li).should('contain', 'Success');
      });
  });
});

Cypress.Commands.add('clickPageAction', (dataCyLabel: string | RegExp) => {
  cy.get('[data-cy="actions-dropdown"]')
    .click()
    .then(() => {
      cy.get(`[data-cy="${dataCyLabel}"]`).click();
    });
});

// Resources for testing AWX
Cypress.Commands.add('createAwxOrganization', (orgName?: string, failOnStatusCode?: boolean) => {
  cy.awxRequestPost<Pick<Organization, 'name'>, Organization>(
    awxAPI`/organizations/`,
    { name: orgName ? orgName : 'E2E Organization ' + randomString(4) },
    failOnStatusCode
  );
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
    >(awxAPI`/credentials/`, {
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
    cy.awxRequestDelete(awxAPI`/credentials/${credential.id.toString()}/`, options);
  }
);

Cypress.Commands.add('createAwxCredentialType', () => {
  cy.awxRequestPost<Pick<CredentialType, 'name' | 'description' | 'kind'>, CredentialType>(
    awxAPI`/credential_types/`,
    {
      name: 'E2E Custom Credential Type ' + randomString(4),
      description: 'E2E Custom Credential Type Description',
      kind: 'cloud',
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
      cy.awxRequestDelete(awxAPI`/credential_types/${credentialType.id.toString()}`, options);
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
>(url: string, body: RequestBodyT, failOnStatusCode?: boolean) {
  cy.awxRequest<ResponseBodyT>('POST', url, body, failOnStatusCode).then(
    (response) => response.body
  );
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
    cy.awxRequestDelete(awxAPI`/organizations/${organization?.id.toString()}/`, options);
  }
);

Cypress.Commands.add('createAwxTeam', (organization: Organization) => {
  cy.awxRequestPost<Pick<Team, 'name' | 'organization'>, Team>(awxAPI`/teams/`, {
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
      cy.awxRequestDelete(awxAPI`/teams/${team.id.toString()}/`, options);
    }
  }
);

Cypress.Commands.add('createAwxUser', (organization: Organization) => {
  cy.awxRequestPost<Omit<User, 'id' | 'auth' | 'summary_fields'>, User>(
    awxAPI`/organizations/${organization.id.toString()}/users/`,
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
      cy.awxRequestDelete(awxAPI`/users/${user.id.toString()}/`, options);
    }
  }
);

Cypress.Commands.add(
  'createAwxProject',
  (project?: SetRequired<Partial<Omit<Project, 'id'>>, 'organization'>, skipSync?: boolean) => {
    cy.awxRequestPost<Partial<Project>, Project>(awxAPI`/projects/`, {
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
  cy.awxRequestGet<Project>(awxAPI`/projects/${projectId.toString()}`).then((project) => {
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
      awxAPI`/execution_environments/`,
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
    cy.awxRequestDelete(awxAPI`/projects/${project.id.toString()}/`, options);
    // Delete organization for the project
    if (organizationId) {
      cy.requestDelete(awxAPI`/organizations/${organizationId.toString()}/`, options);
    }
  }
);

Cypress.Commands.add('createAwxInventory', (inventory?: Partial<Omit<Inventory, 'id'>>) => {
  if (inventory?.organization !== undefined) {
    cy.awxRequestPost<Partial<Omit<Inventory, 'id'>>, Inventory>(awxAPI`/inventories/`, {
      name: 'E2E Inventory ' + randomString(4),
      ...inventory,
    });
  } else {
    cy.createAwxOrganization().then((organization) => {
      cy.awxRequestPost<Partial<Omit<Inventory, 'id'>>, Inventory>(awxAPI`/inventories/`, {
        name: 'E2E Inventory ' + randomString(4),
        organization: organization.id,
        ...inventory,
      });
    });
  }
});
Cypress.Commands.add(
  'createAwxInventorySource',
  (inventory: Partial<Pick<Inventory, 'id'>>, project: Partial<Pick<Project, 'id'>>) => {
    cy.requestPost(awxAPI`/inventory_sources/`, {
      name: 'E2E Inventory Source ' + randomString(4),
      descriptiom: 'This is a description',
      source: 'scm',
      source_project: project.id,
      source_path: '',
      inventory: inventory.id,
    });
  }
);

Cypress.Commands.add(
  'deleteAwxInventory',
  (
    inventory: Inventory,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    cy.awxRequestDelete(awxAPI`/inventories/${inventory.id.toString()}/`, options);
  }
);

Cypress.Commands.add('createAWXSchedule', () => {
  cy.requestPost<Schedule>(awxAPI`/schedules/`, {
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
    cy.requestDelete(awxAPI`/schedules/${schedule.id.toString()}/`, options);
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
    >(awxAPI`/job_templates/`, {
      name: 'E2E Job Template ' + randomString(4),
      playbook: 'playbooks/hello_world.yml',
      ...jobTemplate,
    });
  }
);

Cypress.Commands.add(
  'createAwxWorkflowJobTemplate',
  (workflowJobTemplate: Partial<WorkflowJobTemplate>) => {
    cy.requestPost<WorkflowJobTemplate>(awxAPI`/workflow_job_templates/`, {
      name: 'E2E WorkflowJob Template ' + randomString(4),
      ...workflowJobTemplate,
    });
  }
);

Cypress.Commands.add('getAwxWorkflowJobTemplateByName', (awxWorkflowJobTemplateName: string) => {
  cy.awxRequestGet<AwxItemsResponse<WorkflowJobTemplate>>(
    awxAPI`/workflow_job_templates/?name=${awxWorkflowJobTemplateName}`
  );
});

Cypress.Commands.add(
  'renderWorkflowVisualizerNodesFromFixtureFile',
  (workflowJobTemplateName: string, fixtureFile: string) => {
    cy.getAwxWorkflowJobTemplateByName(workflowJobTemplateName)
      .its('results[0]')
      .then((results: WorkflowJobTemplate) => {
        cy.log('THIS ONE THIS ONE', results.id);
        cy.intercept(
          {
            method: 'GET',
            url: awxAPI`/workflow_job_templates/${results.id.toString()}/workflow_nodes/`,
          },
          { fixture: fixtureFile }
        )
          .as('newVisualizerView')
          .then(() => {
            cy.visit(`/ui_next/templates/workflow_job_template/${results.id}/visualizer`);
          });
      });
  }
);

Cypress.Commands.add(
  'deleteAwxWorkflowJobTemplate',
  (
    workflowJobTemplate: WorkflowJobTemplate,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    if (workflowJobTemplate.id) {
      const workflowTemplateId =
        typeof workflowJobTemplate.id === 'number' ? workflowJobTemplate.id.toString() : '';
      cy.awxRequestDelete(awxAPI`/workflow_job_templates/${workflowTemplateId}/`, options);
    }
  }
);

Cypress.Commands.add(
  'createEdaAwxJobTemplate',
  (project: Project, inventory: Inventory, jobTemplate?: Partial<JobTemplate>) => {
    cy.awxRequestPost<Partial<JobTemplate>, JobTemplate>(awxAPI`/job_templates/`, {
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
    awxAPI`/job_templates/?name=${awxJobTemplateName}`
  ).then((result) => {
    cy.log('Job Template', result);
    if (result && result.count === 0) {
      cy.createAwxOrganizationProjectInventoryJobTemplate();
    } else {
      cy.awxRequestGet<JobTemplate>(
        awxAPI`/job_templates/${result.results[0].id?.toString() ?? ''}`
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
    if (jobTemplate.id) {
      const templateId = typeof jobTemplate.id === 'number' ? jobTemplate.id.toString() : '';
      cy.awxRequestDelete(awxAPI`/job_templates/${templateId}/`, options);
    }
  }
);

Cypress.Commands.add(
  'createInventoryHostGroup',
  function createInventoryHostGroup(organization: Organization) {
    cy.awxRequestPost<Partial<Inventory>>(awxAPI`/inventories/`, {
      name: 'E2E Inventory ' + randomString(4),
      organization: organization.id,
    }).then((inventory) => {
      cy.awxRequestPost<Partial<AwxHost>, AwxHost>(awxAPI`/hosts/`, {
        name: 'E2E Host ' + randomString(4),
        inventory: inventory.id,
      }).then((host) => {
        cy.awxRequestPost<{ name: string; inventory: number }>(
          awxAPI`/hosts/${host.id.toString()}/groups/`,
          {
            name: 'E2E Group ' + randomString(4),
            inventory: host.inventory,
          }
        ).then((group) => ({
          inventory,
          host,
          group,
        }));
      });
    });
  }
);

Cypress.Commands.add('createAwxLabel', (label: Partial<Omit<Label, 'id'>>) => {
  cy.awxRequestPost<Partial<Omit<Label, 'id'>>, Label>(awxAPI`/labels/`, {
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
      cy.awxRequestDelete(awxAPI`/labels/${labelId.toString()}/`, options);
    }
  }
);

Cypress.Commands.add(
  'createAwxInstanceGroup',
  (instanceGroup?: Partial<Omit<InstanceGroup, 'id'>>) => {
    cy.awxRequestPost<Partial<Omit<InstanceGroup, 'id'>>, InstanceGroup>(
      awxAPI`/instance_groups/`,
      {
        name: 'E2E Instance Group ' + randomString(4),
        percent_capacity_remaining: 100,
        policy_instance_minimum: 100,
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
      cy.awxRequestDelete(awxAPI`/instance_groups/${instanceGroup.id.toString()}/`, options);
    }
  }
);

Cypress.Commands.add('createAwxToken', (awxToken?: Partial<AwxToken>) => {
  let awxServer = Cypress.env('AWX_SERVER') as string;
  if (awxServer.endsWith('/')) awxServer = awxServer.slice(0, -1);
  const username = Cypress.env('AWX_USERNAME') as string;
  const password = Cypress.env('AWX_PASSWORD') as string;
  const tokensEndpoint = awxAPI`/tokens/`;
  cy.exec(
    `curl --insecure -d '${JSON.stringify({
      description: 'E2E-' + randomString(4),
      ...awxToken,
    })}' -H "Content-Type: application/json" -u "${username}:${password}" -X POST '${awxServer}${tokensEndpoint}'`
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
    cy.awxRequestDelete(awxAPI`/tokens/${awxToken.id.toString()}/`, options);
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

Cypress.Commands.add('waitForJobToProcessEvents', (jobID: string) => {
  const waitForJobToFinishProcessingEvents = (maxLoops: number) => {
    if (maxLoops === 0) {
      cy.log('Max loops reached while waiting for processing events.');
      return;
    }
    cy.wait(500);

    cy.requestGet<Job>(`api/v2/jobs/${jobID}/`).then((job) => {
      if (job.event_processing_finished !== true) {
        cy.log(`EVENT PROCESSING = ${job.event_processing_finished}`);
        cy.log(`MAX LOOPS RAN = ${maxLoops}`);
        waitForJobToFinishProcessingEvents(maxLoops - 1);
      } else {
        cy.log(`EVENT PROCESSED = ${job.event_processing_finished}`);
      }
    });
  };
  /*
  reason the numbers chosen for wait is 500ms and maxLoops is 80,
  as processing events takes ~30s, hence 80 * 500ms is chosen as the upper limit)
  */
  waitForJobToFinishProcessingEvents(80);
});
