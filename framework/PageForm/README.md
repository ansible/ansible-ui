# Error Handling in PageForm

## Overview

Handling diverse error structures across projects like AWX, HUB, and others is streamlined with `PageForm`, a universal component enriched with adaptable error adapters for each project.

## Problem

The diverse error formats returned by different APIs introduce complexity, demanding a universal yet flexible error handling mechanism in the `PageForm` component.

## Solution

We introduced an error adapter - a mechanism where each project provides its own adapter to transform API errors into a standard format that the `PageForm` can parse.

If no adapter is provided, the `PageForm` uses a generic adapter.

### Error Adapters

- **AWX Error Adapter:** Tailored for AWX-specific error structures.
- **HUB Error Adapter:** Tailored for HUB-specific error structures.
- **EDA Error Adapter:** Tailored for EDA-specific error structures.
- **Generic Error Adapter:** A generic adapter that can be used as a fallback.

### Custom PageForm Wrappers

Custom wrappers are created as follows: `AwxPageForm` for AWX, `HubPageForm` for HUB and 'EdaPageForm' for EDA.
These wrappers automatically include the respective error adapters, abstracting this detail from the developers and users.

## Usage

Simply import the specialized `PageForm` wrapper:

```javascript
import { AwxPageForm } from './AwxPageForm'; // AWX
// or
import { HubPageForm } from './HubPageForm'; // HUB
// or
import { EdaPageForm } from './EdaPageForm'; // EDA
```

Then, use it like any regular component:

```javascript
<AwxPageForm {...props}>// ...</AwxPageForm>
```

## Summary

The combination of error adapters and custom `PageForm` wrappers provides a flexible and streamlined error handling mechanism for the `PageForm` component. Each project gets tailored error handling without compromising the consistency and reusability of the `PageForm`.
