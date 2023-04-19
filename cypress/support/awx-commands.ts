import '@cypress/code-coverage/support';
import { randomString } from '../../framework/utils/random-string';
import { AwxHost } from '../../frontend/awx/interfaces/AwxHost';
import { Inventory } from '../../frontend/awx/interfaces/Inventory';
import { Label } from '../../frontend/awx/interfaces/Label';
import { Organization } from '../../frontend/awx/interfaces/Organization';
import { Project } from '../../frontend/awx/interfaces/Project';
import { Team } from '../../frontend/awx/interfaces/Team';
import { User } from '../../frontend/awx/interfaces/User';
import {
  InstanceGroup,
  JobTemplate,
} from '../../frontend/awx/interfaces/generated-from-swagger/api';
import './auth';
import './commands';
import './rest-commands';

/*  AWX related custom command implementation  */

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

Cypress.Commands.add('selectDropdownOptionByLabel', (label: string | RegExp, text: string) => {
  cy.getFormGroupByLabel(label).within(() => {
    // Click button once it is enabled. Async loading of select will make it disabled until loaded.
    cy.get('button[aria-label="Options menu"]').should('be.enabled').click();

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
      cy.requestPost<AwxHost>('/api/v2/hosts/', {
        name: 'E2E Host ' + randomString(4),
        inventory: inventory.id,
      }).then((host) => {
        cy.requestPost<{ name: string; inventory: number }>(`/api/v2/hosts/${host.id}/groups/`, {
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

Cypress.Commands.add('createAwxLabel', (organization: Organization) => {
  cy.requestPost<Label>('/api/v2/labels/', {
    name: 'E2E Label ' + randomString(4),
    organization: organization.id,
  }).then((label) => label);
});

Cypress.Commands.add('deleteAwxLabel', (label: Label) => {
  const labelId = label.id;
  if (labelId) {
    cy.requestDelete(`/api/v2/labels/${labelId.toString()}/`, true);
  }
});

Cypress.Commands.add('createAwxInstanceGroup', () => {
  cy.requestPost<InstanceGroup>('/api/v2/instance_groups/', {
    name: 'E2E Instance Group ' + randomString(4),
  }).then((instanceGroup) => instanceGroup);
});

Cypress.Commands.add('deleteAwxInstanceGroup', (instanceGroup: InstanceGroup) => {
  const instanceGroupId = instanceGroup.id;
  if (instanceGroupId) {
    cy.requestDelete(`/api/v2/instance_groups/${instanceGroupId.toString()}/`, true);
  }
});
