/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="cypress" />
import '@cypress/code-coverage/support';
import { randomString } from '../../framework/utils/random-string';
import {
  Group,
  Host,
  Inventory,
  JobTemplate,
} from '../../frontend/awx/interfaces/generated-from-swagger/api';
import { Organization } from '../../frontend/awx/interfaces/Organization';
import { Project } from '../../frontend/awx/interfaces/Project';
import { Team } from '../../frontend/awx/interfaces/Team';
import { User } from '../../frontend/awx/interfaces/User';
import { EdaProject } from '../../frontend/eda/interfaces/EdaProject';
import { EdaRulebookActivation } from '../../frontend/eda/interfaces/EdaRulebookActivation';
import { EdaRulebook } from '../../frontend/eda/interfaces/EdaRulebook';
import 'cypress-network-idle';
// import { random } from 'cypress/types/lodash';
// import { stringify } from 'querystring';
import { ItemsResponse } from '../../frontend/common/crud/Data';

declare global {
  namespace Cypress {
    interface Chainable {
      login(
        server: string,
        username: string,
        password: string,
        serverType: string
      ): Chainable<void>;
      awxLogin(): Chainable<void>;
      edaLogin(): Chainable<void>;

      optionsWait(idleTime: number): Chainable<void>;
      getByLabel(label: string | RegExp): Chainable<void>;
      getFormGroupByLabel(label: string | RegExp): Chainable<void>;
      clickLink(label: string | RegExp): Chainable<void>;
      clickButton(label: string | RegExp): Chainable<void>;
      clickTab(label: string | RegExp): Chainable<void>;
      navigateTo(label: string | RegExp, refresh?: boolean): Chainable<void>;
      hasTitle(label: string | RegExp): Chainable<void>;
      hasAlert(label: string | RegExp): Chainable<void>;
      clickToolbarAction(label: string | RegExp): Chainable<void>;
      confirmModalAction(label: string | RegExp): Chainable<void>;
      assertModalSuccess(): Chainable<void>;
      clickRow(name: string | RegExp, filter?: boolean): Chainable<void>;
      getRowFromList(name: string | RegExp, filter?: boolean): Chainable<void>;
      clickRowAction(
        name: string | RegExp,
        label: string | RegExp,
        filter?: boolean
      ): Chainable<void>;
      selectRow(name: string | RegExp, filter?: boolean): Chainable<void>;
      selectRowInDialog(name: string | RegExp, filter?: boolean): Chainable<void>;
      clickPageAction(label: string | RegExp): Chainable<void>;
      typeByLabel(label: string | RegExp, text: string): Chainable<void>;
      selectByLabel(
        label: string | RegExp,
        text: string,
        options?: { disableSearch?: boolean }
      ): Chainable<void>;
      filterByText(text: string): Chainable<void>;

      requestPost<T>(url: string, data: Partial<T>): Chainable<T>;
      requestGet<T>(url: string): Chainable<T>;
      requestDelete(url: string, ignoreError?: boolean): Chainable;

      createAwxOrganization(): Chainable<Organization>;

      /**
       * `createAwxProject` creates an AWX Project via API,
       *  with the name `E2E Project` and appends a random string at the end of the name
       * @returns {Chainable<Project>}
       */
      createAwxProject(): Chainable<Project>;
      createAwxInventory(): Chainable<Inventory>;
      createAwxJobTemplate(): Chainable<JobTemplate>;
      createAwxTeam(organization: Organization): Chainable<Team>;
      createAwxUser(organization: Organization): Chainable<User>;
      deleteAwxOrganization(organization: Organization): Chainable<void>;
      deleteAwxProject(project: Project): Chainable<void>;
      deleteAwxInventory(inventory: Inventory): Chainable<void>;
      deleteAwxJobTemplate(jobTemplate: JobTemplate): Chainable<void>;
      deleteAwxTeam(team: Team): Chainable<void>;
      deleteAwxUser(user: User): Chainable<void>;

      createInventoryHostGroup(
        organization: Organization
      ): Chainable<{ inventory: Inventory; host: Host; group: Group }>;

      /*  EDA related custom commands  */

      /**
       * `createEdaProject()` creates an EDA Project via API,
       *  with the name `E2E Project` and appends a random string at the end of the name
       *
       * @returns {Chainable<EdaProject>}
       */
      createEdaProject(): Chainable<EdaProject>;

      /**
       * `createEdaRulebookActivation()` creates an EDA Rulebook Activation via API,
       *  with the name `E2E Rulebook Activation` and appends a random string at the end of the name
       *
       * @returns {Chainable<EdaRulebookActivation>}
       */
      createEdaRulebookActivation(): Chainable<EdaRulebookActivation>;

      /**
       * `deleteEdaProject(projectName: Project)`
       * deletes an EDA project via API,
       * accepts the project name as parameter
       *
       * @returns {Chainable<void>}
       */
      deleteEdaProject(project: EdaProject): Chainable<void>;
    }
  }
}

