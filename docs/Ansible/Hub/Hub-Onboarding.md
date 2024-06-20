Text From Martin (from Slack):

# Slack Channels:
[#aap-ui](https://redhat-internal.slack.com/archives/C027K1897U4) you already know this one, still the right channel for all work concerning the new ui (except for when you want to complain to/sync with our group :))

[#ansible-galaxy-internal](https://redhat-internal.slack.com/archives/CBPKRHHG9) the main channel for the hub team as a whole, including pulp & cloud stakeholders, etc.; any coordination with API should probably happen there or in the next one

[ansible-hub-internal](https://redhat-internal.slack.com/archives/C0269FV71PX) a smaller version of the above, this one with just the hub team

[#hub-ui](https://redhat-internal.slack.com/archives/C0515RLSBQF) this one, an informal channel for hub ui to keep in sync

[#wg-aap-hub-platform-ui-rewrite](https://redhat-internal.slack.com/archives/C05BB6BGWH2) a channel specifically for the "rewrite hub to ansible-ui" effort

[#pulp](https://redhat-internal.slack.com/archives/C031713779N) even more backend folks

# Documentation
https://ansible.readthedocs.io/projects/galaxy-ng/en/latest/ (current, built from the galaxy_ng repo master branch on update) 

https://github.com/ansible/galaxy_ng/wiki (partly obsolete, parts still relevant) https://github.com/himdel/ansible-hub-ui/wiki/ (mostly related to old ui, still useful for some how to get X done questions) 

https://galaxy.ansible.com/api/v3/swagger-ui/ (closest you can get to api docs, currently broken, Jiri has a fix) 

https://github.com/ansible/ansible-ui/wiki/Hub-Overview (description of what some hub screens do, meant to help the conversion effort) 

(https://docs.pulpproject.org/ (pulp docs, for completeness))

# Components
Historically, the project is a successor to original Ansible Galaxy, which was a python+angular app to serve as a public repository to index ansible roles and host ansible collections. That project is still available in read-only unauthenticated-only form on 

[old-galaxy.ansible.com](http://old-galaxy.ansible.com/), 

built from https://github.com/ansible/galaxy. That repo is NOT relevant anymore.

Currently, the relevant repos are:

# frontend: 
https://github.com/ansible/ansible-hub-ui/ ("old ui", but also the only ui actually used by any users now) 

https://github.com/ansible/ansible-ui/ (future ui, once we write it again) (https://github.com/RedHatInsights/chrome-service-backend/ (c.r.c menu definitions, you probably won't need this one))

# backend: 
https://github.com/ansible/galaxy_ng/ (the backend) https://github.com/pulp/oci_env/ (the container setup you need to run the backend)  

https://github.com/pulp/pulpcore/, 

https://github.com/pulp/pulp_ansible/, 

https://github.com/pulp/pulp_container (you don't need any of these last 3, unless you start contributing to the backend)  

Pulp is a python server that can serve as a repository for various kinds of packages (ansible collections & containers (aka ansible execution environments) in our case).

Galaxy is built on top of pulp, using pulp to host content/sync/etc., but also provides extra APIs for dealing with ansible roles, a custom user/group/role (rbac role = a set of permissions) implementation, etc. This leads to a certain lack of consistency in our APIs, in general, anything with v1 is following galaxy conventions, anything with v3 is more pulp-like.

Some API endpoints use limit & offset, others page & page_size for pagination (old UI abstracts that away and always uses page in code), for sorting, ordering, sort and order_by is used (old UI uses sort in code), results or data are used for list results, with count either in count or meta.count.

Also PATCH does not necessarily update just the fields you're sending. Beware :). For a list of all APIs the old ui is using, consult https://github.com/ansible/ansible-hub-ui/tree/master/src/api (if an api file mentions a commented-out method name, it means that method is used, but inherited unchanged from a base class); the expectations is to use the same APIs as the old ui in the new one (and it's my job to keep the old ui up to date enough for that to work :)), and indeed to provide mostly the same ui, following "the" new conventions.

# Products
The galaxy_ng + ansible-hub-ui combo is currently built into 3 separate products with different life cycles.

PAH = private automation hub = standalone: a version that customers/users can get running locally, and use as their own private self-hosted repositories also includes a standalone-ldap & standalone-keycloak variant - different forms of external auth, probably not relevant

galaxy = [galaxy.ansible.com](http://galaxy.ansible.com/) = community = standalone-community: a publicly hosted version of hub, any github user can log in and add their content enables github login, ansible roles, and unauthenticated user access disables execution environments (containers), signing & custom repositories

Automation Hub = crc = insights: a version of hub running on the [console.redhat.com](http://console.redhat.com/) platform, content is managed by a "partner engineering" group in redhat disables execution environements, user management different signing flow - user uploads signature different authentication token implementation

("standalone"/"community"/"insights" are the names to keep in mind when running the right version of api & ui, see below) PAH is using an almost traditional lifcycle - users never use the code from the master branch, but master ocassionally gets forked into a stable-4.y branch, which then gets tagged and released as a stable PAH release. For a while after that, some fixes get backported to these branches when merged to master, subject to https://github.com/ansible/galaxy_ng/wiki/Backporting-Guidelines . 

For a version mapping, see

https://github.com/ansible/galaxy_ng/wiki/Galaxy-NG-Version-Matrix, 

for support dates also 

https://access.redhat.com/support/policy/updates/ansible-automation-platform . 

crc is deployed from ansible-hub-ui master to stage-beta always, and to stage-stable when not paused before a prod deploy. prod-beta & prod-stable deploys happen during regular maintenance windows.

galaxy is deployed to [galaxy-dev.ansible.com](http://galaxy-dev.ansible.com/) and [galaxy-stage.ansible.com](http://galaxy-stage.ansible.com/) periodically; and to [galaxy.ansible.com](http://galaxy.ansible.com/) semi-periodically (consult jtanner or drodowic if you need to know more, but you'll see merged PRs on stage within a day and on prod within a week). For the purpose of ansible-ui, standalone & community are the relevant modes, see below for a shared setup.

# Content types
Users can upload ansible collections, these live in namespaces and in repositories. The namespace is hardcoded in the collection, the repository can change.

Repositories can be synchronized from other serves using a Remote. Uploaded collections are subject to an approval lifecycle: by default, a collection is uploaded to a "staging" repo, and not visible outside the "Approvals" screen, admins can use the approvals screen to approve or reject a collection, approved collections end up in the "published" repo, rejected in "rejected". Only "published" collections would be visible.

There's also a PULP_GALAXY_REQUIRE_CONTENT_APPROVAL='false' setting, which causes uploads to get auto-approved and land in published. BUT, in 4.7 we also added custom repositories. By default, a custom repository can be uploaded to directly, skipping approvals and staging. Collections in such a repo are visible, same as published.

a custom repo can also be private - collections are not visible outside the repo and it can have a pipeline setting of staging/approved - these behave as alternatives to the original staging/published, uploaders can chose between staging repos, approvers can multi-choose between approval repos.

Users can also upload containers, aka execution environments. A container can be pushed under any name or namespace/name. Users can import ansible roles, these get indexed locally, but served from github. These are also called "standalone roles" or "legacy roles". Consider the "legacy" name deprecated as per community feedback 🙂. These roles have their own namespaces, a role namespaces would usually be managed by a collection namespace for ..reasons 🙂. (We can do RBAC on pulp namespaces, but a role namespace isn't a pulp namespace.)

If you need to add data of some kind and not sure how, https://github.com/himdel/ansible-hub-ui/wiki/Getting-Data will help.

# Settings, feature flags
Most differences between modes are not inherent to the mode, but set via settings or feature flags. (Technically, the set of feature flags is just another setting.)

For a list of relevant setings and feature flags, see these.. 

https://ansible.readthedocs.io/projects/galaxy-ng/en/latest/config/options/ 

https://github.com/ansible/ansible-hub-ui/blob/master/src/api/response-types/settings.ts 

https://ansible.readthedocs.io/projects/galaxy-ng/en/latest/config/featureflags/ 

https://github.com/ansible/ansible-hub-ui/blob/master/src/api/response-types/feature-flags.ts

# Team members
Everybody working on the UI is here in hub-ui, feel free to reach out :), for API problems you may want to reach out to Bruno Rocha, James Tanner, Jiri Jerabek or Brian McLaughlin, possibly also David Newswanger who is mostly working on gateway now. The Hub manager is John Mitchell, with Harpreet managing the ansible ui effort, and Heather Smith & John Hardy as the various PMs.

# Jira, issues
If you need to create an issue, the project is AAH - 

https://issues.redhat.com/projects/AAH/issues In that project, you can identify UI issues using a Component = UI search, and narrow down to new UI using a label = hub-new-ui. (And because Jira is Jira, the opposite search jql is component = ui and label != hub-new-ui or label IS NULL :)) AAP, ANSTRAT, AAHRFE are also possibly relevant.

# Meetings
For the hub team as a whole, there's a Monday 11 EST/17 CET "AH Team Check-in", not sure if relevant, and a Wednesay 9:30/15:30 // 10/16 demo or refinement meeting .. the demos are probably relevant, but happen monthly. And we have a 10 EST/16 CET "UI meeting", I'd like to invite you there if you're ok with that. And now for the useful part.. 🙂

### Setting up dev env

Have Python 3+, docker, git, node 18+.

(Note: if you want to contribute to api/old ui, you need to fork the repos and clone your fork instead (and use ssh, not https). We do not push to upstream repos.
You'd also want to follow https://github.com/himdel/ansible-hub-ui/wiki/#prelude to set up commit signing.)

```
# clone everything under the same parent directory (well, oci-env needs to be side-by-side with galaxy_ng)
git clone https://github.com/pulp/oci_env
git clone https://github.com/ansible/galaxy_ng
git clone https://github.com/ansible/ansible-hub-ui
```

```
# install oci-env command
cd oci_env
pip3 install --break-system-packages --user --upgrade ./client/
cd
oci-env
```

(if the last `oci-env` didn't get found, you'll need `~/.local/bin/` added to your `PATH` (`.bashrc` or `.bash_profile` (or the zsh equivalents)))

```
# configure oci-env
cd oci_env
cat >compose.env <<EOF
COMPOSE_PROJECT_NAME='oci_env-standalone'
COMPOSE_PROFILE=galaxy_ng/base
DEV_SOURCE_PATH=galaxy_ng

COMPOSE_BINARY=docker
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_PASSWORD=admin
ENABLE_SIGNING=1
SETUP_TEST_DATA=1
UPDATE_UI=0

PULP_GALAXY_REQUIRE_CONTENT_APPROVAL=false
PULP_GALAXY_API_PATH_PREFIX='/api/automation-hub/'

# PULP_GALAXY_FEATURE_FLAGS__ai_deny_index=true
PULP_GALAXY_ENABLE_LEGACY_ROLES=true

PULP_CONNECTED_ANSIBLE_CONTROLLERS='["https://controller.example.com"]'

PULP_CSRF_TRUSTED_ORIGINS='["http://localhost:8002", "https://localhost:4102"]'
EOF
```

this configures oci-env to run galaxy in standalone mode with roles enabled and approval pipeline disabled. It's what I currently use, there are other options.

```
# run the backend
oci-env compose build --no-cache
oci-env compose up
```

```
# run the UI
cd ansible-hub-ui
npm install
npm run start-standalone
open http://localhost:8002/
```

Please remember to keep *all 3* repos up to date.

MacOS users: please make sure to enable "containerd" in Docker Machine settings


### Galaxykit

https://github.com/ansible/galaxykit

Used as command line tool for simplyfication of API requests.
For example:

```
galaxykit -u admin -p admin collection upload [namespace] [name] [version]
```

can create + upload a new collection. (Remember to `pip install ansible` for this to work.)

List the commands:

`galaxykit --help`

Particular command:

`galaxykit [command name] --help`

For example, to create a namespace:

* `galaxykit namespace create blahblah`
  * only works if http://localhost:8002/ works, uses admin/admin
* `galaxykit -s https://wherever.com/api/galaxy/ -u myusername -p mypassword namespace create blahblah`
  * create a namespace on a remote server
* `galaxykit -t mytoken namespace create blahblah`
  * authenticate using a token (UI: Collections > API token)
