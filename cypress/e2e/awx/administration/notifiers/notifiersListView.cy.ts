import { NotificationTemplate } from '../../../../../frontend/awx/interfaces/NotificationTemplate';
import { randomE2Ename } from '../../../../support/utils';

describe('Notifications: List View', () => {
    let notificationTemplate: NotificationTemplate;

  before(() => {
    cy.awxLogin();
  });

  beforeEach(() => {
    // TODO - this will be useful for editing
    /*const notificationName = randomE2Ename();
    cy.createNotificationTemplate(notificationName).then((testNotification) => {
      notificationTemplate = testNotification;
    });*/
  });

    //The following create notification tests can be written in a loop style, referencing an array of objects, to help
    //minimize the lines of code written.
    //Assert the type of notification created
    //Assert the info on the details screen of the notification
    //Assert the deletion of the notification

  it('can create a new Email Notification, assert the info in the list view, and delete the notification', () => {
      createNotification('Email', false);
  });

  it('can create a new Grafana Notification, assert the info in the list view, and delete the notification', () => {
      createNotification('Grafana', false);
  });

  it('can create a new IRC Notification in the AAP UI, assert the info in the list view, and delete the notification', () => {
      createNotification('IRC', false);
  });

  it('can create a new Mattermost Notification, assert the info in the list view, and delete the notification', () => {
      createNotification('Mattermost', false);
  });

  it('can create a new Pagerduty Notification, assert the info in the list view, and delete the notification', () => {
      createNotification('Pagerduty', false);
  });

  it.only('can create a new Rocket.Chat Notification, assert the info in the list view, and delete the notification', () => {
      createNotification('Rocket.Chat', false);
  });
  it('can create a new Slack Notification, assert the info in the list view, and delete the notification', () => {
      createNotification('Slack', false);
  });
  it('can create a new Twilio Notification, assert the info in the list view, and delete the notification', () => {
      createNotification('Twilio', false);
  });
  it('can create a new Webhook Notification, assert the info in the list view, and delete the notification', () => {
      createNotification('Webhook', false);
  });

  
    //The following edit notification tests can be written in a loop style, referencing an array of objects, to help
    //minimize the lines of code written.
    //Utilize the creation of notifications in a beforeEach block
    //Assert the initial info of the notification before edit
    //Assert the info of the notification after edit
    //Add an afterEach block to delete the notifications that were created for these tests
    it.skip('can edit a new Email Notification and assert the edited info in the list view', () => {});
    it.skip('can edit a Grafana Notification and assert the edited info in the list view', () => {});
    it.skip('can edit a IRC Notification and assert the edited info in the list view', () => {});
    it.skip('can edit a Mattermost Notification and assert the edited info in the list view', () => {});
    it.skip('can edit a Pagerduty Notification and assert the edited info in the list view', () => {});
    it.skip('can edit a Rocket.Chat Notification and assert the edited info in the list view', () => {});
    it.skip('can edit a Slack Notification and assert the edited info in the list view', () => {});
    it.skip('can edit a Twilio Notification and assert the edited info in the list view', () => {});
    it.skip('can edit a Webhook Notification and assert the edited info in the list view', () => {});

    it.skip('can test a Notification and assert the successful test in the list view', () => {
      //Utilize a notification of any type created in the beforeEach hook
      //Assert the existence of the notification before test
      //Assert the test action and the fact that it is happening from the list view
      //Assert the behavior in the UI following the test action
    });

    it.skip('can copy a Notification and assert that the copy action completed successfully', () => {
      //Utilize a notification of any type created in the beforeEach hook
      //Assert the existence of the notification before copy
      //Assert the copy action
      //Assert the existence of the copied notification as well as the original
      cy.navigateTo('awx', 'notification-templates');
      cy.filterTableByMultiSelect('name', [notificationTemplate.name]);
      cy.getByDataCy('actions-column-cell').within(() => {
        cy.getByDataCy('copy-notifier').click();
      });
      cy.get('[data-cy="alert-toaster"]').contains('copied').should('be.visible');
      cy.clickButton(/^Clear all filters/);
      cy.deleteNotificationTemplate(notificationTemplate, { failOnStatusCode: false });
      cy.filterTableByMultiSelect('name', [`${notificationTemplate.name} @`]);
      cy.get('[data-cy="checkbox-column-cell"]').within(() => {
        cy.get('input').click();
      });
      cy.clickToolbarKebabAction('delete-selected-notifiers');
      cy.getModal().within(() => {
        cy.get('#confirm').click();
        cy.clickButton(/^Delete notifiers/);
        cy.contains(/^Success$/);
        cy.clickButton(/^Close$/);
      });
    });

    it.skip('can bulk delete a Notification and assert deletion', () => {
      //Utilize notification created in the beforeEach block
      //create an additional notification in this test for the purposes of bulk delete
      //Assert the presence of the items before deletion
      //Assert the deletion
    });
  });

  function createNotification(type : string, customizeMessages : boolean)
  {
    const orgName = randomE2Ename();
    cy.createAwxOrganization(orgName).then( () => {
        cy.navigateTo('awx', 'notification-templates');
        cy.get(`[data-cy="add-notifier"]`).click();

        fillBasicData(type);
        fillNotificationType(type);
        selectOrganization(orgName);
    });
  }

  function selectOrganization(orgName : string)
  {
    cy.get(`[data-cy="organization"]`).click();
    cy.contains('button', 'Browse').click();
    cy.filterTableByMultiSelect('name', [orgName]);

    cy.contains(`[aria-label="Simple table"]`, orgName);
    cy.get(`[aria-label="Select row 0"]`).click();
    cy.contains('button', 'Confirm').click();
  }

  function fillBasicData(type : string)
  {
    const notificationName = randomE2Ename();
    cy.get(`[data-cy="name"]`).type(notificationName);
    cy.get(`[data-cy="description"]`).type('this is test description');
    

    cy.get(`[data-cy="notification_type"]`).click();
    
    cy.contains('span', type).click();
  }

  function fillNotificationType(type : string)
  {
    if (type === 'Email') {
      fillEmailForm();
    } else if (type === 'Slack') {
      fillSlackForm();
    } else if (type === 'Twilio') {
      fillTwilioForm();
    } else if (type === 'Pagerduty') {
      fillPagerdutyForm();
    } else if (type === 'Grafana') {
      fillGrafanaForm();
    } else if (type === 'Webhook') {
      fillWebhookForm();
    } else if (type === 'Mattermost') {
      fillMattermostForm();
    } else if (type === 'Rocket.Chat') {
      fillRocketChatForm();
    } else if (type === 'IRC') {
      fillIrcForm();
    }
    
  }

  function fillEmailForm()
  {
    cy.get(`[data-cy="notification-configuration-username"]`).type('email user');
    cy.get(`[data-cy="notification-configuration-password"]`).type('email password');
    cy.get(`[data-cy="notification-configuration-host"]`).type('https://host.com');
    cy.get(`[data-cy="notification-configuration-recipients"]`).type('receipient1{enter}receipient2');
    cy.get(`[data-cy="notification-configuration-sender"]`).type('sender@email.com');
    cy.get(`[data-cy="notification-configuration-port"]`).type('80');
    cy.get(`[data-cy="notification-configuration-timeout"]`).type('100');
    cy.get(`[data-cy="notification_configuration-use_tls"]`).click();
    cy.get(`[data-cy="notification_configuration-use_ssl"]`).click();
  }
  
  function fillSlackForm() {
    cy.get(`[data-cy="notification-configuration-token"]`).type('slack_token');
    cy.get(`[data-cy="notification-configuration-channels"]`).type('channel1{enter}channel2');
    cy.get(`[data-cy="notification-configuration-hex_color"]`).type('#ff5733');
  }
  
  function fillTwilioForm() {
    cy.get(`[data-cy="notification-configuration-account_sid"]`).type('twilio_sid');
    cy.get(`[data-cy="notification-configuration-account_token"]`).type('twilio_token');
    cy.get(`[data-cy="notification-configuration-from_number"]`).type('+1234567890');
    cy.get(`[data-cy="notification-configuration-to_numbers"]`).type('+1987654321{enter}+1123456789');
  }
  
  function fillPagerdutyForm() {
    cy.get(`[data-cy="notification-configuration-subdomain"]`).type('my_subdomain');
    cy.get(`[data-cy="notification-configuration-token"]`).type('pagerduty_token');
    cy.get(`[data-cy="notification-configuration-service-key"]`).type('service_integration_key');
    cy.get(`[data-cy="notification-configuration-client-name"]`).type('client_identifier');
  }
  
  function fillGrafanaForm() {
    cy.get(`[data-cy="notification-configuration-grafana-url-form-group"]`).type('https://grafana.com');
    cy.get(`[data-cy="notification-configuration-grafana-key-form-group"]`).type('grafana_api_key');
    cy.get(`[data-cy="notification-configuration-dashboardid"]`).type('dashboard_id');
    cy.get(`[data-cy="notification-configuration-panelid"]`).type('panel_id');
    cy.get(`[data-cy="notification-configuration-annotation-tags-form-group"]`).type('tag1');
    cy.get(`[data-cy="notification_configuration-grafana_no_verify_ssl"]`).click();
  }
  
  function fillWebhookForm() {
    cy.get(`[data-cy="notification-configuration-username"]`).type('webhook_user');
    cy.get(`[data-cy="notification-configuration-password"]`).type('webhook_password');
    cy.get(`[data-cy="notification-configuration-url"]`).type('https://webhook-endpoint.com');
    cy.get(`[data-cy="notification_configuration-disable_ssl_verification"]`).click();
    cy.get(`[data-cy="notification-configuration-http_method"]`).select('POST');
  }
  
  function fillMattermostForm() {
    cy.get(`[data-cy="notification-configuration-mattermost-url"]`).type('https://mattermost.com');
    cy.get(`[data-cy="notification-configuration-mattermost-username"]`).type('mattermost_user');
    cy.get(`[data-cy="notification-configuration-mattermost-channel-form-group"]`).type('channel_name');
    cy.get(`[data-cy="notification-configuration-mattermost-icon-url"]`).type('https://icon_url.com');
    cy.get(`[data-cy="notification_configuration-mattermost_no_verify_ssl"]`).click();
  }
  
  function fillRocketChatForm() {
    cy.get(`[data-cy="notification-configuration-rocketchat-url"]`).type('https://rocketchat.com');
    cy.get(`[data-cy="notification-configuration-rocketchat-username-form-group"]`).type('rocketchat_user');
    cy.get(`[data-cy="notification-configuration-rocketchat-icon-url-form-group"]`).type('https://icon_url.com');
    cy.get(`[data-cy="notification_configuration-rocketchat_no_verify_ssl"]`).click();
  }
  
  function fillIrcForm() {
    cy.get(`[data-cy="notification-configuration-password"]`).type('irc_password');
    cy.get(`[data-cy="notification-configuration-port"]`).type('6667');
    cy.get(`[data-cy="notification-configuration-server"]`).type('irc.server.com');
    cy.get(`[data-cy="notification-configuration-nickname"]`).type('irc_nickname');
    cy.get(`[data-cy="notification-configuration-targets"]`).type('channel1{enter}user1');
    cy.get(`[data-cy="notification_configuration-use_ssl"]`).click();
  }
  