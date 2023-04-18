/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="cypress" />
import '@cypress/code-coverage/support';
import { SetOptional } from 'type-fest';
import { randomString } from '../../framework/utils/random-string';
import { Inventory } from '../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../frontend/awx/interfaces/Organization';
import { Project } from '../../frontend/awx/interfaces/Project';
import { Team } from '../../frontend/awx/interfaces/Team';
import { User } from '../../frontend/awx/interfaces/User';
import { Group, Host, JobTemplate } from '../../frontend/awx/interfaces/generated-from-swagger/api';
import { EdaCredential } from '../../frontend/eda/interfaces/EdaCredential';
import { EdaDecisionEnvironment } from '../../frontend/eda/interfaces/EdaDecisionEnvironment';
import { EdaProject } from '../../frontend/eda/interfaces/EdaProject';
import { EdaResult } from '../../frontend/eda/interfaces/EdaResult';
import { EdaRulebook } from '../../frontend/eda/interfaces/EdaRulebook';
import { EdaRulebookActivation } from '../../frontend/eda/interfaces/EdaRulebookActivation';
import { EdaUser } from '../../frontend/eda/interfaces/EdaUser';
import './rest-commands';

declare global {
  namespace Cypress {
    interface Chainable {
      login(
        server: string,
        username: string,
        password: string,
        serverType: string
      ): Chainable<void>;
      edaLogout(): Chainable<EdaUser | undefined>;
      awxLogin(): Chainable<void>;
      edaLogin(): Chainable<void>;

      // NAVIGATION COMMANDS
      navigateTo(label: string | RegExp): Chainable<void>;
      hasTitle(label: string | RegExp): Chainable<void>;

      // --- INPUT COMMANDS ---

      /** Get a FormGroup by it's label. A FormGroup is the PF component that wraps an input and provides a label. */
      getFormGroupByLabel(label: string | RegExp): Chainable<JQuery<HTMLElement>>;

      /** Get an input by it's label. */
      // Searches for an element with a certain label, then asserts that the element is enabled.
      getInputByLabel(label: string | RegExp): Chainable<JQuery<HTMLElement>>;

      /** Finds an input by label and types the text into the input .*/
      typeInputByLabel(label: string | RegExp, text: string): Chainable<void>;

      /** Finds a dropdown/select component by its dropdownLabel and clicks on the option specified by dropdownOptionLabel .*/
      selectDropdownOptionByLabel(
        dropdownLabel: string | RegExp,
        dropdownOptionLabel: string
      ): Chainable<void>;

      // TABLE COMMANDS

      /** Change the current filter type in the table toolbar */
      selectToolbarFilterType(filterLabel: string | RegExp): Chainable<void>;

      /** Filter the table using it's current filter by entering text */
      filterTableByText(text: string): Chainable<void>;

      /** Filter the table using specified filter and text. */
      filterTableByTypeAndText(filterLabel: string | RegExp, text: string): Chainable<void>;

      /** Click an action in the table toolbar kebab dropdown actions menu. */
      clickToolbarKebabAction(label: string | RegExp): Chainable<void>;

      /** Get the table row containing the specified text. */
      getTableRowByText(name: string | RegExp, filter?: boolean): Chainable<void>;

      /** Finds a table row containing text and clicks the link inside that row. */
      clickTableRow(name: string | RegExp, filter?: boolean): Chainable<void>;

      /** Finds a table row containing text and clicks action specified by label. */
      clickTableRowKebabAction(
        name: string | RegExp,
        label: string | RegExp,
        filter?: boolean
      ): Chainable<void>;

      /** Finds a table row containing text and clicks action specified by label. */
      clickTableRowPinnedAction(
        name: string | RegExp,
        label: string,
        filter?: boolean
      ): Chainable<void>;

      /** Check if the table row containing the specified text also has the text 'Successful'. */
      tableHasRowWithSuccess(name: string | RegExp, filter?: boolean): Chainable<void>;

      selectTableRow(name: string | RegExp, filter?: boolean): Chainable<void>;

      /**Expands a table row by locating the row using the provided name and thenclicking the "expand-toggle" button on that row*/
      expandTableRow(name: string | RegExp, filter?: boolean): Chainable<void>;

      // --- MODAL COMMANDS ---

      /** Get the active modal dialog. */
      getDialog(): Chainable<void>;

      /** Clicks a button in the active modal dialog. */
      clickModalButton(label: string | RegExp): Chainable<void>;

      /** Clicks the confirm checkbox in the active modal dialog */
      clickModalConfirmCheckbox(): Chainable<void>;

      /** Assert that the active modal dialog contains "Success". */
      assertModalSuccess(): Chainable<void>;

      /** Selects a table row in the active modal dialog, by clicking on the row checkbox. */
      selectTableRowInDialog(name: string | RegExp, filter?: boolean): Chainable<void>;

      // --- DETAILS COMMANDS ---

      clickTab(label: string | RegExp): Chainable<void>;

      /**Asserts that a specific detail term (dt) is displayed and contains text fromthe provided detail description (dd)*/
      hasDetail(detailTerm: string | RegExp, detailDescription: string | RegExp): Chainable<void>;

      clickLink(label: string | RegExp): Chainable<void>;
      clickButton(label: string | RegExp): Chainable<void>;
      clickPageAction(label: string | RegExp): Chainable<void>;

      hasAlert(label: string | RegExp): Chainable<void>;

      hasTooltip(label: string | RegExp): Chainable<void>;

      // --- REST API COMMANDS ---

      /** Sends a request to the API to create a particular resource. */
      requestPost<T>(url: string, data: Partial<T>): Chainable<T>;

      /** Sends a request to the API to get a particular resource. */
      requestGet<T>(url: string): Chainable<T>;

      /** Sends a request to the API to delete a particular resource. */
      requestDelete(url: string, ignoreError?: boolean): Chainable;

      // --- AWX COMMANDS ---
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

      // --- EDA COMMANDS ---

      /**
       * `edaRuleBookActivationActions()` performs an action either `Relaunch` or `Restart` or `Delete rulebookActivation` on a rulebook activation,
       *
       * accepts 2 parameters action name and edaRulebookActivation name
       *
       * edaRuleBookActivationActions('Relaunch')
       * edaRuleBookActivationActions('Restart')
       * edaRuleBookActivationActions('Delete rulebookActivation')
       * @param action
       */
      edaRuleBookActivationActions(action: string, rbaName: string): Chainable<void>;

      /**
       * `edaRuleBookActivationActionsModal()` clicks on button `Relaunch` or `Restart` of a rulebook activation modal,
       *
       * accepts 2 parameters action name and edaRulebookActivation name
       *
       * edaRuleBookActivationActions('Relaunch')
       * edaRuleBookActivationActions('Restart')
       * @param action
       */
      edaRuleBookActivationActionsModal(action: string, rbaName: string): Chainable<void>;
      /**
       * `createEdaProject()` creates an EDA Project via API,
       *  with the name `E2E Project` and appends a random string at the end of the name
       *
       * @returns {Chainable<EdaProject>}
       */
      createEdaProject(): Chainable<EdaProject>;
      getEdaRulebooks(edaProject: EdaProject): Chainable<EdaRulebook[]>;
      getEdaProject(projectName: string): Chainable<EdaProject | undefined>;
      getEdaRulebookActivation(
        edaRulebookActivationName: string
      ): Chainable<EdaRulebookActivation | undefined>;

      waitEdaProjectSync(edaProject: EdaProject): Chainable<EdaProject>;

      getEdaProjectByName(edaProjectName: string): Chainable<EdaProject | undefined>;
      getEdaCredentialByName(edaCredentialName: string): Chainable<EdaCredential | undefined>;

      /**
       * `createEdaRulebookActivation()` creates an EDA Rulebook Activation via API,
       *  with the name `E2E Rulebook Activation` and appends a random string at the end of the name
       *
       * @returns {Chainable<EdaRulebookActivation>}
       */
      createEdaRulebookActivation(
        edaRulebookActivation: SetOptional<Omit<EdaRulebookActivation, 'id'>, 'name'>
      ): Chainable<EdaRulebookActivation>;

      /**
       * `deleteEdaProject(projectName: Project)`
       * deletes an EDA project via API,
       * accepts the project name as parameter
       *
       * @returns {Chainable<void>}
       */
      deleteEdaProject(project: EdaProject): Chainable<void>;

      deleteEdaRulebookActivation(edaRulebookActivation: EdaRulebookActivation): Chainable<void>;
      /**
       * pollEdaResults - Polls eda until results are found
       * @param url The url for the get request
       *
       * @example
       *  cy.pollEdaResults<EdaProject>(`/api/eda/v1/projects/`).then(
       *    (projects: EdaProject[]) => {
       *      // Do something with projects
       *    }
       */
      pollEdaResults<T = unknown>(url: string): Chainable<T[]>;
      createEdaCredential(): Chainable<EdaCredential>;
      deleteEdaCredential(credential: EdaCredential): Chainable<void>;
      /**
       * Creates an EDA user and returns the same
       *
       * @returns {Chainable<EdaUser>}
       */
      createEdaUser(): Chainable<EdaUser>;

      /**
       * Deletes an EDA user which is provided
       *
       * @returns {Chainable<EdaUser>}
       */
      deleteEdaUser(edaUserName: EdaUser): Chainable<void>;

      /**
       * Retrieves an EDA user and returns the same
       *
       * @returns {Chainable<EdaUser>}
       */

      getEdaUser(): Chainable<EdaUser | undefined>;

      /**
       * Creates a DE and returns the same
       */
      createEdaDecisionEnvironment(): Chainable<EdaDecisionEnvironment>;

      /**
       * Retrieves a DE by name
       */
      getEdaDecisionEnvironmentByName(
        edaDEName: string
      ): Chainable<EdaDecisionEnvironment | undefined>;

      /**
       * Deletes a DE which is provided
       */
      deleteEdaDecisionEnvironment(decisionEnvironment: EdaDecisionEnvironment): Chainable<void>;
      waitEdaDESync(edaDE: EdaDecisionEnvironment): Chainable<EdaDecisionEnvironment>;
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
      cy.typeInputByLabel(/^Username$/, username);
      cy.typeInputByLabel(/^Password$/, password);
      cy.get('button[type=submit]').click();
      return;
    }

    cy.visit(`/automation-servers`, {
      retryOnStatusCodeFailure: true,
      retryOnNetworkFailure: true,
    });

    cy.clickButton(/^Add automation server$/);
    cy.typeInputByLabel(/^Name$/, 'E2E');
    cy.typeInputByLabel(/^Url$/, server);
    cy.get('.pf-c-select__toggle').click();
    cy.clickButton(serverType);
    cy.get('button[type=submit]').click();

    cy.contains('a', /^E2E$/).click();
    cy.typeInputByLabel(/^Username$/, username);
    cy.typeInputByLabel(/^Password$/, password);
    cy.get('button[type=submit]').click();
  }
);

