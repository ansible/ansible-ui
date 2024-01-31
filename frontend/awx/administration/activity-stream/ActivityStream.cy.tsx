import { ActivityStreams } from './ActivityStream';

describe('Activity Stream Tests', () => {
  describe('Error list', () => {
    it('Displays error if activity stream is not successfully loaded', () => {
      cy.intercept({ method: 'GET', url: '/api/v2/activity_stream/*' }, { statusCode: 500 });
      cy.mount(<ActivityStreams />);
      cy.contains('Error loading activity stream');
    });
  });
  describe('Basic Navigation', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/activity_stream/*',
        },
        {
          fixture: 'activity_stream.json',
        }
      );
    });
    it('Activity Stream empty list page', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/activity_stream/*',
        },
        {
          fixture: 'emptyList.json',
        }
      );
      cy.mount(<ActivityStreams />);
      cy.verifyPageTitle('Activity Stream');
      cy.contains(/^There are currently no activity streams$/);
    });
    it('Visit Activity Stream list page', () => {
      cy.mount(<ActivityStreams />);
      cy.verifyPageTitle('Activity Stream');
      cy.get('tbody').find('tr').should('have.length', 10);
    });
  });
  describe('Filter', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/activity_stream/*',
        },
        {
          fixture: 'activity_stream.json',
        }
      );
    });
    it('visit the Activity Stream list page filtered by jobs', () => {
      cy.mount(<ActivityStreams />);
      cy.intercept('api/v2/activity_stream/?or__object1__in=job&or__object2__in=job*').as(
        'jobFilterRequest'
      );
      cy.get('button[data-cy="theme"] > .pf-v5-c-menu-toggle__controls').click();
      cy.get('#jobs > .pf-v5-c-menu__item-main > .pf-v5-c-menu__item-text').click();
      cy.wait('@jobFilterRequest');
    });
    it('visit the Activity Stream list page filtered by schedules', () => {
      cy.mount(<ActivityStreams />);
      cy.intercept('api/v2/activity_stream/?or__object1__in=schedule&or__object2__in=schedule*').as(
        'scheduleFilterRequest'
      );
      cy.get('button[data-cy="theme"] > .pf-v5-c-menu-toggle__controls').click();
      cy.get('#schedules > .pf-v5-c-menu__item-main > .pf-v5-c-menu__item-text').click();
      cy.wait('@scheduleFilterRequest');
    });
    it('visit the Activity Stream list page filtered by workflow approvals', () => {
      cy.mount(<ActivityStreams />);
      cy.intercept(
        'api/v2/activity_stream/?or__object1__in=workflow_approval&or__object2__in=workflow_approval*'
      ).as('workflowApprovalFilterRequest');
      cy.get('button[data-cy="theme"] > .pf-v5-c-menu-toggle__controls').click();
      cy.get('#workflow-approvals > .pf-v5-c-menu__item-main > .pf-v5-c-menu__item-text').click();
      cy.wait('@workflowApprovalFilterRequest');
    });
    it('visit the Activity Stream list page filtered by templates', () => {
      cy.mount(<ActivityStreams />);
      cy.intercept(
        'api/v2/activity_stream/?or__object1__in=job_template%2Cworkflow_job_template%2Cworkflow_job_template_node&or__object2__in=job_template%2Cworkflow_job_template%2Cworkflow_job_template_node*'
      ).as('templateFilterRequest');
      cy.get('button[data-cy="theme"] > .pf-v5-c-menu-toggle__controls').click();
      cy.get('#templates > .pf-v5-c-menu__item-main > .pf-v5-c-menu__item-text').click();
      cy.wait('@templateFilterRequest');
    });
    it('visit the Activity Stream list page filtered by credentials', () => {
      cy.mount(<ActivityStreams />);
      cy.intercept(
        'api/v2/activity_stream/?or__object1__in=credential&or__object2__in=credential*'
      ).as('credentialFilterRequest');
      cy.get('button[data-cy="theme"] > .pf-v5-c-menu-toggle__controls').click();
      cy.get('#credentials > .pf-v5-c-menu__item-main > .pf-v5-c-menu__item-text').click();
      cy.wait('@credentialFilterRequest');
    });
    it('visit the Activity Stream list page filtered by projects', () => {
      cy.mount(<ActivityStreams />);
      cy.intercept('api/v2/activity_stream/?or__object1__in=project&or__object2__in=project*').as(
        'projectFilterRequest'
      );
      cy.get('button[data-cy="theme"] > .pf-v5-c-menu-toggle__controls').click();
      cy.get('#projects > .pf-v5-c-menu__item-main > .pf-v5-c-menu__item-text').click();
      cy.wait('@projectFilterRequest');
    });
    it('visit the Activity Stream list page filtered by inventories', () => {
      cy.mount(<ActivityStreams />);
      cy.intercept(
        'api/v2/activity_stream/?or__object1__in=inventory&or__object2__in=inventory*'
      ).as('inventoryFilterRequest');
      cy.get('button[data-cy="theme"] > .pf-v5-c-menu-toggle__controls').click();
      cy.get('#inventories > .pf-v5-c-menu__item-main > .pf-v5-c-menu__item-text').click();
      cy.wait('@inventoryFilterRequest');
    });
    it('visit the Activity Stream list page filtered by hosts', () => {
      cy.mount(<ActivityStreams />);
      cy.intercept('api/v2/activity_stream/?or__object1__in=host&or__object2__in=host*').as(
        'hostFilterRequest'
      );
      cy.get('button[data-cy="theme"] > .pf-v5-c-menu-toggle__controls').click();
      cy.get('#hosts > .pf-v5-c-menu__item-main > .pf-v5-c-menu__item-text').click();
      cy.wait('@hostFilterRequest');
    });
    it('visit the Activity Stream list page filtered by organizations', () => {
      cy.mount(<ActivityStreams />);
      cy.intercept(
        'api/v2/activity_stream/?or__object1__in=organization&or__object2__in=organization*'
      ).as('organizationFilterRequest');
      cy.get('button[data-cy="theme"] > .pf-v5-c-menu-toggle__controls').click();
      cy.get('#organizations > .pf-v5-c-menu__item-main > .pf-v5-c-menu__item-text').click();
      cy.wait('@organizationFilterRequest');
    });
    it('visit the Activity Stream list page filtered by users', () => {
      cy.mount(<ActivityStreams />);
      cy.intercept('api/v2/activity_stream/?or__object1__in=user&or__object2__in=user*').as(
        'userFilterRequest'
      );
      cy.get('button[data-cy="theme"] > .pf-v5-c-menu-toggle__controls').click();
      cy.get('#users > .pf-v5-c-menu__item-main > .pf-v5-c-menu__item-text').click();
      cy.wait('@userFilterRequest');
    });
    it('visit the Activity Stream list page filtered by teams', () => {
      cy.mount(<ActivityStreams />);
      cy.intercept('api/v2/activity_stream/?or__object1__in=team&or__object2__in=team*').as(
        'teamFilterRequest'
      );
      cy.get('button[data-cy="theme"] > .pf-v5-c-menu-toggle__controls').click();
      cy.get('#teams > .pf-v5-c-menu__item-main > .pf-v5-c-menu__item-text').click();
      cy.wait('@teamFilterRequest');
    });
    it('visit the Activity Stream list page filtered by credential types', () => {
      cy.mount(<ActivityStreams />);
      cy.intercept(
        'api/v2/activity_stream/?or__object1__in=credential_type&or__object2__in=credential_type*'
      ).as('credentialTypeFilterRequest');
      cy.get('button[data-cy="theme"] > .pf-v5-c-menu-toggle__controls').click();
      cy.get('#credential-types > .pf-v5-c-menu__item-main > .pf-v5-c-menu__item-text').click();
      cy.wait('@credentialTypeFilterRequest');
    });
    it('visit the Activity Stream list page filtered by notification templates', () => {
      cy.mount(<ActivityStreams />);
      cy.intercept(
        'api/v2/activity_stream/?or__object1__in=notification_template&or__object2__in=notification_template*'
      ).as('notificationTemplateTypeFilterRequest');
      cy.get('button[data-cy="theme"] > .pf-v5-c-menu-toggle__controls').click();
      cy.get(
        '#notification-templates > .pf-v5-c-menu__item-main > .pf-v5-c-menu__item-text'
      ).click();
      cy.wait('@notificationTemplateTypeFilterRequest');
    });
    it('visit the Activity Stream list page filtered by instances', () => {
      cy.mount(<ActivityStreams />);
      cy.intercept('api/v2/activity_stream/?or__object1__in=instance&or__object2__in=instance*').as(
        'instanceTypeFilterRequest'
      );
      cy.get('button[data-cy="theme"] > .pf-v5-c-menu-toggle__controls').click();
      cy.get('#instances > .pf-v5-c-menu__item-main > .pf-v5-c-menu__item-text').click();
      cy.wait('@instanceTypeFilterRequest');
    });
    it('visit the Activity Stream list page filtered by instance groups', () => {
      cy.mount(<ActivityStreams />);
      cy.intercept(
        'api/v2/activity_stream/?or__object1__in=instance_group&or__object2__in=instance_group*'
      ).as('instanceGroupTypeFilterRequest');
      cy.get('button[data-cy="theme"] > .pf-v5-c-menu-toggle__controls').click();
      cy.get('#instance-groups > .pf-v5-c-menu__item-main > .pf-v5-c-menu__item-text').click();
      cy.wait('@instanceGroupTypeFilterRequest');
    });
    it('visit the Activity Stream list page filtered by applications and tokens', () => {
      cy.mount(<ActivityStreams />);
      cy.intercept(
        'api/v2/activity_stream/?or__object1__in=o_auth2_application&or__object2__in=o_auth2_application*'
      ).as('applicationTypeFilterRequest');
      cy.get('button[data-cy="theme"] > .pf-v5-c-menu-toggle__controls').click();
      cy.get(
        '#applications-and-tokens > .pf-v5-c-menu__item-main > .pf-v5-c-menu__item-text'
      ).click();

      cy.wait('@applicationTypeFilterRequest');
    });
    it('visit the Activity Stream list page filtered by execution environments', () => {
      cy.mount(<ActivityStreams />);
      cy.intercept(
        'api/v2/activity_stream/?or__object1__in=execution_environment&or__object2__in=execution_environment*'
      ).as('executionEnvironmentTypeFilterRequest');
      cy.get('button[data-cy="theme"] > .pf-v5-c-menu-toggle__controls').click();
      cy.get(
        '#execution-environments > .pf-v5-c-menu__item-main > .pf-v5-c-menu__item-text'
      ).click();
      cy.wait('@executionEnvironmentTypeFilterRequest');
    });
    it('visit the Activity Stream list page filtered by settings', () => {
      cy.mount(<ActivityStreams />);
      cy.intercept('api/v2/activity_stream/?or__object1__in=setting&or__object2__in=setting*').as(
        'settingTypeFilterRequest'
      );
      cy.get('button[data-cy="theme"] > .pf-v5-c-menu-toggle__controls').click();
      cy.get('#settings > .pf-v5-c-menu__item-main > .pf-v5-c-menu__item-text').click();
      cy.wait('@settingTypeFilterRequest');
    });
  });
  describe('List Page', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/activity_stream/*',
        },
        {
          fixture: 'activity_stream.json',
        }
      );
    });
    it('See a list of activity streams broken down by time, initiator, and event description', () => {
      cy.mount(<ActivityStreams />);
      cy.get('thead').find('th').contains('Time').should('exist');
      cy.get('thead').find('th').contains('Initiated by').should('exist');
      cy.get('thead').find('th').contains('Event').should('exist');
    });
    it('Clicking time table header sorts activity stream by timestamp', () => {
      cy.intercept('api/v2/activity_stream/?&order_by=-timestamp*').as('timeDescSortRequest');
      cy.mount(<ActivityStreams />);
      cy.wait('@timeDescSortRequest');
      cy.intercept('api/v2/activity_stream/?&order_by=timestamp*').as('timeAscSortRequest');
      cy.clickTableHeader(/^Time$/);
      cy.wait('@timeAscSortRequest');
    });
    it('Clicking initiated by table header sorts activity stream by initiator', () => {
      cy.mount(<ActivityStreams />);
      cy.intercept('api/v2/activity_stream/?&order_by=actor__username*').as(
        'initiatorAscSortRequest'
      );
      cy.clickTableHeader(/^Initiated by$/);
      cy.wait('@initiatorAscSortRequest');
    });
    it('Click on the inspect/magnify icon to see stream event details modal', () => {
      cy.mount(<ActivityStreams />);
      cy.get('button[data-cy="view-event-details"]').first().click();
      cy.get('[aria-label="Event details"]').should('contain', 'Event details');
      cy.get('[aria-label="Close"]').click();
    });
  });
  describe('Search', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/activity_stream/*',
        },
        {
          fixture: 'activity_stream.json',
        }
      );
    });
    it('See a list of events filtered by keyword', () => {
      cy.mount(<ActivityStreams />);
      cy.intercept('api/v2/activity_stream/?&search=associate*').as('keywordFilterRequest');
      cy.filterTableByTypeAndText(/^Keyword$/, 'associate');
      cy.wait('@keywordFilterRequest');
      cy.clickButton(/^Clear all filters$/);
    });
    it('See a list of events filtered by initiator', () => {
      cy.mount(<ActivityStreams />);
      cy.intercept('api/v2/activity_stream/?&actor__username__icontains=admin*').as(
        'initiatorFilterRequest'
      );
      cy.filterTableByTypeAndText('Initiated by (username)', 'admin');
      cy.wait('@initiatorFilterRequest');
      cy.clickButton(/^Clear all filters$/);
    });
  });
});
