# Test Depth Improvements for Platform Organization Coverage

## Overview

This document tracks follow-up improvements to deepen test coverage for the platform organization components added in PRs #3336-#3340. The initial coverage focused on basic rendering and structure; this follow-up will add interaction, error handling, and edge case coverage.

## Summary of Current Coverage

### ✅ What's Covered (Batches 1-5)
- Component rendering and basic structure
- Form field presence and labels
- Wizard step navigation display
- Data loading from APIs
- Column configuration in tables
- Filter definitions
- Hook return types and basic behavior

### ❌ What's Missing
1. **Form submission flows** - No tests for successful saves or API errors
2. **User interactions** - No tests for button clicks, field inputs, form validation
3. **Error handling** - No tests for API failures, network errors, validation errors
4. **Edge cases** - No tests for empty states, loading states, permission errors
5. **Shallow hook tests** - Some hooks only test that they don't throw, not actual behavior

## Specific Improvements Needed

### 1. EditPlatformOrganization (PR #3337)
**Priority: High**

Missing coverage:
- [ ] Happy path form submission - fill form, submit, verify PATCH request
- [ ] Error handling - mock 400/500 response, verify error alert shown
- [ ] Field validation - required fields, format validation
- [ ] Instance group association/disassociation loops
- [ ] Galaxy credential association/disassociation loops
- [ ] Navigation after successful save

Example test structure:
```typescript
it('should submit form successfully', async () => {
  const user = userEvent.setup();
  render(<EditPlatformOrganization />);
  
  await waitFor(() => {
    expect(screen.getByDisplayValue('Test Organization')).toBeInTheDocument();
  });
  
  const nameField = screen.getByLabelText(/name/i);
  await user.clear(nameField);
  await user.type(nameField, 'Updated Organization');
  
  const submitButton = screen.getByRole('button', { name: /save/i });
  await user.click(submitButton);
  
  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith('/organizations/1');
  });
});

it('should display error on failed submission', async () => {
  server.use(
    http.patch(gatewayAPI`/organizations/1/`, () => 
      HttpResponse.json({ detail: 'Name already exists' }, { status: 400 })
    )
  );
  
  const user = userEvent.setup();
  render(<EditPlatformOrganization />);
  
  await waitFor(() => {
    expect(screen.getByDisplayValue('Test Organization')).toBeInTheDocument();
  });
  
  const submitButton = screen.getByRole('button', { name: /save/i });
  await user.click(submitButton);
  
  await waitFor(() => {
    expect(screen.getByText(/name already exists/i)).toBeInTheDocument();
  });
});
```

### 2. CreatePlatformOrganization (PR #3336)
**Priority: High**

Missing coverage:
- [ ] Multi-step wizard completion flow
- [ ] Form submission with all fields
- [ ] Validation on required fields
- [ ] Error handling on organization creation
- [ ] Navigation between wizard steps (Next/Back buttons)
- [ ] Cancel workflow

### 3. useSelectOrganization Hook (PR #3340)
**Priority: Medium**

Current test only verifies hook doesn't throw. Should follow repo pattern:
- [ ] Mock `usePageDialog` and verify `setDialog` is called
- [ ] Verify correct dialog component is rendered
- [ ] Verify callback is passed correctly

Example improvement:
```typescript
it('should open select organization dialog when invoked', () => {
  const mockSetDialog = vi.fn();
  
  vi.mock('@ansible/ansible-ui-framework', async () => {
    const actual = await vi.importActual('@ansible/ansible-ui-framework');
    return {
      ...actual,
      usePageDialog: () => [null, mockSetDialog],
    };
  });
  
  const { result } = renderHook(() => useSelectOrganization(), {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
  });
  
  const onSelect = vi.fn();
  const defaultOrg = { id: 1, name: 'Test' } as PlatformOrganization;
  
  result.current(onSelect, defaultOrg);
  
  expect(mockSetDialog).toHaveBeenCalled();
  // Verify dialog props
});
```

### 4. PageFormPlatformOrganizationSelect Component (PR #3340)
**Priority: Low**

Current overlapping tests:
- [ ] Remove duplicate test or add meaningful variation (test `label` prop, `isRequired`, `isDisabled`)
- [ ] Add interaction test - open dropdown, select option
- [ ] Test with pre-populated value

### 5. Wizard Step Components (PR #3338)
**Priority: Medium**

Missing coverage:
- [ ] OrganizationDetailsStep - field interactions, validation, conditional field display
- [ ] OrganizationReviewStep - data display with various field combinations

### 6. Organization Action Hooks (PR #3339)
**Priority: Low**

Current tests are adequate but could add:
- [ ] Delete confirmation dialog interaction in useDeleteOrganizations
- [ ] Actual bulk delete execution flow

## Implementation Strategy

### Phase 1: Critical Paths (Week 1)
Focus on form submission and error handling for Edit/Create components.
Target: PRs #3336, #3337

### Phase 2: Interactions (Week 2)
Add user interaction tests for wizard navigation, field inputs, dropdowns.
Target: PRs #3336, #3338, #3340

### Phase 3: Hook Depth (Week 3)
Improve shallow hook tests to verify actual behavior.
Target: PRs #3339, #3340

## Success Metrics

- [ ] Test coverage for platform/access/organizations/ reaches 90%+
- [ ] All form submission paths covered (happy + error)
- [ ] All user-interactive components have interaction tests
- [ ] No "smoke test only" hooks remain

## References

- Initial Coverage PRs: #3336, #3337, #3338, #3339, #3340
- Related Jira: AAP-70843
- Code Review Comments: 
  - PR #3337: https://github.com/ansible/ansible-ui/pull/3337#issuecomment-4877471167
  - PR #3340: https://github.com/ansible/ansible-ui/pull/3340#issuecomment-4877473765
