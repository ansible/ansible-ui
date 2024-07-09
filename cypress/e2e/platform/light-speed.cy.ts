describe('Ansible Lightspeed external Link Check', () => {
  it('should open external link in a new tab', () => {
    const ansibleLightSpeed_URL = 'https://developers.redhat.com/products/ansible/lightspeed';
    cy.contains('a', 'Ansible Lightspeed').click();
    cy.contains('h1', 'Ansible Lightspeed with IBM watsonx Code Assistant').should('be.visible');
    cy.checkAnchorLinks('Get started');
    cy.contains('a', 'Get started').should('have.attr', 'target', '_blank');
    cy.contains('a[target="_blank"]', 'Get started').invoke('attr', 'href').as('externalLink');
    cy.get('@externalLink').then((url) => {
      expect(url).to.include(ansibleLightSpeed_URL);
    });
  });
});
