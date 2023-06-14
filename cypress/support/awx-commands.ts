import '@cypress/code-coverage/support';
import { SetRequired } from 'type-fest';
import { randomString } from '../../framework/utils/random-string';
import { AwxHost } from '../../frontend/awx/interfaces/AwxHost';
import { AwxToken } from '../../frontend/awx/interfaces/AwxToken';
import { Credential } from '../../frontend/awx/interfaces/Credential';
import { ExecutionEnvironment } from '../../frontend/awx/interfaces/ExecutionEnvironment';
import { InstanceGroup } from '../../frontend/awx/interfaces/InstanceGroup';
import { Inventory } from '../../frontend/awx/interfaces/Inventory';
import { JobTemplate } from '../../frontend/awx/interfaces/JobTemplate';
import { Label } from '../../frontend/awx/interfaces/Label';
import { Organization } from '../../frontend/awx/interfaces/Organization';
import { Project } from '../../frontend/awx/interfaces/Project';
import { Schedule } from '../../frontend/awx/interfaces/Schedule';
import { Team } from '../../frontend/awx/interfaces/Team';
import { User } from '../../frontend/awx/interfaces/User';
import { ItemsResponse } from '../../frontend/common/crud/Data';
import './auth';
import './commands';
import './rest-commands';

//  AWX related custom command implementation

Cypress.Commands.add('getFormGroupByLabel', (label: string | RegExp) => {
  cy.contains('.pf-c-form__label-text', label).parent().parent().parent();
});

Cypress.Commands.add('getInputByLabel', (label: string | RegExp) => {
  cy.contains('.pf-c-form__label-text', label)
    .parent()
    .invoke('attr', 'for')
    .then((id: string | undefined) => {
      if (id) {
        cy.get('#' + id).should('be.enabled');
      }
    });
});

Cypress.Commands.add('getCheckboxByLabel', (label: string | RegExp) => {
  cy.contains('.pf-c-check__label', label)
    .invoke('attr', 'for')
    .then((id: string | undefined) => {
      if (id) {
        cy.get('#' + id);
      }
    });
});

Cypress.Commands.add('typeInputByLabel', (label: string | RegExp, text: string) => {
  cy.getInputByLabel(label).clear().type(text, { delay: 0 });
});

Cypress.Commands.add(
  'selectDropdownOptionByLabel',
  (label: string | RegExp, text: string, multiselect?: boolean) => {
    // Used for Typeahead multiselect components
    if (multiselect) {
      cy.contains('.pf-c-form__label-text', label)
        .parent()
        .parent()
        .parent()
        .parent()
        .within(() => {
          cy.get('button[aria-label="Options menu"]').click();
          cy.get('.pf-c-select__menu').within(() => {
            cy.contains('button', text).click();
          });
        });
      return;
    }
    cy.getFormGroupByLabel(label).within(() => {
      // Click button once it is enabled. Async loading of select will make it disabled until loaded.
      cy.get('button[aria-label="Options menu"]').click();

      // If the select menu contains a search, then search for the text

      cy.get('.pf-c-select__menu').then((selectMenu) => {
        if (selectMenu.find('.pf-m-search').length > 0) {
          cy.get('.pf-m-search').clear().type(text, { delay: 0 });
        }
      });

      cy.get('.pf-c-select__menu').within(() => {
        cy.contains('button', text).click();
      });
    });
  }
);

Cypress.Commands.add('selectToolbarFilterType', (text: string | RegExp) => {
  cy.get('#filter-form-group').within(() => {
    cy.get('.pf-c-select button').as('filterTypeBtn');
    cy.get('@filterTypeBtn').should('not.be.disabled');
    cy.get('@filterTypeBtn').click();
    cy.get('.pf-c-select__menu').within(() => {
      cy.clickButton(text);
    });
  });
});

Cypress.Commands.add('setTablePageSize', (text: '10' | '20' | '50' | '100') => {
  cy.get('.pf-c-pagination')
    .first()
    .within(() => {
      cy.get('.pf-c-options-menu').within(() => {
        cy.get('button').click();
        cy.contains('button', `${text} per page`).click();
      });
    });
});

Cypress.Commands.add('filterTableByText', (text: string) => {
  cy.get('#filter-input').within(() => {
    cy.get('input').clear().type(text, { delay: 0 });
  });
  cy.get('[aria-label="apply filter"]').click();
});

Cypress.Commands.add('filterTableByTypeAndText', (filterLabel: string | RegExp, text: string) => {
  cy.selectToolbarFilterType(filterLabel);
  cy.filterTableByText(text);
});