Cypress.Commands.add('edaLogout', () => {
  cy.get('.pf-c-dropdown__toggle')
    .eq(1)
    .click()
    .then(() => {
      cy.get('ul>li>a').contains('Logout').click();
    });
});

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

Cypress.Commands.add('typeInputByLabel', (label: string | RegExp, text: string) => {
  cy.getInputByLabel(label).clear().type(text, { delay: 0 });
});

Cypress.Commands.add('selectDropdownOptionByLabel', (label: string | RegExp, text: string) => {
  cy.getFormGroupByLabel(label).within(() => {
    // Click button once it is enabled. Async loading of select will make it disabled until loaded.
    cy.get('button').should('be.enabled').click();

    // If the select menu contains a serach, then search for the text
    cy.get('.pf-c-select__menu').then((selectMenu) => {
      if (selectMenu.find('.pf-m-search').length > 0) {
        cy.get('.pf-m-search').clear().type(text, { delay: 0 });
      }
    });

    cy.get('.pf-c-select__menu').within(() => {
      cy.contains('button', text).click();
    });
  });
});

Cypress.Commands.add('selectToolbarFilterType', (text: string | RegExp) => {
  cy.get('#filter-form-group').within(() => {
    cy.get('.pf-c-select').should('not.be.disabled').click();
    cy.get('.pf-c-select__menu').within(() => {
      cy.clickButton(text);
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

Cypress.Commands.add('clickTab', (label: string | RegExp) => {
  cy.contains('button[role="tab"]', label).click();
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

Cypress.Commands.add('tableHasRowWithSuccess', (name: string | RegExp, filter?: boolean) => {
  cy.getTableRowByText(name, filter).within(() => {
    cy.get('.pf-c-alert__title').should('contain', 'Successful');
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

Cypress.Commands.add('selectTableRowInDialog', (name: string | RegExp, filter?: boolean) => {
  cy.getDialog().within(() => {
    cy.getTableRowByText(name, filter).within(() => {
      cy.get('input[type=checkbox]').click();
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
  cy.get('.toggle-kebab').click().get('.pf-c-dropdown__menu-item').contains(label).click();
});

/**Resources for testing AWX*/
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

/**EDA related custom command implementation*/

Cypress.Commands.add('edaRuleBookActivationActions', (action: string, rbaName: string) => {
  cy.contains('td[data-label="Name"]', rbaName)
    .parent()
    .within(() => {
      cy.get('button.toggle-kebab').click();
      cy.contains('a', action).click();
    });
});

Cypress.Commands.add('edaRuleBookActivationActionsModal', (action: string, rbaName: string) => {
  cy.get('div[role="dialog"]').within(() => {
    cy.contains('h1', `${action} activation`).should('be.visible');
    cy.contains('p', `Are you sure you want to ${action} the rulebook activation below?`, {
      matchCase: false,
    }).should('be.visible');
    cy.contains('p', rbaName).should('be.visible');
    cy.contains('button#confirm', action).click();
  });
});

Cypress.Commands.add('createEdaProject', () => {
  cy.requestPost<EdaProject>('/api/eda/v1/projects/', {
    name: 'E2E Project ' + randomString(4),
    url: 'https://github.com/Alex-Izquierdo/eda-sample-project',
  }).then((edaProject) => {
    Cypress.log({
      displayName: 'EDA PROJECT CREATION :',
      message: [`Created 👉  ${edaProject.name}`],
    });
    return edaProject;
  });
});

Cypress.Commands.add('getEdaRulebooks', (_edaProject) => {
  // TODO: Once the API supports it, only get rulebooks for the project
  // Sometimes it takes a while for the rulebooks to be created.
  // Poll for EdaRulebooks until some are found.
  cy.pollEdaResults<EdaRulebook>('/api/eda/v1/rulebooks/').then((edaRulebooks) => {
    return edaRulebooks;
  });
});

Cypress.Commands.add(
  'createEdaRulebookActivation',
  (edaRulebookActivation: SetOptional<Omit<EdaRulebookActivation, 'id'>, 'name'>) => {
    cy.requestPost<EdaRulebookActivation>(`/api/eda/v1/activations/`, {
      name: 'E2E Rulebook Activation ' + randomString(5),
      restart_policy: 'on-failure',
      ...edaRulebookActivation,
    }).then((edaRulebookActivation) => {
      cy.wrap(edaRulebookActivation)
        .should('not.be.undefined')
        .then(() => {
          Cypress.log({
            displayName: 'EDA RULEBOOK ACTIVATIONS CREATION :',
            message: [`Created 👉  ${edaRulebookActivation.name}`],
          });
          return edaRulebookActivation;
        });
    });
  }
);

Cypress.Commands.add('getEdaProject', (projectName: string) => {
  cy.requestGet<EdaResult<EdaProject>>(`/api/eda/v1/projects/?name=${projectName}`).then(
    (result) => {
      if (result?.results && result.results.length === 1) {
        return result.results[0];
      }
      return undefined;
    }
  );
});

Cypress.Commands.add('getEdaRulebookActivation', (edaRulebookActivationName: string) => {
  cy.pollEdaResults<EdaRulebookActivation>(
    `/api/eda/v1/activations/?name=${edaRulebookActivationName}`
  ).then((activations) => {
    return activations[0];
  });
});

Cypress.Commands.add('deleteEdaRulebookActivation', (edaRulebookActivation) => {
  cy.requestDelete(`/api/eda/v1/activations/${edaRulebookActivation.id}/`, true).then(() => {
    Cypress.log({
      displayName: 'EDA RULEBOOK ACTIVATION DELETION :',
      message: [`Deleted 👉  ${edaRulebookActivation.name}`],
    });
  });
});

Cypress.Commands.add('waitEdaProjectSync', (edaProject) => {
  cy.requestGet<EdaResult<EdaProject>>(`/api/eda/v1/projects/?name=${edaProject.name}`).then(
    (result) => {
      if (Array.isArray(result?.results) && result.results.length === 1) {
        const project = result.results[0];
        if (project.import_state !== 'completed') {
          cy.wait(100).then(() => cy.waitEdaProjectSync(edaProject));
        } else {
          cy.wrap(project);
        }
      } else {
        cy.wait(100).then(() => cy.waitEdaProjectSync(edaProject));
      }
    }
  );
});

Cypress.Commands.add('getEdaProjectByName', (edaProjectName: string) => {
  cy.requestGet<EdaResult<EdaProject>>(`/api/eda/v1/projects/?name=${edaProjectName}`).then(
    (result) => {
      if (Array.isArray(result?.results) && result.results.length === 1) {
        return result.results[0];
      } else {
        return undefined;
      }
    }
  );
});

Cypress.Commands.add('deleteEdaProject', (project: EdaProject) => {
  cy.waitEdaProjectSync(project);
  cy.requestDelete(`/api/eda/v1/projects/${project.id}/`, true).then(() => {
    Cypress.log({
      displayName: 'EDA PROJECT DELETION :',
      message: [`Deleted 👉  ${project.name}`],
    });
  });
});

Cypress.Commands.add('pollEdaResults', (url: string) => {
  cy.requestGet<EdaResult<unknown>>(url).then((result) => {
    if (Array.isArray(result?.results) && result.results.length > 0) {
      cy.wrap(result.results);
    } else {
      cy.wait(100).then(() => cy.pollEdaResults(url));
    }
  });
});

Cypress.Commands.add('createEdaCredential', () => {
  cy.requestPost<EdaCredential>('/api/eda/v1/credentials/', {
    name: 'E2E Credential ' + randomString(4),
    credential_type: 'Container Registry',
    description: 'This is a container registry credential',
    username: 'admin',
  }).then((edaCredential) => {
    Cypress.log({
      displayName: 'EDA CREDENTIAL CREATION :',
      message: [`Created 👉  ${edaCredential.name}`],
    });
    return edaCredential;
  });
});

Cypress.Commands.add('deleteEdaCredential', (credential: EdaCredential) => {
  cy.requestDelete(`/api/eda/v1/credentials/${credential.id}/`, true).then(() => {
    Cypress.log({
      displayName: 'EDA CREDENTIAL DELETION :',
      message: [`Deleted 👉  ${credential.name}`],
    });
  });
});

Cypress.Commands.add('getEdaCredentialByName', (edaCredentialName: string) => {
  cy.requestGet<EdaResult<EdaCredential>>(
    `/api/eda/v1/credentials/?name=${edaCredentialName}`
  ).then((result) => {
    if (Array.isArray(result?.results) && result.results.length === 1) {
      return result.results[0];
    } else {
      return undefined;
    }
  });
});

Cypress.Commands.add('createEdaUser', () => {
  cy.requestPost<EdaUser>(`/api/eda/v1/users/`, {
    username: `E2E User ${randomString(4)}`,
    email: `${randomString(4)}@redhat.com`,
    password: `${randomString(4)}`,
    type: 'super',
  }).then((edaUser) => {
    Cypress.log({
      displayName: 'EDA USER CREATION :',
      message: [`Created 👉  ${edaUser.username}`],
    });
    return edaUser;
  });
});

Cypress.Commands.add('deleteEdaUser', (user: EdaUser) => {
  cy.requestDelete(`/api/eda/v1/credentials/${user.id}/`, true).then(() => {
    Cypress.log({
      displayName: 'EDA CREDENTIAL DELETION :',
      message: [`Deleted 👉  ${user.username}`],
    });
  });
});

Cypress.Commands.add('getEdaUser', () => {
  cy.requestGet<EdaResult<EdaUser>>(`/api/eda/v1/users/me/`).then((result) => {
    // This will take care of deleting the project and the associated org, inventory
    if (Array.isArray(result?.results) && result?.results.length === 1) {
      return result?.results[0];
    } else {
      return undefined;
    }
  });
});
Cypress.Commands.add('createEdaDecisionEnvironment', () => {
  cy.requestPost<EdaDecisionEnvironment>('/api/eda/v1/decision-environments/', {
    name: 'E2E Decision Environment ' + randomString(4),
    image_url: 'https://quay.io/ansible/ansible-rulebook:main',
  }).then((edaDE) => {
    Cypress.log({
      displayName: 'EDA DECISION CREATION :',
      message: [`Created 👉  ${edaDE.name}`],
    });
    return edaDE;
  });
});

Cypress.Commands.add('getEdaDecisionEnvironmentByName', (edaDEName: string) => {
  cy.requestGet<EdaResult<EdaDecisionEnvironment>>(
    `/api/eda/v1/decision-environments/?name=${edaDEName}`
  ).then((result) => {
    if (Array.isArray(result?.results) && result.results.length === 1) {
      return result.results[0];
    } else {
      return undefined;
    }
  });
});

Cypress.Commands.add(
  'deleteEdaDecisionEnvironment',
  (decisionEnvironment: EdaDecisionEnvironment) => {
    //cy.waitEdaDESync(decisionEnvironment);
    cy.requestDelete(`/api/eda/v1/decision-environments/${decisionEnvironment.id}/`, true).then(
      () => {
        Cypress.log({
          displayName: 'EDA DECISION ENVIRONMENT DELETION :',
          message: [`Deleted 👉  ${decisionEnvironment.name}`],
        });
      }
    );
  }
);

/*
Cypress.Commands.add('waitEdaDESync', (decisionEnvironment) => {
  cy.requestGet<EdaResult<EdaDecisionEnvironment>>(
    `/api/eda/v1/decision-environments/?name=${decisionEnvironment.name}`
  ).then((result) => {
    if (Array.isArray(result?.results) && result.results.length === 1) {
      const project = result.results[0];
      if (project.import_state !== 'completed') {
        cy.wait(100).then(() => cy.waitEdaDESync(decisionEnvironment));
      } else {
        cy.wrap(project);
      }
    } else {
      cy.wait(100).then(() => cy.waitEdaDESync(decisionEnvironment));
    }
  });
});
*/
