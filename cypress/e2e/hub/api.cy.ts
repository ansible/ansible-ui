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

  it('should cleanup old e2e execution environments', () => {
    cy.queryHubExecutionEnvironments().then((response) => {
      for (const executionEnvironment of response.body.data) {
        if (
          executionEnvironment.name.startsWith('e2e_') ||
          executionEnvironment.name.startsWith('hub_e2e_')
        ) {
          if (new Date(executionEnvironment.created_at ?? '') < oneHourAgo) {
            cy.deleteHubExecutionEnvironment(executionEnvironment);
          }
        }
      }
    });
  });

  it('should create and delete a repository', () => {
    cy.createHubRepository().then((repository) => {
      cy.deleteHubRepository(repository);
    });
  });

  it('should cleanup old e2e repositories', () => {
    cy.queryHubRepositories().then((response) => {
      for (const repository of response.body.results) {
        if (repository.name.startsWith('e2e_') || repository.name.startsWith('hub_e2e_')) {
          if (new Date(repository.pulp_created ?? '') < oneHourAgo) {
            cy.deleteHubRepository(repository);
          }
        }
      }
    });
  });

  it('should create and delete a namespace', () => {
    cy.createHubNamespace().then((namespace) => {
      cy.deleteHubNamespace(namespace);
    });
  });

  // Namespaces do not have a created date thus cannot be cleaned up by date...
  it.skip('should cleanup old e2e namespaces', () => {
    cy.queryHubNamespaces().then((response) => {
      for (const namespace of response.body.data) {
        if (namespace.name.startsWith('e2e_') || namespace.name.startsWith('hub_e2e_')) {
          cy.log('namespace', namespace);
          // if (new Date(namespace.pulp_created ?? '') < oneHourAgo) {
          // cy.deleteHubNamespace(namespace);
          // }
        }
      }
    });
  });

  it('should create and delete a role', () => {
    cy.createHubRole().then((role) => {
      cy.deleteHubRole(role);
    });
  });

  it('should cleanup old e2e roles', () => {
    cy.queryHubRoles().then((response) => {
      for (const role of response.body.results) {
        if (role.name.startsWith('e2e_') || role.name.startsWith('hub_e2e_')) {
          if (new Date(role.pulp_created ?? '') < oneHourAgo) {
            cy.deleteHubRole(role);
          }
        }
      }
    });
  });

  it('should create and delete a remote', () => {
    cy.createHubRemote().then((remote) => {
      cy.deleteHubRemote(remote);
    });
  });

  it('should cleanup old e2e remotes', () => {
    cy.queryHubRemotes().then((response) => {
      for (const remote of response.body.results) {
        if (remote.name.startsWith('e2e_') || remote.name.startsWith('hub_e2e_')) {
          if (new Date(remote.pulp_created ?? '') < oneHourAgo) {
            cy.deleteHubRemote(remote);
          }
        }
      }
    });
  });
});
