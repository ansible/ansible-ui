

# Comprehensive Deprecations Test Playbook

This playbook demonstrates deprecation warnings in Ansible Core 2.16 that are captured by AWX/AAP Controller and displayed in the Deprecations Dashboard.

## Purpose

This test playbook is designed to:
1. **Generate deprecation events** that AWX/AAP captures as structured database records
2. **Demonstrate the Deprecations Dashboard** functionality
3. **Provide a realistic test case** for customers evaluating the feature

## What Deprecations Are Included?

### Primary Pattern: Bare String Variables in Conditionals

The main deprecation pattern in Ansible Core 2.16 that triggers structured events is:

**Using string variables directly in `when` conditionals without boolean conversion**

```yaml
when: ansible_distribution  # DEPRECATED - string evaluated as truthy
when: ansible_distribution != ""  # CORRECT - explicit boolean expression
```

**Warning Message:**
```
[DEPRECATION WARNING]: Conditional result at location <file>:<line> was of 
type 'AnsibleUnsafeText'. Conditional results should only be True or False. 
The result was interpreted as True. This feature will be removed in version 2.19.
```

**Why It's Deprecated:**
- Security issue (CVE-2023-5764) with unsafe data in conditionals
- Implicit truthy/falsy evaluation can be ambiguous
- Scheduled for removal in Ansible Core 2.19

## How to Use

### In AWX/AAP Controller

1. **Create a Project**
   - Point to the repository/directory containing this playbook
   - Sync the project

2. **Create a Job Template**
   - **Name:** Deprecation Test
   - **Inventory:** Any inventory with localhost
   - **Project:** Your project
   - **Playbook:** `comprehensive_deprecations_test.yml`
   - **Execution Environment:** ee-supported-rhel9 (Ansible Core 2.16)
   - **Limit:** localhost

3. **Run the Job**
   - Execute the job template
   - The job should complete successfully

4. **View Results**
   - Navigate to **Administration → Deprecations**
   - You should see:
     - **Total Warnings:** 20+ deprecation events
     - **Affected Jobs:** Number of times you ran the test
     - **Unique Issues:** 1-2 types of deprecations
     - **Heat map** showing deprecation patterns
     - **Detailed table** with counts and severity

### From Command Line

```bash
ansible-playbook comprehensive_deprecations_test.yml
```

**Note:** You'll see `[DEPRECATION WARNING]` messages in the output, but only AWX/AAP Controller captures these as structured events for the dashboard.

## Expected Results

Running this playbook should generate approximately:
- **20+ deprecation events** from bare conditional patterns
- **1 unique deprecation type:** "Bare variables in conditionals"
- **Severity level:** Cool (≤10 occurrences per job)

Run the playbook multiple times to see:
- **Affected Jobs** count increase
- **Total Warnings** accumulate across runs
- Heat map showing distribution

## Important Notes

### Not All Deprecations Create Events

AWX/AAP only captures **specific types** of deprecation warnings as structured `event=deprecated` database records:

✅ **Captured as events:**
- Bare string variables in `when` conditionals
- Certain other callback-triggered deprecations

❌ **NOT captured as events:**
- Loop syntax warnings (`with_items`, `with_dict`) - these only appear in stdout
- `include` vs `import_tasks` warnings - stdout only
- Many other deprecation messages

This is why the playbook focuses on bare conditional patterns - they're the primary deprecation type that creates the structured events the dashboard displays.

### Ansible Version Requirements

- **Ansible Core 2.16+** required for these specific deprecation warnings
- **AWX 23.0.0+** or **AAP Controller 4.4+** recommended for event capture
- Older versions may not capture deprecation events properly

### Contributing

If you discover additional deprecation patterns that trigger structured events in AWX/AAP, please:
1. Test them to confirm they create `event=deprecated` records
2. Document the pattern and warning message
3. Submit a PR to add them to this playbook

## Related Resources

- [Ansible Core 2.16 Porting Guide](https://docs.ansible.com/ansible/latest/porting_guides/porting_guide_core_2.16.html)
- [Ansible Core 2.19 Porting Guide](https://docs.ansible.com/projects/ansible/latest/porting_guides/porting_guide_core_2.19.html) (planned removal)
- [AAP Deprecations Dashboard PR](https://github.com/ansible/ansible-ui/pull/3177)
- [JIRA RFE: AAPRFE-2912](https://redhat.atlassian.net/browse/AAPRFE-2912)

## Troubleshooting

**Q: I don't see any deprecations in the dashboard**

A: Check:
1. Job completed successfully (check job status)
2. Using Ansible Core 2.16+ (check job output header)
3. Deprecation warnings appear in job stdout (search for `[DEPRECATION WARNING]`)
4. API endpoint returns events: `/api/controller/v2/jobs/<job_id>/job_events/?event=deprecated`

**Q: Deprecation warnings appear in stdout but not in dashboard**

A: Not all deprecation warnings create structured events. The dashboard only shows deprecations that AWX captures as `event=deprecated` records. This is a known limitation - some deprecation types only appear in stdout.

**Q: How do I clear old deprecation data?**

A: The dashboard shows data from the last 20 jobs scanned. As old jobs are deleted or fall out of the scan window, their deprecations disappear from the dashboard automatically.

