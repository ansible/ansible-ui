Ansible UI Framework

# Ansible UI Framework

A framework for building applications using [PatternFly](https://www.patternfly.org).

- [Getting Started](GettingStarted.md)
- [Guides](Guides.md)
- [Components](Components.md)

While PatternFly provides the building blocks and guidance on building applications, PatternFly does not tie together those building blocks and manage the needed state for the developer. This framework adds state management and abstractions for common patterns of application development.

This framework:

- does not use any state libraries other than the built in react context state management.
- does not assume any specific translation libraries, but does provide a hook for internal translations.
- does not assume any specific navigation libraries, but does provide a hook for internal navigation.

There is an [Ansible UI Framework Demo](https://github.com/jamestalton/ansible-ui-framework-demo) repo showing an example of using the framework.
