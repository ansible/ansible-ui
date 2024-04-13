import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { InventorySource } from '../../../../frontend/awx/interfaces/InventorySource';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { Schedule } from '../../../../frontend/awx/interfaces/Schedule';

describe('Schedules', () => {
  let schedule: Schedule;
  let organization: Organization;
  let inventory: Inventory;
  let project: Project;
  let inventorySource: InventorySource;

  before(() => {
    cy.awxLogin();
  });

  beforeEach(() => {
    cy.createAWXSchedule().then((sched: Schedule) => (schedule = sched));
    cy.createAwxOrganization().then((o) => {
      organization = o;
      cy.createAwxProject({ organization: organization.id }).then((p) => {
        project = p;
      });
      cy.createAwxInventory({ organization: organization.id }).then((i) => {
        inventory = i;
        cy.createAwxInventorySource(i, project).then((invSrc) => {
          inventorySource = invSrc;
        });
      });
    });
    cy.navigateTo('awx', 'schedules');
  });

  afterEach(() => {
    cy.deleteAWXSchedule(schedule, { failOnStatusCode: false });
  });

  it('renders schedules list', () => {
    cy.verifyPageTitle('Schedules');
    cy.getTableRow('name', schedule.name);
    cy.deleteAWXSchedule(schedule);
  });

  it('renders the toolbar and row actions', () => {
    cy.get('.pf-v5-c-toolbar__group button.toggle-kebab').click();
    cy.get('.pf-v5-c-dropdown__menu').within(() => {
      cy.contains(/^Delete selected schedules$/).should('exist');
      cy.deleteAWXSchedule(schedule);
    });
  });

  it('loads the correct options for the schedule wizard', () => {
    cy.getBy('[data-cy="create-schedule"]').click();
    cy.get('.pf-v5-c-form__label-text').contains(/Resource type/);
  });

  it('job template renders prompt step', () => {
    cy.createAwxJobTemplate({
      organization: organization.id,
      project: project.id,
      inventory: inventory.id,
      ask_variables_on_launch: true,
    }).then((jobTemplate) => {
      cy.getBy('[data-cy="create-schedule"]').click();
      cy.selectDropdownOptionByResourceName('node_type', 'Job template');
      cy.selectDropdownOptionByResourceName('job-template-select', jobTemplate.name);
      cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Prompts');
    });
  });

  it('workflow job template renders prompt step', () => {
    cy.createAwxWorkflowJobTemplate({
      organization: organization.id,
      inventory: inventory.id,
      ask_variables_on_launch: true,
    }).then((workflowJobTemplate) => {
      cy.getBy('[data-cy="create-schedule"]').click();
      cy.selectDropdownOptionByResourceName('node_type', 'Workflow job template');
      cy.selectDropdownOptionByResourceName('job-template-select', workflowJobTemplate.name);
      cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Prompts');
    });
  });

  it('project does not renders prompt step', () => {
    cy.getBy('[data-cy="create-schedule"]').click();
    cy.getBy('[data-cy="node_type-form-group"]').click();
    cy.getBy('[data-cy="project"]').click();
    cy.selectDropdownOptionByResourceName('project', project.name);
    cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Rules');
  });

  it('management jobs does not renders prompt step', () => {
    cy.getBy('[data-cy="create-schedule"]').click();
    cy.selectDropdownOptionByResourceName('node_type', 'Management job template');
    cy.selectDropdownOptionByResourceName(
      'management-job-template-select',
      'Cleanup Activity Stream'
    );
    cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Rules');
  });

  it('inventory source does not renders prompt step', () => {
    cy.getBy('[data-cy="create-schedule"]').click();
    cy.selectDropdownOptionByResourceName('node_type', 'Inventory source');
    cy.selectDropdownOptionByResourceName('inventory', inventory.name);
    cy.selectDropdownOptionByResourceName('inventory-source-select', inventorySource.name);
    cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Rules');
  });
});

describe('Schedules - Create', () => {
  it.skip('can create a simple schedule and navigate to the schedule details page', () => {
    //Make sure to assert schedule summary, rules preview, exceptions preview
    //Survey, prompts, rules and exceptions are not needed for this test
  });
  it.skip('can create a simple schedule of resource type Job template', () => {
    //Make sure to assert the input data in the review step
    //Survey, prompts, rules and exceptions are not needed for this test
  });

  it.skip('can create a simple schedule of resource type Workflow job template', () => {
    //Make sure to assert the input data in the review step
    //Survey, prompts, rules and exceptions are not needed for this test
  });

  it.skip('can create a simple schedule of resource type Inventory source', () => {
    //Make sure to assert the input data in the review step
    //Survey, prompts, rules and exceptions are not needed for this test
  });

  it.skip('can create a simple schedule of resource type Project', () => {
    //Make sure to assert the input data in the review step
    //Survey, prompts, rules and exceptions are not needed for this test
  });

  it.skip('can create a simple schedule of resource type Management job template', () => {
    //Make sure to assert the input data in the review step
    //Survey, prompts, rules and exceptions are not needed for this test
  });

  it.skip('can create a complex schedule and navigate to details page', () => {
    //Survey, prompts, rules and exceptions should be included
  });
});

