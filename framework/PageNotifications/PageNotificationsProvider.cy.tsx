/* eslint-disable i18next/no-literal-string */
import { PageSection, Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';
import { PageLayout } from '../PageLayout';
import { PageNotificationsIcon } from '../PageMasthead/PageNotificationsIcon';
import {
  IPageNotification,
  PageNotificationsDrawer,
  usePageNotifications,
} from './PageNotificationsProvider';

describe('PageNotificationsProvider component tests', () => {
  function Component(props: { notifications?: IPageNotification[] }) {
    const { setNotificationGroups } = usePageNotifications();

    if (props.notifications) {
      setNotificationGroups((notificationGroups) => {
        notificationGroups['test'] = { title: 'test', notifications: props.notifications! };
        return notificationGroups;
      });
    }

    return (
      <>
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem>
              <PageNotificationsIcon />
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
        <PageNotificationsDrawer>
          <PageLayout>
            <PageSection isFilled>Notifications Test</PageSection>
          </PageLayout>
        </PageNotificationsDrawer>
      </>
    );
  }

  it('should render PageNotificationsProvider component', () => {
    cy.mount(<Component notifications={[{ title: 'test', description: 'test', to: '/test' }]} />);
    cy.get('[data-cy=notifications-drawer]').should('not.exist');
    cy.get('[data-cy=notification-badge]').should('be.visible');
    cy.get('[data-cy=notification-badge]').should('contain', '1');
    cy.get('[data-cy=notification-badge]').click();
    cy.get('[data-cy=notifications-drawer]').should('be.visible');
    cy.get('[data-cy=notifications-drawer]').should('contain', 'test');
  });
});
