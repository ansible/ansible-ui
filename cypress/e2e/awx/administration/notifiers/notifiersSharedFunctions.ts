import { getDefaultMessages } from '../../../../../frontend/awx/administration/notifiers/notifierFormMessagesHelpers';
import { AwxItemsResponse } from '../../../../../frontend/awx/common/AwxItemsResponse';
import { awxAPI } from '../../../../support/formatApiPathForAwx';
import { Notification } from '../../../../../frontend/awx/interfaces/generated-from-swagger/api';
import { randomE2Ename } from '../../../../support/utils';

export function testNotification(
  type: string,
  options?: { details?: boolean; skipMessages?: boolean }
) {
  const notificationName = randomE2Ename();
  const orgName = randomE2Ename();
  cy.createAwxOrganization({ name: orgName }).then(() => {
    cy.navigateTo('awx', 'notification-templates');
    cy.get(`[data-cy="add-notifier"]`).click();
    cy.verifyPageTitle('Create notifier');

    fillBasicData(notificationName, type);
    fillNotificationType(type);
    selectOrganization(orgName);
    verifyDefaultsMessages(type);

    cy.get(`[data-cy="Submit"]`).click();

    // test detail
    testBasicData(notificationName, type, orgName);
    testNotificationType(type);

    // test edit
    if (options?.details === true) {
      cy.getByDataCy(`edit-notifier`).click();
    } else {
      // if not in detail, we go back to list and click edit there
      cy.getByDataCy('back-to notifiers').click();
      cy.filterTableByMultiSelect('name', [notificationName]);
      cy.contains(notificationName);
      cy.get(`[aria-label="Simple table"] [data-cy="actions-dropdown"]`).click();
      cy.getByDataCy(`edit-notifier`).click();
    }

    const name2 = randomE2Ename();
    editBasicData(name2);
    editNotificationType(type);

    if (!options?.skipMessages) {
      editCustomMessages(type);
    }
    cy.get(`[data-cy="Submit"]`).click();

    testBasicDataEdited(name2, orgName);
    testNotificationTypeEdited(type);

    if (!options?.skipMessages) {
      verifyEditedMessages(type);
    }

    testDelete(name2, options);
  });
}

export function testDelete(name: string, options?: { details?: boolean }) {
  // validate its here and delete it
  if (options?.details === true) {
    cy.get(`[data-cy="actions-dropdown"]`).click();
    cy.get(`[data-cy="delete-notifier"]`).click();
  } else {
    // if not in detail, we go back to list and click delete there
    cy.getByDataCy('back-to notifiers').click();
    cy.filterTableByMultiSelect('name', [name]);
    cy.contains(name);

    cy.get(`[aria-label="Simple table"] [data-cy="actions-dropdown"]`).click();
    cy.get(`[data-cy="delete-notifier"]`).click();
  }

  cy.get(`[role="dialog"] input`).click();
  cy.contains(`[role="dialog"] button`, `Delete notifiers`).click();
  if (options?.details !== true) {
    cy.contains(`[role="dialog"] button`, `Close`).click();
  }

  cy.verifyPageTitle('Notifiers');
  cy.contains('Configure custom notifications to be sent based on predefined events.');

  cy.requestGet<AwxItemsResponse<Notification>>(awxAPI`/notification_templates/?name={name}`)
    .its('results')
    .then((results) => {
      expect(results).to.have.length(0);
    });
}

export function selectOrganization(orgName: string) {
  cy.get(`[data-cy="organization"]`).click();
  cy.contains('button', 'Browse').click();

  // sync dialog
  cy.get(`[role="dialog"]`).within(() => {
    cy.contains('button', 'Confirm');
    cy.contains('button', 'Cancel');
    cy.get(`[aria-label="Simple table"]`);
  });

  cy.filterTableByMultiSelect('name', [orgName]);
  cy.get(`[aria-label="Simple table"] tr`).should('have.length', 2);

  cy.contains(`[aria-label="Simple table"]`, orgName);
  cy.get(`[aria-label="Select row 0"]`).click();
  cy.contains('button', 'Confirm').click();
}