describe('Schedules - Delete', () => {
  let schedule: Schedule;

  before(() => {
    cy.awxLogin();
  });

  beforeEach(() => {
    cy.createAWXSchedule().then((sched: Schedule) => (schedule = sched));
    cy.navigateTo('awx', 'schedules');
  });

  it('deletes a schedule from the schedules list row', () => {
    cy.clickTableRowKebabAction(schedule.name, 'delete-schedule', true);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete schedule/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.filterTableByTextFilter('name', schedule.name);
    cy.contains('No results found');
  });

  it('deletes a schedule from the schedules list toolbar', () => {
    cy.getTableRow('name', schedule.name).within(() => {
      cy.get('input[aria-label="Select all rows"]').click();
    });
    cy.clickToolbarKebabAction('delete-selected-schedules');
    cy.get('#confirm').click();
    cy.clickButton(/^Delete schedule/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.contains('tr', schedule.name).should('not.exist');
    cy.clickButton(/^Clear all filters$/);
  });

  it.skip('user can bulk delete schedules from the Schedules list page ', () => {
    //Make sure to assert the deletion by intercepting the Delete request
  });
});

describe('Schedules - Edit', () => {
  //Make sure to assert the deletion by intercepting the Patch request
  let schedule: Schedule;

  before(() => {
    cy.awxLogin();
  });

  beforeEach(() => {
    cy.createAWXSchedule().then((sched: Schedule) => (schedule = sched));
    cy.navigateTo('awx', 'schedules');
  });

  it('can edit a simple schedule from details page', () => {
    cy.getTableRow('name', schedule.name).within(() => {
      cy.get('[data-cy="name-column-cell"]').click();
    });
    cy.getBy('[data-cy="edit-schedule"]').click();
    cy.get('[data-cy="wizard-nav"]').within(() => {
      ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
        cy.get('li')
          .eq(index)
          .should((el) => expect(el.text().trim()).to.equal(text));
      });
    });
    cy.get('[data-cy="description"]').type('-edited');
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="description"]').contains('-edited');
  });
  it('can edit a simple schedule from the schedules list row', () => {
    cy.getTableRow('name', schedule.name).within(() => {
      cy.get('[data-cy="edit-schedule"]').click();
    });
    cy.get('[data-cy="wizard-nav"]').within(() => {
      ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
        cy.get('li')
          .eq(index)
          .should((el) => expect(el.text().trim()).to.equal(text));
      });
    });
    cy.get('[data-cy="description"]').type('-edited');
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="description"]').contains('-edited');
  });
  it('can edit a schedule to add rules', () => {
    cy.getTableRow('name', schedule.name).within(() => {
      cy.get('[data-cy="edit-schedule"]').click();
    });
    cy.get('[data-cy="wizard-nav"]').within(() => {
      ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
        cy.get('li')
          .eq(index)
          .should((el) => expect(el.text().trim()).to.equal(text));
      });
    });
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Add rule$/);
    cy.clickButton(/^Add$/);
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Next$/);
    cy.get('.pf-v5-c-page__main-body').contains('Rule 2');
    cy.get('.pf-v5-c-page__main-body').contains('FREQ=WEEKLY');
  });
  //Fix when exceptions step works correctly
  it.skip('can edit a schedule to add exceptions', () => {
    cy.getTableRow('name', schedule.name).within(() => {
      cy.get('[data-cy="edit-schedule"]').click();
    });
    cy.get('[data-cy="wizard-nav"]').within(() => {
      ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
        cy.get('li')
          .eq(index)
          .should((el) => expect(el.text().trim()).to.equal(text));
      });
    });
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Create exception$/);
    cy.get('[data-cy="freq-form-group"]').click();
    cy.get('[data-cy="freq"]').within(() => {
      cy.clickButton('Yearly');
    });
    cy.clickButton(/^Add$/);
    cy.clickButton(/^Next$/);
    cy.get('.pf-v5-c-page__main-body').contains('FREQ=YEARLY');
  });
  it('can edit a schedule to remove rules', () => {
    cy.getTableRow('name', schedule.name).within(() => {
      cy.get('[data-cy="edit-schedule"]').click();
    });
    cy.get('[data-cy="wizard-nav"]').within(() => {
      ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
        cy.get('li')
          .eq(index)
          .should((el) => expect(el.text().trim()).to.equal(text));
      });
    });
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Add rule$/);
    cy.getBy('[data-cy="row-id-0"]').within(() => {
      cy.getBy('[data-cy="delete-rule"]').click();
    });
    cy.clickButton(/^Add$/);
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Next$/);
    cy.get('.pf-v5-c-page__main-body').should('not.contain', 'FREQ=DAILY');
  });
  //Fix when exceptions step works correctly
  it.skip('can edit a schedule remove exceptions', () => {});
  it('can enable a schedule', () => {
    cy.getTableRow('name', schedule.name).within(() => {
      cy.get('[data-cy="toggle-switch"]').click();
      cy.get('[data-cy="toggle-switch"]').within(() => {
        cy.get('[aria-label="Click to enable schedule"]').should('exist');
      });
      cy.get('[data-cy="toggle-switch"]').click();
      cy.get('[data-cy="toggle-switch"]').within(() => {
        cy.get('[aria-label="Click to enable schedule"]').should('exist');
      });
    });
  });
  it('can disable a schedule', () => {
    cy.getTableRow('name', schedule.name).within(() => {
      cy.get('[data-cy="toggle-switch"]').click();
      cy.get('[data-cy="toggle-switch"]').within(() => {
        cy.get('[aria-label="Click to enable schedule"]').should('exist');
      });
    });
  });
});
