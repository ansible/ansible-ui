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
import { Resources } from '../../cypress.config';

export type AwxOrgResource = {
  organization: Organization;
};
export type AwxResources = {
  organization: Organization;
  inventory: Inventory;
  project: Project;
  jobTemplate: JobTemplate;
};

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

      getByLabel(label: string | RegExp): Chainable<void>;
      clickLink(label: string | RegExp): Chainable<void>;
      clickButton(label: string | RegExp): Chainable<void>;
      clickTab(label: string | RegExp): Chainable<void>;
      navigateTo(label: string | RegExp, refresh?: boolean): Chainable<void>;
      hasTitle(label: string | RegExp): Chainable<void>;
      hasAlert(label: string | RegExp): Chainable<void>;
      clickToolbarAction(label: string | RegExp): Chainable<void>;
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
      filterByText(text: string): Chainable<void>;

      requestPost<T>(url: string, data: Partial<T>): Chainable<T>;
      requestGet<T>(url: string): Chainable<T>;
      requestDelete(url: string, ignoreError?: boolean): Chainable;

      createBaselineResourcesForAWX(options?: {
        onlyCreateOrg?: boolean;
      }): Chainable<AwxOrgResource | AwxResources>;
      cleanupBaselineResourcesForAWX(organization?: Organization): Chainable<void>;
      createInventoryHostGroup(
        organization: Organization
      ): Chainable<{ inventory: Inventory; host: Host; group: Group }>;
    }
  }
}