function fillBasicData(notificationName: string, type: string) {
  cy.get(`[data-cy="name"]`).type(notificationName);
  cy.get(`[data-cy="description"]`).type('this is test description');

  cy.get(`[data-cy="notification_type"]`).click();

  cy.contains('span', type).click();
}

function editBasicData(notificationName: string) {
  cy.get(`[data-cy="name"]`).clear().type(notificationName);
  cy.get(`[data-cy="description"]`).clear().type('this is test description edited');
}

function testBasicDataEdited(notificationName: string, organization: string) {
  cy.contains(`[data-cy="description"]`, 'this is test description edited');
  cy.contains(`[data-cy="name"]`, notificationName);
  cy.contains(`[data-cy="organization"]`, organization);
}

function testBasicData(notificationName: string, type: string, organization: string) {
  cy.contains(`[data-cy="name"]`, notificationName);
  cy.contains(`[data-cy="description"]`, 'this is test description');

  cy.contains(`[data-cy="notification-type"]`, TransformTypeName(type));
  cy.contains(`[data-cy="organization"]`, organization);
}

function fillNotificationType(type: string) {
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

function convertType(type: string) {
  if (type === 'Email') {
    return 'email';
  }
  if (type === 'Grafana') {
    return 'grafana';
  }
  if (type === 'IRC') {
    return 'irc';
  }
  if (type === 'Mattermost') {
    return 'mattermost';
  }
  if (type === 'Pagerduty') {
    return 'pagerduty';
  }
  if (type === 'Rocket.Chat') {
    return 'rocketchat';
  }
  if (type === 'Slack') {
    return 'slack';
  }
  if (type === 'Twilio') {
    return 'twilio';
  }
  if (type === 'Webhook') {
    return 'webhook';
  }
  return type;
}

function verifyDefaultsMessages(type: string) {
  const defaults = getDefaultMessages(convertType(type));

  cy.get('[data-cy="customize-messages-toggle"]').parent().find('span').click();

  if (defaults.started.message) {
    cy.get('[data-cy="messages-started-message"]').should('have.value', defaults.started.message);
  }
  if (defaults.success.message) {
    cy.get('[data-cy="messages-success-message"]').should('have.value', defaults.success.message);
  }
  if (defaults.error.message) {
    cy.get('[data-cy="messages-error-message"]').should('have.value', defaults.error.message);
  }
  if (defaults.workflow_approval.approved.message) {
    cy.get('[data-cy="messages-workflow-approval-approved-message"]').should(
      'have.value',
      defaults.workflow_approval.approved.message
    );
  }
  if (defaults.workflow_approval.running.message) {
    cy.get('[data-cy="messages-workflow-approval-running-message"]').should(
      'have.value',
      defaults.workflow_approval.running.message
    );
  }
  if (defaults.workflow_approval.denied.message) {
    cy.get('[data-cy="messages-workflow-approval-denied-message"]').should(
      'have.value',
      defaults.workflow_approval.denied.message
    );
  }
  if (defaults.workflow_approval.timed_out.message) {
    cy.get('[data-cy="messages-workflow-approval-timed-out-message"]').should(
      'have.value',
      defaults.workflow_approval.timed_out.message
    );
  }

  if (defaults.started.body) {
    cy.get('[data-cy="messages-started-body"]').should('have.value', defaults.started.body);
  }
  if (defaults.success.body) {
    cy.get('[data-cy="messages-success-body"]').should('have.value', defaults.success.body);
  }
  if (defaults.error.body) {
    cy.get('[data-cy="messages-error-body"]').should('have.value', defaults.error.body);
  }
  if (defaults.workflow_approval.approved.body) {
    cy.get('[data-cy="messages-workflow-approval-approved-body"]').should(
      'have.value',
      defaults.workflow_approval.approved.body
    );
  }
  if (defaults.workflow_approval.running.body) {
    cy.get('[data-cy="messages-workflow-approval-running-body"]').should(
      'have.value',
      defaults.workflow_approval.running.body
    );
  }
  if (defaults.workflow_approval.denied.body) {
    cy.get('[data-cy="messages-workflow-approval-denied-body"]').should(
      'have.value',
      defaults.workflow_approval.denied.body
    );
  }
  if (defaults.workflow_approval.timed_out.body) {
    cy.get('[data-cy="messages-workflow-approval-timed-out-body"]').should(
      'have.value',
      defaults.workflow_approval.timed_out.body
    );
  }
}

function editCustomMessages(type: string) {
  const defaults = getDefaultMessages(convertType(type));

  if (defaults.started.message) {
    cy.get('[data-cy="messages-started-message"]').clear().type('started message edited');
  }
  if (defaults.success.message) {
    cy.get('[data-cy="messages-success-message"]').clear().type('success message edited');
  }
  if (defaults.error.message) {
    cy.get('[data-cy="messages-error-message"]').clear().type('error message edited');
  }
  if (defaults.workflow_approval.approved.message) {
    cy.get('[data-cy="messages-workflow-approval-approved-message"]')
      .clear()
      .type('workflow approval approved message edited');
  }
  if (defaults.workflow_approval.running.message) {
    cy.get('[data-cy="messages-workflow-approval-running-message"]')
      .clear()
      .type('workflow approval running message edited');
  }
  if (defaults.workflow_approval.denied.message) {
    cy.get('[data-cy="messages-workflow-approval-denied-message"]')
      .clear()
      .type('workflow approval denied message edited');
  }
  if (defaults.workflow_approval.timed_out.message) {
    cy.get('[data-cy="messages-workflow-approval-timed-out-message"]')
      .clear()
      .type('workflow approval timed out message edited');
  }
  if (defaults.started.body) {
    cy.get('[data-cy="messages-started-body"]').clear().type('started body edited');
  }
  if (defaults.success.body) {
    cy.get('[data-cy="messages-success-body"]').clear().type('success body edited');
  }
  if (defaults.error.body) {
    cy.get('[data-cy="messages-error-body"]').clear().type('error body edited');
  }
  if (defaults.workflow_approval.approved.body) {
    cy.get('[data-cy="messages-workflow-approval-approved-body"]')
      .clear()
      .type('workflow approval approved body edited');
  }
  if (defaults.workflow_approval.running.body) {
    cy.get('[data-cy="messages-workflow-approval-running-body"]')
      .clear()
      .type('workflow approval running body edited');
  }
  if (defaults.workflow_approval.denied.body) {
    cy.get('[data-cy="messages-workflow-approval-denied-body"]')
      .clear()
      .type('workflow approval denied body edited');
  }
  if (defaults.workflow_approval.timed_out.body) {
    cy.get('[data-cy="messages-workflow-approval-timed-out-body"]')
      .clear()
      .type('workflow approval timed out body edited');
  }
}

function verifyEditedMessages(type: string) {
  const defaults = getDefaultMessages(convertType(type));

  if (defaults.started.message) {
    cy.contains('[data-cy="start-message"]', 'started message edited');
  }

  if (defaults.success.message) {
    cy.contains('[data-cy="success-message"]', 'success message edited');
  }
  if (defaults.error.message) {
    cy.contains('[data-cy="error-message"]', 'error message edited');
  }
  if (defaults.workflow_approval.approved.message) {
    cy.contains(
      '[data-cy="workflow-approved-message"]',
      'workflow approval approved message edited'
    );
  }
  if (defaults.workflow_approval.running.message) {
    cy.contains('[data-cy="workflow-pending-message"]', 'workflow approval running message edited');
  }
  if (defaults.workflow_approval.denied.message) {
    cy.contains('[data-cy="workflow-denied-message"]', 'workflow approval denied message edited');
  }
  if (defaults.workflow_approval.timed_out.message) {
    cy.contains(
      '[data-cy="workflow-timed-out-message"]',
      'workflow approval timed out message edited'
    );
  }
  if (defaults.started.body) {
    cy.contains('[data-cy="start-message-body"]', 'started body edited');
  }
  if (defaults.success.body) {
    cy.contains('[data-cy="success-message-body"]', 'success body edited');
  }
  if (defaults.error.body) {
    cy.contains('[data-cy="error-message-body"]', 'error body edited');
  }
  if (defaults.workflow_approval.approved.body) {
    cy.contains(
      '[data-cy="workflow-approved-message-body"]',
      'workflow approval approved body edited'
    );
  }
  if (defaults.workflow_approval.running.body) {
    cy.contains(
      '[data-cy="workflow-pending-message-body"]',
      'workflow approval running body edited'
    );
  }
  if (defaults.workflow_approval.denied.body) {
    cy.contains('[data-cy="workflow-denied-message-body"]', 'workflow approval denied body edited');
  }
  if (defaults.workflow_approval.timed_out.body) {
    cy.contains(
      '[data-cy="workflow-timed-out-message-body"]',
      'workflow approval timed out body edited'
    );
  }
}

function editNotificationType(type: string) {
  if (type === 'Email') {
    editEmailForm();
  } else if (type === 'Slack') {
    editSlackForm();
  } else if (type === 'Twilio') {
    editTwilioForm();
  } else if (type === 'Pagerduty') {
    editPagerdutyForm();
  } else if (type === 'Grafana') {
    editGrafanaForm();
  } else if (type === 'Webhook') {
    editWebhookForm();
  } else if (type === 'Mattermost') {
    editMattermostForm();
  } else if (type === 'Rocket.Chat') {
    editRocketChatForm();
  } else if (type === 'IRC') {
    editIrcForm();
  }
}

function testNotificationType(type: string) {
  switch (type) {
    case 'Email':
      testEmailForm();
      break;
    case 'Slack':
      testSlackForm();
      break;
    case 'Twilio':
      testTwilioForm();
      break;
    case 'Pagerduty':
      testPagerDutyForm();
      break;
    case 'Grafana':
      testGrafanaForm();
      break;
    case 'Webhook':
      testWebhookForm();
      break;
    case 'Mattermost':
      testMattermostForm();
      break;
    case 'Rocket.Chat':
      testRocketChatForm();
      break;
    case 'IRC':
      testIRCForm();
      break;
    default:
      throw new Error(`Unknown notification type: ${type}`);
  }
}

function testNotificationTypeEdited(type: string) {
  switch (type) {
    case 'Email':
      testEmailFormEdited();
      break;
    case 'Slack':
      testSlackFormEdited();
      break;
    case 'Twilio':
      testTwilioFormEdited();
      break;
    case 'Pagerduty':
      testPagerDutyFormEdited();
      break;
    case 'Grafana':
      testGrafanaFormEdited();
      break;
    case 'Webhook':
      testWebhookFormEdited();
      break;
    case 'Mattermost':
      testMattermostFormEdited();
      break;
    case 'Rocket.Chat':
      testRocketChatFormEdited();
      break;
    case 'IRC':
      testIRCFormEdited();
      break;
    default:
      throw new Error(`Unknown notification type: ${type}`);
  }
}

function TransformTypeName(type: string) {
  if (type === 'Email') {
    return 'email';
  } else if (type === 'Slack') {
    return 'slack';
  } else if (type === 'Twilio') {
    return 'twilio';
  } else if (type === 'Pagerduty') {
    return 'pagerduty';
  } else if (type === 'Grafana') {
    return 'grafana';
  } else if (type === 'Webhook') {
    return 'webhook';
  } else if (type === 'Mattermost') {
    return 'mattermost';
  } else if (type === 'Rocket.Chat') {
    return 'rocketchat';
  } else if (type === 'IRC') {
    return 'irc';
  }

  return '';
}

function fillEmailForm() {
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
  cy.get(`[data-cy="notification-configuration-hex-color"]`).type('#ff5733');
}

function fillTwilioForm() {
  cy.get(`[data-cy="notification-configuration-account-sid"]`).type('twilio_sid');
  cy.get(`[data-cy="notification-configuration-account-token-form-group"]`).type('twilio_token');
  cy.get(`[data-cy="notification-configuration-from-number-form-group"]`).type('+1234567890');
  cy.get(`[data-cy="notification-configuration-to-numbers-form-group"]`).type(
    '+1987654321{enter}+1123456789'
  );
}

function fillPagerdutyForm() {
  cy.get(`[data-cy="notification-configuration-subdomain"]`).type('my_subdomain');
  cy.get(`[data-cy="notification-configuration-token"]`).type('pagerduty_token');
  cy.get(`[data-cy="notification-configuration-service-key"]`).type('service_integration_key');
  cy.get(`[data-cy="notification-configuration-client-name"]`).type('client_identifier');
}

function fillGrafanaForm() {
  cy.get(`[data-cy="notification-configuration-grafana-url-form-group"]`).type(
    'https://grafana.com'
  );
  cy.get(`[data-cy="notification-configuration-dashboardid"]`).type('dashboard_id');
  cy.get(`[data-cy="notification-configuration-panelid"]`).type('panel_id');
  cy.get(`[data-cy="notification-configuration-annotation-tags-form-group"]`).type('tag1');
  cy.get(`[data-cy="notification_configuration-grafana_no_verify_ssl"]`).click();
  cy.get(`[data-cy='notification-configuration-grafana-key']`).type('key');
}

function fillWebhookForm() {
  cy.get(`[data-cy="notification-configuration-username"]`).type('webhook_user');
  cy.get(`[data-cy="notification-configuration-url"]`).type('https://webhook-endpoint.com');
  cy.get(`[data-cy="notification_configuration-disable_ssl_verification"]`).click();
  cy.get(`[data-cy="notification-configuration-http-method"]`).click();
  cy.contains('POST').click();
}

function fillMattermostForm() {
  cy.get(`[data-cy="notification-configuration-mattermost-url"]`).type('https://mattermost.com');
  cy.get(`[data-cy="notification-configuration-mattermost-username"]`).type('mattermost_user');
  cy.get(`[data-cy="notification-configuration-mattermost-channel-form-group"]`).type(
    'channel_name'
  );
  cy.get(`[data-cy="notification-configuration-mattermost-icon-url"]`).type('https://icon_url.com');
  cy.get(`[data-cy="notification_configuration-mattermost_no_verify_ssl"]`).click();
}

function fillRocketChatForm() {
  cy.get(`[data-cy="notification-configuration-rocketchat-url"]`).type('https://rocketchat.com');
  cy.get(`[data-cy="notification-configuration-rocketchat-username-form-group"]`).type(
    'rocketchat_user'
  );
  cy.get(`[data-cy="notification-configuration-rocketchat-icon-url-form-group"]`).type(
    'https://icon_url.com'
  );
  cy.get(`[data-cy="notification_configuration-rocketchat_no_verify_ssl"]`).click();
}

function fillIrcForm() {
  cy.get(`[data-cy="notification-configuration-port"]`).type('6667');
  cy.get(`[data-cy="notification-configuration-server"]`).type('https://irc.server.com');
  cy.get(`[data-cy="notification-configuration-nickname"]`).type('irc_nickname');
  cy.get(`[data-cy="notification-configuration-targets"]`).type('channel1{enter}user1');
  cy.get(`[data-cy="notification_configuration-use_ssl"]`).click();
}

// Email Form Test
function testEmailForm() {
  cy.contains(`[data-cy="username"]`, 'email user');
  cy.contains(`[data-cy="use-tls"]`, 'true');
  cy.contains(`[data-cy="use-ssl"]`, 'true');
  cy.contains(`[data-cy="host"]`, 'https://host.com');
  cy.contains(`[data-cy="recipient-list"]`, 'receipient1');
  cy.contains(`[data-cy="recipient-list"]`, 'receipient2');
  cy.contains(`[data-cy="sender-email"]`, 'sender@email.com');
  cy.contains(`[data-cy="port"]`, '80');
  cy.contains(`[data-cy="timeout"]`, '100');
}

// Slack Form Test
function testSlackForm() {
  cy.contains(`[data-cy="destination-channels"]`, 'channel1');
  cy.contains(`[data-cy="destination-channels"]`, 'channel2');
  cy.contains(`[data-cy="notification-color"]`, '#ff5733');
}

// Twilio Form Test
function testTwilioForm() {
  cy.contains(`[data-cy="account-sid"]`, 'twilio_sid');
  cy.contains(`[data-cy="source-phone-number"]`, '+1234567890');
  cy.contains(`[data-cy="destination-sms-numbers"]`, '+1987654321');
  cy.contains(`[data-cy="destination-sms-numbers"]`, '+1123456789');
}

// PagerDuty Form Test
function testPagerDutyForm() {
  cy.contains(`[data-cy="pagerduty-subdomain"]`, 'my_subdomain');
  cy.contains(`[data-cy="api-service/integration-key"]`, 'service_integration_key');
  cy.contains(`[data-cy="client-identifier"]`, 'client_identifier');
}

// Grafana Form Test
function testGrafanaForm() {
  cy.contains(`[data-cy="grafana-url"]`, 'https://grafana.com');
  cy.contains(`[data-cy="id-of-the-dashboard-(optional)"]`, 'dashboard_id');
  cy.contains(`[data-cy="id-of-the-panel-(optional)"]`, 'panel_id');
  cy.contains(`[data-cy="tags-for-the-annotation-(optional)"]`, 'tag1');
  cy.contains(`[data-cy='disable-ssl-verification']`, 'true');
}

// Webhook Form Test
function testWebhookForm() {
  cy.contains(`[data-cy="username"]`, 'webhook_user');
  cy.contains(`[data-cy="target-url"]`, 'https://webhook-endpoint.com');
  cy.contains(`[data-cy="http-method"]`, 'POST');
  cy.contains(`[data-cy='disable-ssl-verification-']`, 'true');
}

// Mattermost Form Test
function testMattermostForm() {
  cy.contains(`[data-cy="target-url"]`, 'https://mattermost.com');
  cy.contains(`[data-cy="username"]`, 'mattermost_user');
  cy.contains(`[data-cy="channel"]`, 'channel_name');
  cy.contains(`[data-cy="icon-url"]`, 'https://icon_url.com');
  cy.contains(`[data-cy="verify-ssl"]`, 'true');
}

// RocketChat Form Test
function testRocketChatForm() {
  cy.contains(`[data-cy="target-url"]`, 'https://rocketchat.com');
  cy.contains(`[data-cy="username"]`, 'rocketchat_user');
  cy.contains(`[data-cy="icon-url"]`, 'https://icon_url.com');
  cy.contains(`[data-cy='disable-ssl-verification']`, 'true');
}

// IRC Form Test
function testIRCForm() {
  cy.contains(`[data-cy="irc-server-port"]`, '6667');
  cy.contains(`[data-cy="irc-server-address"]`, 'https://irc.server.com');
  cy.contains(`[data-cy="irc-nick"]`, 'irc_nick');
  cy.contains(`[data-cy="destination-channels-or-users"]`, 'channel1');
  cy.contains(`[data-cy="destination-channels-or-users"]`, 'user1');
  cy.contains(`[data-cy="disable-ssl-verification-"]`, 'true');
}

function editEmailForm() {
  cy.get(`[data-cy="notification-configuration-username"]`).clear().type('email user edited');
  cy.get(`[data-cy="notification-configuration-host"]`).clear().type('https://host_edited.com');
  cy.get(`[data-cy="notification-configuration-recipients"]`)
    .clear()
    .type('receipient1{enter}receipient2{enter}receipient3');
  cy.get(`[data-cy="notification-configuration-sender"]`).clear().type('sender@email_edited.com');
  cy.get(`[data-cy="notification-configuration-port"]`).clear().type('100');
  cy.get(`[data-cy="notification-configuration-timeout"]`).clear().type('120');
  cy.get(`[data-cy="notification_configuration-use_tls"]`).click();
  cy.get(`[data-cy="notification_configuration-use_ssl"]`).click();
}

function editSlackForm() {
  cy.get(`[data-cy="notification-configuration-token"]`).clear().type('new_slack_token');
  cy.get(`[data-cy="notification-configuration-channels"]`)
    .clear()
    .type('new_channel1{enter}new_channel2');
  cy.get(`[data-cy="notification-configuration-hex-color"]`).clear().type('#123abc');
}

function editTwilioForm() {
  cy.get(`[data-cy="notification-configuration-account-sid"]`).clear().type('new_twilio_sid');
  cy.get(`[data-cy="notification-configuration-account-token-form-group"]`)
    .clear()
    .type('new_twilio_token');
  cy.get(`[data-cy="notification-configuration-from-number-form-group"]`)
    .clear()
    .type('+10987654321');
}

function editPagerdutyForm() {
  cy.get(`[data-cy="notification-configuration-subdomain"]`).clear().type('new_subdomain');
  cy.get(`[data-cy="notification-configuration-token"]`).clear().type('new_pagerduty_token');
  cy.get(`[data-cy="notification-configuration-service-key"]`)
    .clear()
    .type('new_service_integration_key');
  cy.get(`[data-cy="notification-configuration-client-name"]`)
    .clear()
    .type('new_client_identifier');
}

function editGrafanaForm() {
  cy.get(`[data-cy="notification-configuration-grafana-url-form-group"]`)
    .clear()
    .type('https://new.grafana.com');
  cy.get(`[data-cy="notification-configuration-dashboardid"]`).clear().type('new_dashboard_id');
  cy.get(`[data-cy="notification-configuration-panelid"]`).clear().type('new_panel_id');
  cy.get(`[data-cy="notification-configuration-annotation-tags-form-group"]`)
    .clear()
    .type('new_tag1');
  cy.get(`[data-cy="notification-configuration-grafana-key"]`).clear().type('new_key');
}

function editWebhookForm() {
  cy.get(`[data-cy="notification-configuration-username"]`).clear().type('new_webhook_user');
  cy.get(`[data-cy="notification-configuration-url"]`)
    .clear()
    .type('https://new_webhook_endpoint.com');
  cy.get(`[data-cy="notification-configuration-http-method"]`).click();
  cy.contains('PUT').click();
}

function editMattermostForm() {
  cy.get(`[data-cy="notification-configuration-mattermost-url"]`)
    .clear()
    .type('https://new_mattermost.com');
  cy.get(`[data-cy="notification-configuration-mattermost-username"]`)
    .clear()
    .type('new_mattermost_user');
  cy.get(`[data-cy="notification-configuration-mattermost-channel-form-group"]`)
    .clear()
    .type('new_channel_name');
  cy.get(`[data-cy="notification-configuration-mattermost-icon-url"]`)
    .clear()
    .type('https://new_icon_url.com');
}

function editRocketChatForm() {
  cy.get(`[data-cy="notification-configuration-rocketchat-url"]`)
    .clear()
    .type('https://new_rocketchat.com');
  cy.get(`[data-cy="notification-configuration-rocketchat-username-form-group"]`)
    .clear()
    .type('new_rocketchat_user');
  cy.get(`[data-cy="notification-configuration-rocketchat-icon-url-form-group"]`)
    .clear()
    .type('https://new_icon_url.com');
}

function editIrcForm() {
  cy.get(`[data-cy="notification-configuration-port"]`).clear().type('6670');
  cy.get(`[data-cy="notification-configuration-server"]`)
    .clear()
    .type('https://new_irc.server.com');
  cy.get(`[data-cy="notification-configuration-nickname"]`).clear().type('new_irc_nickname');
  cy.get(`[data-cy="notification-configuration-targets"]`)
    .clear()
    .type('new_channel1{enter}new_user1');
}

// Email Form Test Edited
function testEmailFormEdited() {
  cy.contains(`[data-cy="username"]`, 'email user edited');
  cy.contains(`[data-cy="use-tls"]`, 'false');
  cy.contains(`[data-cy="use-ssl"]`, 'false');
  cy.contains(`[data-cy="host"]`, 'https://host_edited.com');
  cy.contains(`[data-cy="recipient-list"]`, 'receipient1');
  cy.contains(`[data-cy="recipient-list"]`, 'receipient2');
  cy.contains(`[data-cy="recipient-list"]`, 'receipient3');
  cy.contains(`[data-cy="sender-email"]`, 'sender@email_edited.com');
  cy.contains(`[data-cy="port"]`, '100');
  cy.contains(`[data-cy="timeout"]`, '120');
}

// Slack Form Test Edited
function testSlackFormEdited() {
  cy.contains(`[data-cy="destination-channels"]`, 'new_channel1');
  cy.contains(`[data-cy="destination-channels"]`, 'new_channel2');
  cy.contains(`[data-cy="notification-color"]`, '#123abc');
}

// Twilio Form Test Edited
function testTwilioFormEdited() {
  cy.contains(`[data-cy="account-sid"]`, 'new_twilio_sid');
  cy.contains(`[data-cy="source-phone-number"]`, '+10987654321');
  cy.contains(`[data-cy="destination-sms-numbers"]`, '+1987654321');
  cy.contains(`[data-cy="destination-sms-numbers"]`, '+1123456789');
}

// PagerDuty Form Test Edited
function testPagerDutyFormEdited() {
  cy.contains(`[data-cy="pagerduty-subdomain"]`, 'new_subdomain');
  cy.contains(`[data-cy="api-service/integration-key"]`, 'new_service_integration_key');
  cy.contains(`[data-cy="client-identifier"]`, 'new_client_identifier');
}

// Grafana Form Test Edited
function testGrafanaFormEdited() {
  cy.contains(`[data-cy="grafana-url"]`, 'https://new.grafana.com');
  cy.contains(`[data-cy="id-of-the-dashboard-(optional)"]`, 'new_dashboard_id');
  cy.contains(`[data-cy="id-of-the-panel-(optional)"]`, 'new_panel_id');
  cy.contains(`[data-cy="tags-for-the-annotation-(optional)"]`, 'new_tag1');
  cy.contains(`[data-cy='disable-ssl-verification']`, 'true');
}

// Webhook Form Test Edited
function testWebhookFormEdited() {
  cy.contains(`[data-cy="username"]`, 'new_webhook_user');
  cy.contains(`[data-cy="target-url"]`, 'https://new_webhook_endpoint.com');
  cy.contains(`[data-cy="http-method"]`, 'PUT');
}

// Mattermost Form Test Edited
function testMattermostFormEdited() {
  cy.contains(`[data-cy="target-url"]`, 'https://new_mattermost.com');
  cy.contains(`[data-cy="username"]`, 'new_mattermost_user');
  cy.contains(`[data-cy="channel"]`, 'new_channel_name');
  cy.contains(`[data-cy="icon-url"]`, 'https://new_icon_url.com');
  cy.contains(`[data-cy="verify-ssl"]`, 'true');
}

// RocketChat Form Test Edited
function testRocketChatFormEdited() {
  cy.contains(`[data-cy="target-url"]`, 'https://new_rocketchat.com');
  cy.contains(`[data-cy="username"]`, 'new_rocketchat_user');
  cy.contains(`[data-cy="icon-url"]`, 'https://new_icon_url.com');
  cy.contains(`[data-cy='disable-ssl-verification']`, 'true');
}

// IRC Form Test Edited
function testIRCFormEdited() {
  cy.contains(`[data-cy="irc-server-port"]`, '6670');
  cy.contains(`[data-cy="irc-server-address"]`, 'https://new_irc.server.com');
  cy.contains(`[data-cy="irc-nick"]`, 'new_irc_nickname');
  cy.contains(`[data-cy="destination-channels-or-users"]`, 'new_channel1');
  cy.contains(`[data-cy="destination-channels-or-users"]`, 'new_user1');
}