Cypress.Commands.add(
  'login',
  (server: string, username: string, password: string, serverType: string) => {
    window.localStorage.setItem('theme', 'light');
    window.localStorage.setItem('disclaimer', 'true');

    if (serverType === 'EDA server' && Cypress.env('TEST_STANDALONE') === true) {
      // Standalone EDA login
      cy.visit(`/login`, {
        retryOnStatusCodeFailure: true,
        retryOnNetworkFailure: true,
      });
      cy.typeByLabel(/^Username$/, username);
      cy.typeByLabel(/^Password$/, password);
      cy.get('button[type=submit]').click();
      return;
    }

    cy.visit(`/automation-servers`, {
      retryOnStatusCodeFailure: true,
      retryOnNetworkFailure: true,
    });

    cy.clickButton(/^Add automation server$/);
    cy.typeByLabel(/^Name$/, 'E2E');
    cy.typeByLabel(/^Url$/, server);
    cy.get('.pf-c-select__toggle').click();
    cy.clickButton(serverType);
    cy.get('button[type=submit]').click();

    cy.contains('a', /^E2E$/).click();
    cy.typeByLabel(/^Username$/, username);
    cy.typeByLabel(/^Password$/, password);
    cy.get('button[type=submit]').click();
  }
);

// Logs into the live server on AWX and triggers creation of baseline resources (Org, Project, Inventory, Template)
Cypress.Commands.add('awxLogin', () => {
  cy.session(
    'AWX',
    () => {
      cy.login(
        Cypress.env('AWX_SERVER') as string,
        Cypress.env('AWX_USERNAME') as string,
        Cypress.env('AWX_PASSWORD') as string,
        'AWX Ansible server'
      );
      cy.hasTitle(/^Welcome to AWX$/);
    },
    {
      cacheAcrossSpecs: true,
      validate: () => {
        cy.request({ method: 'GET', url: '/api/v2/me/' });
      },
    }
  );
  cy.visit(`/ui_next`, { retryOnStatusCodeFailure: true, retryOnNetworkFailure: true });
});

Cypress.Commands.add('edaLogin', () => {
  cy.session(
    'EDA',
    () => {
      cy.login(
        Cypress.env('EDA_SERVER') as string,
        Cypress.env('EDA_USERNAME') as string,
        Cypress.env('EDA_PASSWORD') as string,
        'EDA server'
      );
      cy.hasTitle(/^Projects$/);
    },
    {
      cacheAcrossSpecs: true,
      validate: () => {
        cy.request({ method: 'GET', url: '/api/eda/v1/users/me/' });
      },
    }
  );
  cy.visit(`/eda`, { retryOnStatusCodeFailure: true, retryOnNetworkFailure: true });
});

//This command allows a user to insert a wait time into a test to account for items that sync.
//Number is in milliseconds. ie: 5000 would be 5 seconds.
Cypress.Commands.add('optionsWait', (idleTime: number) => {
  cy.waitForNetworkIdle('GET', '/api/eda/v1**', idleTime);
});

//Searches for an element with a certain label, then asserts that the element is enabled.
Cypress.Commands.add('getByLabel', (label: string | RegExp) => {
  cy.contains('.pf-c-form__label-text', label)
    .parent()
    .invoke('attr', 'for')
    .then((id: string | undefined) => {
      if (id) {
        cy.get('#' + id).should('be.enabled');
      }
    });
});

//Add description here
Cypress.Commands.add('getFormGroupByLabel', (label: string | RegExp) => {
  cy.contains('.pf-c-form__label-text', label).parent().parent().parent();
});

//Filters a list of items by name.
Cypress.Commands.add('filterByText', (text: string) => {
  cy.get('#filter-input').type(text, { delay: 0 });
  cy.get('[aria-label="apply filter"]').click();
});