Cypress.Commands.add(
  'login',
  (server: string, username: string, password: string, serverType: string) => {
    window.localStorage.setItem('theme', 'light');
    window.localStorage.setItem('disclaimer', 'true');

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

Cypress.Commands.add('getByLabel', (label: string | RegExp) => {
  cy.contains('.pf-c-form__label-text', label)
    .parent()
    .invoke('attr', 'for')
    .then((id: string | undefined) => {
      if (id) {
        cy.get('#' + id);
      }
    });
});

Cypress.Commands.add('filterByText', (text: string) => {
  cy.get('#filter-input').type(text, { delay: 0 });
  cy.get('[aria-label="apply filter"]').click();
});

Cypress.Commands.add('requestPost', function requestPost<T>(url: string, body: Partial<T>) {
  cy.getCookie('csrftoken').then((cookie) =>
    cy
      .request<T>({ method: 'POST', url, body, headers: { 'X-CSRFToken': cookie?.value } })
      .then((response) => response.body)
  );
});

Cypress.Commands.add('requestGet', function requestGet<T>(url: string) {
  return cy.request<T>({ method: 'GET', url }).then((response) => response.body);
});

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

Cypress.Commands.add('typeByLabel', (label: string | RegExp, text: string) => {
  cy.getByLabel(label).type(text, { delay: 0 });
});

Cypress.Commands.add('clickLink', (label: string | RegExp) => {
  cy.contains('a', label).click();
});

Cypress.Commands.add('clickTab', (label: string | RegExp) => {
  cy.contains('button[role="tab"]', label).click();
});

Cypress.Commands.add('clickButton', (label: string | RegExp) => {
  cy.contains('button:not(:disabled):not(:hidden)', label).click();
});

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

Cypress.Commands.add('hasTitle', (label: string | RegExp) => {
  cy.contains('.pf-c-title', label);
});

Cypress.Commands.add('hasAlert', (label: string | RegExp) => {
  cy.contains('.pf-c-alert__title', label);
});

Cypress.Commands.add('clickToolbarAction', (label: string | RegExp) => {
  cy.get('.page-table-toolbar').within(() => {
    cy.get('.toggle-kebab').click().get('.pf-c-dropdown__menu-item').contains(label).click();
  });
});

Cypress.Commands.add('clickRow', (name: string | RegExp, filter?: boolean) => {
  if (filter !== false && typeof name === 'string') {
    cy.filterByText(name);
  }
  cy.contains('td', name).within(() => {
    cy.get('a').click();
  });
});

Cypress.Commands.add('getRowFromList', (name: string | RegExp, filter?: boolean) => {
  if (filter !== false && typeof name === 'string') {
    cy.filterByText(name);
  }
  cy.contains('tr', name);
});

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

Cypress.Commands.add('clickPageAction', (label: string | RegExp) => {
  cy.get('.toggle-kebab').click().get('.pf-c-dropdown__menu-item').contains(label).click();
});

/**
 * Resources for testing AWX
 */

// Create Organization and optionally Project, Inventory & Template
Cypress.Commands.add('createBaselineResourcesForAWX', (options?: { onlyCreateOrg?: boolean }) => {
  const onlyCreateOrg = options?.onlyCreateOrg;

  // Return if resources have been previously created
  cy.task('getBaselineResources').then((resources) => {
    if (resources) {
      return;
    }
  });

  // Create org
  cy.requestPost<Organization>('/api/v2/organizations/', {
    name: 'E2E Organization ' + randomString(4),
  }).then((organization) => {
    if (onlyCreateOrg) {
      cy.task('setBaselineResources', {
        organization,
      }).then(() => ({
        organization,
      }));
    }
    // Create project in the org created above
    cy.requestPost<Project>('/api/v2/projects/', {
      name: 'E2E Project ' + randomString(4),
      organization: organization.id,
      scm_type: 'git',
      scm_url: 'https://github.com/ansible/ansible-tower-samples',
    }).then((project) => {
      // Create inventory in the org created above
      cy.requestPost<Inventory>('/api/v2/inventories/', {
        name: 'E2E Inventory ' + randomString(4),
        organization: organization.id,
      }).then((inventory) => {
        // Create job template using the project and inventory created above
        waitForProjectToFinishSyncing(project.id);
        cy.requestPost<JobTemplate>('/api/v2/job_templates/', {
          name: 'E2E Job Template ' + randomString(4),
          playbook: 'hello_world.yml',
          project: project.id.toString(),
          inventory: inventory.id,
        }).then((jobTemplate) => {
          cy.task('setBaselineResources', {
            organization,
            inventory,
            project,
            jobTemplate,
          }).then(() => ({
            organization,
            inventory,
            project,
            jobTemplate,
          }));
        });
      });
    });
  });
});

// Polling to wait till a project is synced
function waitForProjectToFinishSyncing(projectId: number) {
  cy.requestGet<Project>(`/api/v2/projects/${projectId}`).then((project) => {
    if (project.status === 'successful') return;

    waitForProjectToFinishSyncing(projectId);
  });
}

// Clean up org (and its underlying resources)
Cypress.Commands.add('cleanupBaselineResourcesForAWX', () => {
  cy.task('getBaselineResources').then((resources) => {
    if (resources && (resources as AwxResources | AwxOrgResource).organization) {
      cy.requestDelete(`/api/v2/organizations/${(resources as Resources).organization.id}/`, true);
    }
    if (resources && (resources as AwxResources).project) {
      // Delete sync job related to project
      const project = (resources as AwxResources).project;
      if (project && project.related && typeof project.related.last_job === 'string') {
        const projectUpdateEndpoint: string = project.related.last_job;
        cy.requestDelete(projectUpdateEndpoint);
      }
      // Delete project
      cy.requestDelete(`/api/v2/projects/${project.id}/`, true);
    }
    if (resources && (resources as AwxResources).jobTemplate) {
      const jobTemplate = (resources as AwxResources).jobTemplate;
      if (jobTemplate && jobTemplate.id) {
        const templateId = typeof jobTemplate.id === 'number' ? jobTemplate.id.toString() : '';
        cy.requestDelete(`/api/v2/job_templates/${templateId}/`, true);
      }
    }
    cy.task('setBaselineResources', null);
  });
});

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
