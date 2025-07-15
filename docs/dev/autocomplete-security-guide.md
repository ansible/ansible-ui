# Autocomplete Security Guide

## Overview

Modern browsers increasingly ignore `autocomplete="off"` for username and password fields when they detect field patterns. This guide ensures proper autocomplete settings for all credential and sensitive data fields.

## Problem

The framework's `PageFormTextInput` defaults to `autoComplete="off"`, but browsers detect patterns like:
- Field names containing "username", "password", "secret"
- Input types of `type="password"`
- Form context that looks like login/registration

## Solution: Smart Defaults + TypeScript Safety

### Automatic Secure Defaults

**Password fields now automatically use secure values for `autoComplete`**

```tsx
// ✅ AUTOMATIC - Defaults to autoComplete="new-password" meaning no cached suggestions and autofill
<PageFormTextInput
  name="password"
  type="password"
  // No autoComplete needed - automatically secure!
/>

// ✅ EXPLICIT - Override when needed to allow suggestions for things like existing credentials
<PageFormTextInput
  name="currentPassword" 
  type="username"
  autoComplete="current-password"  // Use with caution as current product security requirements mandate all disabling auto complete on all sensitive fields
/>
```

**Smart Defaults:**
- **Password fields**: Automatically default to `"new-password"` (secure for most use cases)
- **Non-password fields**: Default to `"off"` (existing behavior)
- **Type safety**: TypeScript validates values when explicitly specified. Password inputs can either have autoComplete set to `new-password`, `current-password` or `off`, while all other input types allow a generic string for autoComplete


## Benefits of Smart Defaults

- **Zero configuration needed** for most password fields
- **TypeScript type safety** prevents invalid values when explicitly specified
- **Secure by default** - no more forgotten autocomplete settings
- **Backward compatible** - existing explicit settings still work
- **Maintainable** - consistent behavior across all forms

## Testing

To verify autocomplete is disabled:
1. Enter data in the form and submit
2. Navigate away and return to the form  
3. Check that browsers don't auto-populate the fields
4. Inspect HTML to confirm proper `autocomplete` attributes

## Related Resources

- [MDN autocomplete attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete)
- [HTML Standard - autocomplete tokens](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill) 