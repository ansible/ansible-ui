describe('Ansible Lightspeed external Link Check', () => {
  it('should open external link in a new tab', () => {
    cy.platformLogin();
    cy.contains('a', 'Ansible Lightspeed').click();
    cy.contains('h1', 'Ansible Lightspeed with IBM watsonx Code Assistant').should('be.visible');
    cy.checkAnchorLinks('Get started');
    cy.intercept('GET', 'https://developers.redhat.com/products/ansible/lightspeed').as(
      'externalLink'
    );
    cy.contains('a', 'Get started').should('have.attr', 'target', '_blank').click();
    cy.wait('@externalLink').then((interception) => {
      expect(interception.request.url).to.include(
        'https://developers.redhat.com/products/ansible/lightspeed'
      );
    });
  });
});
