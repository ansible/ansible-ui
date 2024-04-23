/** The Roles endpoint is going to change with the EDA server's RBAC branch and these tests will need to be updated to reflect the new endpoint */
//Tests a user's ability to perform certain actions on the Roles list in the EDA UI.

// describe('EDA Roles List', () => {
//   before(() => {
//     cy.edaLogin();
//   });

//   it('can render the Roles list view and utilize the Roles links to view details', () => {
//     cy.navigateTo('eda', 'roles');
//     cy.verifyPageTitle('Roles');
//     cy.getEdaRoles().then((roles) => {
//       cy.get('tbody').find('tr').should('have.length', roles.length);
//       roles.forEach((role) => {
//         cy.verifyPageTitle('Roles');
//         cy.clickLink(role.name);
//         cy.verifyPageTitle(role.name);
//         cy.get('#description').should('contain', role.description);
//         cy.clickLink(/^Roles$/);
//       });
//     });
//   });
// });
