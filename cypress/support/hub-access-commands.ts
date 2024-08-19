import { randomString } from '../../framework/utils/random-string';
import { HubUser } from '../../frontend/hub/interfaces/expanded/HubUser';
import { HubTeam } from '../../frontend/hub/interfaces/expanded/HubTeam';

Cypress.Commands.add('createHubUser', (hubUser?: Partial<HubUser>) => {
  cy.createPlatformUser({
    username: `hub-user${randomString(4)}`,
    password: `${randomString(10)}`,
    ...hubUser,
  }).then((platformUser) => {
    // Retrieve the created user from Hub
    cy.getHubUserByAnsibleId(platformUser.summary_fields.resource.ansible_id);
  });
});

Cypress.Commands.add('deleteHubUser', (user: HubUser, options?: { failOnStatusCode?: boolean }) => {
  cy.getPlatformUserByAnsibleId(user.resource.ansible_id).then((platformUser) =>
    cy.deletePlatformUser(platformUser, options)
  );
});

Cypress.Commands.add('createHubTeam', () => {
  cy.createPlatformTeam({
    name: `hub-team${randomString(4)}`,
    organization: 1, // Use default organization
  }).then((platformTeam) =>
    // Retrieve the created team from Hub
    cy.getHubTeamByAnsibleId(platformTeam.summary_fields.resource.ansible_id)
  );
});

Cypress.Commands.add('deleteHubTeam', (team: HubTeam, options?: { failOnStatusCode?: boolean }) => {
  cy.getPlatformTeamByAnsibleId(team.resource.ansible_id).then((platformTeam) =>
    cy.deletePlatformTeam(platformTeam, options)
  );
});
