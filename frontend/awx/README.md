# Controller (AWX) UI workspace

React UI for Ansible Automation Platform **Controller** (historically AWX). This package is built into the unified Platform UI in `platform/`, not shipped as a separate product from this repository.

## Local development

Supported workflow: run the Platform UI (`npm start` from the repository root) with a gateway configured via `PLATFORM_SERVER`. See the [repository README](../../README.md).

## Standalone dev server (unsupported)

`npm start` in this directory starts a Vite dev server on port 4101 with `AWX_SERVER` pointing at a Controller API. That path is **not supported**: it is unmaintained, not exercised in CI, and may not work with current authentication and RBAC. Prefer the Platform UI unless you are explicitly working on standalone Controller UI support.
