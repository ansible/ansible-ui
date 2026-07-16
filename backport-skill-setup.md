# Backporting with the `platform-services-utilities` Plugin in Carbonite

This guide explains how to set up and use the `/backport` skill provided by the `platform-services-utilities` plugin inside a Carbonite shell session.

## Overview

The `platform-services-utilities` plugin (sourced from `ai-marketplace-internal`) provides backporting skills that automate cherry-picking changes across branches and opening PRs in downstream repos. When configured, the plugin is installed automatically when Carbonite starts.

The backport workflow touches multiple GitHub orgs/repos, each requiring its own token:

| Purpose | Org/Repo | Token variable |
|---|---|---|
| Pull the plugin source | `ansible/platform-services-utilities` | `GH_PSU_TOKEN` |
| Read the upstream PR | `ansible/ansible-ui` | `GH_ANSIBLE_UI_TOKEN` |
| Open the backport PR | `ansible-automation-platform/aap-ui` | `GH_AAP_UI_TOKEN` |

## Prerequisites

- Carbonite installed and working
- GitHub tokens with appropriate access:
  - **`GH_PSU_TOKEN`** — read access to `ansible/platform-services-utilities`
  - **`GH_ANSIBLE_UI_TOKEN`** — read access to `ansible/ansible-ui`
  - **`GH_AAP_UI_TOKEN`** — write access to `ansible-automation-platform/aap-ui` (for creating PRs)
- A JIRA account (for linking backport work to issues)

## Setup

### 1. Export your tokens

Add the following to your `~/.zshrc` (or equivalent):

```bash
export GH_PSU_TOKEN="ghp_..."
export GH_ANSIBLE_UI_TOKEN="ghp_..."
export GH_AAP_UI_TOKEN="ghp_..."
```

### 2. Configure Carbonite

Create or edit `~/.config/carbonite/config.yaml`:

```yaml
claude:
  plugins:
    - aap-sdlc-harness
    - platform-services-utilities

credentials:
  github:
    - org: ansible
      repo: ansible-ui
      token_var: GH_ANSIBLE_UI_TOKEN
    - org: ansible-automation-platform
      repo: aap-ui
      token_var: GH_AAP_UI_TOKEN
    - org: ansible
      repo: platform-services-utilities
      token_var: GH_PSU_TOKEN

sandbox:
  env:
    JIRA_BASE_URL: https://redhat.atlassian.net
    JIRA_EMAIL: your-email@redhat.com
```

The `credentials.github` block tells Carbonite which token to use for each org/repo combination. Claude will automatically select the right token when accessing each repo.

### 3. Update Carbonite

Multi-org token switching depends on two MRs from the AT-AT team, both now merged:

- **Carbonite**: https://gitlab.cee.redhat.com/atat/carbonite/-/merge_requests/206 (merged)
- **Harness**: https://gitlab.cee.redhat.com/atat/harness/-/merge_requests/157 (merged)

Update Carbonite to pick up multi-token support:

```bash
cd ~/carbonite
git checkout main
git pull
carbonite update
```

Then start a Carbonite shell the regular way:

```bash
cd ~/path/to/aap-ui
carbonite shell .
```

## Usage

Once inside the Carbonite shell, start Claude and invoke the backport skill:

```
$ claude
```

Then use the slash command:

```
❯ /backport
```

Claude will walk you through the backport process — identifying the upstream PR, cherry-picking commits, resolving conflicts, and opening a PR in the downstream `aap-ui` repo.

A `/backport-review` skill is also available to compare an original PR against its backport for validation.

## Troubleshooting

- **Plugin not found** — Verify your `config.yaml` lists `platform-services-utilities` under `claude.plugins` and that `GH_PSU_TOKEN` is exported.
- **Authentication errors on PR creation** — Check that `GH_AAP_UI_TOKEN` has write access to `ansible-automation-platform/aap-ui`.
- **Token not switching** — Make sure Carbonite is up to date (`cd ~/carbonite && git checkout main && git pull && carbonite update`).