//Sends a request to the API to create a particular resource.
Cypress.Commands.add('requestPost', function requestPost<T>(url: string, body: Partial<T>) {
  cy.getCookie('csrftoken').then((cookie) =>
    cy
      .request<T>({
        method: 'POST',
        url,
        body,
        headers: {
          'X-CSRFToken': cookie?.value,
          Referer: Cypress.config().baseUrl,
        },
      })
      .then((response) => response.body)
  );
});

//Sends a request to the API to get a particular resource.
Cypress.Commands.add('requestGet', function requestGet<T>(url: string) {
  return cy.request<T>({ method: 'GET', url }).then((response) => response.body);
});

//Sends a request to the API to delete a particular resource.
Cypress.Commands.add('requestDelete', function deleteFn(url: string, ignoreError?: boolean) {
  cy.getCookie('csrftoken').then((cookie) =>
    cy.request({
      method: 'Delete',
      url,
      failOnStatusCode: ignoreError ? false : true,
      headers: { 'X-CSRFToken': cookie?.value },
    })
  );
});

//Utilizes cy.getByLabel() to find an element with a certain label and then types a string in the input.
//Common use case: Form field input
Cypress.Commands.add('typeByLabel', (label: string | RegExp, text: string) => {
  cy.getByLabel(label).type(text, { delay: 0 });
});

//Add description here
Cypress.Commands.add(
  'selectByLabel',
  (label: string | RegExp, text: string, options?: { disableSearch?: boolean }) => {
    cy.getFormGroupByLabel(label).within(() => {
      cy.get('button').should('be.enabled').click();
      if (!options?.disableSearch) {
        cy.get('.pf-m-search').type(text, { delay: 0 });
      }
      cy.get('.pf-c-select__menu').within(() => {
        cy.contains('button', text).click();
      });
    });
  }
);

//Uses a certain label string to find a URL link and click it.
Cypress.Commands.add('clickLink', (label: string | RegExp) => {
  cy.contains('a', label).click();
});

//Uses a certain label string to find a tab and click it.
Cypress.Commands.add('clickTab', (label: string | RegExp) => {
  cy.contains('button[role="tab"]', label).click();
});

//Uses a certain label string to find a button and click it.
Cypress.Commands.add('clickButton', (label: string | RegExp) => {
  cy.contains('button:not(:disabled):not(:hidden)', label).click();
});

//Visits one of the URL addresses contained in the links of the Resource Menu on the left side of the UI.
Cypress.Commands.add('navigateTo', (label: string | RegExp, refresh?: boolean) => {
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
  if (refresh) {
    cy.get('#refresh').click();
  }
});

//Uses a certain label string to identify the title of the page.
Cypress.Commands.add('hasTitle', (label: string | RegExp) => {
  cy.contains('.pf-c-title', label);
});

//Uses a certain label string to identify the alert showing on the screen.
Cypress.Commands.add('hasAlert', (label: string | RegExp) => {
  cy.contains('.pf-c-alert__title', label);
});

//Uses a certain label string to find a button within the kebab located within the toolbar on the page and clicks it.
Cypress.Commands.add('clickToolbarAction', (label: string | RegExp) => {
  cy.get('.page-table-toolbar').within(() => {
    cy.get('.toggle-kebab').click().get('.pf-c-dropdown__menu-item').contains(label).click();
  });
});

//Uses a name string to filter results, locates the row on the page containing that name
//string, and then clicks the link within that row.
Cypress.Commands.add('clickRow', (name: string | RegExp, filter?: boolean) => {
  if (filter !== false && typeof name === 'string') {
    cy.filterByText(name);
  }
  cy.contains('td', name).within(() => {
    cy.get('a').click();
  });
});

//Uses a name string to filter results and then locates the row on the page containing that name string.
Cypress.Commands.add('getRowFromList', (name: string | RegExp, filter?: boolean) => {
  if (filter !== false && typeof name === 'string') {
    cy.filterByText(name);
  }
  cy.contains('tr', name);
});

//Uses a name string to filter results, locates the row on the page containing that name
//string, clicks the toggle button for the row, then finds the toolbar action button using
//a particular label and clicks that button.
Cypress.Commands.add(
  'clickRowAction',
  (name: string | RegExp, label: string | RegExp, filter?: boolean) => {
    if (filter !== false && typeof name === 'string') {
      cy.filterByText(name);
    }
    cy.contains('td', name)
      .parent()
      .within(() => {
        cy.get('.pf-c-dropdown__toggle').click();
        cy.get('.pf-c-dropdown__menu-item').contains(label).click();
      });
  }
);

