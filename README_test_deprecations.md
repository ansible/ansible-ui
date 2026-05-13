# Test Deprecations Playbook

This playbook is designed to trigger multiple Ansible deprecation warnings on Core 2.16 for testing the Deprecations Dashboard.

## Deprecation Patterns Included

1. **with_items on package modules** (yum, dnf, apt, package)
   - Triggers: "with_items on module" deprecations
   - Should use `loop` instead

2. **with_dict loops**
   - Triggers: "with_dict loop" deprecations  
   - Should use `loop` with `dict2items` filter

3. **Bare variables in conditionals**
   - Triggers: "Bare variables in conditionals" warnings
   - Should use `{{ }}` syntax in when statements

## How to Run

### In AWX/AAP Controller

1. Create a new Project pointing to this directory
2. Create a Job Template:
   - **Name:** Test Deprecations
   - **Inventory:** Demo Inventory (or any inventory with localhost)
   - **Project:** Your project
   - **Playbook:** test_deprecations.yml
   - **Execution Environment:** ee-minimal-rhel9:latest (Core 2.16)
   - **Limit:** localhost

3. Launch the job multiple times to generate data

4. Navigate to Administration → Deprecations to view the dashboard

### From Command Line

```bash
ansible-playbook test_deprecations.yml
```

## Expected Results

Running this playbook should generate:
- **50+** total deprecation warnings
- **3** unique deprecation types:
  - with_items on module
  - with_dict loop  
  - Bare variables in conditionals

Run it 3-5 times to see the dashboard populate with meaningful data showing "affected jobs" count.

## Notes

- Most tasks use `ignore_errors: yes` so the playbook completes even if package installations fail
- The playbook is safe to run - it only touches /tmp files and attempts to install common packages
- Designed for testing only, not for production use
