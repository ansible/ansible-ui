# Production Demo Setup

This setup creates a realistic deprecations dashboard demo showing what customers would see in their production environments.

## Setup Instructions

### 1. Install Collections

In your AWX Project, add the `collections/requirements.yml` file:

```yaml
---
collections:
  - name: community.general
  - name: community.crypto
  - name: amazon.aws
  - name: ansible.posix
  - name: community.docker
  - name: community.mysql
```

**In AWX:**
1. Add this file to your project repository
2. Project settings → Enable "Use Collections Requirements File"
3. Sync the project - AWX will auto-install collections

### 2. Run the Production Demo Playbook

Use `production_deprecations_demo.yml` which simulates:
- ✅ Multiple environments (prod, staging, dev)
- ✅ Common infrastructure patterns (web, database, cache servers)
- ✅ Service and package management
- ✅ Collection-specific deprecations

### 3. Run Multiple Times

To simulate a production estate:

```bash
# Run 5-10 times to show "Affected Jobs" metric
# Tag different runs to simulate different teams/environments:

ansible-playbook production_deprecations_demo.yml --tags core
ansible-playbook production_deprecations_demo.yml --tags services
ansible-playbook production_deprecations_demo.yml --tags database
ansible-playbook production_deprecations_demo.yml --tags webserver
ansible-playbook production_deprecations_demo.yml --tags production
```

**In AWX:** Just run the job template multiple times

## Expected Dashboard Results

After running 5-10 times, you should see:

- **Total Warnings:** 50-100+ (realistic for mid-size environment)
- **Affected Jobs:** 5-10 (multiple playbook runs)
- **Unique Issues:** 2-4 types of deprecations
- **Severity Levels:** 
  - Some **HOT** (>50 occurrences) - critical issues
  - Some **WARM** (25-50) - important
  - Some **MODERATE** (10-25) - should fix soon
  - Some **COOL** (<10) - low priority

## About Collection Deprecations

### What Might Trigger Events

Collection deprecations that use Ansible's deprecation framework properly **should** create `event=deprecated` records:

```python
# In a collection module
module.deprecate(
    msg="This parameter is deprecated",
    version="3.0.0",
    collection_name="community.general"
)
```

### What Won't Trigger Events

- Python library warnings (like paramiko TripleDES)
- Collection warnings that only print to stdout
- Deprecations handled outside Ansible's callback system

### Known Collection Deprecations (as of 2026)

**community.general:**
- `git_config` with `list_all` parameter
- `iso_extract` module (being removed)
- `cmdrunner` ignore_none parameter

**community.crypto:**
- `openssl_privatekey` (use `openssl_privatekey_pipe` instead)
- Support for ansible-core < 2.15

**ansible.posix:**
- Some firewalld parameters
- Older selinux module parameters

## Limitations

**Important:** Not all collection deprecations create the `event=deprecated` callback that AWX captures. Some only appear in stdout.

The dashboard shows **callback-triggered deprecations** only. This is still valuable because:

1. ✅ Shows the deprecations that ARE being captured
2. ✅ Better than manual log review
3. ✅ Demonstrates the value of centralized deprecation tracking
4. ✅ Will automatically show more as collections improve their deprecation callbacks

## Demo Tips

**For a convincing customer demo:**

1. **Run the playbook 8-10 times** - shows realistic "Affected Jobs" count
2. **Use different tags** - simulates different teams/playbooks
3. **Point out the heat map** - visual severity makes it clear what's urgent
4. **Explain RBAC** - users only see deprecations from jobs they can access
5. **Show the time-saving** - previously required manual log review or DB queries

**Demo script:**

> "Before this dashboard, customers had to manually review job output or 
> query the Postgres database to find deprecation warnings. With 500+ jobs 
> per day, that's not scalable.
> 
> Now they can see at a glance: 87 total warnings across 10 jobs, with 
> 'bare variables in conditionals' being the hot issue (52 occurrences).
> 
> They know exactly what to fix before upgrading to Ansible Core 2.19."

