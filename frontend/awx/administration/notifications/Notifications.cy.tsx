import { ToolbarFilterType } from '../../../../framework';
import * as useOptions from '../../../common/crud/useOptions';
import { Notifications } from './Notifications';

describe('Notifications.cy.tsx', () => {
  describe('Error list', () => {
    it('Displays error if notifications are not successfully loaded', () => {
      cy.intercept({ method: 'GET', url: '/api/v2/notification_templates/*' }, { statusCode: 500 });
      cy.mount(<Notifications />);
      cy.contains('Error loading notifications');
    });
  });

  describe('Non-empty list', () => {
    it('Component renders', () => {
      cy.intercept(
        { method: 'GET', url: '/api/v2/notification_templates/*' },
        { fixture: 'notification_templates.json' }
      );
      cy.mount(<Notifications />);
      cy.verifyPageTitle('Notifications');
      cy.get('table').find('tr').should('have.length', 2);
    });

    it('List has filter for Name', () => {
      cy.intercept(
        { method: 'GET', url: '/api/v2/notification_templates/*' },
        { fixture: 'notification_templates.json' }
      );
      cy.mount(<Notifications />);
      cy.intercept('/api/v2/notification_templates/?name=notification*').as('nameFilterRequest');
      cy.filterTableByMultiSelect('name', ['csantiago_notification']);
      cy.wait('@nameFilterRequest');
      cy.clearAllFilters();
    });

    it('Bulk deletion confirmation', () => {
      cy.intercept(
        { method: 'GET', url: '/api/v2/notification_templates/*' },
        { fixture: 'notification_templates.json' }
      );
      cy.mount(<Notifications />);
      cy.get('[type="checkbox"][id="select-all"]').check();
      cy.clickToolbarKebabAction('delete-selected-notifications');
      cy.contains('Delete notifications').should('be.visible');
    });

    it('Add notification template button is disabled if the user does not have the correct permissions', () => {
      cy.intercept(
        { method: 'GET', url: '/api/v2/notification_templates/*' },
        { fixture: 'notification_templates.json' }
      );
      cy.mount(<Notifications />);
      cy.get('[data-cy="add-notification-template"]').should('have.attr', 'aria-disabled', 'true');
    });

    it('Add notification template button is enabled if the user has the correct permissions', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {
            POST: {
              name: {
                type: ToolbarFilterType.MultiText,
                required: true,
                label: 'Name',
                max_length: 512,
                help_text: 'Name of this notification template.',
                filterable: true,
              },
            },
          },
        },
      }));
      cy.intercept(
        { method: 'GET', url: '/api/v2/notification_templates/*' },
        { fixture: 'notification_templates.json' }
      );
      cy.mount(<Notifications />);
      cy.get('[data-cy="add-notification-template"]').should('have.attr', 'aria-disabled', 'false');
    });

    it('Copy notification template button is enabled if the user has the correct permissions', () => {
      cy.intercept(
        { method: 'GET', url: '/api/v2/notification_templates/*' },
        { fixture: 'notification_templates.json' }
      );
      cy.mount(<Notifications />);
      cy.get('[data-cy="copy-notification-template"]').should(
        'have.attr',
        'aria-disabled',
        'false'
      );
    });

    it('Edit notification template button is enabled if the user has the correct permissions', () => {
      cy.intercept(
        { method: 'GET', url: '/api/v2/notification_templates/*' },
        { fixture: 'notification_templates.json' }
      );
      cy.mount(<Notifications />);
      cy.get('[data-cy="edit-notification-template"]').should(
        'have.attr',
        'aria-disabled',
        'false'
      );
    });
  });

  describe('Empty list', () => {
    it('Empty state is displayed correctly for user with permission to add notification templates', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {
            POST: {
              name: {
                type: ToolbarFilterType.MultiText,
                required: true,
                label: 'Name',
                max_length: 512,
                help_text: 'Name of this notification template.',
                filterable: true,
              },
            },
          },
        },
      }));
      cy.intercept(
        { method: 'GET', url: '/api/v2/notification_templates/*' },
        { fixture: 'emptyList.json' }
      );
      cy.mount(<Notifications />);
      cy.contains(/^No notifications found.$/);
      cy.contains(/^Please add notification templates to populate this list.$/);
      cy.contains('button', /^Add notification template$/).should('be.visible');
    });

    it('Empty state is displayed correctly for user without permission to add notifications templates', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({ data: { actions: {} } }));
      cy.intercept(
        { method: 'GET', url: '/api/v2/notification_templates/*' },
        { fixture: 'emptyList.json' }
      );
      cy.mount(<Notifications />);
      cy.contains(/^You do not have permission to add notification templates.$/);
      cy.contains(
        /^Please contact your organization administrator if there is an issue with your access.$/
      );
      cy.contains('button', /^Add notification template$/).should('not.exist');
    });
  });
});
