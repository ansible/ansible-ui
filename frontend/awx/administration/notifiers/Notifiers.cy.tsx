import { IToolbarFilter, ToolbarFilterType } from '../../../../framework';
import * as useOptions from '../../../common/crud/useOptions';
import { Notifiers } from './Notifiers';
import { useNotifiersFilters } from './hooks/useNotifiersFilters';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function TestInner(props: { filters: IToolbarFilter[] }) {
  return <div />;
}

function Test() {
  const notifierFilters = useNotifiersFilters();
  return (
    notifierFilters &&
    notifierFilters.length > 0 && (
      <div id="root">
        <TestInner filters={notifierFilters} />
      </div>
    )
  );
}

describe('Notifiers.cy.tsx', () => {
  describe('Error list', () => {
    it('Displays error if notifiers are not successfully loaded', () => {
      cy.intercept({ method: 'GET', url: '/api/v2/notification_templates/*' }, { statusCode: 500 });
      cy.mount(<Notifiers />);
      cy.contains('Error loading notifiers');
    });
  });

  describe('Non-empty list', () => {
    it('Component renders', () => {
      cy.intercept(
        { method: 'GET', url: '/api/v2/notification_templates/*' },
        { fixture: 'notification_templates.json' }
      );
      cy.mount(<Notifiers />);
      cy.verifyPageTitle('Notifiers');
      cy.get('table').find('tr').should('have.length', 2);
    });

    it('Returns number of expected filters', () => {
      cy.intercept(
        { method: 'GET', url: '/api/v2/notification_templates/*' },
        { fixture: 'notification_templates.json' }
      );
      cy.intercept(
        { method: 'OPTIONS', url: '/api/v2/notification_templates/' },
        { fixture: 'mock_options.json' }
      ).as('getOptions');
      cy.mount(<Test />);
      cy.wait('@getOptions');
      cy.waitForReact(10000, '#root');
      cy.getReact('TestInner').getProps('filters').should('have.length', 26);
    });

    it('List has filter for Name', () => {
      cy.intercept(
        { method: 'GET', url: '/api/v2/notification_templates/*' },
        { fixture: 'notification_templates.json' }
      );
      cy.intercept(
        { method: 'OPTIONS', url: '/api/v2/notification_templates/' },
        { fixture: 'mock_options.json' }
      );
      cy.mount(<Notifiers />);
      cy.intercept('/api/v2/notification_templates/?name=notification*').as('nameFilterRequest');
      cy.filterTableByMultiSelect('name', ['csantiago_notification']);
      cy.clearAllFilters();
    });

    it('Bulk deletion confirmation', () => {
      cy.intercept(
        { method: 'GET', url: '/api/v2/notification_templates/*' },
        { fixture: 'notification_templates.json' }
      );
      cy.mount(<Notifiers />);
      cy.get('[type="checkbox"][id="select-all"]').check();
      cy.clickToolbarKebabAction('delete-notifiers');
      cy.contains('Delete notifiers').should('be.visible');
    });

    it('Add notifier button is disabled if the user does not have the correct permissions', () => {
      cy.intercept(
        { method: 'GET', url: '/api/v2/notification_templates/*' },
        { fixture: 'notification_templates.json' }
      );
      cy.mount(<Notifiers />);
      cy.get('[data-cy="create-notifier"]').should('have.attr', 'aria-disabled', 'true');
    });

    it('Add notifier button is enabled if the user has the correct permissions', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {
            POST: {
              name: {
                type: ToolbarFilterType.MultiText,
                required: true,
                label: 'Name',
                max_length: 512,
                help_text: 'Name of this notifier.',
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
      cy.mount(<Notifiers />);
      cy.get('[data-cy="create-notifier"]').should('have.attr', 'aria-disabled', 'false');
    });

    it('Copy notifier button is enabled if the user has the correct permissions', () => {
      cy.intercept(
        { method: 'GET', url: '/api/v2/notification_templates/*' },
        { fixture: 'notification_templates.json' }
      );
      cy.mount(<Notifiers />);
      cy.get('[data-cy="copy-notifier"]').should('have.attr', 'aria-disabled', 'false');
    });

    it('Edit notifier button is enabled if the user has the correct permissions', () => {
      cy.intercept(
        { method: 'GET', url: '/api/v2/notification_templates/*' },
        { fixture: 'notification_templates.json' }
      );
      cy.mount(<Notifiers />);
      cy.get('[data-cy="edit-notifier"]').should('have.attr', 'aria-disabled', 'false');
    });
  });

  describe('Empty list', () => {
    it('Empty state is displayed correctly for user with permission to add notifier', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {
            POST: {
              name: {
                type: ToolbarFilterType.MultiText,
                required: true,
                label: 'Name',
                max_length: 512,
                help_text: 'Name of this notifier.',
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
      cy.mount(<Notifiers />);
      cy.contains(/^No notifiers found.$/);
      cy.contains(/^Please create notifiers to populate this list.$/);
      cy.contains('button', /^Create notifier$/).should('be.visible');
    });

    it('Empty state is displayed correctly for user without permission to add notifier', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({ data: { actions: {} } }));
      cy.intercept(
        { method: 'GET', url: '/api/v2/notification_templates/*' },
        { fixture: 'emptyList.json' }
      );
      cy.mount(<Notifiers />);
      cy.contains(/^You do not have permission to create notifiers.$/);
      cy.contains(
        /^Please contact your organization administrator if there is an issue with your access.$/
      );
      cy.contains('button', /^Create notifier$/).should('not.exist');
    });
  });
});
