---
title: Ansible Framework
---

A framework for building applications using [PatternFly](https://www.patternfly.org).

While PatternFly provides the building blocks and guidance on building applications, PatternFly does not tie together those building blocks and manage the needed state for the developer. This framework adds state management and abstractions for common patterns of application development.

This framework:

- does not use any state libraries other than the built in react context state management.
- does not assume any specific translation libraries, but does provide a hook for internal translations.
- does not assume any specific navigation libraries, but does provide a hook for internal navigation.

There is an [Ansible UI Framework Demo](https://github.com/jamestalton/ansible-ui-framework-demo) repo showing an example of using the framework.

## Getting Started

### Install the [NPM package](https://www.npmjs.com/package/@ansible/ansible-ui-framework)

```
npm install @ansible/ansible-ui-framework
```

### Using the framework

1. Use [PageFramework](./PageFramework) in your application.
2. Use [PageLayout](./PageLayout) to control the layout in your pages.
3. Use [PageHeader](./PageHeader) to add consistent headers to your pages.
4. Use framework components in your page
   - [PageTable](./PageTable) for tables
   - [PageForm](./PageForm) for forms
   - [PageDetails](./PageDetails) for details
   - [PageTabs](./PageTabs) for tabs
   - [PageToolbar](./PageToolbar) for toolbar

### Overview, structure, guides

See [Overview, structure](./Overview,-structure)
