[Overview](Hub-Overview.md) > Remote Registries

### Remote Registries

Remote Registries serve to create pulp remotes for use by [Execution Environments](Hub-Execution-Environments.md).
(pulp remotes are also used for collection [Remotes](./Hub-Remotes)).

A remote contains all the information (usernames, tokens, passwords, server urls & config) needed to sync Execution Environments from another server.

Since EEs are just containers, these can be synced from any container registry, such as `https://registry.hub.docker.com/`.
You can also sync from another Hub instance; syncing from a Hub dev instance will only work when `/v2/` and `/extensions/v2/` are proxied to oci-env.


#### Sync from Registry

There is a "Sync from Registry" action available for Remote Registries, it's important to note that this is a convenience wrapper around "sync every remote EE using this registry". If no remote containers are configured, the sync will successfully do nothing, even if the server is not configured correctly.