//Filters a list to show only particular results using a name, locates the row with that name,
//and clicks the checkbox for that line item.
Cypress.Commands.add('selectRow', (name: string | RegExp, filter?: boolean) => {
  if (filter !== false && typeof name === 'string') {
    cy.filterByText(name);
  }
  cy.contains('td', name)
    .parent()
    .within(() => {
      cy.get('input[type=checkbox]').click();
    });
});

//Locates the modal box on the page and filters results in that modal by a certain name. Then
//finds a particular line item from those filtered results and clicks the check box on that line item.
Cypress.Commands.add('selectRowInDialog', (name: string | RegExp, filter?: boolean) => {
  if (filter !== false && typeof name === 'string') {
    cy.get('div[data-ouia-component-type="PF4/ModalContent"]').within(() => {
      cy.get('#filter-input').type(name, { delay: 0 });
      cy.get('[aria-label="apply filter"]').click();
    });
  }
  cy.contains('td', name)
    .parent()
    .within(() => {
      cy.get('input[type=checkbox]').click();
    });
});

//Selects a check box in a modal and then clicks a button with a certain label name.
Cypress.Commands.add('confirmModalAction', (label: string | RegExp) => {
  cy.get('div[data-ouia-component-type="PF4/ModalContent"]').within(() => {
    cy.get('input[id="confirm"]').click();
    cy.contains('button', label).click();
  });
});

//Asserts a successful result in a modal window.
//This command is specific to a modal that lists one or more line items showing the deletion of
//certain resources.
Cypress.Commands.add('assertModalSuccess', () => {
  cy.get('div[data-ouia-component-type="PF4/ModalContent"]').within(() => {
    cy.get('tbody>tr')
      .find('[data-label="Status"]')
      .each(($li) => {
        cy.wrap($li).should('contain', 'Success');
      });
  });
});

//Locates the kebab menu on a Details page of a resource and uses a label string to click the 
//button that contains that label string.
Cypress.Commands.add('clickPageAction', (label: string | RegExp) => {
  cy.get('.toggle-kebab').click().get('.pf-c-dropdown__menu-item').contains(label).click();
});

/**
 * Resources for testing AWX
 */
Cypress.Commands.add('createAwxOrganization', () => {
  cy.requestPost<Organization>('/api/v2/organizations/', {
    name: 'E2E Organization ' + randomString(4),
  }).then((organization) => organization);
});

Cypress.Commands.add('deleteAwxOrganization', (organization: Organization) => {
  cy.requestDelete(`/api/v2/organizations/${organization.id}/`, true);
});

Cypress.Commands.add('createAwxTeam', (organization: Organization) => {
  cy.requestPost<Team>('/api/v2/teams/', {
    name: 'E2E Team ' + randomString(4),
    organization: organization.id,
  }).then((team) => team);
});

Cypress.Commands.add('deleteAwxTeam', (team: Team) => {
  if (team.id) {
    cy.requestDelete(`/api/v2/teams/${team.id.toString()}/`, true);
  }
});

Cypress.Commands.add('createAwxUser', (organization: Organization) => {
  cy.requestPost<User>(`/api/v2/organizations/${organization.id.toString()}/users/`, {
    username: 'e2e-user-' + randomString(4),
    is_superuser: false,
    is_system_auditor: false,
    password: 'pw',
    user_type: 'normal',
  }).then((user) => user);
});

Cypress.Commands.add('deleteAwxUser', (user: User) => {
  if (user.id) {
    cy.requestDelete(`/api/v2/users/${user.id}/`, true);
  }
});

Cypress.Commands.add('createAwxProject', () => {
  cy.createAwxOrganization().then((organization) => {
    cy.requestPost<Project>('/api/v2/projects/', {
      name: 'E2E Project ' + randomString(4),
      organization: organization.id,
      scm_type: 'git',
      scm_url: 'https://github.com/ansible/ansible-tower-samples',
    }).then((project) => {
      waitForProjectToFinishSyncing(project.id);
    });
  });
});

Cypress.Commands.add('deleteAwxProject', (project: Project) => {
  const organizationId = project.organization;
  // Delete sync job related to project
  if (project && project.related && typeof project.related.last_job === 'string') {
    const projectUpdateEndpoint: string = project.related.last_job;
    cy.requestDelete(projectUpdateEndpoint);
  }
  // Delete project
  cy.requestDelete(`/api/v2/projects/${project.id}/`, true);
  // Delete organization for the project
  cy.requestDelete(`/api/v2/organizations/${organizationId.toString()}/`, true);
});

