[Overview](Hub-Overview.md) > Repositories

### Repositories

Repositories exist to group ansible collections; unlike namespaces, the repository name is not part of the collection data, the same collection version may be present in multiple repositories.

Most interactions with a repository are really interactions with the latest repository version of that repository. A repository may have multiple versions, these are immutable, so any change to the repo creates a new version. Depending on the repository config, 0 to all previous versions can be retained. The UI allows limited inspection of previous versions in the repository detail Versions tab.

A collection may also be in 0 repositories: when a collection version gets removed, it may still be referenced in a previous repo version. (Most list APIs filter these out.) The artifact itself will exist even after the last repo version stops referencing it, until regular orphan cleanup happens after at least 24 hrs. (`oci-env exec pulp orphan cleanup --protection-time 0`; or `curl -k -u admin:password -X POST https://HOST/api/galaxy/pulp/api/v3/orphans/cleanup/`)

In pulp, a repository may have zero to many distributions, and an optional remote.

Distributions exist to expose a repository to outside - sync or upload work through a distribution, it also provides a `base_path` (url fragment). Any repository actions that use a `base_path` need at least one distribution to exist.

Hub doesn't allow manipulating distributions directly, but allows creating a distribution when a repo doesn't have one, and uses a heuristic to figure out the right distribution to use when multiple are present (`repositoryBasePath`: prefer same name, or oldest).

Remotes contain the configuration needed to sync from an external source - server, tokens/passwords, `requirements.yaml`.
A repository needs to be associated with a remote in order to sync from that source. (Multiple repositories could use the same remote, but why, you need a different remote for a different `requirements.yaml` value.)

The traditional flow only used 3+2 repos: `staging` -> `published` | `rejected`. Uploads would go to `staging`, approval or rejection would move to `published` or `rejected`. There would also be a `rh-certified` and a `community` repository, both preconfigured with remotes that sync from `galaxy.ansible.com` and `console.redhat.com`.

Since 2.4+, users can also create custom repositories; assign them a pipeline setting (`staging`, `approved`, none) to allow for custom upload/approval targets (+ a modal to chose, when there are options); copy collections between repositories, remove from repositories, etc.

The underlying pulp repository concept is also used in Execution Environments, but each EE gets its own repository and they are not visible in the UI.


#### Repository URLs (`getRepoURL`)

Right now `getRepoURL` special-cases `published` to just return the server URL without the repository parts, which is a reasonable default for now. 

How it should actually work..

URLs for **pulling**

* if the repository is literally `published`, return the api base path (ie `http://host/api/galaxy/`)
  * *except* on c.r.c where we'd include content/published since AAH-2335 (though only on the token page, not namespaces ... there's a chance we can remove that exception, or base it on IS_INSIGHTS instead of the screen)
* for any other repository, return the distribution base path (ie `http://host/api/galaxy/content/foobar/`)

URLs for **pushing**

* if the repository is a `pipeline:approved` it has to go through the approval process, return the api base path
* if the repository is a `pipeline:staging` it has to go through the process, but the repo is a valid place to start the process, return the distribution base path
* if the repository is a `pipeline:rejected`, there is no reason to push there, return nothing (or go with api base path if it makes more sense than nothing)
* any other repository, we push there directly, use the distribution base path (but also add an object permission check for that repo before displaying it)