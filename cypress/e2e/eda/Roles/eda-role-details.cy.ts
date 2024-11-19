describe('Check if the build includes EDA', () => {
  before(function () {
    cy.getPlatformApis().then((data) => {
      if (data?.apis && !data?.apis?.eda) {
        this.skip();
      } else {
        cy.log('Run these tests');
      }
    });
  });

  describe('Eda Role Details', () => {
    it('role details pages should display role name, description, and permissions', () => {
      cy.getEdaRoles().then((roles) => {
        roles.forEach((role) => {
          cy.navigateTo('eda', 'roles');
          cy.clickTableRow(role.name, true);
          cy.get('[data-cy=name]').should('have.text', role.name);
          cy.get('[data-cy=description]').should('have.text', role.description);
          cy.getEdaRoleDetail(role.id.toString()).then((roleDetail) => {
            if (roleDetail.permissions.length > 3) {
              cy.get('[data-cy="permissions-description-list"] button').click();
            }
            for (const detail of roleDetail.permissions) {
              cy.get(`[data-cy="${detail}"]`).should('be.visible');
            }
          });
        });
      });
    });
  });
});
