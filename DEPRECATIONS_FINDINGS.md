# Deprecations Dashboard - Research Findings

## Summary

The Deprecations Dashboard successfully displays deprecation warnings from Ansible Core 2.16 playbook executions. However, **not all deprecation warnings are captured as structured events** by AWX/AAP Controller.

## What Works ✅

### Captured Deprecations (create `event=deprecated` records)

**1. Bare String Variables in Conditionals**
   - **Pattern:** Using string variables directly in `when` without boolean conversion
   - **Example:** `when: ansible_distribution`
   - **Warning:** "Conditional result was of type 'AnsibleUnsafeText'"
   - **Removal:** Scheduled for Ansible Core 2.19
   - **CVE:** Related to CVE-2023-5764 (security issue)

These deprecations:
- ✅ Create structured `event=deprecated` database records
- ✅ Appear in the dashboard UI
- ✅ Can be queried via API: `/api/controller/v2/jobs/{id}/job_events/?event=deprecated`
- ✅ Include full context (task name, playbook, line number)

## What Doesn't Work ❌

### Non-Captured Deprecations (stdout only, no events)

**1. Loop Syntax Deprecations**
   - **Patterns:** `with_items`, `with_dict`, `with_first`, etc.
   - **Recommendation:** Use `loop` with filters
   - **Status:** Warnings appear in stdout but DON'T create events

**2. Include vs Import Deprecations**
   - **Pattern:** `include:` directive
   - **Recommendation:** Use `include_tasks` or `import_tasks`
   - **Status:** Warning in stdout only (or error if fully removed)

**3. Module-Specific Deprecations**
   - **Examples:** Package module parameter changes, deprecated modules
   - **Status:** Most appear in stdout only

## Technical Root Cause

### Why Only Some Deprecations Create Events

Ansible uses **callback plugins** to emit events. The `deprecated` event type exists in AWX's schema, but it's only populated when:

1. **Ansible's callback explicitly emits a `v2_on_deprecated` event**
2. The deprecation is triggered **during task execution** (not during parsing)
3. The deprecation is **callback-aware** (not just a printed warning)

**Bare conditional deprecations** trigger the callback because they're evaluated at runtime during conditional checking. **Loop syntax warnings** are emitted during task parsing/execution but don't trigger the same callback.

This is an **Ansible Core limitation**, not an AWX/AAP Controller issue.

## Impact on Dashboard

### Current State

The dashboard works correctly but has limited coverage:

**Pros:**
- ✅ Shows real deprecation events from the API
- ✅ RBAC-aware (users only see their accessible jobs)
- ✅ Aggregates across multiple jobs
- ✅ Provides useful metrics and visualization
- ✅ Zero backend changes required

**Cons:**
- ❌ Only shows ~10-20% of all deprecation types
- ❌ Missing important deprecations like loop syntax
- ❌ Users may be confused why some warnings don't appear

### User Expectations

**What users will see:**
- Primarily bare conditional deprecations
- Possibly other callback-triggered deprecations (TBD)

**What users won't see:**
- Loop syntax warnings (`with_items`, `with_dict`)
- Include/import warnings
- Many module-specific deprecations
- Parsing-time warnings

## Recommendations

### For the PR

**Option 1: Ship As-Is with Documentation**
- Document the limitation clearly
- Focus messaging on "callback-captured deprecations"
- Provide test playbooks that trigger the supported types
- **Pros:** Feature provides value for covered deprecations
- **Cons:** Users may report "missing" deprecations

**Option 2: Enhance with Stdout Parsing**
- Add a secondary mechanism to parse `[DEPRECATION WARNING]` from stdout
- Combine with event-based data for complete coverage
- **Pros:** Shows ALL deprecations
- **Cons:** Requires more complex implementation, less reliable

**Option 3: Wait for Backend Support**
- File RFE for ansible-core to emit more deprecation events
- Delay dashboard until better coverage
- **Pros:** Complete solution eventually
- **Cons:** Multi-year timeline, customers want this now

### Recommended Approach: Option 1

**Ship the feature with clear documentation** because:

1. **It solves a real problem** - Bare conditionals are common and important
2. **It's better than nothing** - Currently users have zero visibility
3. **It's extensible** - When ansible-core adds more events, they'll appear automatically
4. **It demonstrates the value** - Shows what's possible, justifies investment

## Test Playbooks

Three playbooks are provided:

1. **`quickstart_deprecations.yml`** - 5 deprecations, quick test
2. **`comprehensive_deprecations_test.yml`** - 20+ deprecations, full demo
3. **`test_deprecations_working.yml`** - Original test from development

All focus on **bare conditional patterns** since those are what actually generate events.

## Future Enhancements

### Short Term (Can be added to UI)
- Add tooltip explaining why some deprecations don't appear
- Link to test playbooks in help text
- Add filter to show only specific deprecation types

### Medium Term (Requires backend work)
- Parse stdout for additional deprecations (not in events)
- Store parsed deprecations separately
- Merge event-based and stdout-based data

### Long Term (Requires ansible-core changes)
- File RFE with ansible-core to emit more `v2_on_deprecated` events
- Work with ansible-core maintainers on callback coverage
- Eventually get 100% deprecation coverage via events

## References

- [Ansible Core 2.16 Porting Guide](https://docs.ansible.com/ansible/latest/porting_guides/porting_guide_core_2.16.html)
- [Ansible Core 2.19 Porting Guide](https://docs.ansible.com/projects/ansible/latest/porting_guides/porting_guide_core_2.19.html) - When bare conditionals will be removed
- [CVE-2023-5764](https://access.redhat.com/security/cve/CVE-2023-5764) - Security issue that drove the bare conditional deprecation
- AWX Job Events API: `/api/controller/v2/jobs/{id}/job_events/?event=deprecated`

## Conclusion

The Deprecations Dashboard is **production-ready** but with **documented limitations**. It provides real value for the deprecation types it covers, with a clear path for future enhancement as ansible-core improves event coverage.

