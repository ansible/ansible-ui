// //Tests the actions a user can perform on the tabs inside of a User in the EDA UI.
// import { randomString } from '../../../../framework/utils/random-string';
// import { AwxToken } from '../../../../frontend/awx/interfaces/AwxToken';
// import { EdaControllerToken } from '../../../../frontend/eda/interfaces/EdaControllerToken';
// import { IAwxResources } from '../../../support/awx-commands';

// describe('EDA User Tokens Tab', () => {
//   let awxToken: AwxToken;
//   let awxResources: IAwxResources;

//   before(() => {
//     cy.createAwxToken().then((token) => {
//       awxToken = token;
//     });

//     cy.createAwxOrganizationProjectInventoryJobTemplate({
//       project: { scm_url: 'https://github.com/ansible/ansible-ui' },
//       jobTemplate: { name: 'run_basic', playbook: 'basic.yml' },
//     }).then((resources) => (awxResources = resources));

//     cy.edaLogin();
//   });

//   after(() => {
//     cy.deleteAwxToken(awxToken);
//     cy.deleteAwxResources(awxResources);
//   });

//   it('can add a new Token', () => {
//     const newTokenName = 'E2E Token ' + randomString(8);
//     cy.getEdaActiveUser().then((activeUser) => {
//       cy.visit('/eda/users?sort=&page=1&perPage=100');
//       cy.clickLink(activeUser?.username);
//       cy.clickTab('Controller Tokens');
//       cy.clickButton('Create controller token');
//       cy.hasTitle('Create Controller Token');
//       cy.typeInputByLabel('Name', newTokenName);
//       cy.typeInputByLabel('Token', awxToken.token);
//       cy.intercept('POST', '/api/eda/v1/users/me/awx-tokens/').as('created');
//       cy.clickButton('Create controller token');
//       // cy.setPageSize(100);
//       cy.contains('td', newTokenName);
//       cy.wait('@created')
//         .its('response.body')
//         .then((token: EdaControllerToken) => cy.deleteEdaCurrentUserAwxToken(token));
//     });
//   });

//   // EDA ONLY SUPPORTS A SINGLE TOKEN AND THROWS ERROR IF THERE ARE MORE
//   // SINCE MULTIPLE E2E RUNS ARE RUNNING IN PARALLEL, THIS TEST WILL CAUSE FAILURES
//   // it('can delete a Token from the list', () => {
//   //   cy.addEdaCurrentUserAwxToken(awxToken.token).then((activeUserToken) => {
//   //     cy.getEdaActiveUser().then((activeUser) => {
//   //       cy.navigateTo('Users');
//   //       cy.clickLink(activeUser?.username);
//   //       cy.clickButton('Controller Tokens');
//   //       cy.get('.pf-c-toggle-group__button').eq(2).click();
//   //       cy.get(`#${activeUserToken.id}`).within(() => {
//   //         cy.get('.toggle-kebab')
//   //           .click()
//   //           .then(() => {
//   //             cy.get('li').click();
//   //           });
//   //       });
//   //       cy.clickModalConfirmCheckbox();
//   //       cy.intercept('DELETE', `/api/eda/v1/users/me/awx-tokens/${activeUserToken.id}/`).as(
//   //         'deleted'
//   //       );
//   //       cy.clickModalButton('Delete controller tokens');
//   //       cy.wait('@deleted').then((deleted) => {
//   //         expect(deleted?.response?.statusCode).to.eql(204);
//   //       });
//   //       cy.assertModalSuccess();
//   //     });
//   //   });
//   // });
// });
