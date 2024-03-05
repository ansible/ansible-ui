describe('HUB API Commands', () => {
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);

  it('should create and delete an execution environment', () => {
    cy.createHubRemoteRegistry().then((remoteRegistry) => {
      cy.createHubExecutionEnvironment({
        executionEnvironment: { registry: remoteRegistry.id },
      }).then((executionEnvironment) => {
        cy.deleteHubExecutionEnvironment(executionEnvironment).then(() => {
          cy.deleteHubRemoteRegistry(remoteRegistry);
        });
      });
    });
  });

  it('should create and delete a repository', () => {
    cy.createHubRepository().then((repository) => {
      cy.deleteHubRepository(repository);
    });
  });

  it('should create and delete a namespace', () => {
    cy.createHubNamespace().then((namespace) => {
      cy.deleteHubNamespace(namespace);
    });
  });

  it('should create and delete a role', () => {
    cy.createHubRole().then((role) => {
      cy.deleteHubRole(role);
    });
  });

  it('should create and delete a remote', () => {
    cy.createHubRemote().then((remote) => {
      cy.deleteHubRemote(remote);
    });
  });
});
