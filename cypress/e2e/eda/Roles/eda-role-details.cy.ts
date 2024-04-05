// Skip Eda role tests until the API is available in eda-server/main
describe.skip('Eda Role Details', () => {
  before(() => {
    cy.edaLogin();
  });

  it('Role Details Pages Should Show', () => {
    cy.getEdaRoles().then((roles) => {
      roles.forEach((role) => {
        cy.navigateTo('eda', 'roles');
        cy.clickLink(role.name);
        cy.verifyPageTitle(role.name);
        cy.get('[data-cy=name]').should('have.text', role.name);
        cy.get('[data-cy=description]').should('have.text', role.description);
        cy.getEdaRoleDetail(role.id.toString()).then((roleDetail) => {
          cy.get('[data-cy=permissions-description-list]').within(() => {
            for (const detail of roleDetail.permissions) {
              cy.get(`[data-cy=${detail.resource_type}]`).should('be.visible');
              cy.get(`[data-cy=${detail.resource_type}]`)
                .parent()
                .within(() => {
                  for (const action of detail.action) {
                    cy.get(`[data-cy=${action}]`).should('be.visible');
                  }
                });
            }
          });
        });
      });
    });
  });
});