Cypress.Commands.add('clickLink', (label: string | RegExp) => {
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

Cypress.Commands.add('navigateTo', (label: string | RegExp) => {
  cy.get('#page-sidebar').then((c) => {
    if (c.hasClass('pf-m-collapsed')) {
      cy.get('#nav-toggle').click();
    }
  });
  cy.contains('.pf-c-nav__link', label).click();
  cy.get('#page-sidebar').then((c) => {
    if (!c.hasClass('pf-m-collapsed')) {
      cy.get('#nav-toggle').click();
    }
  });
  cy.get('#refresh').click();
});

Cypress.Commands.add('hasTitle', (label: string | RegExp) => {
  cy.contains('.pf-c-title', label);
});

Cypress.Commands.add('hasAlert', (label: string | RegExp) => {
  cy.contains('.pf-c-alert__title', label);
});

Cypress.Commands.add('hasTooltip', (label: string | RegExp) => {
  cy.contains('.pf-c-tooltip__content', label);
});

Cypress.Commands.add('clickToolbarKebabAction', (label: string | RegExp) => {
  cy.get('.page-table-toolbar').within(() => {
    cy.get('.toggle-kebab').click().get('.pf-c-dropdown__menu-item').contains(label).click();
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
      cy.get('.pf-c-dropdown__toggle').click();
      cy.contains('.pf-c-dropdown__menu-item', label)
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
      cy.get('.pf-c-dropdown__toggle').click();
      cy.contains('.pf-c-dropdown__menu-item', label)
        .should('not.be.disabled')
        .should('not.have.attr', 'aria-disabled', 'true')
        .click();
    });
  }
);

Cypress.Commands.add(
  'clickTableRowPinnedAction',
  (name: string | RegExp, label: string, filter?: boolean) => {
    cy.getTableRowByText(name, filter).within(() => {
      cy.get(`#${label.toLowerCase().split(' ').join('-')}`)
        .should('not.be.disabled')
        .should('not.have.attr', 'aria-disabled', 'true')
        .click();
    });
  }
);

Cypress.Commands.add(
  'clickTableRowActionIcon',
  (name: string | RegExp, ariaLabel: string, filter?: boolean) => {
    cy.getTableRowByText(name, filter).within(() => {
      cy.get(`button[aria-label="${ariaLabel}"]`)
        .should('not.be.disabled')
        .should('not.have.attr', 'aria-disabled', 'true')
        .click();
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
  cy.get('div[data-ouia-component-type="PF4/ModalContent"]');
});

Cypress.Commands.add(
  'selectRowItemInFormGroupLookupModal',
  (label: string | RegExp, rowItem: string) => {
    cy.getFormGroupByLabel(label)
      .within(() => {
        cy.get('button[aria-label="Options menu"]').click();
      })
      .then(() => {
        cy.selectTableRowInDialog(rowItem, true);
      });

    cy.clickModalButton('Confirm');
  }
);

Cypress.Commands.add(
  'selectTableRowInDialog',
  (name: string | RegExp, filter?: boolean, inputType = 'checkbox') => {
    cy.getDialog().within(() => {
      cy.getTableRowByText(name, filter).within(() => {
        cy.get(`input[type=${inputType}]`).click();
      });
    });
  }
);

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
  cy.get('.toggle-kebab').click().get('.pf-c-dropdown__menu-item').contains(label).click();
});

// Resources for testing AWX
Cypress.Commands.add('createAwxOrganization', () => {
  cy.awxRequestPost<Pick<Organization, 'name'>, Organization>('/api/v2/organizations/', {
    name: 'E2E Organization ' + randomString(4),
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

Cypress.Commands.add('awxRequest', function awxRequest<
  T
>(method: string, url: string, body?: Cypress.RequestBody) {
  let awxServer = Cypress.env('AWX_SERVER') as string;
  if (awxServer.endsWith('/')) awxServer = awxServer.slice(0, -1);
  cy.getGlobalAwxToken().then((awxToken) => {
    cy.request<T>({
      method,
      url: awxServer + url,
      body,
      headers: { Authorization: 'Bearer ' + awxToken.token },
    });
  });
});

Cypress.Commands.add('awxRequestPost', function awxRequestPost<
  RequestBodyT extends Cypress.RequestBody,
  ResponseBodyT = RequestBodyT
>(url: string, body: RequestBodyT) {
  cy.awxRequest<ResponseBodyT>('POST', url, body).then((response) => response.body);
});

Cypress.Commands.add('awxRequestGet', function awxRequestGet<ResponseBodyT = unknown>(url: string) {
  cy.awxRequest<ResponseBodyT>('GET', url).then((response) => response.body);
});

Cypress.Commands.add('awxRequestDelete', function awxRequestDelete(url: string) {
  cy.awxRequest('DELETE', url);
});

Cypress.Commands.add('deleteAwxOrganization', (organization: Organization) => {
  cy.awxRequestDelete(`/api/v2/organizations/${organization.id}/`);
});

Cypress.Commands.add('createAwxTeam', (organization: Organization) => {
  cy.awxRequestPost<Pick<Team, 'name' | 'organization'>, Team>('/api/v2/teams/', {
    name: 'E2E Team ' + randomString(4),
    organization: organization.id,
  });
});

Cypress.Commands.add('deleteAwxTeam', (team: Team) => {
  if (team.id) {
    cy.awxRequestDelete(`/api/v2/teams/${team.id.toString()}/`);
  }
});

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

Cypress.Commands.add('deleteAwxUser', (user: User) => {
  if (user.id) {
    cy.awxRequestDelete(`/api/v2/users/${user.id}/`);
  }
});

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
        cy.waitAwxProjectSync(project);
      } else {
        cy.wrap(project);
      }
    });
  }
);

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

Cypress.Commands.add('deleteAwxProject', (project: Project) => {
  const organizationId = project.organization;
  // Delete sync job related to project
  if (project && project.related && typeof project.related.last_job === 'string') {
    const projectUpdateEndpoint: string = project.related.last_job;
    cy.awxRequestDelete(projectUpdateEndpoint);
  }
  // Delete project
  cy.awxRequestDelete(`/api/v2/projects/${project.id}/`);
  // Delete organization for the project
  if (organizationId) {
    cy.requestDelete(`/api/v2/organizations/${organizationId.toString()}/`, true);
  }
});

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

Cypress.Commands.add('deleteAwxInventory', (inventory: Inventory) => {
  const organizationId = inventory.organization;
  // Delete organization created for this inventory (this will also delete the inventory)
  if (organizationId) {
    cy.awxRequestDelete(`/api/v2/organizations/${organizationId.toString()}/`);
  }
});

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

Cypress.Commands.add('deleteAWXSchedule', (schedule: Schedule) => {
  cy.requestDelete(`/api/v2/schedules/${schedule.id}/`, true);
});

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

Cypress.Commands.add('deleteAwxResources', (resources?: IAwxResources) => {
  if (resources?.jobTemplate) cy.deleteAwxJobTemplate(resources.jobTemplate);
});

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
  cy.awxRequestGet<ItemsResponse<JobTemplate>>(
    `/api/v2/job_templates/?name=${awxJobTemplateName}`
  ).then((result) => {
    cy.log('RESULT RESULT', result);
    if (result && result.count === 0) {
      cy.createAwxOrganizationProjectInventoryJobTemplate();
    } else {
      cy.awxRequestGet<JobTemplate>(
        `/api/v2/job_templates/${result.results[0].id?.toString() ?? ''}`
      );
    }
  });
});

