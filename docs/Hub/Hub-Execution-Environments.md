[Overview](Hub-Overview.md) > Execution Environments

### Execution Environments

An Execution Environment is really a container.

Hub serves as a local container registry, allowing users to upload containers (these are called local EEs),
and it can also download containers from other registries (these are called remote EEs).

In pulp terms an execution environment is a pulp_container repository + namespace + distribution (while a [Remote Registry](Hub-Remote-Registries.md) is a pulp remote).


#### Remote vs Local EE

Adding locals can only be done using podman/docker:

| podman                                                        | docker                                                 |
| ------------------------------------------------------------- | ------------------------------------------------------ |
| `podman login localhost:5001 --tls-verify=false`              | `docker login localhost:5001`                          |
| `podman pull docker.io/library/alpine`                        | `docker pull alpine`                                   |
| `podman image tag alpine localhost:5001/alpine:latest`        | `docker image tag alpine localhost:5001/alpine:latest` |
| `podman push localhost:5001/alpine:latest --tls-verify=false` | `docker push localhost:5001/alpine:latest`             |

on dev, this needs `/v2/` and `/extensions/v2/` proxied to oci-env if you're talking to webpack.

UI for adding remote EEs needs a [Remote Registry](Hub-Remote-Registries.md) to exist, and allows adding remote containers to be synced from a remote registry. You can pick a subset of tags to sync (eg. just latest), it's a good idea to do that, pulling large containers with all their versions tends to fail because of rate-limiting on the other side. A remote EE's name can be different than the remote counterpart, the remote name corresponds to the name on the other server, for non-namespaced names some remote registries won't find it without a `library/` prefix (eg. `alpine` becomes `library/alpine` but `foo/bar` stays as is). Once added, the remote EE doesn't sync by default, you have to triggger the sync manually. Until that happens, the EE is visible but mostly empty, can't be pulled from.

Local and Remote containers are mostly identical in the UI, except remotes can be synced and the edit form is different.


#### Detail screens

Details tab shows how to pull from hub, and allows editing README.
(And a header with Edit, [Sync], Use in Controller, Delete, Sign; signature status, and for remotes last update status.)

Activity shows recent changes to tags & images, with a click-through to an Image layers view (for tags and digests).

Images shows individual images/digests/versions, and allows managing tags and removing layers.

(+ a shared Access tab)

:exclamation: Constructing the proper `docker pull` string is non-trivial - use [`getContainersURL`](https://github.com/ansible/ansible-hub-ui/blob/master/src/utilities/get-repo-url.ts#L15-L31). (The formats are `url/image`, `url/image:tag`, `url/image@digest` (including a `sha256:` prefix).)


#### Use in Controller

A "Use in Controller" action is available for containers - you can select a container by tag or digest (sha), and use the use in controller modal to open this in a linked Controller instance. This requires the backend configured with at least one linked Controller url:

(in `compose.env`:)
```
PULP_CONNECTED_ANSIBLE_CONTROLLERS='["https://controller.example.com"]'
```

All this really does is use the container info and the selected server URL to construct a link into the Controller UI, with the choice of containers prefilled by the shas.

The action is available in EE list/header (using the latest tag), or for individual digests in the Images tag (using the first tag or digest if none).

(My assumption would be that in AAP this would be removed from upstream, and hardcoded to use the local controller urls downstream.)


#### Signing

Container signing is described in https://ansible.readthedocs.io/projects/galaxy-ng/en/latest/config/container_signing/.
Currently ansible-hub-ui is doing too much signing, see [AAH-1989](https://issues.redhat.com/browse/AAH-1989) for how it *should* work.


#### Manage Tags

Container tags are just a `\w+` pointer to a digest (sha).

The Images tab shows all images in that container's repo, along with associated tags and allow adding/removing tags. 
And image can have many tags, updating a tag via a sync / docker pull will only change the pushed / included tag, if a digest has other tags they will remain unchanged.


#### Multi-arch images

Example: library/alpine from dockerhub

Multi-arch images are special kinds of containers where the top level digest is not a real image, but an object mapping from architecture strings to actual image shas.

The UI supports these in a limited way, the Image layers view won't work (but it should if the APIs support it now),
but the Images view allows expanding these and following links to the individual architecure's Image layers.


#### Misc

Since EEs can have namespaced names but don't have to, and we want the image name to be part of the URL in the UI, we're essentially having 2 sets of routes for every EE screen - `eeprefix/:namespace/:name/_contents/*` and `eeprefix/:name/_contents/*` (this only works because of that magic `_contents` - container names can't start with an underscore so it provides disambiguation).