Cypress.Commands.add('createAwxInventory', () => {
  cy.createAwxOrganization().then((organization) => {
    cy.requestPost<Inventory>('/api/v2/inventories/', {
      name: 'E2E Inventory ' + randomString(4),
      organization: organization.id,
    }).then((inventory) => inventory);
  });
});

Cypress.Commands.add('deleteAwxInventory', (inventory: Inventory) => {
  const organizationId = inventory.organization;
  // Delete organization created for this inventory (this will also delete the inventory)
  if (organizationId) {
    cy.requestDelete(`/api/v2/organizations/${organizationId.toString()}/`, true);
  }
});

Cypress.Commands.add('createAwxJobTemplate', () => {
  cy.createAwxProject().then((project) => {
    cy.createAwxInventory().then((inventory) => {
      cy.requestPost<JobTemplate>('/api/v2/job_templates/', {
        name: 'E2E Job Template ' + randomString(4),
        playbook: 'hello_world.yml',
        project: project.id.toString(),
        inventory: inventory.id,
      }).then((jobTemplate) => jobTemplate);
    });
  });
});

Cypress.Commands.add('deleteAwxJobTemplate', (jobTemplate: JobTemplate) => {
  const projectId = jobTemplate.project;

  if (jobTemplate.id) {
    const templateId = typeof jobTemplate.id === 'number' ? jobTemplate.id.toString() : '';
    cy.requestDelete(`/api/v2/job_templates/${templateId}/`, true);
  }
  if (projectId) {
    cy.requestGet<Project>(`/api/v2/projects/${projectId}/`).then((project) => {
      // This will take care of deleting the project and the associated org, inventory
      cy.deleteAwxProject(project);
    });
  }
});

let requestCount = 1;

// Polling to wait till a project is synced
function waitForProjectToFinishSyncing(projectId: number) {
  cy.requestGet<Project>(`/api/v2/projects/${projectId}`).then((project) => {
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
    waitForProjectToFinishSyncing(projectId);
  });
}

Cypress.Commands.add(
  'createInventoryHostGroup',
  function createInventoryHostGroup(organization: Organization) {
    cy.requestPost<Inventory>('/api/v2/inventories/', {
      name: 'E2E Inventory ' + randomString(4),
      organization: organization.id,
    }).then((inventory) => {
      cy.requestPost<Host>('/api/v2/hosts/', {
        name: 'E2E Host ' + randomString(4),
        inventory: inventory.id,
      }).then((host) => {
        cy.requestPost<{ name: string; inventory: number }>(`/api/v2/hosts/${host.id!}/groups/`, {
          name: 'E2E Group ' + randomString(4),
          inventory: inventory.id,
        }).then((group) => ({
          inventory,
          host,
          group,
        }));
      });
    });
  }
);

/*  EDA related custom command implementation  */

Cypress.Commands.add('createEdaProject', () => {
  cy.requestPost<EdaProject>('/api/eda/v1/projects/', {
    name: 'E2E Project ' + randomString(4),
    url: 'https://github.com/ansible/event-driven-ansible',
  }).then((response) => {
    Cypress.log({
      displayName: 'EDA PROJECT CREATION :',
      message: [`Created 👉  ${response.name}`],
    });
  });
});

Cypress.Commands.add('deleteEdaProject', (project: EdaProject) => {
  cy.requestDelete(`/api/eda/v1/projects/${project.id}/`, true).then(() => {
    Cypress.log({
      displayName: 'EDA PROJECT DELETION :',
      message: [`Deleted 👉  ${project.name}`],
    });
  });
});

Cypress.Commands.add('createEdaRulebookActivation', () => {
  // Create Rulebook Activation
  //this will need to be edited when the Decision Environments are working in the API
  cy.createEdaProject().then(() => {
    cy.requestGet<ItemsResponse<EdaRulebook>>('/api/eda/v1/rulebooks/').then((rulebooks) => {
      cy.log('rulebooks', rulebooks);
      if (rulebooks && rulebooks.results && rulebooks.results.length > 0) {
        cy.requestPost<EdaRulebookActivation>(`/api/eda/v1/activations/`, {
          name: 'E2E Rulebook Activation ' + randomString(5),
          rulebook_id: rulebooks.results[0].id,
        }).then((response) => {
          Cypress.log({
            displayName: 'EDA RULEBOOK ACTIVATIONS CREATION :',
            message: [`Created 👉  ${response.name}`],
          });
        });
      } else {
        throw new Error('No rulebooks were returned; rulebook activation cannot be created.');
      }
    });
  });
});