Cypress.Commands.add('deleteAwxJobTemplate', (jobTemplate: JobTemplate) => {
  const projectId = jobTemplate.project;

  if (jobTemplate.id) {
    const templateId = typeof jobTemplate.id === 'number' ? jobTemplate.id.toString() : '';
    cy.awxRequestDelete(`/api/v2/job_templates/${templateId}/`);
  }
  if (projectId) {
    cy.awxRequestGet<Project>(`/api/v2/projects/${projectId}/`).then((project) => {
      // This will take care of deleting the project and the associated org, inventory
      cy.deleteAwxProject(project);
    });
  }
});

Cypress.Commands.add('waitAwxProjectSync', (project: Project) => {
  waitForProjectToFinishSyncing(project.id);
});

// Polling to wait till a project is synced
function waitForProjectToFinishSyncing(projectId: number, requestCount?: number) {
  requestCount = requestCount ?? 1;
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
    requestCount++;
    cy.wait(1000);
    waitForProjectToFinishSyncing(projectId, requestCount);
  });
}

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

Cypress.Commands.add('deleteAwxLabel', (label?: Label) => {
  const labelId = label?.id;
  if (labelId) {
    cy.awxRequestDelete(`/api/v2/labels/${labelId.toString()}/`);
  }
});

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

Cypress.Commands.add('deleteAwxInstanceGroup', (instanceGroup: InstanceGroup) => {
  const instanceGroupId = instanceGroup.id;
  if (instanceGroupId) {
    cy.awxRequestDelete(`/api/v2/instance_groups/${instanceGroupId.toString()}/`);
  }
});

Cypress.Commands.add('createAwxToken', (awxToken?: Partial<AwxToken>) => {
  let awxServer = Cypress.env('AWX_SERVER') as string;
  if (awxServer.endsWith('/')) awxServer = awxServer.slice(0, -1);
  const username = Cypress.env('AWX_USERNAME') as string;
  const password = Cypress.env('AWX_PASSWORD') as string;
  const authorization = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
  cy.request<AwxToken>({
    method: 'POST',
    url: `${awxServer}/api/v2/tokens/`,
    body: { description: 'E2E-' + randomString(4), ...awxToken },
    headers: { authorization },
  }).then((response) => response.body);
});

Cypress.Commands.add('getGlobalAwxToken', () => {
  if (globalAwxToken) cy.wrap(globalAwxToken);
  else cy.createAwxToken().then((awxToken) => (globalAwxToken = awxToken));
});

Cypress.Commands.add('deleteAwxToken', (awxToken: AwxToken) => {
  cy.awxRequestDelete(`/api/v2/tokens/${awxToken.id}/`);
});

// Global variable to store the token for AWX
// Created on demand when a cammand needs it
let globalAwxToken: AwxToken | undefined;

after(() => {
  // Delete the token if it was created
  if (globalAwxToken) {
    cy.deleteAwxToken(globalAwxToken);
  }
});
